from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import timedelta

from .models import Shift
from orders.models import Order, Payment
from products.models import Product, ProductVariant
from .cashier_serializers import (
    ShiftSerializer, StartShiftSerializer, EndShiftSerializer,
    CreateSaleSerializer, SaleSerializer, PickupOrderSerializer,
    ProcessPickupSerializer
)


class CashierPermission(IsAuthenticated):
    """
    Permiso personalizado para cajeros
    Solo usuarios con rol: admin, manager, employee pueden acceder
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role in ['admin', 'manager', 'employee']


class ShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de turnos de cajero
    """
    serializer_class = ShiftSerializer
    permission_classes = [CashierPermission]
    queryset = Shift.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        cashier_id = self.request.query_params.get('cashier_id')
        
        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_time__lte=end_date)
        if cashier_id:
            queryset = queryset.filter(cashier_id=cashier_id)
        
        return queryset
    
    @action(detail=False, methods=['post'], url_path='start')
    def start_shift(self, request):
        """Iniciar un nuevo turno"""
        serializer = StartShiftSerializer(data=request.data)
        if serializer.is_valid():
            shift = serializer.save()
            return Response(
                ShiftSerializer(shift).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='end')
    def end_shift(self, request):
        """Cerrar el turno actual"""
        serializer = EndShiftSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            shift = serializer.save()
            return Response(
                ShiftSerializer(shift).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='active')
    def active_shift(self, request):
        """Obtener el turno activo del cajero actual"""
        shift = Shift.objects.filter(
            cashier=request.user,
            status='open'
        ).first()
        
        if shift:
            # Actualizar resumen antes de retornar
            shift.update_sales_summary()
            return Response(ShiftSerializer(shift).data)
        else:
            return Response(
                {'detail': 'No hay turno activo'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Obtener detalles completos de un turno"""
        shift = self.get_object()
        
        # Actualizar resumen
        shift.update_sales_summary()
        
        # Obtener ventas del turno
        orders = Order.objects.filter(
            processed_by=shift.cashier,
            created_at__gte=shift.start_time
        )
        if shift.end_time:
            orders = orders.filter(created_at__lte=shift.end_time)
        
        data = ShiftSerializer(shift).data
        data['sales'] = SaleSerializer(orders, many=True).data
        
        return Response(data)


class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ventas (solo lectura para consultas)
    """
    serializer_class = SaleSerializer
    permission_classes = [CashierPermission]
    queryset = Order.objects.filter(order_type='in_store')
    
    @action(detail=False, methods=['post'])
    def create_sale(self, request):
        """Crear una nueva venta desde el POS"""
        serializer = CreateSaleSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                SaleSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='current-shift')
    def current_shift_sales(self, request):
        """Obtener ventas del turno actual"""
        shift = Shift.objects.filter(
            cashier=request.user,
            status='open'
        ).first()
        
        if not shift:
            return Response(
                {'detail': 'No hay turno activo'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        orders = Order.objects.filter(
            processed_by=request.user,
            created_at__gte=shift.start_time,
            order_type='in_store'
        )
        
        serializer = SaleSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancelar una venta"""
        order = self.get_object()
        reason = request.data.get('reason', '')
        
        if order.status == 'cancelled':
            return Response(
                {'detail': 'La venta ya está cancelada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.internal_notes = f"Cancelada: {reason}"
        order.save()
        
        # Revertir inventario
        for item in order.items.all():
            if item.product_variant:
                item.product_variant.stock += item.quantity
                item.product_variant.save()
        
        # Actualizar turno
        shift = Shift.objects.filter(
            cashier=request.user,
            status='open'
        ).first()
        if shift:
            shift.update_sales_summary()
        
        return Response(SaleSerializer(order).data)
    
    @action(detail=True, methods=['get'])
    def print(self, request, pk=None):
        """Generar PDF de factura para imprimir"""
        from django.http import HttpResponse
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from io import BytesIO
        
        order = self.get_object()
        
        # Crear PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Título
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "SPORTSWEAR - FACTURA DE VENTA")
        
        # Información de la orden
        p.setFont("Helvetica", 12)
        y = height - 100
        p.drawString(50, y, f"Factura No: {order.order_number}")
        y -= 20
        p.drawString(50, y, f"Fecha: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
        y -= 20
        p.drawString(50, y, f"Cliente: {order.customer.get_full_name()}")
        y -= 20
        p.drawString(50, y, f"Atendido por: {order.processed_by.get_full_name()}")
        
        # Items
        y -= 40
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Producto")
        p.drawString(250, y, "Cant.")
        p.drawString(350, y, "Precio")
        p.drawString(450, y, "Subtotal")
        
        y -= 5
        p.line(50, y, width - 50, y)
        y -= 20
        
        p.setFont("Helvetica", 10)
        for item in order.items.all():
            p.drawString(50, y, item.product_name[:30])
            p.drawString(250, y, str(item.quantity))
            p.drawString(350, y, f"${item.unit_price:.2f}")
            p.drawString(450, y, f"${item.total_price:.2f}")
            y -= 20
            if y < 100:
                p.showPage()
                y = height - 50
        
        # Totales
        y -= 10
        p.line(350, y, width - 50, y)
        y -= 20
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(350, y, "Subtotal:")
        p.drawString(450, y, f"${order.subtotal:.2f}")
        y -= 20
        p.drawString(350, y, "IVA (13%):")
        p.drawString(450, y, f"${order.tax_amount:.2f}")
        y -= 20
        p.drawString(350, y, "TOTAL:")
        p.drawString(450, y, f"${order.total_amount:.2f}")
        
        # Método de pago
        y -= 30
        p.setFont("Helvetica", 10)
        payments = order.payments.filter(status='completed')
        for payment in payments:
            p.drawString(50, y, f"Pago: {payment.payment_method.name} - ${payment.amount:.2f}")
            y -= 15
        
        # Finalizar PDF
        p.showPage()
        p.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="factura-{order.order_number}.pdf"'
        return response


class ProductSearchViewSet(viewsets.ViewSet):
    """
    ViewSet para búsqueda de productos en el POS
    """
    permission_classes = [CashierPermission]
    
    @action(detail=False, methods=['get'], url_path='barcode')
    def search_by_barcode(self, request):
        """Buscar producto por código de barras"""
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'Se requiere el parámetro code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar por SKU o código de barras
        variant = ProductVariant.objects.filter(
            Q(sku_variant=code) | Q(barcode=code)
        ).select_related('product', 'size', 'color').first()
        
        if variant:
            return Response({
                'id': str(variant.product.id),
                'name': variant.product.name,
                'price': float(variant.price or variant.product.price),
                'stock': variant.stock,
                'image': variant.product.image.url if variant.product.image else None,
                'default_size': variant.size.name if variant.size else 'M',
                'default_color': variant.color.name if variant.color else 'Negro',
                'sku': variant.sku_variant,
                'barcode': code
            })
        
        return Response(
            {'error': 'Producto no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Buscar productos por nombre o código"""
        q = request.query_params.get('q', '')
        if len(q) < 2:
            return Response(
                {'error': 'La búsqueda debe tener al menos 2 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        products = Product.objects.filter(
            Q(name__icontains=q) | Q(sku__icontains=q),
            is_active=True
        )[:10]
        
        results = []
        for product in products:
            # Obtener la primera variante con stock
            variant = product.variants.filter(stock__gt=0).first()
            if variant:
                results.append({
                    'id': str(product.id),
                    'name': product.name,
                    'price': float(variant.price or product.price),
                    'stock': variant.stock,
                    'image': product.image.url if product.image else None,
                    'default_size': variant.size.name if variant.size else 'M',
                    'default_color': variant.color.name if variant.color else 'Negro',
                    'sku': product.sku
                })
        
        return Response(results)
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Verificar disponibilidad de stock"""
        quantity = int(request.query_params.get('quantity', 1))
        
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calcular stock total
        total_stock = sum(v.stock for v in product.variants.all())
        
        return Response({
            'available': total_stock >= quantity,
            'current_stock': total_stock
        })


class PickupOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para gestión de retiro de pedidos online
    """
    serializer_class = PickupOrderSerializer
    permission_classes = [CashierPermission]
    queryset = Order.objects.filter(
        order_type='online',
        status='ready_for_pickup'
    )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Buscar pedido por número de orden o código de retiro"""
        q = request.query_params.get('q', '')
        if not q:
            return Response(
                {'error': 'Se requiere el parámetro q'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = Order.objects.filter(
            Q(order_number=q) | Q(pickup_code=q),
            order_type='online'
        ).first()
        
        if order:
            return Response(PickupOrderSerializer(order).data)
        
        return Response(
            {'error': 'Pedido no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['get'], url_path='ready-for-pickup')
    def ready_for_pickup(self, request):
        """Obtener todos los pedidos listos para retiro"""
        orders = Order.objects.filter(
            order_type='online',
            status='ready_for_pickup'
        ).order_by('-pickup_ready_at')
        
        serializer = PickupOrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='process-pickup')
    def process_pickup(self, request):
        """Procesar retiro de pedido"""
        serializer = ProcessPickupSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                {
                    'success': True,
                    'order': PickupOrderSerializer(order).data,
                    'message': 'Pedido entregado exitosamente'
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='verify-code')
    def verify_code(self, request, pk=None):
        """Verificar código de retiro"""
        order = self.get_object()
        code = request.data.get('code', '')
        
        if order.pickup_code == code:
            return Response({
                'valid': True,
                'order': PickupOrderSerializer(order).data
            })
        
        return Response({
            'valid': False,
            'error': 'Código de retiro inválido'
        }, status=status.HTTP_400_BAD_REQUEST)


class CashierReportsViewSet(viewsets.ViewSet):
    """
    ViewSet para reportes y estadísticas del cajero
    """
    permission_classes = [CashierPermission]
    
    @action(detail=False, methods=['get'], url_path='daily-summary')
    def daily_summary(self, request):
        """Resumen de ventas del día"""
        date = request.query_params.get('date')
        if date:
            target_date = timezone.datetime.strptime(date, '%Y-%m-%d').date()
        else:
            target_date = timezone.now().date()
        
        # Ventas del día
        orders = Order.objects.filter(
            order_type='in_store',
            created_at__date=target_date,
            status__in=['completed', 'delivered']
        )
        
        total_sales = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_transactions = orders.count()
        
        # Ventas por método de pago
        payments = Payment.objects.filter(
            order__in=orders,
            status='completed'
        )
        
        payment_methods = {
            'cash': 0,
            'card': 0,
            'qr': 0
        }
        
        for payment in payments:
            if payment.payment_method.payment_type in ['cash']:
                payment_methods['cash'] += float(payment.amount)
            elif payment.payment_method.payment_type in ['credit_card', 'debit_card', 'stripe']:
                payment_methods['card'] += float(payment.amount)
            elif payment.payment_method.payment_type in ['qr_code', 'mobile_payment']:
                payment_methods['qr'] += float(payment.amount)
        
        # Top productos
        from django.db.models import Count, F
        top_products = OrderItem.objects.filter(
            order__in=orders
        ).values(
            'product_name'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum('total_price')
        ).order_by('-quantity_sold')[:5]
        
        return Response({
            'date': target_date.isoformat(),
            'total_sales': float(total_sales),
            'total_transactions': total_transactions,
            'payment_methods': payment_methods,
            'top_products': list(top_products)
        })
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Métricas del cajero actual"""
        period = request.query_params.get('period', 'today')
        
        if period == 'today':
            start_date = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = timezone.now() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now() - timedelta(days=30)
        else:
            start_date = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        orders = Order.objects.filter(
            processed_by=request.user,
            created_at__gte=start_date,
            order_type='in_store',
            status__in=['completed', 'delivered']
        )
        
        sales_count = orders.count()
        total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        average_ticket = total_revenue / sales_count if sales_count > 0 else 0
        
        # Clientes únicos
        customer_count = orders.values('customer').distinct().count()
        
        return Response({
            'sales_count': sales_count,
            'total_revenue': float(total_revenue),
            'average_ticket': float(average_ticket),
            'customer_count': customer_count
        })
