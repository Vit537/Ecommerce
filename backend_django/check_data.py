"""
Script para verificar datos actuales en la base de datos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from products.models import Product, ProductVariant, Category
from django.db.models import Count, Sum

User = get_user_model()

print("=" * 60)
print("=== RESUMEN DE DATOS ACTUALES EN LA BASE DE DATOS ===")
print("=" * 60)

# USUARIOS
print("\n📊 USUARIOS:")
print(f"  Total: {User.objects.count()}")
print(f"  Clientes: {User.objects.filter(role='customer').count()}")
print(f"  Empleados: {User.objects.filter(role='employee').count()}")
print(f"  Admins: {User.objects.filter(role='admin').count()}")

if User.objects.exists():
    print("\n  Ejemplos de usuarios:")
    for user in User.objects.all()[:5]:
        print(f"    - {user.email} ({user.role})")

# CATEGORÍAS
print("\n🏷️ CATEGORÍAS:")
print(f"  Total: {Category.objects.count()}")
if Category.objects.exists():
    for cat in Category.objects.all():
        print(f"    - {cat.name}")

# PRODUCTOS
print("\n📦 PRODUCTOS:")
print(f"  Total: {Product.objects.count()}")
print(f"  Activos: {Product.objects.filter(status='active').count()}")
print(f"  Variantes: {ProductVariant.objects.count()}")

if Product.objects.exists():
    print("\n  Ejemplos de productos:")
    for prod in Product.objects.all()[:5]:
        variants = ProductVariant.objects.filter(product=prod)
        stock_total = sum(v.stock_quantity for v in variants)
        print(f"    - {prod.name} (${prod.price}) - Stock: {stock_total}")

# ÓRDENES
print("\n🛒 ÓRDENES:")
total_orders = Order.objects.count()
print(f"  Total: {total_orders}")

if total_orders > 0:
    status_counts = Order.objects.values('status').annotate(count=Count('id'))
    for s in status_counts:
        print(f"    {s['status']}: {s['count']}")
    
    # Items de órdenes
    print(f"\n  Items de órdenes: {OrderItem.objects.count()}")
    
    # Estadísticas
    print("\n💰 ESTADÍSTICAS:")
    total_sales = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    print(f"  Ventas totales: ${total_sales:.2f}")
    if total_orders > 0:
        print(f"  Promedio por orden: ${total_sales/total_orders:.2f}")
    
    # Últimas órdenes
    print("\n  Últimas 5 órdenes:")
    for order in Order.objects.order_by('-created_at')[:5]:
        print(f"    - #{order.order_number} - ${order.total_amount} ({order.status}) - {order.created_at.strftime('%Y-%m-%d')}")
else:
    print("    No hay órdenes en la base de datos")

print("\n" + "=" * 60)
print("✅ Verificación completada")
print("=" * 60)
