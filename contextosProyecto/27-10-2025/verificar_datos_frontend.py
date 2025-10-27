#!/usr/bin/env python3
"""
Script para verificar y completar datos necesarios para el frontend
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('backend_django')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Product, ProductVariant, Category, Brand
from orders.models import Order, OrderItem, PaymentMethod
from decimal import Decimal
import random

User = get_user_model()

def verificar_datos():
    """Verificar qué datos están disponibles"""
    print("🔍 VERIFICANDO DATOS ACTUALES")
    print("=" * 50)
    
    # Usuarios
    usuarios = User.objects.count()
    print(f"👤 Usuarios: {usuarios}")
    
    # Productos
    productos = Product.objects.count()
    productos_activos = Product.objects.filter(status='active').count()
    print(f"📦 Productos: {productos} (Activos: {productos_activos})")
    
    # Variantes
    variantes = ProductVariant.objects.count()
    variantes_con_stock = ProductVariant.objects.filter(stock_quantity__gt=0).count()
    print(f"📋 Variantes: {variantes} (Con stock: {variantes_con_stock})")
    
    # Categorías
    categorias = Category.objects.count()
    print(f"📁 Categorías: {categorias}")
    
    # Órdenes
    ordenes = Order.objects.count()
    ordenes_completadas = Order.objects.filter(status='delivered').count()
    print(f"🛒 Órdenes: {ordenes} (Completadas: {ordenes_completadas})")
    
    # OrderItems
    order_items = OrderItem.objects.count()
    print(f"📋 Items de órdenes: {order_items}")
    
    # Métodos de pago
    payment_methods = PaymentMethod.objects.count()
    print(f"💳 Métodos de pago: {payment_methods}")
    
    print()

def verificar_productos_con_datos():
    """Verificar productos específicos"""
    print("📦 PRODUCTOS CON MÁS DETALLES")
    print("=" * 50)
    
    productos = Product.objects.filter(status='active')[:5]
    for producto in productos:
        variantes = producto.variants.filter(is_active=True)
        total_stock = sum(v.stock_quantity for v in variantes)
        
        print(f"• {producto.name}")
        print(f"  Precio: ${producto.price}")
        print(f"  Variantes: {variantes.count()}")
        print(f"  Stock total: {total_stock}")
        print(f"  Categoría: {producto.category.name if producto.category else 'Sin categoría'}")
        print(f"  Marca: {producto.brand.name if producto.brand else 'Sin marca'}")
        print()

def verificar_ordenes_con_datos():
    """Verificar órdenes específicas"""
    print("🛒 ÓRDENES CON MÁS DETALLES")
    print("=" * 50)
    
    ordenes = Order.objects.all()[:5]
    for orden in ordenes:
        items = orden.items.all()
        total_calculado = sum(Decimal(item.unit_price) * item.quantity for item in items)
        
        print(f"• Orden #{str(orden.id)[:8]}...")
        print(f"  Cliente: {orden.customer.email}")
        print(f"  Estado: {orden.status}")
        print(f"  Tipo: {orden.order_type}")
        print(f"  Items: {items.count()}")
        print(f"  Total en DB: {orden.total_amount}")
        print(f"  Total calculado: ${total_calculado}")
        print(f"  Fecha: {orden.created_at.strftime('%Y-%m-%d')}")
        print()

def corregir_totales_ordenes():
    """Corregir totales de órdenes que están vacíos"""
    print("🔧 CORRIGIENDO TOTALES DE ÓRDENES")
    print("=" * 50)
    
    ordenes_sin_total = Order.objects.filter(total_amount__isnull=True)
    print(f"Órdenes sin total: {ordenes_sin_total.count()}")
    
    for orden in ordenes_sin_total:
        items = orden.items.all()
        if items:
            # Calcular subtotal
            subtotal = sum(Decimal(item.unit_price) * item.quantity for item in items)
            
            # Calcular impuestos (13%)
            tax_rate = Decimal('0.13')
            tax_amount = subtotal * tax_rate
            
            # Total final
            total = subtotal + tax_amount
            
            # Actualizar orden
            orden.subtotal_amount = subtotal
            orden.tax_amount = tax_amount
            orden.total_amount = total
            orden.save()
            
            print(f"✅ Orden #{str(orden.id)[:8]}... - Total: ${total}")

def crear_datos_adicionales_si_necesario():
    """Crear datos adicionales para el dashboard"""
    print("➕ CREANDO DATOS ADICIONALES SI ES NECESARIO")
    print("=" * 50)
    
    # Verificar si hay suficientes productos
    productos_activos = Product.objects.filter(status='active').count()
    if productos_activos < 5:
        print("⚠️  Pocos productos activos para el dashboard")
    
    # Verificar si hay órdenes recientes
    from datetime import datetime, timedelta
    hace_7_dias = datetime.now() - timedelta(days=7)
    ordenes_recientes = Order.objects.filter(created_at__gte=hace_7_dias).count()
    
    if ordenes_recientes < 3:
        print("⚠️  Pocas órdenes recientes para el dashboard")
        crear_ordenes_adicionales()

def crear_ordenes_adicionales():
    """Crear algunas órdenes adicionales para datos de prueba"""
    print("🛒 Creando órdenes adicionales...")
    
    # Obtener datos necesarios
    clientes = User.objects.filter(role='customer')
    productos = Product.objects.filter(status='active')
    cajero = User.objects.filter(role='employee').first()
    
    if not clientes or not productos:
        print("❌ No hay suficientes clientes o productos")
        return
    
    # Crear 3 órdenes nuevas
    for i in range(3):
        cliente = random.choice(clientes)
        
        orden = Order.objects.create(
            customer=cliente,
            order_type=random.choice(['online', 'in_store']),
            status=random.choice(['confirmed', 'processing', 'delivered']),
            shipping_address={
                'street': f'Calle Test {i+1}',
                'city': 'La Paz',
                'country': 'Bolivia'
            },
            processed_by=cajero if random.choice([True, False]) else None
        )
        
        # Agregar 2-3 productos a la orden
        num_items = random.randint(2, 3)
        productos_seleccionados = random.sample(list(productos), min(num_items, len(productos)))
        
        subtotal = Decimal('0.00')
        for producto in productos_seleccionados:
            quantity = random.randint(1, 2)
            price = producto.price
            
            OrderItem.objects.create(
                order=orden,
                product=producto,
                quantity=quantity,
                unit_price=price
            )
            
            subtotal += price * quantity
        
        # Calcular totales
        tax_rate = Decimal('0.13')
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        orden.subtotal_amount = subtotal
        orden.tax_amount = tax_amount
        orden.total_amount = total_amount
        orden.save()
        
        print(f"✅ Orden creada: #{str(orden.id)[:8]}... - ${total_amount}")

def main():
    print("🚀 VERIFICACIÓN Y CORRECCIÓN DE DATOS PARA FRONTEND")
    print("=" * 70)
    print()
    
    # Verificar datos actuales
    verificar_datos()
    
    # Ver detalles de productos
    verificar_productos_con_datos()
    
    # Ver detalles de órdenes
    verificar_ordenes_con_datos()
    
    # Corregir totales de órdenes
    corregir_totales_ordenes()
    
    # Crear datos adicionales si es necesario
    crear_datos_adicionales_si_necesario()
    
    print()
    print("=" * 70)
    print("✅ VERIFICACIÓN COMPLETADA")
    print()
    print("🎯 PRÓXIMOS PASOS:")
    print("1. Recargar el frontend (http://localhost:3000)")
    print("2. Probar login con: admin@boutique.com / admin123")
    print("3. Verificar que los dashboards muestren datos")
    print("4. Revisar reportes y alertas")

if __name__ == "__main__":
    main()