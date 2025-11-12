from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'orders', views.OrderViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'invoices', views.InvoiceViewSet)
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'shipping-methods', views.ShippingMethodViewSet)

urlpatterns = [
    # Stripe endpoints
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('stripe-webhook/', views.stripe_webhook, name='stripe-webhook'),
    
    # QR Code payment endpoints
    path('create-qr-payment/', views.create_qr_payment, name='create-qr-payment'),
    path('confirm-qr-payment/', views.confirm_qr_payment, name='confirm-qr-payment'),
] + router.urls