from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import render
from .models import Order, Payment, Invoice, PaymentMethod, ShippingMethod
from .serializers import OrderSerializer, PaymentSerializer, InvoiceSerializer, PaymentMethodSerializer, ShippingMethodSerializer


class PaymentMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para métodos de pago
    Acceso público - los clientes pueden ver los métodos disponibles sin login
    """
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [AllowAny]


class ShippingMethodViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para métodos de envío
    Acceso público - los clientes pueden ver los métodos disponibles sin login
    """
    queryset = ShippingMethod.objects.filter(is_active=True)
    serializer_class = ShippingMethodSerializer
    permission_classes = [AllowAny]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer