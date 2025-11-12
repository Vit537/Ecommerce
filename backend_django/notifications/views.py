from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import NotificationSettings, Notification, NotificationTemplate
from .serializers import (
    NotificationSettingsSerializer,
    NotificationSerializer,
    NotificationListSerializer,
    NotificationTemplateSerializer,
    SendTestEmailSerializer,
    BroadcastEmailSerializer
)
from .email_service import email_service
import logging

logger = logging.getLogger(__name__)


class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet para configuración de notificaciones"""
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo permitir al admin ver/editar la configuración
        if self.request.user.is_staff or self.request.user.role in ['admin', 'gerente']:
            return self.queryset
        return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Obtiene la configuración actual"""
        settings, created = NotificationSettings.objects.get_or_create(
            id=1,
            defaults={
                'admin_email': request.user.email if request.user.is_staff else 'admin@sportswear.com'
            }
        )
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def test_connection(self, request):
        """Prueba la conexión con Resend enviando un email de prueba"""
        try:
            from django.conf import settings
            
            print("-------------------------------")
            print("Resend API Key:", settings.RESEND_API_KEY[:20] + "..." if settings.RESEND_API_KEY else "No configurada")
            print("-------------------------------")
            
            if not settings.RESEND_API_KEY:
                return Response(
                    {'error': 'API key de Resend no configurada en .env'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener email del admin
            notification_settings = NotificationSettings.objects.first()
            admin_email = notification_settings.admin_email if notification_settings else request.user.email
            
            # Enviar email de prueba
            test_html = """
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #1a1a1a;">✓ Conexión Exitosa</h2>
                    <p>Este es un email de prueba desde SPORTSWEAR.</p>
                    <p>Tu configuración de Resend está funcionando correctamente.</p>
                </body>
            </html>
            """
            
            response = email_service.send_email(
                to_email=admin_email,
                subject="Prueba de Conexión - SPORTSWEAR",
                html_content=test_html,
                event_type='test'
            )
            
            return Response({
                'success': True,
                'message': f'Email de prueba enviado a {admin_email}',
                'email_id': response.get('id')
            })
            
        except Exception as e:
            logger.error(f"Error en test de conexión: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def broadcast_email(self, request):
        """Envía un email personalizado a múltiples destinatarios"""
        # Verificar permisos de admin
        if not (request.user.is_staff or request.user.role in ['admin', 'gerente']):
            return Response(
                {'error': 'No tienes permisos para enviar emails masivos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BroadcastEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        recipients = serializer.validated_data['recipients']
        subject = serializer.validated_data['subject']
        message = serializer.validated_data['message']
        is_html = serializer.validated_data.get('is_html', True)
        
        try:
            # Construir el HTML del email si es necesario
            if is_html:
                html_content = message
            else:
                html_content = f"""
                <html>
                    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
                        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">SPORTSWEAR</h1>
                            </div>
                            <div style="color: #212121; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                                {message}
                            </div>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                                <p style="color: #757575; font-size: 14px; margin: 0;">
                                    Gracias por ser parte de SPORTSWEAR
                                </p>
                            </div>
                        </div>
                    </body>
                </html>
                """
            
            # Enviar emails a cada destinatario
            results = {
                'success': [],
                'failed': [],
                'total': len(recipients)
            }
            
            for recipient_email in recipients:
                try:
                    response = email_service.send_email(
                        to_email=recipient_email,
                        subject=subject,
                        html_content=html_content,
                        event_type='broadcast',
                        user=request.user,
                        metadata={
                            'broadcast': True,
                            'sender': request.user.email,
                            'total_recipients': len(recipients)
                        }
                    )
                    results['success'].append({
                        'email': recipient_email,
                        'email_id': response.get('id')
                    })
                    logger.info(f"Email broadcast enviado a {recipient_email}")
                    
                except Exception as e:
                    logger.error(f"Error enviando email a {recipient_email}: {str(e)}")
                    results['failed'].append({
                        'email': recipient_email,
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'Emails enviados: {len(results["success"])} exitosos, {len(results["failed"])} fallidos',
                'results': results
            })
            
        except Exception as e:
            logger.error(f"Error en broadcast de emails: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def send_daily_report(self, request):
        """Genera y envía el reporte diario de ventas al administrador"""
        # Verificar permisos de admin
        if not (request.user.is_staff or request.user.role in ['admin', 'gerente']):
            return Response(
                {'error': 'No tienes permisos para enviar reportes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from django.db.models import Sum, Count, Avg
            from orders.models import Order
            from datetime import date, timedelta
            
            # Obtener datos del día actual (o fecha especificada)
            target_date = request.data.get('date')
            if target_date:
                from datetime import datetime
                target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
            else:
                target_date = date.today()
            
            # Filtrar órdenes del día
            orders = Order.objects.filter(
                created_at__date=target_date,
                status__in=['completed', 'pending', 'processing']
            )
            
            # Calcular estadísticas
            total_sales = orders.aggregate(total=Sum('total'))['total'] or 0
            total_orders = orders.count()
            avg_ticket = orders.aggregate(avg=Avg('total'))['avg'] or 0
            
            # Nuevos clientes (usuarios que hicieron su primera compra hoy)
            new_customers = Order.objects.filter(
                created_at__date=target_date
            ).values('user').distinct().count()
            
            # Por método de pago
            by_payment_method = {}
            payment_stats = orders.values('payment_method__name').annotate(
                total=Sum('total'),
                count=Count('id')
            )
            for stat in payment_stats:
                method_name = stat['payment_method__name'] or 'Sin método'
                by_payment_method[method_name] = {
                    'total': float(stat['total']),
                    'count': stat['count']
                }
            
            # Top productos
            from orders.models import OrderItem
            top_products = OrderItem.objects.filter(
                order__created_at__date=target_date,
                order__status__in=['completed', 'pending', 'processing']
            ).values(
                'product__name'
            ).annotate(
                quantity=Sum('quantity'),
                revenue=Sum('subtotal')
            ).order_by('-revenue')[:5]
            
            # Preparar datos del reporte
            report_data = {
                'total_sales': float(total_sales),
                'total_orders': total_orders,
                'avg_ticket': float(avg_ticket),
                'new_customers': new_customers,
                'by_payment_method': by_payment_method,
                'top_products': [
                    {
                        'name': item['product__name'],
                        'quantity': item['quantity'],
                        'revenue': float(item['revenue'])
                    }
                    for item in top_products
                ]
            }
            
            # Enviar reporte
            response = email_service.send_daily_sales_report(report_data)
            
            if response:
                return Response({
                    'success': True,
                    'message': 'Reporte diario enviado exitosamente',
                    'email_id': response.get('id'),
                    'report_data': report_data
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Los reportes diarios están deshabilitados en la configuración'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error generando reporte diario: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para ver notificaciones"""
    queryset = Notification.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin ve todas las notificaciones
        if user.is_staff or user.role in ['admin', 'gerente']:
            return self.queryset.select_related('user')
        
        # Usuarios normales solo ven sus notificaciones
        return self.queryset.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_notifications(self, request):
        """Obtiene las notificaciones del usuario actual"""
        notifications = self.get_queryset().filter(user=request.user)[:20]
        serializer = NotificationListSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Cuenta las notificaciones no leídas"""
        count = self.get_queryset().filter(
            user=request.user,
            status__in=['pending', 'sent']
        ).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marca una notificación como leída"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({
            'success': True,
            'message': 'Notificación marcada como leída'
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marca todas las notificaciones del usuario como leídas"""
        updated = self.get_queryset().filter(
            user=request.user,
            status__in=['pending', 'sent']
        ).update(
            status='read',
            read_at=timezone.now()
        )
        return Response({
            'success': True,
            'message': f'{updated} notificaciones marcadas como leídas'
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Elimina todas las notificaciones leídas del usuario"""
        deleted_count, _ = self.get_queryset().filter(
            user=request.user,
            status='read'
        ).delete()
        return Response({
            'success': True,
            'message': f'{deleted_count} notificaciones eliminadas'
        })


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para plantillas de notificaciones"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo admin puede gestionar plantillas
        if self.request.user.is_staff or self.request.user.role in ['admin', 'gerente']:
            return self.queryset
        return self.queryset.none()
