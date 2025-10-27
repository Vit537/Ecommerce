from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()


def admin_dashboard_stats(request):
    """Return basic dashboard stats for admin panel (stub implementation)."""
    try:
        total_users = User.objects.count()
    except Exception:
        total_users = 0

    # In a full implementation you'd aggregate orders, revenue, low-stock products, etc.
    data = {
        'total_users': total_users,
        'total_products': 0,
        'total_orders': 0,
        'total_revenue': 0.0,
        'recent_orders': [],
        'low_stock_products': [],
        'user_registrations_this_month': 0,
        'orders_this_month': 0,
    }

    return JsonResponse(data)
