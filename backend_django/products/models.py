from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Category(models.Model):
    """
    Categorías de productos para tienda de ropa
    """
    CATEGORY_TYPES = [
        ('clothing', 'Ropa'),
        ('footwear', 'Calzado'),
        ('accessories', 'Accesorios'),
        ('underwear', 'Ropa Interior'),
        ('sportswear', 'Ropa Deportiva'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='clothing')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    season = models.CharField(max_length=20, blank=True, null=True)  # Verano, Invierno, etc.
    target_gender = models.CharField(max_length=20, blank=True, null=True)  # Hombre, Mujer, Unisex
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class Brand(models.Model):
    """
    Marcas de productos
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    country_origin = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Size(models.Model):
    """
    Tallas disponibles
    """
    SIZE_TYPES = [
        ('clothing', 'Ropa'),
        ('shoes', 'Calzado'),
        ('accessories', 'Accesorios'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=10)  # XS, S, M, L, XL, 38, 39, etc.
    size_type = models.CharField(max_length=20, choices=SIZE_TYPES)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('name', 'size_type')
        ordering = ['size_type', 'sort_order']
    
    def __str__(self):
        return f"{self.name} ({self.get_size_type_display()})"


class Color(models.Model):
    """
    Colores disponibles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, blank=True, null=True)  # #FFFFFF
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Productos de la tienda de ropa con gestión de inventario
    """
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('discontinued', 'Descontinuado'),
        ('out_of_stock', 'Agotado'),
    ]
    
    GENDER_CHOICES = [
        ('men', 'Hombre'),
        ('women', 'Mujer'),
        ('unisex', 'Unisex'),
        ('kids', 'Niños'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Precio antes del descuento
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    target_gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='unisex')
    material = models.CharField(max_length=100, blank=True, null=True)  # Algodón, Poliéster, etc.
    care_instructions = models.TextField(blank=True, null=True)
    sizes = models.ManyToManyField(Size, blank=True, related_name='products')
    colors = models.ManyToManyField(Color, blank=True, related_name='products')
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    dimensions = models.JSONField(default=dict, blank=True)  # {"length": 10, "width": 5, "height": 3}
    images = models.JSONField(default=list, blank=True)  # ["url1", "url2", "url3"]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_featured = models.BooleanField(default=False)
    is_on_sale = models.BooleanField(default=False)
    season = models.CharField(max_length=20, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_products')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['brand']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['target_gender']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.sku}"
    
    @property
    def total_stock(self):
        """Obtener stock total de todas las variantes"""
        return sum(variant.stock_quantity for variant in self.variants.all())
    
    @property
    def is_in_stock(self):
        return self.total_stock > 0
    
    @property
    def discount_percentage(self):
        """Calcular porcentaje de descuento"""
        if self.compare_at_price and self.compare_at_price > self.price:
            return round(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
        return 0
    
    def save(self, *args, **kwargs):
        if not self.sku:
            # Auto-generate SKU if not provided
            self.sku = f"PROD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """
    Variantes de productos (combinación de color, talla, etc.)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.ForeignKey(Size, on_delete=models.CASCADE, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.CASCADE, null=True, blank=True)
    sku_variant = models.CharField(max_length=100, unique=True)
    stock_quantity = models.IntegerField(default=0)
    min_stock_level = models.IntegerField(default=5)
    reserved_quantity = models.IntegerField(default=0)  # Stock reservado por órdenes pendientes
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Ajuste de precio para esta variante
    images = models.JSONField(default=list, blank=True)  # Imágenes específicas de esta variante
    barcode = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'size', 'color')
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['sku_variant']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        variant_details = []
        if self.size:
            variant_details.append(str(self.size.name))
        if self.color:
            variant_details.append(str(self.color.name))
        variant_str = " - ".join(variant_details) if variant_details else "Sin variantes"
        return f"{self.product.name} ({variant_str})"
    
    @property
    def available_stock(self):
        """Stock disponible (total - reservado)"""
        return max(0, self.stock_quantity - self.reserved_quantity)
    
    @property
    def needs_restock(self):
        return self.stock_quantity <= self.min_stock_level
    
    @property
    def final_price(self):
        """Precio final incluyendo ajuste de la variante"""
        return self.product.price + self.price_adjustment
    
    def save(self, *args, **kwargs):
        if not self.sku_variant:
            # Auto-generate variant SKU
            variant_parts = [self.product.sku]
            if self.size:
                variant_parts.append(self.size.name)
            if self.color:
                variant_parts.append(self.color.name[:3].upper())
            self.sku_variant = "-".join(variant_parts)
        super().save(*args, **kwargs)


class Supplier(models.Model):
    """
    Proveedores de productos
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    tax_id = models.CharField(max_length=50, blank=True, null=True)
    payment_terms = models.CharField(max_length=100, blank=True, null=True)  # 30 días, al contado, etc.
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ProductSupplier(models.Model):
    """
    Relación entre productos y proveedores
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='suppliers')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    supplier_sku = models.CharField(max_length=100, blank=True, null=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_quantity = models.IntegerField(default=1)
    lead_time_days = models.IntegerField(default=7)  # Tiempo de entrega en días
    is_primary = models.BooleanField(default=False)  # Proveedor principal
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'supplier')
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['supplier']),
            models.Index(fields=['is_primary']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.supplier.name}"
