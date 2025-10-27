from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AvailableReportModel, ReportTemplate, UserSavedReport
from .nlp_utils import NLPReportProcessor
from .serializers import (
    AvailableReportModelSerializer,
    ReportExecuteSerializer,
    ReportTemplateSerializer,
    UserSavedReportSerializer,
)
from .utils import (
    apply_dynamic_filters,
    apply_dynamic_ordering,
    export_to_csv,
    export_to_excel_response,
    export_to_pdf_response,
    extract_rows,
)


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet para plantillas de reportes del sistema"""
    serializer_class = ReportTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ReportTemplate.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                models.Q(is_public=True) | models.Q(created_by=self.request.user)
            )
        return queryset


class AvailableReportModelViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para listar modelos disponibles para reportes"""
    serializer_class = AvailableReportModelSerializer
    permission_classes = [IsAuthenticated]
    queryset = AvailableReportModel.objects.filter(is_active=True)
    
    @action(detail=True, methods=['get'])
    def fields(self, request, pk=None):
        """Obtiene los campos disponibles de un modelo"""
        report_model = self.get_object()
        return Response({
            'model': report_model.name,
            'fields': report_model.available_fields,
            'related_models': report_model.related_models,
        })
    
    @action(detail=False, methods=['post'])
    def introspect(self, request):
        """
        Introspecciona un modelo de Django y devuelve sus campos
        Solo para administradores
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        app_label = request.data.get('app_label')
        model_name = request.data.get('model_name')
        
        try:
            model = apps.get_model(app_label, model_name)
        except LookupError:
            return Response(
                {'error': f'Modelo {app_label}.{model_name} no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        fields_info = {}
        for field in model._meta.get_fields():
            if field.concrete and not field.many_to_many:
                field_type = field.get_internal_type()
                fields_info[field.name] = {
                    'label': field.verbose_name if hasattr(field, 'verbose_name') else field.name,
                    'type': field_type,
                    'filterable': True,
                    'sortable': not isinstance(field, (models.TextField, models.JSONField)),
                    'nullable': field.null if hasattr(field, 'null') else False,
                }
        
        return Response({
            'app_label': app_label,
            'model_name': model_name,
            'fields': fields_info,
        })


class UserSavedReportViewSet(viewsets.ModelViewSet):
    """ViewSet para reportes guardados por usuarios"""
    serializer_class = UserSavedReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return UserSavedReport.objects.filter(
            models.Q(created_by=user) | models.Q(shared_with=user)
        ).distinct()
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Ejecuta un reporte guardado con filtros opcionales"""
        saved_report = self.get_object()
        serializer = ReportExecuteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obtener el modelo
        report_model = saved_report.report_model
        try:
            model_class = apps.get_model(report_model.app_label, report_model.model_name)
        except LookupError:
            return Response(
                {'error': 'Modelo no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Construir queryset base
        queryset = model_class.objects.all()
        
        # Aplicar filtros guardados
        if saved_report.filters:
            queryset = apply_dynamic_filters(queryset, saved_report.filters)
        
        # Aplicar filtros adicionales del request
        additional_filters = serializer.validated_data.get('filters', [])
        if additional_filters:
            queryset = apply_dynamic_filters(queryset, additional_filters)
        
        # Aplicar ordenamiento
        ordering = serializer.validated_data.get('ordering', saved_report.ordering)
        if ordering:
            queryset = apply_dynamic_ordering(queryset, ordering)
        
        # Paginación
        limit = serializer.validated_data.get('limit', 1000)
        offset = serializer.validated_data.get('offset', 0)
        
        total_count = queryset.count()
        queryset = queryset[offset:offset + limit]
        
        # Extraer datos
        fields = saved_report.selected_fields or ['id']
        columns, rows = extract_rows(queryset, fields)
        
        # Actualizar estadísticas
        saved_report.execution_count += 1
        saved_report.last_executed_at = timezone.now()
        saved_report.save(update_fields=['execution_count', 'last_executed_at'])
        
        # Exportar según formato
        export_format = serializer.validated_data.get('export_format', 'json')
        
        if export_format == 'excel':
            filename = f"{saved_report.name.replace(' ', '_')}.xlsx"
            return export_to_excel_response(columns, rows, filename)
        
        elif export_format == 'pdf':
            filename = f"{saved_report.name.replace(' ', '_')}.pdf"
            return export_to_pdf_response(columns, rows, saved_report.name, filename)
        
        elif export_format == 'csv':
            path, size = export_to_csv(columns, rows)
            return Response({
                'file_path': path,
                'file_size': size,
                'columns': columns,
                'row_count': len(rows),
            })
        
        # Por defecto, retornar JSON
        return Response({
            'report_name': saved_report.name,
            'columns': columns,
            'data': rows,
            'total_count': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': (offset + limit) < total_count,
        })
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplica un reporte guardado"""
        original = self.get_object()
        
        # Crear copia
        duplicate = UserSavedReport.objects.create(
            name=f"{original.name} (Copia)",
            description=original.description,
            report_model=original.report_model,
            selected_fields=original.selected_fields,
            filters=original.filters,
            ordering=original.ordering,
            grouping=original.grouping,
            aggregations=original.aggregations,
            show_totals=original.show_totals,
            page_size=original.page_size,
            created_by=request.user,
        )
        
        serializer = self.get_serializer(duplicate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Comparte un reporte con otros usuarios"""
        saved_report = self.get_object()
        
        # Verificar que el usuario sea el creador
        if saved_report.created_by != request.user:
            return Response(
                {'error': 'Solo el creador puede compartir este reporte'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_ids = request.data.get('user_ids', [])
        saved_report.shared_with.set(user_ids)
        saved_report.is_shared = len(user_ids) > 0
        saved_report.save()
        
        serializer = self.get_serializer(saved_report)
        return Response(serializer.data)


class AIReportViewSet(viewsets.ViewSet):
    """ViewSet para generación de reportes con IA usando lenguaje natural"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Genera un reporte basado en una consulta en lenguaje natural"""
        query = request.data.get('query', '')
        
        if not query:
            return Response(
                {'error': 'La consulta no puede estar vacía'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Solo administradores pueden usar reportes con IA
        if request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'No tienes permisos para generar reportes con IA'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Procesar consulta con NLP
            processor = NLPReportProcessor()
            interpretation = processor.parse_query(query)
            
            # Construir queryset
            queryset, model = processor.build_queryset(None, interpretation)
            
            # Aplicar ordenamiento y límite según el tipo de consulta
            entity = interpretation['entity']
            metric = interpretation['metric']
            limit = interpretation['limit']
            
            # Determinar campos a seleccionar según la entidad
            if entity == 'clientes':
                # Top clientes por número de órdenes o monto total
                queryset = queryset.annotate(
                    order_count=Count('orders'),
                    total_amount=Sum('orders__total_amount')
                ).order_by('-total_amount' if metric == 'suma' else '-order_count')[:limit]
                
                columns = ['name', 'email', 'phone', 'order_count', 'total_amount']
                data = list(queryset.values(*columns))
                
            elif entity == 'productos':
                # Top productos por cantidad vendida
                from orders.models import OrderItem
                start_date, end_date = processor.get_date_range(interpretation['period'])
                product_stats = OrderItem.objects.filter(
                    tenant=request.user.tenant,
                    order__created_at__gte=start_date,
                    order__created_at__lte=end_date
                ).values(
                    'product__name',
                    'product__sku'
                ).annotate(
                    quantity_sold=Sum('quantity'),
                    total_revenue=Sum('line_total')
                ).order_by('-quantity_sold')[:limit]
                
                columns = ['product__name', 'product__sku', 'quantity_sold', 'total_revenue']
                data = list(product_stats)
                
            elif entity == 'ordenes':
                # Listado de órdenes
                columns = ['id', 'customer__name', 'status', 'total_amount', 'created_at']
                if interpretation['type'] == 'top_n':
                    queryset = queryset.order_by('-total_amount')[:limit]
                else:
                    queryset = queryset.order_by('-created_at')[:limit]
                
                data = list(queryset.values(*columns))
                
                # Formatear fechas
                for row in data:
                    if 'created_at' in row and row['created_at']:
                        row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M')
                
            elif entity == 'pagos':
                # Listado de pagos
                columns = ['id', 'order__id', 'amount', 'payment_method', 'created_at']
                queryset = queryset.order_by('-created_at')[:limit]
                data = list(queryset.values(*columns))
                
                # Formatear fechas
                for row in data:
                    if 'created_at' in row and row['created_at']:
                        row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M')
            
            else:
                # Genérico: valores básicos del modelo
                queryset = queryset[:limit]
                all_fields = [f.name for f in model._meta.fields if not f.many_to_many]
                columns = all_fields[:10]  # Máximo 10 columnas
                data = list(queryset.values(*columns))
            
            # Generar resumen
            summary = processor.generate_summary(interpretation, len(data))
            
            # Traducir nombres de columnas
            translated_columns = []
            for col in columns:
                # Reemplazar __ por . y convertir a título
                translated = col.replace('__', '.').replace('_', ' ').title()
                translated_columns.append(translated)
            
            return Response({
                'query': query,
                'interpretation': interpretation,
                'column_keys': columns,
                'columns': translated_columns,
                'data': data,
                'summary': summary,
            })
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error procesando la consulta: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
