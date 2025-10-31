"""
Script para verificar los datos cargados en la base de datos
"""
import os
import sys
import django

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, Category, Brand
from orders.models import Order, OrderItem, Invoice, Payment, PaymentMethod
from permissions.models import Permission, Role

User = get_user_model()

print("=" * 80)
print("📊 RESUMEN DE DATOS EN LA BASE DE DATOS")
print("=" * 80)
print()

print("👤 USUARIOS:")
print(f"   • Total: {User.objects.count()}")
print(f"   • Admins: {User.objects.filter(role='admin').count()}")
print(f"   • Empleados: {User.objects.filter(role='employee').count()}")
print(f"   • Gerentes: {User.objects.filter(role='manager').count()}")
print(f"   • Clientes: {User.objects.filter(role='customer').count()}")
print()

print("🔐 PERMISOS Y ROLES:")
print(f"   • Permisos: {Permission.objects.count()}")
print(f"   • Roles: {Role.objects.count()}")
print()

print("📦 PRODUCTOS:")
products_count = Product.objects.count()
variants_count = ProductVariant.objects.count()
print(f"   • Categorías: {Category.objects.count()}")
print(f"   • Marcas: {Brand.objects.count()}")
print(f"   • Productos: {products_count}")
print(f"   • Variantes: {variants_count}")

if products_count > 0:
    avg_variants = variants_count / products_count
    print(f"   • Promedio variantes por producto: {avg_variants:.1f}")
    
    # Stock total
    from django.db.models import Sum
    total_stock = ProductVariant.objects.aggregate(total=Sum('stock_quantity'))['total'] or 0
    print(f"   • Stock total en inventario: {total_stock:,} unidades")
print()

print("🛒 ÓRDENES Y VENTAS:")
orders_count = Order.objects.count()
print(f"   • Órdenes: {orders_count}")
print(f"   • Items de Orden: {OrderItem.objects.count()}")
print(f"   • Facturas: {Invoice.objects.count()}")
print(f"   • Pagos: {Payment.objects.count()}")
print(f"   • Métodos de Pago: {PaymentMethod.objects.count()}")
print()

# Distribución de órdenes por cliente
print("� DISTRIBUCIÓN DE ÓRDENES POR CLIENTE:")
customers = User.objects.filter(role='customer')
customers_count = customers.count()

if customers_count > 0 and orders_count > 0:
    avg_orders = orders_count / customers_count
    print(f"   • Promedio: {avg_orders:.1f} órdenes por cliente")
    
    # Top 10 clientes con más órdenes
    from django.db.models import Count
    top_customers = User.objects.filter(role='customer').annotate(
        orders_count=Count('orders')
    ).order_by('-orders_count')[:10]
    
    print(f"   • Top 10 clientes:")
    for i, customer in enumerate(top_customers, 1):
        print(f"     {i}. {customer.first_name} {customer.last_name}: {customer.orders_count} órdenes")
    
    # Clientes sin órdenes
    no_orders = User.objects.filter(role='customer', orders__isnull=True).count()
    print(f"   • Clientes sin órdenes: {no_orders}")
print()

# Distribución de órdenes por estado
print("📋 DISTRIBUCIÓN DE ÓRDENES POR ESTADO:")
status_dist = Order.objects.values('status').annotate(count=Count('id')).order_by('-count')
for item in status_dist:
    print(f"   • {item['status']}: {item['count']} órdenes")
print()

# Ventas totales
from django.db.models import Sum
from decimal import Decimal
total_sales = Order.objects.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
print(f"💰 VENTAS TOTALES: Bs. {total_sales:,.2f}")
print()

# Rango de fechas de órdenes
first_order = Order.objects.order_by('created_at').first()
last_order = Order.objects.order_by('-created_at').first()
if first_order and last_order:
    print("📅 RANGO DE FECHAS:")
    print(f"   • Primera orden: {first_order.created_at.strftime('%Y-%m-%d %H:%M')}")
    print(f"   • Última orden: {last_order.created_at.strftime('%Y-%m-%d %H:%M')}")
    print()

print("=" * 80)
print("✅ VERIFICACIÓN COMPLETADA")
print("=" * 80)
print()

print("👤 CREDENCIALES DE ACCESO:")
print("-" * 80)
print("Super Admin: superadmin@boutique.com / admin123")
print("Administrador: admin@boutique.com / admin123")
print("Cajero: cajero@boutique.com / cajero123")
print("Gerente: gerente@boutique.com / gerente123")
print("Clientes: *.@email.com / cliente123")
print("-" * 80)
