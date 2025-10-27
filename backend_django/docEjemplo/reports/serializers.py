from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import (
    AvailableReportModel,
    ReportExecution,
    ReportTemplate,
    UserSavedReport,
)


class ReportTemplateSerializer(serializers.ModelSerializer):
    content_type_label = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = ReportTemplate
        fields = [
            'id',
            'name',
            'description',
            'report_type',
            'content_type',
            'content_type_label',
            'fields',
            'filters',
            'ordering',
            'grouping',
            'aggregations',
            'layout_config',
            'chart_config',
            'is_public',
            'is_system',
            'allowed_exports',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate_content_type(self, value: ContentType):
        if not hasattr(value.model_class(), 'objects'):
            raise serializers.ValidationError('El modelo seleccionado no es válido para reportes.')
        return value


class ReportExecutionSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    executed_by_email = serializers.EmailField(source='executed_by.email', read_only=True)

    class Meta:
        model = ReportExecution
        fields = [
            'id',
            'template',
            'template_name',
            'executed_by',
            'executed_by_email',
            'status',
            'started_at',
            'completed_at',
            'result_count',
            'result_data',
            'error_message',
            'pdf_file',
            'excel_file',
            'created_at',
        ]
        read_only_fields = fields


class ReportRunSerializer(serializers.Serializer):
    parameters = serializers.DictField(child=serializers.JSONField(), required=False)
    filters = serializers.DictField(child=serializers.JSONField(), required=False)
    ordering = serializers.ListField(child=serializers.CharField(), required=False)
    format = serializers.ChoiceField(choices=['json', 'csv', 'excel'], default='json')
    include_data = serializers.BooleanField(default=True)
    limit = serializers.IntegerField(min_value=1, max_value=1000, required=False)


class AvailableReportModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableReportModel
        fields = [
            'id',
            'name',
            'app_label',
            'model_name',
            'content_type',
            'available_fields',
            'related_models',
            'is_active',
            'display_order',
        ]
        read_only_fields = ['id']


class UserSavedReportSerializer(serializers.ModelSerializer):
    report_model_name = serializers.CharField(source='report_model.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSavedReport
        fields = [
            'id',
            'name',
            'description',
            'report_model',
            'report_model_name',
            'selected_fields',
            'filters',
            'ordering',
            'grouping',
            'aggregations',
            'show_totals',
            'page_size',
            'created_by',
            'created_by_email',
            'is_shared',
            'shared_with',
            'execution_count',
            'last_executed_at',
            'created_at',
            'updated_at',
            'can_edit',
        ]
        read_only_fields = ['created_by', 'execution_count', 'last_executed_at', 'created_at', 'updated_at']
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        return obj.created_by == request.user
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportExecuteSerializer(serializers.Serializer):
    """Serializer para ejecutar un reporte guardado con filtros dinámicos"""
    filters = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text='Lista de filtros adicionales a aplicar'
    )
    ordering = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text='Ordenamiento personalizado'
    )
    limit = serializers.IntegerField(min_value=1, max_value=10000, default=1000)
    offset = serializers.IntegerField(min_value=0, default=0)
    export_format = serializers.ChoiceField(
        choices=['json', 'csv', 'excel', 'pdf'],
        default='json',
        required=False
    )
