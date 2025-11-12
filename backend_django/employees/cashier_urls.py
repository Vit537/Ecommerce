from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .cashier_views import (
    ShiftViewSet,
    SaleViewSet,
    ProductSearchViewSet,
    PickupOrderViewSet,
    CashierReportsViewSet
)

# Crear router
router = DefaultRouter()
router.register(r'shifts', ShiftViewSet, basename='cashier-shifts')
router.register(r'sales', SaleViewSet, basename='cashier-sales')
router.register(r'products', ProductSearchViewSet, basename='cashier-products')
router.register(r'orders', PickupOrderViewSet, basename='cashier-orders')
router.register(r'reports', CashierReportsViewSet, basename='cashier-reports')

urlpatterns = [
    path('', include(router.urls)),
]
