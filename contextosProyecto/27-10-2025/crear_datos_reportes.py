#!/usr/bin/env python3
"""
Script para crear datos adicionales específicos para reportes dinámicos
"""
import os
import sys
import django
from decimal import Decimal
import random
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('backend_django')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from products.models import Product, ProductVariant
from orders.models import Order, OrderItem, Payment, PaymentMethod, Invoice
from reports.models import ReportLog

User = get_user_model()

def crear_datos_historicos_ventas():
    """Crear datos históricos de ventas para reportes más ricos"""
    print("📊 CREANDO DATOS HISTÓRICOS PARA REPORTES")
    print("=" * 60)
    
    # Obtener datos necesarios
    clientes = list(User.objects.filter(role='customer'))
    productos = list(Product.objects.filter(status='active'))
    cajero = User.objects.filter(role='employee').first()
    admin = User.objects.filter(role='admin').first()
    payment_methods = list(PaymentMethod.objects.filter(is_active=True))
    
    if not clientes or not productos or not payment_methods:
        print("❌ Faltan datos básicos (clientes, productos o métodos de pago)")
        return
    
    print(f"📋 Datos disponibles:")
    print(f"   • Clientes: {len(clientes)}")
    print(f"   • Productos: {len(productos)}")
    print(f"   • Métodos de pago: {len(payment_methods)}")
    print()
    
    # Crear órdenes para los últimos 3 meses con variación realista
    ordenes_creadas = 0
    now = timezone.now()
    
    # Distribución de órdenes por mes (más recientes = más órdenes)
    distribuciones = [
        (90, 30, 15),  # Hace 3 meses: 15 órdenes
        (60, 30, 25),  # Hace 2 meses: 25 órdenes  
        (30, 30, 35),  # Último mes: 35 órdenes
    ]
    
    for dias_atras, periodo, num_ordenes in distribuciones:
        inicio_periodo = now - timedelta(days=dias_atras)
        fin_periodo = now - timedelta(days=dias_atras - periodo)
        
        print(f"📅 Creando {num_ordenes} órdenes entre {inicio_periodo.strftime('%Y-%m-%d')} y {fin_periodo.strftime('%Y-%m-%d')}")
        
        for i in range(num_ordenes):
            # Fecha aleatoria en el período
            fecha_orden = inicio_periodo + timedelta(
                seconds=random.randint(0, int((fin_periodo - inicio_periodo).total_seconds()))
            )
            
            # Cliente aleatorio
            cliente = random.choice(clientes)
            
            # Tipo de orden (más online recientemente)
            if dias_atras <= 30:  # Último mes más online
                order_type = random.choices(['online', 'in_store'], weights=[70, 30])[0]
            else:
                order_type = random.choices(['online', 'in_store'], weights=[50, 50])[0]
            
            # Estado basado en antigüedad
            if dias_atras > 45:
                status = 'delivered'  # Órdenes antiguas ya entregadas
            elif dias_atras > 7:
                status = random.choices(['delivered', 'processing'], weights=[80, 20])[0]
            else:
                status = random.choices(['delivered', 'processing', 'confirmed'], weights=[60, 25, 15])[0]
            
            # Crear orden
            orden = Order.objects.create(
                customer=cliente,
                order_type=order_type,
                status=status,
                shipping_address={
                    'street': f'Av. Principal {random.randint(100, 999)}',
                    'city': random.choice(['La Paz', 'Santa Cruz', 'Cochabamba']),
                    'country': 'Bolivia'
                },
                processed_by=cajero if order_type == 'in_store' else None,
                created_at=fecha_orden,
                updated_at=fecha_orden + timedelta(hours=random.randint(1, 48))
            )
            
            # Agregar 1-4 productos por orden
            num_items = random.choices([1, 2, 3, 4], weights=[20, 40, 30, 10])[0]
            productos_orden = random.sample(productos, min(num_items, len(productos)))
            
            subtotal = Decimal('0.00')
            for producto in productos_orden:
                quantity = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
                
                # Variación de precio (descuentos ocasionales)
                precio_base = producto.price
                if random.random() < 0.15:  # 15% de descuento ocasional
                    precio_final = precio_base * Decimal('0.85')
                else:
                    precio_final = precio_base
                
                # Crear item de orden
                OrderItem.objects.create(
                    order=orden,
                    product=producto,
                    quantity=quantity,
                    unit_price=precio_final,
                    total_price=precio_final * quantity,
                    product_name=producto.name,
                    product_sku=producto.sku
                )
                
                subtotal += precio_final * quantity
            
            # Calcular totales
            tax_rate = Decimal('0.13')  # 13% IVA Bolivia
            tax_amount = subtotal * tax_rate
            
            # Descuento ocasional en la orden completa
            discount_amount = Decimal('0.00')
            if random.random() < 0.10:  # 10% de órdenes con descuento
                discount_amount = subtotal * Decimal('0.05')  # 5% descuento
            
            total_amount = subtotal + tax_amount - discount_amount
            
            # Actualizar totales de la orden
            orden.subtotal_amount = subtotal
            orden.tax_amount = tax_amount
            orden.discount_amount = discount_amount
            orden.total_amount = total_amount
            orden.save()
            
            # Crear pago para órdenes completadas
            if status in ['delivered', 'processing']:
                payment_method = random.choice(payment_methods)
                
                Payment.objects.create(
                    order=orden,
                    payment_method=payment_method,
                    amount=total_amount,
                    status='completed',
                    processed_by=cajero if order_type == 'in_store' else admin,
                    created_at=fecha_orden + timedelta(minutes=random.randint(5, 60))
                )
                
                # Crear factura
                if random.random() < 0.90:  # 90% de las órdenes tienen factura
                    issue_date = fecha_orden.date()
                    due_date = issue_date + timedelta(days=30)  # 30 días para pagar
                    
                    Invoice.objects.create(
                        order=orden,
                        customer=cliente,
                        invoice_number=f'FAC-{random.randint(100000, 999999)}',
                        subtotal=subtotal,
                        tax_amount=tax_amount,
                        total_amount=total_amount,
                        issue_date=issue_date,
                        due_date=due_date,
                        status='sent',
                        created_by=admin,
                        created_at=fecha_orden + timedelta(hours=1)
                    )
            
            ordenes_creadas += 1
            
            if ordenes_creadas % 10 == 0:
                print(f"   ✅ {ordenes_creadas} órdenes creadas...")
    
    print(f"\n✅ Total órdenes históricas creadas: {ordenes_creadas}")

