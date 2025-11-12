from rest_framework import serializers
from .models import Shift
from orders.models import Order, OrderItem, Payment, PaymentMethod
from authentication.models import User
from django.db import transaction


class ShiftSerializer(serializers.ModelSerializer):
    """Serializer para turnos de cajero"""
    cashier_name = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    sales_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Shift
        fields = [
            'id', 'cashier', 'cashier_name', 'employee',
            'start_time', 'end_time', 'status',
            'initial_cash', 'final_cash', 'expected_cash', 'difference',
            'sales_count', 'total_cash_sales', 'total_card_sales', 
            'total_qr_sales', 'total_sales',
            'duration_minutes', 'sales_summary',
            'notes', 'closed_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'cashier_name', 'start_time', 'expected_cash', 
            'difference', 'sales_count', 'total_cash_sales', 
            'total_card_sales', 'total_qr_sales', 'total_sales',
            'duration_minutes', 'sales_summary', 'created_at', 'updated_at'
        ]
    
    def get_cashier_name(self, obj):
        return obj.cashier.get_full_name()
    
    def get_duration_minutes(self, obj):
        return obj.duration
    
    def get_sales_summary(self, obj):
        return {
            'cash': float(obj.total_cash_sales),
            'card': float(obj.total_card_sales),
            'qr': float(obj.total_qr_sales),
            'total': float(obj.total_sales)
        }


class StartShiftSerializer(serializers.Serializer):
    """Serializer para iniciar turno"""
    cashier_id = serializers.UUIDField()
    initial_cash = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def validate_cashier_id(self, value):
        # Verificar que el cajero existe
        try:
            user = User.objects.get(id=value)
            if user.role not in ['admin', 'employee', 'manager']:
                raise serializers.ValidationError("El usuario no es un empleado válido")
        except User.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado")
        
        # Verificar que no tiene un turno activo
        active_shift = Shift.objects.filter(cashier=user, status='open').first()
        if active_shift:
            raise serializers.ValidationError("El cajero ya tiene un turno activo")
        
        return value
    
    def create(self, validated_data):
        cashier = User.objects.get(id=validated_data['cashier_id'])
        shift = Shift.objects.create(
            cashier=cashier,
            initial_cash=validated_data['initial_cash'],
            status='open'
        )
        return shift


class EndShiftSerializer(serializers.Serializer):
    """Serializer para cerrar turno"""
    shift_id = serializers.UUIDField()
    final_cash = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_shift_id(self, value):
        try:
            shift = Shift.objects.get(id=value)
            if shift.status != 'open':
                raise serializers.ValidationError("El turno ya está cerrado")
        except Shift.DoesNotExist:
            raise serializers.ValidationError("Turno no encontrado")
        return value
    
    def save(self):
        shift = Shift.objects.get(id=self.validated_data['shift_id'])
        # Actualizar resumen de ventas antes de cerrar
        shift.update_sales_summary()
        # Cerrar el turno
        shift.close_shift(
            final_cash=self.validated_data['final_cash'],
            closed_by=self.context['request'].user
        )
        if 'notes' in self.validated_data:
            shift.notes = self.validated_data['notes']
            shift.save()
        return shift


class SaleItemSerializer(serializers.Serializer):
    """Serializer para items de una venta"""
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    size = serializers.CharField()
    color = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    sku = serializers.CharField(required=False, allow_blank=True)
    image = serializers.URLField(required=False, allow_blank=True)


class PaymentDetailSerializer(serializers.Serializer):
    """Serializer para detalles de pago"""
    method = serializers.ChoiceField(choices=['cash', 'card', 'qr'])
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    reference = serializers.CharField(required=False, allow_blank=True)


