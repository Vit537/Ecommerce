from django.contrib import admin
from .models import ReportTemplate, ReportExecution, DashboardWidget, SavedFilter


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'report_type', 'is_public', 'is_system', 'created_by')
    list_filter = ('report_type', 'is_public', 'is_system', 'tenant')
    search_fields = ('name', 'description')


@admin.register(ReportExecution)
class ReportExecutionAdmin(admin.ModelAdmin):
    list_display = ('template', 'tenant', 'executed_by', 'status', 'started_at', 'completed_at')
    list_filter = ('status', 'started_at', 'tenant')
    search_fields = ('template__name', 'executed_by__email')
    readonly_fields = ('started_at', 'completed_at')


@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'widget_type', 'created_by')
    list_filter = ('widget_type', 'tenant')
    search_fields = ('name',)


@admin.register(SavedFilter)
class SavedFilterAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'content_type', 'is_public', 'created_by')
    list_filter = ('is_public', 'tenant', 'content_type')
    search_fields = ('name', 'description')