def crear_logs_reportes_ejemplo():
    """Crear algunos logs de reportes para historial"""
    print("\n📋 CREANDO LOGS DE REPORTES DE EJEMPLO")
    print("=" * 60)
    
    admin = User.objects.filter(role='admin').first()
    empleado = User.objects.filter(role='employee').first()
    
    if not admin:
        print("❌ No hay usuario admin disponible")
        return
    
    # Reportes ejemplo generados anteriormente
    reportes_ejemplo = [
        {
            'query': 'Ventas del último mes',
            'report_type': 'sales',
            'user': admin,
            'execution_time': 1.2,
            'status': 'completed'
        },
        {
            'query': 'Productos más vendidos',
            'report_type': 'products',
            'user': empleado or admin,
            'execution_time': 0.8,
            'status': 'completed'
        },
        {
            'query': 'Clientes con más compras',
            'report_type': 'customers',
            'user': admin,
            'execution_time': 1.5,
            'status': 'completed'
        },
        {
            'query': 'Inventario con stock bajo',
            'report_type': 'inventory',
            'user': empleado or admin,
            'execution_time': 0.5,
            'status': 'completed'
        }
    ]
    
    for i, reporte in enumerate(reportes_ejemplo):
        fecha = timezone.now() - timedelta(days=random.randint(1, 14))
        
        ReportLog.objects.create(
            user=reporte['user'],
            original_prompt=reporte['query'],
            report_type=reporte['report_type'],
            input_type='text',
            generated_sql=f"SELECT * FROM ejemplo_tabla WHERE fecha > '{fecha.strftime('%Y-%m-%d')}'",
            export_format='json',
            results_count=random.randint(5, 50),
            execution_time=reporte['execution_time'],
            tokens_used=random.randint(1000, 3000),
            success=True,
            created_at=fecha
        )
        
        print(f"   ✅ Log {i+1}: {reporte['query']}")
    
    print(f"\n✅ {len(reportes_ejemplo)} logs de reportes creados")

def mostrar_estadisticas_finales():
    """Mostrar estadísticas finales después de crear datos"""
    from django.db import models
    
    print("\n📊 ESTADÍSTICAS FINALES DEL SISTEMA")
    print("=" * 60)
    
    # Órdenes por mes
    now = timezone.now()
    ultimo_mes = Order.objects.filter(created_at__gte=now - timedelta(days=30)).count()
    hace_2_meses = Order.objects.filter(
        created_at__gte=now - timedelta(days=60),
        created_at__lt=now - timedelta(days=30)
    ).count()
    hace_3_meses = Order.objects.filter(
        created_at__gte=now - timedelta(days=90),
        created_at__lt=now - timedelta(days=60)
    ).count()
    
    print(f"📅 Órdenes por período:")
    print(f"   • Último mes: {ultimo_mes}")
    print(f"   • Hace 2 meses: {hace_2_meses}")
    print(f"   • Hace 3 meses: {hace_3_meses}")
    
    # Ventas totales
    total_ventas = Order.objects.filter(status='delivered').aggregate(
        total=models.Sum('total_amount')
    )['total'] or 0
    
    print(f"\n💰 Resumen financiero:")
    print(f"   • Total órdenes: {Order.objects.count()}")
    print(f"   • Órdenes entregadas: {Order.objects.filter(status='delivered').count()}")
    print(f"   • Ventas totales: ${total_ventas}")
    
    # Productos y stock
    productos_stock_bajo = ProductVariant.objects.filter(
        stock_quantity__lte=models.F('min_stock_level')
    ).count()
    
    print(f"\n📦 Inventario:")
    print(f"   • Total productos: {Product.objects.count()}")
    print(f"   • Variantes: {ProductVariant.objects.count()}")
    print(f"   • Stock bajo: {productos_stock_bajo}")
    
    # Reportes
    print(f"\n📋 Sistema de reportes:")
    print(f"   • Logs de reportes: {ReportLog.objects.count()}")
    
    print(f"\n✅ Sistema listo para pruebas de reportes dinámicos!")

def main():
    print("🚀 PREPARANDO DATOS PARA REPORTES DINÁMICOS")
    print("=" * 70)
    print()
    
    # Importar models que se necesitan
    from django.db import models
    
    # Crear datos históricos
    crear_datos_historicos_ventas()
    
    # Crear logs de ejemplo
    crear_logs_reportes_ejemplo()
    
    # Mostrar estadísticas
    mostrar_estadisticas_finales()
    
    print("\n" + "=" * 70)
    print("🎯 PRÓXIMOS PASOS PARA PROBAR REPORTES:")
    print("1. Ir a: http://localhost:3000/reports")
    print("2. Login con: admin@boutique.com / admin123")
    print("3. Probar consultas como:")
    print("   • 'Ventas del último mes'")
    print("   • 'Productos más vendidos'")
    print("   • 'Clientes con más compras'")
    print("   • 'Stock bajo por categoría'")
    print("=" * 70)

if __name__ == "__main__":
    main()