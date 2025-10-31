from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant
from decimal import Decimal
import uuid

User = get_user_model()


class PaymentMethod(models.Model):
    """
    Métodos de pago disponibles
    """
    PAYMENT_TYPES = [
        ('cash', 'Efectivo'),
        ('credit_card', 'Tarjeta de Crédito'),
        ('debit_card', 'Tarjeta de Débito'),
        ('bank_transfer', 'Transferencia Bancaria'),
        ('mobile_payment', 'Pago Móvil'),
        ('check', 'Cheque'),
        ('store_credit', 'Crédito de Tienda'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=False)
    processing_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    processing_fee_fixed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Order(models.Model):
    """
    Órdenes de compra (ventas)
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
        ('refunded', 'Reembolsado'),
    ]
    
    ORDER_TYPES = [
        ('online', 'Venta Online'),
        ('in_store', 'Venta en Tienda'),
        ('phone', 'Venta por Teléfono'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPES, default='online')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Totales
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Información de envío
    shipping_address = models.JSONField(default=dict, blank=True)
    billing_address = models.JSONField(default=dict, blank=True)
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    internal_notes = models.TextField(blank=True, null=True)  # Solo para staff
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Usuario que procesó la orden (para ventas en tienda)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_orders')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['customer']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Orden {self.order_number} - {self.customer.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_order = Order.objects.filter(order_number__startswith=f'ORD-{date_str}').order_by('-order_number').first()
            if last_order:
                last_number = int(last_order.order_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.order_number = f'ORD-{date_str}-{new_number:04d}'
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Items de una orden
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Información del producto al momento de la venta (para histórico)
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    variant_details = models.JSONField(default=dict, blank=True)  # Color, talla, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product']),
        ]
    
    def save(self, *args, **kwargs):
        # Calcular total automáticamente
        self.total_price = self.quantity * self.unit_price
        
        # Guardar información del producto
        if not self.product_name:
            self.product_name = self.product.name
        if not self.product_sku:
            self.product_sku = self.product.sku
        
        # Guardar detalles de la variante
        if self.product_variant and not self.variant_details:
            self.variant_details = {
                'size': str(self.product_variant.size) if self.product_variant.size else None,
                'color': str(self.product_variant.color) if self.product_variant.color else None,
                'sku_variant': self.product_variant.sku_variant
            }
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity} - Orden {self.order.order_number}"


class Payment(models.Model):
    """
    Pagos realizados para una orden
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
        ('refunded', 'Reembolsado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='payments')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Información del pago
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    reference_number = models.CharField(max_length=255, blank=True, null=True)
    
    # Fechas
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Usuario que procesó el pago
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payments')
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['status']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"Pago {self.amount} - {self.payment_method.name} - Orden {self.order.order_number}"


class Invoice(models.Model):
    """
    Facturas de venta
    """
    INVOICE_TYPES = [
        ('sale', 'Factura de Venta'),
        ('credit_note', 'Nota de Crédito'),
        ('debit_note', 'Nota de Débito'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('sent', 'Enviada'),
        ('paid', 'Pagada'),
        ('overdue', 'Vencida'),
        ('cancelled', 'Cancelada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPES, default='sale')
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='invoices')
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='invoices')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Información fiscal
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Porcentaje de impuesto
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Fechas
    issue_date = models.DateField()
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Usuario que creó la factura
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_invoices')
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['customer']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"Factura {self.invoice_number} - {self.customer.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            # Generate invoice number
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_invoice = Invoice.objects.filter(invoice_number__startswith=f'FAC-{date_str}').order_by('-invoice_number').first()
            if last_invoice:
                last_number = int(last_invoice.invoice_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.invoice_number = f'FAC-{date_str}-{new_number:04d}'
        super().save(*args, **kwargs)


class PurchaseOrder(models.Model):
    """
    Órdenes de compra a proveedores
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('sent', 'Enviada'),
        ('confirmed', 'Confirmada'),
        ('partially_received', 'Parcialmente Recibida'),
        ('received', 'Recibida'),
        ('cancelled', 'Cancelada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey('products.Supplier', on_delete=models.PROTECT, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Totales
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Fechas
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Usuario que creó la orden
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_purchase_orders')
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['po_number']),
            models.Index(fields=['supplier']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"OC {self.po_number} - {self.supplier.name}"
    
    def save(self, *args, **kwargs):
        if not self.po_number:
            # Generate PO number
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_po = PurchaseOrder.objects.filter(po_number__startswith=f'OC-{date_str}').order_by('-po_number').first()
            if last_po:
                last_number = int(last_po.po_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.po_number = f'OC-{date_str}-{new_number:04d}'
        super().save(*args, **kwargs)


class PurchaseOrderItem(models.Model):
    """
    Items de una orden de compra
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    quantity_ordered = models.PositiveIntegerField()
    quantity_received = models.PositiveIntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['purchase_order']),
            models.Index(fields=['product']),
        ]
    
    @property
    def remaining_quantity(self):
        return self.quantity_ordered - self.quantity_received
    
    @property
    def is_fully_received(self):
        return self.quantity_received >= self.quantity_ordered
    
    def save(self, *args, **kwargs):
        # Calcular total automáticamente
        self.total_cost = self.quantity_ordered * self.unit_cost
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity_ordered} - OC {self.purchase_order.po_number}"


class StockMovement(models.Model):
    """
    Movimientos de inventario
    """
    MOVEMENT_TYPES = [
        ('purchase', 'Compra'),
        ('sale', 'Venta'),
        ('adjustment', 'Ajuste'),
        ('transfer', 'Transferencia'),
        ('return', 'Devolución'),
        ('damaged', 'Dañado'),
        ('lost', 'Pérdida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()  # Positivo para entrada, negativo para salida
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    
    # Referencias
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Información adicional
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # Usuario que realizó el movimiento
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='stock_movements')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product_variant']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        direction = "Entrada" if self.quantity > 0 else "Salida"
        return f"{direction} - {self.product_variant} - {abs(self.quantity)} unidades"