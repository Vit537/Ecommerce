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
    SendTestEmailSerializer
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
            settings = NotificationSettings.objects.first()
            print("-------------------------------")
            print("Resend API Key:", settings.resend_api_key if settings else "No settings found")
            print("-------------------------------")
            if not settings or not settings.resend_api_key:
                return Response(
                    {'error': 'API key de Resend no configurada'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
                to_email=settings.admin_email,
                subject="Prueba de Conexión - SPORTSWEAR",
                html_content=test_html,
                event_type='test'
            )
            
            return Response({
                'success': True,
                'message': f'Email de prueba enviado a {settings.admin_email}',
                'email_id': response.get('id')
            })
            
        except Exception as e:
            logger.error(f"Error en test de conexión: {str(e)}")
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