class CreateSaleSerializer(serializers.Serializer):
    """Serializer para crear una venta desde el POS"""
    shift_id = serializers.UUIDField()
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    items = SaleItemSerializer(many=True)
    payment_method = serializers.ChoiceField(choices=['cash', 'card', 'qr', 'mixed'])
    payment_details = PaymentDetailSerializer(many=True, required=False)
    cash_received = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_shift_id(self, value):
        try:
            shift = Shift.objects.get(id=value)
            if shift.status != 'open':
                raise serializers.ValidationError("El turno está cerrado")
        except Shift.DoesNotExist:
            raise serializers.ValidationError("Turno no encontrado")
        return value
    
    def validate(self, data):
        # Calcular total
        total = sum(item['subtotal'] for item in data['items'])
        tax = total * 0.13  # 13% IVA
        total_with_tax = total + tax
        
        # Validar pago
        if data['payment_method'] == 'cash':
            if 'cash_received' not in data:
                raise serializers.ValidationError("Se requiere el monto recibido en efectivo")
            if data['cash_received'] < total_with_tax:
                raise serializers.ValidationError("El monto recibido es insuficiente")
        
        elif data['payment_method'] == 'mixed':
            if 'payment_details' not in data:
                raise serializers.ValidationError("Se requieren detalles de pago para pago mixto")
            total_paid = sum(detail['amount'] for detail in data['payment_details'])
            if abs(total_paid - total_with_tax) > 0.01:
                raise serializers.ValidationError(
                    f"El total pagado ({total_paid}) no coincide con el total de la venta ({total_with_tax})"
                )
        
        data['calculated_total'] = total_with_tax
        data['subtotal'] = total
        data['tax'] = tax
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        from products.models import Product, ProductVariant
        from django.utils import timezone
        
        shift = Shift.objects.get(id=validated_data['shift_id'])
        cashier = shift.cashier
        
        # Obtener o crear cliente anónimo
        if 'customer_id' in validated_data and validated_data['customer_id']:
            customer = User.objects.get(id=validated_data['customer_id'])
        else:
            # Cliente anónimo (walk-in customer)
            customer, _ = User.objects.get_or_create(
                email='walkin@store.local',
                defaults={
                    'first_name': 'Cliente',
                    'last_name': 'Tienda',
                    'role': 'customer',
                    'username': 'walkin'
                }
            )
        
        # Crear orden
        order = Order.objects.create(
            customer=customer,
            order_type='in_store',
            status='completed',
            payment_status='paid',
            subtotal=validated_data['subtotal'],
            tax_amount=validated_data['tax'],
            total_amount=validated_data['calculated_total'],
            processed_by=cashier,
            confirmed_at=timezone.now(),
            delivered_at=timezone.now()
        )
        
        # Crear items
        for item_data in validated_data['items']:
            try:
                product = Product.objects.get(id=item_data['product_id'])
                
                # Buscar variante del producto
                variant = ProductVariant.objects.filter(
                    product=product,
                    size__name=item_data['size'],
                    color__name=item_data['color']
                ).first()
                
                # Crear OrderItem
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_variant=variant,
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    total_price=item_data['subtotal'],
                    product_name=item_data['product_name'],
                    product_sku=item_data.get('sku', product.sku),
                    variant_details={
                        'size': item_data['size'],
                        'color': item_data['color']
                    }
                )
                
                # Actualizar inventario
                if variant:
                    variant.stock -= item_data['quantity']
                    variant.save()
                    
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Producto {item_data['product_id']} no encontrado")
        
        # Crear pagos
        if validated_data['payment_method'] in ['cash', 'card', 'qr']:
            # Pago único
            payment_type_map = {
                'cash': 'cash',
                'card': 'credit_card',
                'qr': 'qr_code'
            }
            
            payment_method, _ = PaymentMethod.objects.get_or_create(
                payment_type=payment_type_map[validated_data['payment_method']],
                defaults={
                    'name': validated_data['payment_method'].title(),
                    'is_active': True
                }
            )
            
            Payment.objects.create(
                order=order,
                payment_method=payment_method,
                amount=validated_data['calculated_total'],
                status='completed',
                processed_at=timezone.now(),
                processed_by=cashier
            )
            
        elif validated_data['payment_method'] == 'mixed':
            # Pagos múltiples
            for detail in validated_data['payment_details']:
                payment_type_map = {
                    'cash': 'cash',
                    'card': 'credit_card',
                    'qr': 'qr_code'
                }
                
                payment_method, _ = PaymentMethod.objects.get_or_create(
                    payment_type=payment_type_map[detail['method']],
                    defaults={
                        'name': detail['method'].title(),
                        'is_active': True
                    }
                )
                
                Payment.objects.create(
                    order=order,
                    payment_method=payment_method,
                    amount=detail['amount'],
                    status='completed',
                    processed_at=timezone.now(),
                    processed_by=cashier,
                    reference_number=detail.get('reference', '')
                )
        
        # Actualizar estadísticas del turno
        shift.sales_count += 1
        shift.total_sales += validated_data['calculated_total']
        
        # Actualizar totales por método de pago
        if validated_data['payment_method'] == 'cash':
            shift.total_cash_sales += validated_data['calculated_total']
        elif validated_data['payment_method'] == 'card':
            shift.total_card_sales += validated_data['calculated_total']
        elif validated_data['payment_method'] == 'qr':
            shift.total_qr_sales += validated_data['calculated_total']
        elif validated_data['payment_method'] == 'mixed':
            for detail in validated_data['payment_details']:
                if detail['method'] == 'cash':
                    shift.total_cash_sales += detail['amount']
                elif detail['method'] == 'card':
                    shift.total_card_sales += detail['amount']
                elif detail['method'] == 'qr':
                    shift.total_qr_sales += detail['amount']
        
        shift.calculate_expected_cash()
        shift.save()
        
        return order


