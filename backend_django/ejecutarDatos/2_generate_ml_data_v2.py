"""
Script para generar datos de prueba para Machine Learning
Genera datos históricos de ventas complementarios a los existentes
Adaptado a la estructura real de la base de datos
"""
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, Category, Brand, Size, Color
from orders.models import Order, OrderItem, PaymentMethod
from datetime import datetime, timedelta
from django.utils import timezone
import random
from decimal import Decimal

User = get_user_model()


def generate_ml_training_data():
    """
    Genera datos de entrenamiento complementarios para ML
    """
    print("=" * 80)
    print("🤖 GENERANDO DATOS COMPLEMENTARIOS PARA MACHINE LEARNING")
    print("=" * 80)
    
    # VERIFICAR DATOS EXISTENTES
    print("\n📊 VERIFICANDO DATOS EXISTENTES...")
    existing_customers = list(User.objects.filter(role='customer'))
    existing_products = list(Product.objects.filter(status='active'))
    existing_orders = Order.objects.count()
    
    print(f"   ✓ Clientes existentes: {len(existing_customers)}")
    print(f"   ✓ Productos existentes: {len(existing_products)}")
    print(f"   ✓ Órdenes existentes: {existing_orders}")
    
    if len(existing_products) == 0:
        print("\n❌ ERROR: No hay productos en la base de datos.")
        print("   Por favor, crea al menos 10 productos antes de ejecutar este script.")
        return
    
    # 1. MÉTODOS DE PAGO
    print("\n💳 Verificando métodos de pago...")
    payment_methods = []
    payment_data = [
        ('Efectivo', 'cash', 'Pago en efectivo en tienda'),
        ('Tarjeta de Crédito Visa', 'credit_card', 'Tarjeta de crédito Visa'),
        ('Tarjeta de Crédito Mastercard', 'credit_card', 'Tarjeta de crédito Mastercard'),
        ('Tarjeta de Débito', 'debit_card', 'Tarjeta de débito'),
        ('Transferencia Bancaria', 'bank_transfer', 'Transferencia bancaria'),
        ('QR Simple', 'mobile_payment', 'Pago móvil con QR'),
    ]
    
    for name, ptype, desc in payment_data:
        pm, created = PaymentMethod.objects.get_or_create(
            name=name,
            payment_type=ptype,
            defaults={
                'description': desc,
                'is_active': True,
                'processing_fee_percentage': Decimal('0.00')
            }
        )
        payment_methods.append(pm)
        status = "Creado" if created else "Existente"
        print(f"   {status}: {name}")
    
    # 2. USAR CLIENTES EXISTENTES (No crear más por rendimiento)
    print("\n👥 Usando clientes existentes...")
    customers = list(existing_customers)
    
    # Si hay muy pocos clientes, informar pero continuar
    if len(customers) < 5:
        print(f"   ⚠️  ADVERTENCIA: Solo hay {len(customers)} clientes.")
        print("   ⚠️  Se recomienda tener al menos 10 clientes para datos ML realistas.")
        print("   ⚠️  Ejecuta primero generate_test_data.py para crear más clientes base.")
    else:
        print(f"   ✓ {len(customers)} clientes disponibles para simulación")
    
    # Asegurar que tenemos al menos algunos clientes
    if len(customers) == 0:
        print("\n❌ ERROR: No hay clientes en la base de datos.")
        print("   Por favor, ejecuta generate_test_data.py primero.")
        return
    
    # 3. VERIFICAR EMPLEADOS
    print("\n👔 Verificando empleados...")
    employees = list(User.objects.filter(role__in=['employee', 'manager', 'admin']))
    if not employees:
        print("   ⚠️  No hay empleados. Usando clientes para processed_by.")
        employees = customers[:5]  # Usar algunos clientes como fallback
    else:
        print(f"   ✓ {len(employees)} empleados disponibles")
    
    # 4. OBTENER VARIANTES DE PRODUCTOS
    print("\n📦 Obteniendo variantes de productos...")
    product_variants = {}
    for product in existing_products:
        variants = list(ProductVariant.objects.filter(product=product, is_active=True))
        if variants:
            product_variants[product.id] = variants
        else:
            # Si no hay variantes, usar el producto base
            product_variants[product.id] = [None]
    
    print(f"   ✓ {len(product_variants)} productos con variantes disponibles")
    
    # 5. SEGMENTAR CLIENTES (para patrones realistas)
    print("\n🎯 Segmentando clientes...")
    random.shuffle(customers)
    
    # 10% VIP (compran mucho y frecuente)
    vip_count = max(5, len(customers) // 10)
    vip_customers = customers[:vip_count]
    
    # 25% Frecuentes (compran regularmente)
    frequent_count = max(10, len(customers) // 4)
    frequent_customers = customers[vip_count:vip_count + frequent_count]
    
    # 35% Ocasionales (compran de vez en cuando)
    occasional_count = max(15, int(len(customers) * 0.35))
    occasional_customers = customers[vip_count + frequent_count:vip_count + frequent_count + occasional_count]
    
    # El resto son nuevos/inactivos
    new_customers_list = customers[vip_count + frequent_count + occasional_count:]
    
    print(f"   ✓ VIP: {len(vip_customers)}")
    print(f"   ✓ Frecuentes: {len(frequent_customers)}")
    print(f"   ✓ Ocasionales: {len(occasional_customers)}")
    print(f"   ✓ Nuevos: {len(new_customers_list)}")
    
    # 6. GENERAR VENTAS HISTÓRICAS
    print("\n💰 Generando ventas históricas...")
    print("   Período: Últimos 6 meses")
    print("   Con 50 clientes → Promedio 12 órdenes por cliente en 6 meses")
    print("   Este proceso puede tomar varios minutos...")
    
    # Fecha de inicio: 6 meses atrás
    start_date = timezone.now() - timedelta(days=180)
    end_date = timezone.now()
    
    current_date = start_date
    orders_created = 0
    total_revenue = Decimal('0.00')
    
    # Estadísticas para mostrar progreso
    days_total = (end_date - current_date).days
    progress_step = max(1, days_total // 10)
    
    while current_date <= end_date:
        day_of_week = current_date.weekday()
        month = current_date.month
        
        # DETERMINAR CANTIDAD DE VENTAS POR DÍA
        # Base: 2-4 ventas por día (reducido para ~600 órdenes totales / 50 clientes)
        base_orders = random.randint(2, 4)
        
        # Fin de semana: +50% de ventas
        if day_of_week >= 5:
            base_orders = int(base_orders * 1.5)
        
        # Temporadas altas (más moderadas)
        if month == 12:  # Diciembre (Navidad): +80%
            base_orders = int(base_orders * 1.8)
        elif month in [6, 7]:  # Junio-Julio (Invierno/San Juan): +40%
            base_orders = int(base_orders * 1.4)
        elif month == 2:  # Febrero (Día de enamorados): +20%
            base_orders = int(base_orders * 1.2)
        
        # GENERAR ÓRDENES DEL DÍA
        for order_num in range(base_orders):
            # Seleccionar tipo de cliente
            rand = random.random()
            if rand < 0.15 and vip_customers:  # 15% VIPs
                customer = random.choice(vip_customers)
                items_count = random.randint(4, 10)
                has_discount = random.random() < 0.3  # 30% tienen descuento
            elif rand < 0.40 and frequent_customers:  # 25% Frecuentes
                customer = random.choice(frequent_customers)
                items_count = random.randint(2, 6)
                has_discount = random.random() < 0.15  # 15% tienen descuento
            elif rand < 0.75 and occasional_customers:  # 35% Ocasionales
                customer = random.choice(occasional_customers)
                items_count = random.randint(1, 4)
                has_discount = random.random() < 0.05  # 5% tienen descuento
            else:  # Nuevos/Inactivos
                if new_customers_list:
                    customer = random.choice(new_customers_list)
                else:
                    customer = random.choice(customers)
                items_count = random.randint(1, 2)
                has_discount = False
            
            # Hora de la venta (horario comercial 9:00 - 20:00)
            order_time = current_date + timedelta(
                hours=random.randint(9, 19),
                minutes=random.randint(0, 59)
            )
            
            # Determinar tipo de orden y estado
            order_type = random.choice(['in_store', 'in_store', 'online', 'phone'])
            
            # La mayoría de órdenes antiguas están completadas
            days_ago = (end_date - current_date).days
            if days_ago > 7:
                status = 'delivered'
            elif days_ago > 3:
                status = random.choice(['delivered', 'delivered', 'shipped'])
            else:
                status = random.choice(['delivered', 'processing', 'confirmed'])
            
            # CREAR ORDEN
            order = Order.objects.create(
                customer=customer,
                order_type=order_type,
                status=status,
                processed_by=random.choice(employees) if random.random() < 0.7 else None,
                created_at=order_time,
                updated_at=order_time
            )
            
            # AGREGAR ITEMS A LA ORDEN
            order_subtotal = Decimal('0.00')
            selected_products = random.sample(
                list(product_variants.keys()),
                min(items_count, len(product_variants))
            )
            
            for product_id in selected_products:
                product = Product.objects.get(id=product_id)
                variants = product_variants[product_id]
                variant = random.choice(variants) if variants[0] is not None else None
                
                # Cantidad
                quantity = random.randint(1, 4)
                
                # Precio (usar precio actual del producto)
                unit_price = product.price
                
                # Información de variante
                variant_details = {}
                if variant:
                    if variant.size:
                        variant_details['size'] = variant.size.name
                    if variant.color:
                        variant_details['color'] = variant.color.name
                
                # Crear OrderItem
                item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_variant=variant,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=unit_price * quantity,
                    product_name=product.name,
                    product_sku=product.sku,
                    variant_details=variant_details
                )
                
                order_subtotal += item.total_price
            
            # CALCULAR TOTALES
            # Descuento
            discount_amount = Decimal('0.00')
            if has_discount:
                discount_percent = random.choice([5, 10, 15, 20])
                discount_amount = (order_subtotal * Decimal(discount_percent)) / Decimal('100')
            
            # Impuesto (13% en Bolivia)
            tax_amount = (order_subtotal - discount_amount) * Decimal('0.13')
            
            # Costo de envío (solo para ventas online)
            shipping_cost = Decimal('0.00')
            if order_type == 'online':
                if order_subtotal < 500:
                    shipping_cost = Decimal('30.00')
                # Envío gratis para compras > 500
            
            # Total
            total_amount = order_subtotal - discount_amount + tax_amount + shipping_cost
            
            # Actualizar orden
            order.subtotal = order_subtotal
            order.discount_amount = discount_amount
            order.tax_amount = tax_amount
            order.shipping_cost = shipping_cost
            order.total_amount = total_amount
            
            # Establecer fechas según estado
            if status in ['delivered', 'shipped']:
                order.confirmed_at = order_time + timedelta(hours=random.randint(1, 4))
                order.shipped_at = order_time + timedelta(days=random.randint(1, 3))
            if status == 'delivered':
                order.delivered_at = order.shipped_at + timedelta(days=random.randint(1, 5))
            
            order.save()
            
            orders_created += 1
            total_revenue += total_amount
            
            # Mostrar progreso
            if (current_date - start_date).days % progress_step == 0:
                progress = ((current_date - start_date).days / days_total) * 100
                print(f"   Progreso: {progress:.1f}% - {orders_created} órdenes - Bs. {total_revenue:,.2f}")
        
        # Siguiente día
        current_date += timedelta(days=1)
    
    # RESULTADOS FINALES
    print("\n" + "=" * 80)
    print("✅ GENERACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 80)
    
    print(f"\n📊 RESUMEN DE DATOS GENERADOS:")
    print(f"   • Órdenes nuevas: {orders_created}")
    print(f"   • Items vendidos: {OrderItem.objects.filter(order__created_at__gte=start_date).count()}")
    print(f"   • Ingresos generados: Bs. {total_revenue:,.2f}")
    print(f"   • Ticket promedio: Bs. {(total_revenue/orders_created) if orders_created > 0 else 0:.2f}")
    print(f"   • Período: {start_date.strftime('%Y-%m-%d')} a {end_date.strftime('%Y-%m-%d')}")
    
    # ESTADÍSTICAS TOTALES
    print(f"\n📈 ESTADÍSTICAS TOTALES (INCLUYE DATOS ANTERIORES):")
    total_orders = Order.objects.count()
    total_customers = User.objects.filter(role='customer').count()
    total_products = Product.objects.filter(status='active').count()
    total_sales = Order.objects.aggregate(total=models.Sum('total_amount'))['total'] or Decimal('0')
    
    print(f"   • Total órdenes: {total_orders}")
    print(f"   • Total clientes: {total_customers}")
    print(f"   • Productos activos: {total_products}")
    print(f"   • Ventas totales: Bs. {total_sales:,.2f}")
    
    # DISTRIBUCIÓN POR ESTADO
    print(f"\n📋 DISTRIBUCIÓN POR ESTADO:")
    from django.db.models import Count
    status_dist = Order.objects.values('status').annotate(count=Count('id')).order_by('-count')
    for item in status_dist:
        print(f"   • {item['status']}: {item['count']} órdenes")
    
    # VERIFICACIÓN PARA ML
    print(f"\n🤖 VERIFICACIÓN PARA MACHINE LEARNING:")
    recent_orders = Order.objects.filter(status='delivered').count()
    
    print(f"   ✓ Órdenes completadas: {recent_orders}")
    
    if recent_orders >= 100:
        print("   ✅ EXCELENTE: Datos suficientes para entrenar modelos con alta precisión")
    elif recent_orders >= 50:
        print("   ✅ BIEN: Datos suficientes para entrenar modelos con buena precisión")
    elif recent_orders >= 30:
        print("   ⚠️  ACEPTABLE: Datos mínimos. Los modelos funcionarán pero con menor precisión")
    else:
        print("   ⚠️  INSUFICIENTE: Se recomienda generar más datos")
    
    # GENERAR FACTURAS Y PAGOS PARA ÓRDENES CREADAS
    print("\n" + "=" * 80)
    print("💳 GENERANDO FACTURAS Y PAGOS")
    print("=" * 80)
    
    from orders.models import Payment, Invoice
    
    # Obtener órdenes sin factura/pago
    orders_without_invoice = Order.objects.filter(invoices__isnull=True)
    orders_without_payment = Order.objects.filter(payments__isnull=True)
    
    print(f"\n📊 Órdenes sin factura: {orders_without_invoice.count()}")
    print(f"📊 Órdenes sin pago: {orders_without_payment.count()}")
    
    # Crear pagos
    print("\n💰 Creando pagos...")
    payments_created = 0
    for order in orders_without_payment:
        if order.status not in ['delivered', 'confirmed', 'shipped']:
            continue
        
        payment_method = random.choice(payment_methods)
        processed_by = random.choice(employees) if employees and order.order_type == 'in_store' else None
        
        Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=order.total_amount,
            status='completed',
            transaction_id=f'TXN-{random.randint(100000, 999999)}',
            processed_by=processed_by,
            processed_at=order.created_at + timedelta(minutes=random.randint(1, 30)),
            notes=f'Pago para orden {order.order_number}'
        )
        payments_created += 1
        
        if payments_created % 200 == 0:
            print(f"   Progreso: {payments_created} pagos creados...")
    
    print(f"   ✅ {payments_created} pagos creados")
    
    # Crear facturas
    print("\n📄 Creando facturas...")
    invoices_created = 0
    invoice_creators = employees if employees else [User.objects.filter(is_staff=True).first()]
    
    for order in orders_without_invoice:
        if order.status not in ['delivered', 'confirmed', 'shipped']:
            continue
        
        invoice_status = 'paid' if order.status == 'delivered' else 'sent'
        created_by = order.processed_by if order.processed_by else random.choice(invoice_creators)
        
        Invoice.objects.create(
            order=order,
            customer=order.customer,
            invoice_type='sale',
            status=invoice_status,
            tax_rate=Decimal('13.00'),
            subtotal=order.subtotal,
            tax_amount=order.tax_amount,
            total_amount=order.total_amount,
            issue_date=order.created_at.date(),
            due_date=order.created_at.date() + timedelta(days=30),
            created_by=created_by,
            notes=f'Factura para orden {order.order_number}'
        )
        invoices_created += 1
        
        if invoices_created % 200 == 0:
            print(f"   Progreso: {invoices_created} facturas creadas...")
    
    print(f"   ✅ {invoices_created} facturas creadas")
    
    print("\n" + "=" * 80)
    print("🎉 SISTEMA LISTO PARA MACHINE LEARNING")
    print("=" * 80)
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("   1. Redistribuir fechas: python fix_order_dates.py")
    print("   2. Verificar datos: python check_data.py")
    print("   3. Entrenar modelos: python test_ml_complete.py")
    print("\n")


if __name__ == '__main__':
    try:
        from django.db import models
        generate_ml_training_data()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n💡 Si ves errores de campos, verifica los modelos de tu base de datos.")
