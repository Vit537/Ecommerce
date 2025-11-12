from rest_framework import serializers
from .models import NotificationSettings, Notification, NotificationTemplate


class NotificationTemplateSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id',
            'event_type',
            'event_type_display',
            'subject',
            'html_template',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'id',
            'resend_api_key',
            'from_email',
            'from_name',
            'admin_email',
            'enable_order_confirmation',
            'enable_payment_notifications',
            'enable_low_stock_alerts',
            'enable_daily_reports',
            'daily_report_time',
            'low_stock_threshold',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'resend_api_key': {'write_only': True}  # No exponer la API key en las respuestas
        }


class NotificationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'notification_type',
            'notification_type_display',
            'event_type',
            'title',
            'message',
            'recipient_email',
            'email_id',
            'status',
            'status_display',
            'error_message',
            'metadata',
            'sent_at',
            'read_at',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'email_id',
            'sent_at',
            'created_at',
            'user_email',
            'user_name'
        ]
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return None


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar notificaciones"""
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'event_type',
            'title',
            'message',
            'status',
            'status_display',
            'read_at',
            'created_at'
        ]
        read_only_fields = fields


class SendTestEmailSerializer(serializers.Serializer):
    """Serializer para enviar emails de prueba"""
    to_email = serializers.EmailField(required=True)
    subject = serializers.CharField(max_length=200, required=True)
    message = serializers.CharField(required=True)


class BroadcastEmailSerializer(serializers.Serializer):
    """Serializer para enviar emails promocionales personalizados"""
    recipients = serializers.ListField(
        child=serializers.EmailField(),
        required=True,
        help_text="Lista de emails a los que enviar el mensaje"
    )
    subject = serializers.CharField(
        max_length=200, 
        required=True,
        help_text="Asunto del email"
    )
    message = serializers.CharField(
        required=True,
        help_text="Mensaje HTML o texto plano"
    )
    is_html = serializers.BooleanField(
        default=True,
        help_text="Si el mensaje es HTML (true) o texto plano (false)"
    )
    
    def validate_recipients(self, value):
        """Valida que haya al menos un destinatario"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Debe proporcionar al menos un destinatario")
        return value
