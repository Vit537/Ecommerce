from django.contrib import admin
from .models import NotificationSettings, Notification, NotificationTemplate


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['id', 'from_email', 'admin_email', 'enable_order_confirmation', 'enable_daily_reports']
    fieldsets = (
        ('Email Configuration', {
            'fields': ('resend_api_key', 'from_email', 'from_name', 'admin_email')
        }),
        ('Notification Toggles', {
            'fields': (
                'enable_order_confirmation',
                'enable_payment_notifications',
                'enable_low_stock_alerts',
                'enable_daily_reports'
            )
        }),
        ('Settings', {
            'fields': ('daily_report_time', 'low_stock_threshold')
        }),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'user', 'notification_type', 'event_type', 'status', 'created_at']
    list_filter = ['notification_type', 'event_type', 'status', 'created_at']
    search_fields = ['title', 'message', 'recipient_email', 'user__email']
    readonly_fields = ['email_id', 'sent_at', 'read_at', 'created_at']
    date_hierarchy = 'created_at'


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'event_type', 'subject', 'is_active', 'updated_at']
    list_filter = ['event_type', 'is_active']
    search_fields = ['subject', 'html_template']
    readonly_fields = ['created_at', 'updated_at']
