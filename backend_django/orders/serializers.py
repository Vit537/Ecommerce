from rest_framework import serializers
from .models import Order, OrderItem, Payment, Invoice, PaymentMethod, ShippingMethod
from django.contrib.auth import get_user_model

User = get_user_model()


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'


class ShippingMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingMethod
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    product_sku = serializers.CharField(read_only=True)
    variant_details = serializers.JSONField(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_method = ShippingMethodSerializer(read_only=True)
    order_number = serializers.CharField(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    payment_method = PaymentMethodSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'


# Serializer detallado para admin - vista de facturas
class InvoiceDetailSerializer(serializers.ModelSerializer):
    """
    Serializer completo para la vista de administración de facturas
    Incluye todos los detalles de la orden, items, pagos, etc.
    """
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    order_type = serializers.CharField(source='order.order_type', read_only=True)
    order_type_display = serializers.CharField(source='order.get_order_type_display', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_status_display = serializers.CharField(source='order.get_status_display', read_only=True)
    
    # Información del cliente
    customer_id = serializers.UUIDField(source='customer.id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    
    # Items de la orden
    order_items = serializers.SerializerMethodField()
    
    # Información de pago
    payments = serializers.SerializerMethodField()
    
    # Método de envío
    shipping_method_name = serializers.CharField(source='order.shipping_method.name', read_only=True, allow_null=True)
    shipping_method_type = serializers.CharField(source='order.shipping_method.shipping_type', read_only=True, allow_null=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_type', 'status',
            'order_number', 'order_type', 'order_type_display', 
            'order_status', 'order_status_display',
            'customer_id', 'customer_name', 'customer_email',
            'order_items', 'payments',
            'shipping_method_name', 'shipping_method_type',
            'subtotal', 'tax_amount', 'total_amount',
            'issue_date', 'due_date', 'created_at', 'updated_at',
            'notes'
        ]
    
    def get_customer_name(self, obj):
        """Obtener nombre completo del cliente"""
        return obj.customer.get_full_name() or obj.customer.username
    
    def get_order_items(self, obj):
        """Obtener items de la orden con detalles"""
        items = obj.order.items.all()
        return [{
            'id': str(item.id),
            'product_name': item.product_name,
            'product_sku': item.product_sku,
            'variant_details': item.variant_details,
            'quantity': item.quantity,
            'unit_price': str(item.unit_price),
            'total_price': str(item.total_price),
        } for item in items]
    
    def get_payments(self, obj):
        """Obtener información de pagos"""
        payments = obj.order.payments.all()
        return [{
            'id': str(payment.id),
            'payment_method': payment.payment_method.name,
            'payment_type': payment.payment_method.payment_type,
            'amount': str(payment.amount),
            'status': payment.status,
            'transaction_id': payment.transaction_id,
            'created_at': payment.created_at,
            'processed_at': payment.processed_at,
        } for payment in payments]