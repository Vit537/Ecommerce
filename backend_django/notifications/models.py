from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationTemplate(models.Model):
    """Plantillas de notificaciones para diferentes eventos"""
    
    EVENT_CHOICES = [
        ('order_created', 'Confirmación de Compra'),
        ('payment_received', 'Cuota Pagada'),
        ('payment_reminder', 'Recordatorio de Pago'),
        ('low_stock', 'Stock Bajo'),
        ('daily_sales_report', 'Reporte Diario de Ventas'),
    ]
    
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES, unique=True)
    subject = models.CharField(max_length=200)
    html_template = models.TextField(help_text="HTML template con placeholders: {{variable}}")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Plantilla de Notificación'
        verbose_name_plural = 'Plantillas de Notificaciones'
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.subject}"


class NotificationSettings(models.Model):
    """Configuración global de notificaciones"""
    
    # Email Settings
    resend_api_key = models.CharField(max_length=200, blank=True)
    from_email = models.EmailField(default='noreply@sportswear.com')
    from_name = models.CharField(max_length=100, default='SPORTSWEAR')
    
    # Admin email for reports
    admin_email = models.EmailField(help_text="Email del administrador para reportes")
    
    # Notification Toggles
    enable_order_confirmation = models.BooleanField(default=True, verbose_name="Confirmar Órdenes")
    enable_payment_notifications = models.BooleanField(default=True, verbose_name="Notificar Pagos")
    enable_low_stock_alerts = models.BooleanField(default=True, verbose_name="Alertas de Stock Bajo")
    enable_daily_reports = models.BooleanField(default=True, verbose_name="Reportes Diarios")
    
    # Daily Report Schedule
    daily_report_time = models.TimeField(default='20:00:00', help_text="Hora para enviar reporte diario (24h)")
    
    # Stock Alert Threshold
    low_stock_threshold = models.IntegerField(default=10, help_text="Cantidad mínima antes de alertar")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_settings'
        verbose_name = 'Configuración de Notificaciones'
        verbose_name_plural = 'Configuración de Notificaciones'
    
    def __str__(self):
        return "Configuración de Notificaciones"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings object exists (singleton pattern)
        if not self.pk and NotificationSettings.objects.exists():
            raise ValueError("Solo puede existir una configuración de notificaciones")
        return super().save(*args, **kwargs)


class Notification(models.Model):
    """Registro de notificaciones enviadas"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('sent', 'Enviado'),
        ('failed', 'Fallido'),
        ('read', 'Leído'),
    ]
    
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('system', 'Sistema'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    event_type = models.CharField(max_length=50)
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Email specific
    recipient_email = models.EmailField(null=True, blank=True)
    email_id = models.CharField(max_length=100, null=True, blank=True, help_text="ID del email en Resend")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True, help_text="Datos adicionales en JSON")
    
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['event_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    def mark_as_read(self):
        """Marca la notificación como leída"""
        if self.status != 'read':
            self.status = 'read'
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])