class SaleSerializer(serializers.ModelSerializer):
    """Serializer para ventas (Orders)"""
    items = SaleItemSerializer(many=True, source='items.all')
    cashier_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    invoice_number = serializers.CharField(source='order_number', read_only=True)
    payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'invoice_number', 'cashier_name', 'customer_name',
            'items', 'subtotal', 'tax_amount', 'total_amount',
            'payment_status', 'payment_details',
            'status', 'created_at', 'notes'
        ]
    
    def get_cashier_name(self, obj):
        return obj.processed_by.get_full_name() if obj.processed_by else 'N/A'
    
    def get_customer_name(self, obj):
        return obj.customer.get_full_name()
    
    def get_payment_details(self, obj):
        payments = obj.payments.filter(status='completed')
        return [
            {
                'method': payment.payment_method.payment_type,
                'amount': float(payment.amount),
                'reference': payment.reference_number
            }
            for payment in payments
        ]


class PickupOrderSerializer(serializers.ModelSerializer):
    """Serializer para pedidos listos para retiro"""
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    items = SaleItemSerializer(many=True, source='items.all', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 
            'customer_phone', 'items', 'total_amount', 'payment_status',
            'status', 'created_at', 'pickup_code', 'pickup_ready_at'
        ]
    
    def get_customer_name(self, obj):
        return obj.customer.get_full_name()


class ProcessPickupSerializer(serializers.Serializer):
    """Serializer para procesar retiro de pedido"""
    order_id = serializers.UUIDField()
    pickup_code = serializers.CharField(max_length=6)
    customer_id_verification = serializers.CharField()
    payment_method = serializers.ChoiceField(
        choices=['cash', 'card', 'qr'],
        required=False
    )
    payment_details = PaymentDetailSerializer(many=True, required=False)
    
    def validate(self, data):
        try:
            order = Order.objects.get(id=data['order_id'])
        except Order.DoesNotExist:
            raise serializers.ValidationError("Pedido no encontrado")
        
        # Verificar código de retiro
        if order.pickup_code != data['pickup_code']:
            raise serializers.ValidationError("Código de retiro inválido")
        
        # Verificar estado del pedido
        if order.status != 'ready_for_pickup':
            raise serializers.ValidationError("El pedido no está listo para retiro")
        
        # Si el pago está pendiente, requerir método de pago
        if order.payment_status == 'pending' and 'payment_method' not in data:
            raise serializers.ValidationError("El pedido requiere pago. Especifique el método de pago")
        
        data['order'] = order
        return data
    
    @transaction.atomic
    def save(self):
        from django.utils import timezone
        
        order = self.validated_data['order']
        user = self.context['request'].user
        
        # Procesar pago si está pendiente
        if order.payment_status == 'pending' and 'payment_method' in self.validated_data:
            payment_type_map = {
                'cash': 'cash',
                'card': 'credit_card',
                'qr': 'qr_code'
            }
            
            payment_method, _ = PaymentMethod.objects.get_or_create(
                payment_type=payment_type_map[self.validated_data['payment_method']],
                defaults={
                    'name': self.validated_data['payment_method'].title(),
                    'is_active': True
                }
            )
            
            Payment.objects.create(
                order=order,
                payment_method=payment_method,
                amount=order.total_amount,
                status='completed',
                processed_at=timezone.now(),
                processed_by=user
            )
            
            order.payment_status = 'paid'
        
        # Marcar como retirado
        order.process_pickup(
            picked_up_by_name=order.customer.get_full_name(),
            picked_up_by_id=self.validated_data['customer_id_verification'],
            delivered_by=user
        )
        
        return order
