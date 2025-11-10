from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.OrderViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'shipping-methods', views.ShippingMethodViewSet)

urlpatterns = router.urls