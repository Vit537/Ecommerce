"""
Script para generar datos de prueba para Machine Learning
Genera 2 años de datos históricos de ventas, clientes y productos
"""
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, Category, Brand, ProductVariant
from orders.models import Order, OrderItem, PaymentMethod
from datetime import datetime, timedelta
import random
from decimal import Decimal

User = get_user_model()


def generate_ml_training_data():
    """
    Genera datos de entrenamiento para ML
    """
    print("=" * 80)
    print("🤖 GENERANDO DATOS DE PRUEBA PARA MACHINE LEARNING")
    print("=" * 80)
    
    # 1. Crear métodos de pago si no existen
    print("\n📱 Creando métodos de pago...")
    payment_methods = []
    payment_data = [
        ('Efectivo', 'cash'),
        ('Tarjeta de Crédito', 'credit_card'),
        ('Tarjeta de Débito', 'debit_card'),
        ('Transferencia Bancaria', 'bank_transfer'),
        ('QR / Pago Móvil', 'mobile_payment'),
    ]
    
    for name, ptype in payment_data:
        # Buscar primero si existe
        pm = PaymentMethod.objects.filter(payment_type=ptype).first()
        if pm:
            payment_methods.append(pm)
            print(f"   ✓ Existente: {name}")
        else:
            pm = PaymentMethod.objects.create(
                name=name,
                payment_type=ptype,
                is_active=True
            )
            payment_methods.append(pm)
            print(f"   ✓ Creado: {name}")
    
    # 2. Verificar productos
    products = list(Product.objects.filter(status='active'))
    if len(products) < 10:
        print("\n⚠️  ADVERTENCIA: Menos de 10 productos encontrados.")
        print("   Se recomienda tener al menos 50 productos para mejores resultados.")
        print("   Continuando con los productos disponibles...")
    else:
        print(f"\n✓ {len(products)} productos disponibles")
    
    # 3. Crear clientes si no existen suficientes
    print("\n👥 Verificando clientes...")
    customers = list(User.objects.filter(role='customer'))
    
    if len(customers) < 50:
        print(f"   Creando {50 - len(customers)} clientes adicionales...")
        nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura', 
                   'Miguel', 'Sofia', 'José', 'Isabel', 'Diego', 'Patricia', 'Javier']
        apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 
                     'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez']
        
        for i in range(50 - len(customers)):
            nombre = random.choice(nombres)
            apellido = random.choice(apellidos)
            email = f"{nombre.lower()}.{apellido.lower()}{random.randint(1, 999)}@example.com"
            
            customer = User.objects.create_user(
                email=email,
                password='password123',
                first_name=nombre,
                last_name=apellido,
                role='customer',
                phone=f"+591 {random.randint(60000000, 79999999)}"
            )
            customers.append(customer)
        
        print(f"   ✓ {len(customers)} clientes totales")
    else:
        print(f"   ✓ {len(customers)} clientes existentes")
    
    # 4. Obtener o crear empleado vendedor
    print("\n👔 Verificando empleados...")
    employee = User.objects.filter(role='employee').first()
    if not employee:
        employee = User.objects.create_user(
            email='vendedor@boutique.com',
            password='password123',
            first_name='Vendedor',
            last_name='Principal',
            role='employee'
        )
        print("   ✓ Empleado creado")
    else:
        print(f"   ✓ Empleado: {employee.email}")
    
    # 5. GENERAR VENTAS HISTÓRICAS (2 AÑOS)
    print("\n💰 Generando ventas históricas (2 años)...")
    print("   Esto puede tomar algunos minutos...")
    
    start_date = datetime.now() - timedelta(days=730)  # 2 años atrás
    end_date = datetime.now()
    
    # Patrones de ventas
    # - Más ventas en fines de semana
    # - Más ventas en diciembre (navidad) y julio (invierno/ofertas)
    # - Clientes VIP compran más frecuentemente
    
    # Segmentar clientes
    vip_customers = random.sample(customers, k=min(10, len(customers) // 5))  # 20% VIP
    frequent_customers = random.sample(customers, k=min(20, len(customers) // 3))  # 30% frecuentes
    
    current_date = start_date
    orders_created = 0
    total_revenue = 0
    
    while current_date <= end_date:
        # Determinar cuántas ventas generar este día
        day_of_week = current_date.weekday()
        month = current_date.month
        
        # Base: 2-5 ventas por día
        base_orders = random.randint(2, 5)
        
        # Multipliers
        # Fin de semana: +50%
        if day_of_week >= 5:
            base_orders = int(base_orders * 1.5)
        
        # Diciembre: +80%
        if month == 12:
            base_orders = int(base_orders * 1.8)
        # Julio: +30%
        elif month == 7:
            base_orders = int(base_orders * 1.3)
        
        # Generar ventas del día
        for _ in range(base_orders):
            # Seleccionar cliente (VIPs compran más)
            if random.random() < 0.3 and vip_customers:
                customer = random.choice(vip_customers)
                items_count = random.randint(3, 8)  # VIPs compran más items
            elif random.random() < 0.5 and frequent_customers:
                customer = random.choice(frequent_customers)
                items_count = random.randint(2, 5)
            else:
                customer = random.choice(customers)
                items_count = random.randint(1, 3)
            
            # Crear orden
            order = Order.objects.create(
                customer=customer,
                employee=employee,
                payment_method=random.choice(payment_methods),
                status=random.choice(['delivered', 'delivered', 'delivered', 'completed']),  # Mayoría completadas
                created_at=current_date + timedelta(hours=random.randint(9, 20))  # Horario comercial
            )
            
            # Agregar items
            order_total = Decimal('0.00')
            selected_products = random.sample(products, min(items_count, len(products)))
            
            for product in selected_products:
                quantity = random.randint(1, 3)
                price = product.sale_price if product.sale_price else product.price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=price,
                    subtotal=price * quantity
                )
                
                order_total += price * quantity
            
            # Aplicar descuento aleatorio (10% de las ventas)
            if random.random() < 0.1:
                discount = order_total * Decimal('0.10')  # 10% de descuento
            else:
                discount = Decimal('0.00')
            
            order.discount_amount = discount
            order.total_amount = order_total - discount
            order.save()
            
            orders_created += 1
            total_revenue += float(order.total_amount)
            
            # Mostrar progreso cada 100 órdenes
            if orders_created % 100 == 0:
                days_processed = (current_date - start_date).days
                progress = (days_processed / 730) * 100
                print(f"   Progreso: {progress:.1f}% - {orders_created} órdenes creadas")
        
        # Siguiente día
        current_date += timedelta(days=1)
    
    print(f"\n✅ GENERACIÓN COMPLETADA")
    print(f"   📊 Órdenes creadas: {orders_created}")
    print(f"   💵 Ingreso total generado: Bs. {total_revenue:,.2f}")
    print(f"   📈 Promedio por orden: Bs. {total_revenue/orders_created:.2f}")
    print(f"   📅 Período: {start_date.date()} a {end_date.date()}")
    
    # Estadísticas adicionales
    print(f"\n📊 ESTADÍSTICAS FINALES:")
    print(f"   Clientes: {len(customers)}")
    print(f"   Productos: {len(products)}")
    print(f"   Clientes VIP: {len(vip_customers)}")
    print(f"   Clientes Frecuentes: {len(frequent_customers)}")
    
    # Verificar distribución temporal
    orders_by_month = {}
    for order in Order.objects.filter(created_at__gte=start_date):
        month_key = order.created_at.strftime('%Y-%m')
        orders_by_month[month_key] = orders_by_month.get(month_key, 0) + 1
    
    print(f"\n📆 DISTRIBUCIÓN MENSUAL (últimos 6 meses):")
    for month_key in sorted(orders_by_month.keys())[-6:]:
        print(f"   {month_key}: {orders_by_month[month_key]} órdenes")
    
    print("\n" + "=" * 80)
    print("✅ LISTO PARA ENTRENAR MODELOS DE MACHINE LEARNING")
    print("=" * 80)
    print("\n💡 PRÓXIMOS PASOS:")
    print("   1. Ejecutar migraciones: python manage.py makemigrations ml_predictions")
    print("   2. Aplicar migraciones: python manage.py migrate")
    print("   3. Entrenar modelo de ventas: POST /api/ml/train-sales-forecast/")
    print("   4. Entrenar modelo de recomendaciones: POST /api/ml/train-product-recommendation/")
    print("   5. Entrenar segmentación de clientes: POST /api/ml/train-customer-segmentation/")
    print("\n")


if __name__ == '__main__':
    try:
        generate_ml_training_data()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
