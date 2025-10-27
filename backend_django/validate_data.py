"""
Script para validar la integridad de los datos después de cargarlos
Ejecutar con: python manage.py shell < validate_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, Category, Brand
from orders.models import Order, OrderItem, Payment, Invoice
from permissions.models import Permission, Role

User = get_user_model()

print("=" * 80)
print("🔍 VALIDANDO INTEGRIDAD DE DATOS")
print("=" * 80)

errors = []
warnings = []

# 1. Verificar usuarios
print("\n👤 Validando usuarios...")
users_count = User.objects.count()
superusers_count = User.objects.filter(is_superuser=True).count()
customers_count = User.objects.filter(role='customer').count()
employees_count = User.objects.filter(role__in=['employee', 'manager', 'admin']).count()

print(f"   Total usuarios: {users_count}")
print(f"   Superusuarios: {superusers_count}")
print(f"   Clientes: {customers_count}")
print(f"   Empleados/Admin: {employees_count}")

if superusers_count == 0:
    errors.append("❌ No hay superusuarios creados")
if customers_count < 5:
    warnings.append("⚠️  Pocos clientes para pruebas ML")

# 2. Verificar productos
print("\n📦 Validando productos...")
products_count = Product.objects.count()
active_products = Product.objects.filter(status='active').count()
variants_count = ProductVariant.objects.count()
variants_with_stock = ProductVariant.objects.filter(stock_quantity__gt=0).count()

print(f"   Total productos: {products_count}")
print(f"   Productos activos: {active_products}")
print(f"   Variantes totales: {variants_count}")
print(f"   Variantes con stock: {variants_with_stock}")

if products_count == 0:
    errors.append("❌ No hay productos en la base de datos")
if variants_with_stock == 0:
    errors.append("❌ No hay stock disponible")

# 3. Verificar categorías y marcas
print("\n🏷️  Validando categorías y marcas...")
categories_count = Category.objects.count()
brands_count = Brand.objects.count()

print(f"   Categorías: {categories_count}")
print(f"   Marcas: {brands_count}")

if categories_count == 0:
    errors.append("❌ No hay categorías creadas")

# 4. Verificar órdenes
print("\n🛒 Validando órdenes...")
orders_count = Order.objects.count()
delivered_orders = Order.objects.filter(status='delivered').count()
order_items_count = OrderItem.objects.count()
payments_count = Payment.objects.count()
invoices_count = Invoice.objects.count()

print(f"   Total órdenes: {orders_count}")
print(f"   Órdenes entregadas: {delivered_orders}")
print(f"   Items en órdenes: {order_items_count}")
print(f"   Pagos registrados: {payments_count}")
print(f"   Facturas generadas: {invoices_count}")

if delivered_orders < 30:
    warnings.append(f"⚠️  Solo {delivered_orders} órdenes entregadas. Se recomiendan al menos 50 para ML")

# 5. Verificar permisos y roles
print("\n🔐 Validando permisos y roles...")
permissions_count = Permission.objects.count()
roles_count = Role.objects.count()

print(f"   Permisos: {permissions_count}")
print(f"   Roles: {roles_count}")

if permissions_count < 20:
    warnings.append("⚠️  Pocos permisos configurados")
if roles_count < 3:
    warnings.append("⚠️  Pocos roles configurados")

# 6. Validar relaciones
print("\n🔗 Validando relaciones...")

# Productos sin variantes
products_without_variants = Product.objects.filter(variants__isnull=True).count()
if products_without_variants > 0:
    warnings.append(f"⚠️  {products_without_variants} productos sin variantes")
    print(f"   Productos sin variantes: {products_without_variants}")

# Órdenes sin items
orders_without_items = Order.objects.filter(items__isnull=True).count()
if orders_without_items > 0:
    errors.append(f"❌ {orders_without_items} órdenes sin items")
    print(f"   Órdenes sin items: {orders_without_items}")

# Items con información faltante
items_without_product_name = OrderItem.objects.filter(product_name='').count()
if items_without_product_name > 0:
    warnings.append(f"⚠️  {items_without_product_name} items sin nombre de producto guardado")

print("\n")
print("=" * 80)

# Mostrar resumen
if errors:
    print("❌ ERRORES ENCONTRADOS:")
    for error in errors:
        print(f"   {error}")
    print()

if warnings:
    print("⚠️  ADVERTENCIAS:")
    for warning in warnings:
        print(f"   {warning}")
    print()

if not errors and not warnings:
    print("✅ TODOS LOS DATOS SON VÁLIDOS")
    print("   El sistema está listo para usarse")
    print()

# Estadísticas ML
print("🤖 PREPARACIÓN PARA MACHINE LEARNING:")
print(f"   Clientes: {customers_count}")
print(f"   Productos: {active_products}")
print(f"   Órdenes completadas: {delivered_orders}")
print(f"   Items vendidos: {order_items_count}")

if delivered_orders >= 100:
    print("   ✅ EXCELENTE: Datos suficientes para ML de alta precisión")
elif delivered_orders >= 50:
    print("   ✅ BUENO: Datos suficientes para ML con buena precisión")
elif delivered_orders >= 30:
    print("   ⚠️  ACEPTABLE: Datos mínimos para ML")
else:
    print("   ❌ INSUFICIENTE: Se necesitan más datos para ML")

print()
print("=" * 80)
print("✅ VALIDACIÓN COMPLETADA")
print("=" * 80)
