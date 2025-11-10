from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant
import uuid

User = get_user_model()


class Cart(models.Model):
    """
    Shopping cart model supporting both authenticated and anonymous users
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='carts')
    session_id = models.CharField(max_length=255, null=True, blank=True)  # For anonymous users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Anonymous cart {self.session_id}"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def subtotal(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    """
    Individual items in a shopping cart
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('cart', 'product_variant')
        indexes = [
            models.Index(fields=['cart']),
            models.Index(fields=['product']),
            models.Index(fields=['product_variant']),
        ]
    
    def __str__(self):
        variant_info = ""
        if self.product_variant:
            if self.product_variant.size:
                variant_info += f" {self.product_variant.size.name}"
            if self.product_variant.color:
                variant_info += f" {self.product_variant.color.name}"
        return f"{self.product.name}{variant_info} x{self.quantity}"
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price
    
    def save(self, *args, **kwargs):
        # Validar stock disponible de la variante
        if self.product_variant:
            if self.product_variant.available_stock < self.quantity:
                raise ValueError(f"Stock insuficiente. Disponible: {self.product_variant.available_stock}")
            
            # Usar precio de la variante si tiene ajuste
            if not self.unit_price:
                self.unit_price = self.product_variant.final_price
        else:
            # Usar precio del producto base
            if not self.unit_price:
                self.unit_price = self.product.price
        
        super().save(*args, **kwargs)
