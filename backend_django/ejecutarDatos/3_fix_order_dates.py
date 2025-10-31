"""
Script para redistribuir las fechas de las órdenes en el tiempo
Corrige el problema de que todas las órdenes están concentradas en pocos días
"""
import os
import sys
import django

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import Order
from django.utils import timezone
from datetime import timedelta
import random

print("=" * 80)
print("🔧 REDISTRIBUYENDO FECHAS DE ÓRDENES")
print("=" * 80)

# Obtener todas las órdenes
all_orders = Order.objects.all().order_by('id')
total_orders = all_orders.count()

print(f"\nTotal de órdenes a redistribuir: {total_orders}")

# Período: últimos 18 meses
end_date = timezone.now()
start_date = end_date - timedelta(days=540)  # 18 meses

print(f"Período: {start_date.date()} a {end_date.date()}")
print("\nRedistribuyendo...")

# Actualizar fechas
current_date = start_date
orders_per_day_base = total_orders // 540  # Distribución base

count = 0
for i, order in enumerate(all_orders):
    # Determinar cuántas órdenes por día (con variación)
    day_of_week = current_date.weekday()
    month = current_date.month
    
    # Más ventas en fines de semana
    multiplier = 1.6 if day_of_week >= 5 else 1.0
    
    # Temporadas altas
    if month == 12:
        multiplier *= 2.0
    elif month in [6, 7]:
        multiplier *= 1.5
    elif month == 2:
        multiplier *= 1.3
    
    # Hora aleatoria del día (9am - 8pm)
    hour = random.randint(9, 19)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    
    order_time = current_date + timedelta(hours=hour, minutes=minute, seconds=second)
    
    # Actualizar orden
    order.created_at = order_time
    order.updated_at = order_time
    
    # Fechas según estado
    if order.status in ['delivered', 'shipped']:
        order.confirmed_at = order_time + timedelta(hours=random.randint(1, 4))
        order.shipped_at = order_time + timedelta(days=random.randint(1, 3))
    if order.status == 'delivered':
        order.delivered_at = order.shipped_at + timedelta(days=random.randint(1, 5))
    
    order.save(update_fields=['created_at', 'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at'])
    
    count += 1
    
    # Avanzar al siguiente día cada X órdenes
    orders_in_this_day = int(orders_per_day_base * multiplier)
    if orders_in_this_day == 0:
        orders_in_this_day = 1
        
    if count % orders_in_this_day == 0:
        current_date += timedelta(days=1)
        if current_date > end_date:
            current_date = end_date - timedelta(days=random.randint(0, 30))
    
    # Mostrar progreso
    if (i + 1) % 500 == 0:
        progress = ((i + 1) / total_orders) * 100
        print(f"  Progreso: {progress:.1f}% ({i + 1}/{total_orders})")

print(f"\n✅ {total_orders} órdenes redistribuidas exitosamente")

# Verificar distribución
print("\n--- Verificación ---")
from django.db.models import Count
from django.db.models.functions import TruncDate

orders_by_date = Order.objects.annotate(
    date=TruncDate('created_at')
).values('date').annotate(
    count=Count('id')
).order_by('date')

print(f"Días con ventas: {orders_by_date.count()}")
print(f"\nPrimeros 10 días:")
for day in list(orders_by_date)[:10]:
    print(f"  {day['date']}: {day['count']} órdenes")

print(f"\nÚltimos 10 días:")
for day in list(orders_by_date)[-10:]:
    print(f"  {day['date']}: {day['count']} órdenes")

print("\n" + "=" * 80)
print("✅ REDISTRIBUCIÓN COMPLETADA")
print("=" * 80)
