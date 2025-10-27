from typing import Any, Dict

from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from tenant.middleware import get_current_tenant

from .models import ReportExecution, ReportTemplate
from .serializers import (
    ReportExecutionSerializer,
    ReportRunSerializer,
    ReportTemplateSerializer,
)
from .utils import apply_ordering, build_queryset, export_to_csv, extract_rows


class ReportTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = ReportTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant()
        queryset = ReportTemplate.objects.all()
        if tenant:
            queryset = queryset.filter(tenant=tenant)
        return queryset.order_by('name')

    def perform_create(self, serializer):
        tenant = get_current_tenant()
        serializer.save(tenant=tenant, created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], url_path='run')
    def run_report(self, request, pk=None):
        template = self.get_object()
        serializer = ReportRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        execution = ReportExecution.objects.create(
            tenant=template.tenant,
            template=template,
            executed_by=request.user,
            parameters=data.get('parameters', {}),
            filters_applied=data.get('filters', {}),
            status='running',
            started_at=timezone.now(),
            is_active=True,
        )

        try:
            model = template.content_type.model_class()
            queryset = build_queryset(template.filters, data.get('filters', {}), model)
            queryset = apply_ordering(queryset, data.get('ordering') or template.ordering)

            limit = data.get('limit')
            columns, rows = extract_rows(queryset, template.fields, limit=limit)

            execution.result_count = len(rows)

            export_info: Dict[str, Any] = {}
            export_format = data.get('format', 'json')

            if export_format in {'csv', 'excel'}:
                path, size = export_to_csv(columns, rows)
                execution.excel_file.name = path
                execution.backup_size = size if hasattr(execution, 'backup_size') else None
                export_info['file_path'] = path
                export_info['file_size'] = size

            if data.get('include_data', True) or export_format == 'json':
                execution.result_data = {
                    'columns': columns,
                    'rows': rows,
                }

            execution.status = 'completed'
            execution.completed_at = timezone.now()
            execution.save()

            response_payload = {
                'execution': ReportExecutionSerializer(execution, context={'request': request}).data,
                'export': export_info,
            }

            return Response(response_payload, status=status.HTTP_200_OK)

        except Exception as exc:
            execution.status = 'failed'
            execution.error_message = str(exc)
            execution.completed_at = timezone.now()
            execution.save(update_fields=['status', 'error_message', 'completed_at'])
            return Response({'detail': 'No se pudo generar el reporte.', 'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_current_tenant()
        queryset = ReportExecution.objects.all()
        if tenant:
            queryset = queryset.filter(tenant=tenant)
        return queryset.select_related('template', 'executed_by').order_by('-created_at')
