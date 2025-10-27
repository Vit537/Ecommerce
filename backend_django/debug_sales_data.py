"""
Debug: Verificar datos de ventas por fecha
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDate
from orders.models import Order
from django.utils import timezone
from datetime import timedelta

print("=" * 80)
print("DEBUG: Verificando datos de ventas por fecha")
print("=" * 80)

end_date = timezone.now()
start_date = end_date - timedelta(days=60)  # Últimos 60 días

print(f"\nPeríodo: {start_date.date()} a {end_date.date()}")

# Método 1: TruncDate
print("\n--- Método 1: TruncDate ---")
orders_trunc = Order.objects.filter(
    created_at__gte=start_date,
    status__in=['delivered', 'completed']
).annotate(
    date=TruncDate('created_at')
).values('date').annotate(
    total_sales=Sum('total_amount'),
    num_orders=Count('id')
).order_by('date')

print(f"Días con ventas (TruncDate): {orders_trunc.count()}")
if orders_trunc.count() > 0:
    print("\nPrimeros 10 días:")
    for day in list(orders_trunc)[:10]:
        print(f"  {day['date']}: {day['num_orders']} órdenes, Bs. {day['total_sales']}")

# Método 2: Contar total de órdenes
print("\n--- Total de órdenes completadas ---")
total_completed = Order.objects.filter(
    status__in=['delivered', 'completed']
).count()
print(f"Total órdenes completadas: {total_completed}")

# Últimas 5 órdenes
print("\nÚltimas 5 órdenes completadas:")
recent_orders = Order.objects.filter(
    status__in=['delivered', 'completed']
).order_by('-created_at')[:5]

for order in recent_orders:
    print(f"  {order.order_number}: {order.created_at} - Bs. {order.total_amount}")

print("\n" + "=" * 80)
