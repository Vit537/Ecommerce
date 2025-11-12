from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import render
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, Payment, Invoice, PaymentMethod, ShippingMethod
from .serializers import (
    OrderSerializer, PaymentSerializer, InvoiceSerializer, 
    PaymentMethodSerializer, ShippingMethodSerializer,
    InvoiceDetailSerializer
)
from authentication.permissions import IsAdminOrManager


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
    """
    ViewSet para gestión de facturas
    - Admin/Manager: pueden ver todas las facturas con filtros
    - Cliente: solo pueden ver sus propias facturas
    """
    queryset = Invoice.objects.all().select_related(
        'order', 'customer', 'order__shipping_method'
    ).prefetch_related('order__items', 'order__payments')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'invoice_type', 'issue_date', 'due_date']
    ordering_fields = ['created_at', 'issue_date', 'due_date', 'total_amount']
    ordering = ['-created_at']
    search_fields = ['invoice_number', 'customer__email', 'customer__first_name', 'customer__last_name']
    
    def get_queryset(self):
        """
        Filtrar facturas según rol del usuario
        - Admin/Manager: ven todas las facturas
        - Cliente: solo ven sus propias facturas
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        # Si es admin o gerente, puede ver todas las facturas
        if user.role in ['admin', 'gerente']:
            return queryset
        
        # Si es cliente, solo ve sus propias facturas
        return queryset.filter(customer=user)
    
    def get_serializer_class(self):
        """
        Usar serializer detallado para admin/manager
        """
        if self.request.user.role in ['admin', 'gerente']:
            return InvoiceDetailSerializer
        return InvoiceSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrManager])
    def admin_list(self, request):
        """
        Endpoint especial para admin/manager con filtros avanzados
        GET /api/invoices/admin_list/
        
        Filtros disponibles:
        - order_type: online, in_store, phone
        - payment_method: id del método de pago
        - payment_type: cash, credit_card, stripe, qr_code, etc.
        - date_from: fecha desde (YYYY-MM-DD)
        - date_to: fecha hasta (YYYY-MM-DD)
        - status: draft, sent, paid, overdue, cancelled
        - customer: id del cliente
        """
        queryset = self.get_queryset()
        
        # Filtro por tipo de orden (canal)
        order_type = request.query_params.get('order_type')
        if order_type:
            queryset = queryset.filter(order__order_type=order_type)
        
        # Filtro por método de pago específico
        payment_method = request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(order__payments__payment_method__id=payment_method)
        
        # Filtro por tipo de pago (cash, stripe, qr, etc)
        payment_type = request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(order__payments__payment_method__payment_type=payment_type)
        
        # Filtro por rango de fechas
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Filtro por cliente
        customer = request.query_params.get('customer')
        if customer:
            queryset = queryset.filter(customer__id=customer)
        
        # Eliminar duplicados (pueden surgir por los JOINs con payments)
        queryset = queryset.distinct()
        
        # Paginación
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = InvoiceDetailSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = InvoiceDetailSerializer(queryset, many=True)
        return Response(serializer.data)


# ========================================
# STRIPE PAYMENT VIEWS
# ========================================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .stripe_service import stripe_service
from decimal import Decimal
import json


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Crear un Payment Intent de Stripe
    
    POST /api/orders/create-payment-intent/
    Body: {
        "amount": 100.50,
        "order_id": "uuid-here",
        "currency": "usd"  // opcional
    }
    """
    try:
        amount = Decimal(str(request.data.get('amount')))
        order_id = request.data.get('order_id')
        currency = request.data.get('currency', 'usd')
        
        if not amount or not order_id:
            return Response(
                {'error': 'Se requiere amount y order_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la orden existe y pertenece al usuario
        try:
            order = Order.objects.get(id=order_id)
            if order.customer != request.user:
                return Response(
                    {'error': 'No tienes permiso para esta orden'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Orden no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Crear Payment Intent en Stripe
        metadata = {
            'order_id': str(order_id),
            'customer_email': request.user.email,
            'customer_id': str(request.user.id),
        }
        
        payment_intent_data = stripe_service.create_payment_intent(
            amount=amount,
            currency=currency,
            metadata=metadata
        )
        
        # Buscar el método de pago de tipo Stripe
        stripe_payment_method = PaymentMethod.objects.filter(
            payment_type='stripe',
            is_active=True
        ).first()
        
        if not stripe_payment_method:
            return Response(
                {'error': 'Método de pago Stripe no configurado'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Crear registro de pago en la base de datos
        payment = Payment.objects.create(
            order=order,
            payment_method=stripe_payment_method,
            amount=amount,
            status='pending',
            stripe_payment_intent_id=payment_intent_data['id'],
            stripe_client_secret=payment_intent_data['client_secret'],
        )
        
        return Response({
            'payment_intent_id': payment_intent_data['id'],
            'client_secret': payment_intent_data['client_secret'],
            'payment_id': str(payment.id),
            'status': payment_intent_data['status'],
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Webhook para recibir eventos de Stripe
    
    POST /api/orders/stripe-webhook/
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        # Verificar el evento (si hay webhook secret configurado)
        if sig_header:
            event = stripe_service.construct_webhook_event(payload, sig_header)
        else:
            # En desarrollo sin webhook secret
            event = json.loads(payload)
        
        # Manejar el evento
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            payment_intent_id = payment_intent['id']
            
            # Buscar el pago en la base de datos
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
                payment.status = 'completed'
                payment.transaction_id = payment_intent_id
                payment.save()
                
                # Actualizar el estado de la orden
                order = payment.order
                order.status = 'confirmed'
                order.save()
                
                # Crear/actualizar factura
                from django.utils import timezone
                invoice, created = Invoice.objects.get_or_create(
                    order=order,
                    defaults={
                        'customer': order.customer,
                        'invoice_type': 'sale',
                        'status': 'paid',
                        'subtotal': order.subtotal,
                        'tax_amount': order.tax_amount,
                        'total_amount': order.total_amount,
                        'issue_date': timezone.now().date(),
                        'due_date': timezone.now().date(),
                    }
                )
                if not created:
                    invoice.status = 'paid'
                    invoice.save()
                
                # Aquí podrías enviar email al cliente
                print(f"✅ Pago completado para orden {order.order_number}")
                
            except Payment.DoesNotExist:
                print(f"⚠️ Pago no encontrado para payment_intent {payment_intent_id}")
        
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            payment_intent_id = payment_intent['id']
            
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
                payment.status = 'failed'
                payment.save()
                
                print(f"❌ Pago fallido para payment_intent {payment_intent_id}")
            except Payment.DoesNotExist:
                pass
        
        return HttpResponse(status=200)
        
    except Exception as e:
        print(f"❌ Error en webhook: {str(e)}")
        return HttpResponse(status=400)


# ========================================
# QR CODE PAYMENT VIEWS
# ========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_qr_payment(request):
    """
    Endpoint para iniciar un pago con código QR
    
    Request body:
    {
        "order_id": "id de la orden"
    }
    
    Returns:
    {
        "qr_image_url": "url de la imagen del QR",
        "payment_id": "id del pago creado",
        "order_id": "id de la orden",
        "amount": decimal
    }
    """
    try:
        order_id = request.data.get('order_id')
        
        if not order_id:
            return Response(
                {'error': 'order_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener la orden
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Orden no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que la orden pertenezca al usuario
        if order.customer.id != request.user.id:
            return Response(
                {'error': 'No tienes permiso para acceder a esta orden'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener el método de pago QR
        try:
            qr_payment_method = PaymentMethod.objects.get(payment_type='qr_code', is_active=True)
        except PaymentMethod.DoesNotExist:
            return Response(
                {'error': 'Método de pago QR no disponible'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear el registro de pago
        from django.conf import settings
        qr_image_path = settings.QR_CODE_IMAGE_PATH
        
        # Construir la URL completa del QR
        qr_image_url = f"{request.scheme}://{request.get_host()}/static/qr_codes/banco_qr.jpg"
        
        payment = Payment.objects.create(
            order=order,
            payment_method=qr_payment_method,
            amount=order.total_amount,
            status='pending',
            qr_image_url=qr_image_url,
            qr_code_data='QR_BANK_DATA'  # Aquí podrías guardar datos adicionales del banco
        )
        
        return Response({
            'payment_id': payment.id,
            'order_id': order.id,
            'order_number': order.order_number,
            'qr_image_url': qr_image_url,
            'amount': float(order.total_amount)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al crear el pago con QR: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_qr_payment(request):
    """
    Endpoint para que el cliente confirme que realizó el pago con QR
    
    Request body:
    {
        "payment_id": "id del pago",
        "order_id": "id de la orden"
    }
    
    Returns:
    {
        "success": true,
        "message": "Pago confirmado. Verificaremos tu transacción pronto."
    }
    """
    try:
        payment_id = request.data.get('payment_id')
        order_id = request.data.get('order_id')
        
        if not payment_id or not order_id:
            return Response(
                {'error': 'payment_id y order_id son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el pago
        try:
            payment = Payment.objects.get(id=payment_id, order__id=order_id)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Pago no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar que el pago pertenezca al usuario
        if payment.order.customer.id != request.user.id:
            return Response(
                {'error': 'No tienes permiso para confirmar este pago'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Actualizar el estado del pago a "pendiente de verificación"
        payment.status = 'pending'  # El admin verificará manualmente
        payment.save()
        
        # Actualizar el estado de la orden
        order = payment.order
        order.status = 'pending'  # Esperando verificación del pago
        order.save()
        
        # Crear la factura en estado borrador
        from django.utils import timezone
        invoice, created = Invoice.objects.get_or_create(
            order=order,
            defaults={
                'customer': order.customer,
                'invoice_type': 'sale',
                'status': 'draft',  # Borrador hasta que se verifique el pago
                'subtotal': order.subtotal,
                'tax_amount': order.tax_amount,
                'total_amount': order.total_amount,
                'issue_date': timezone.now().date(),
                'due_date': timezone.now().date(),
            }
        )
        
        # Aquí podrías enviar un email al cliente y al admin
        print(f"📱 Cliente confirmó pago QR para orden {order.order_number}")
        
        return Response({
            'success': True,
            'message': 'Pago confirmado. Verificaremos tu transacción y te notificaremos por email.',
            'order_number': order.order_number
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al confirmar el pago: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )