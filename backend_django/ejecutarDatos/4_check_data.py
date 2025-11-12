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
from django.db.models import Sum, Count
from decimal import Decimal

from products.models import Product, ProductVariant, Category, Brand, Supplier, ProductSupplier
from orders.models import (Order, OrderItem, Invoice, Payment, PaymentMethod, ShippingMethod,
                            PurchaseOrder, PurchaseOrderItem, StockMovement)
from permissions.models import Permission, Role, UserRole
from employees.models import Department, Position, Employee, Shift
from finance.models import ExpenseCategory, Expense, Transaction
from notifications.models import NotificationTemplate, NotificationSettings
from cart.models import Cart, CartItem
from assistant.models import ChatConversation, ChatMessage
from ml_predictions.models import MLModel, Prediction, SalesForecast
from reports.models import ReportLog

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

print("🏢 ESTRUCTURA ORGANIZACIONAL:")
print(f"   • Departamentos: {Department.objects.count()}")
print(f"   • Puestos de Trabajo: {Position.objects.count()}")
print(f"   • Empleados: {Employee.objects.count()}")
print(f"   • Turnos de Cajero: {Shift.objects.count()}")
print()

print("📦 PRODUCTOS:")
products_count = Product.objects.count()
variants_count = ProductVariant.objects.count()
print(f"   • Categorías: {Category.objects.count()}")
print(f"   • Marcas: {Brand.objects.count()}")
print(f"   • Productos: {products_count}")
print(f"   • Variantes: {variants_count}")
print(f"   • Proveedores: {Supplier.objects.count()}")
print(f"   • Relaciones Producto-Proveedor: {ProductSupplier.objects.count()}")

if products_count > 0:
    avg_variants = variants_count / products_count
    print(f"   • Promedio variantes por producto: {avg_variants:.1f}")
    
    # Stock total
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
print(f"   • Métodos de Envío: {ShippingMethod.objects.count()}")
print()

print("📦 COMPRAS E INVENTARIO:")
print(f"   • Órdenes de Compra: {PurchaseOrder.objects.count()}")
print(f"   • Items de Órdenes de Compra: {PurchaseOrderItem.objects.count()}")
print(f"   • Movimientos de Stock: {StockMovement.objects.count()}")
print()

print("💰 FINANZAS:")
print(f"   • Categorías de Gastos: {ExpenseCategory.objects.count()}")
print(f"   • Gastos Registrados: {Expense.objects.count()}")
print(f"   • Transacciones: {Transaction.objects.count()}")
total_expenses = Expense.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or Decimal('0')
print(f"   • Total Gastos: Bs. {total_expenses:,.2f}")
print()

print("📧 NOTIFICACIONES:")
print(f"   • Plantillas: {NotificationTemplate.objects.count()}")
print(f"   • Configuración: {'✓ Configurada' if NotificationSettings.objects.exists() else '✗ No configurada'}")
print()

print("🛒 CARRITOS:")
print(f"   • Carritos: {Cart.objects.count()}")
print(f"   • Items en Carritos: {CartItem.objects.count()}")
print()

print("💬 ASISTENTE/CHAT:")
print(f"   • Conversaciones: {ChatConversation.objects.count()}")
print(f"   • Mensajes: {ChatMessage.objects.count()}")
print()

print("🤖 MACHINE LEARNING:")
print(f"   • Modelos ML: {MLModel.objects.count()}")
print(f"   • Predicciones: {Prediction.objects.count()}")
print(f"   • Pronósticos de Ventas: {SalesForecast.objects.count()}")
print()

print("📊 REPORTES:")
print(f"   • Logs de Reportes: {ReportLog.objects.count()}")
print()

# Distribución de órdenes por cliente
print("👥 DISTRIBUCIÓN DE ÓRDENES POR CLIENTE:")
customers = User.objects.filter(role='customer')
customers_count = customers.count()

if customers_count > 0 and orders_count > 0:
    avg_orders = orders_count / customers_count
    print(f"   • Promedio: {avg_orders:.1f} órdenes por cliente")
    
    # Top 5 clientes con más órdenes
    top_customers = User.objects.filter(role='customer').annotate(
        orders_count=Count('orders')
    ).order_by('-orders_count')[:5]
    
    print(f"   • Top 5 clientes:")
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
    
    # Calcular duración
    duration = last_order.created_at - first_order.created_at
    print(f"   • Período de datos: {duration.days} días (~{duration.days/30:.1f} meses)")
print()

# Estadísticas de turnos de cajero
if Shift.objects.exists():
    total_shifts = Shift.objects.count()
    closed_shifts = Shift.objects.filter(status='closed').count()
    print("⏰ TURNOS DE CAJERO:")
    print(f"   • Total de turnos: {total_shifts}")
    print(f"   • Turnos cerrados: {closed_shifts}")
    
    avg_sales_per_shift = Shift.objects.filter(status='closed').aggregate(
        avg_sales=Sum('total_sales')/Count('id')
    )['avg_sales'] or Decimal('0')
    print(f"   • Promedio de ventas por turno: Bs. {avg_sales_per_shift:,.2f}")
    print()

# Estadísticas de compras
if PurchaseOrder.objects.exists():
    total_po = PurchaseOrder.objects.count()
    received_po = PurchaseOrder.objects.filter(status='received').count()
    total_po_amount = PurchaseOrder.objects.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    
    print("📦 ÓRDENES DE COMPRA:")
    print(f"   • Total órdenes: {total_po}")
    print(f"   • Órdenes recibidas: {received_po}")
    print(f"   • Monto total: Bs. {total_po_amount:,.2f}")
    print()

print("=" * 80)
print("✅ VERIFICACIÓN COMPLETADA")
print("=" * 80)
print()

# Resumen de tablas importantes
print("📋 RESUMEN DE TABLAS:")
print(f"   • Usuarios: {User.objects.count()}")
print(f"   • Productos y Variantes: {Product.objects.count()} / {ProductVariant.objects.count()}")
print(f"   • Órdenes de Venta: {Order.objects.count()}")
print(f"   • Órdenes de Compra: {PurchaseOrder.objects.count()}")
print(f"   • Movimientos de Stock: {StockMovement.objects.count()}")
print(f"   • Gastos: {Expense.objects.count()}")
print(f"   • Transacciones: {Transaction.objects.count()}")
print(f"   • Turnos: {Shift.objects.count()}")
print()

print("👤 CREDENCIALES DE ACCESO:")
print("-" * 80)
print("Super Admin: superadmin@boutique.com / admin123")
print("Administrador: admin@boutique.com / admin123")
print("Cajero: cajero@boutique.com / cajero123")
print("Gerente: gerente@boutique.com / gerente123")
print("Clientes: *.@email.com / cliente123")
print("-" * 80)
