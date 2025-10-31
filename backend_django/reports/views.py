"""
Views para el sistema de reportes dinámicos con IA
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from django.http import HttpResponse
from django.utils import timezone
import time
import json

from .ai_service import AIReportService
# from .whisper_service import WhisperTranscriptionService
from .export_service import ReportExporter
from .models import ReportLog
from .serializers import ReportLogSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    """
    Endpoint principal para generar reportes dinámicos
    
    Body:
        {
            "prompt": "string (opcional si hay audio)",
            "audio": "file (opcional)",
            "export_format": "pdf|excel",
            "include_chart": boolean (default: true)
        }
    """
    
    user = request.user
    
    # Verificar permisos
    if user.role not in ['admin', 'employee']:
        return Response(
            {'error': 'No tienes permisos para generar reportes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    start_time = time.time()
    
    try:
        # 1. Obtener prompt (texto o audio)
        prompt = request.data.get('prompt')
        audio_file = request.FILES.get('audio')
        export_format = request.data.get('export_format', 'pdf')
        include_chart = request.data.get('include_chart', True)
        
        transcription = None
        input_type = 'text'
        
        # Si hay audio, transcribir primero
        if audio_file:
            input_type = 'audio'
            whisper_service = WhisperTranscriptionService()
            transcription_result = whisper_service.transcribe_audio(audio_file)
            transcription = transcription_result['text']
            prompt = transcription
        
        if not prompt:
            return Response(
                {'error': 'Debes proporcionar un prompt o un audio'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 2. Interpretar prompt con IA
        ai_service = AIReportService()
        ai_response = ai_service.interpret_prompt(prompt)
        
        sql_query = ai_response['sql_query']
        report_type = ai_response['report_type']
        explanation = ai_response['explanation']
        suggested_chart = ai_response.get('suggested_chart_type', 'bar')
        tokens_used = ai_response.get('tokens_used', 0)
        
        # 3. Validar seguridad SQL
        ai_service.validate_sql_safety(sql_query)
        
        # 4. Ejecutar query
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            columns = [col[0] for col in cursor.description]
            results = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
        
        # 5. Generar resumen con IA
        summary = ai_service.generate_report_summary(prompt, results)
        
        # 6. Preparar metadata
        report_metadata = {
            'title': f"Reporte de {report_type.title()}",
            'user': user.get_full_name() or user.email,
            'prompt': prompt,
            'explanation': explanation,
            'summary': summary,
            'generated_at': timezone.now().isoformat(),
        }
        
        # 7. Exportar según formato
        if export_format == 'excel':
            file_content = ReportExporter.to_excel(results, 'reporte', report_metadata)
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = f'reporte_{report_type}_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        else:  # PDF
            chart_data = None
            if include_chart and len(results) > 0 and suggested_chart != 'none':
                # Intentar detectar campos para gráfico
                numeric_fields = [k for k, v in results[0].items() if isinstance(v, (int, float))]
                text_fields = [k for k, v in results[0].items() if isinstance(v, str)]
                
                if numeric_fields and text_fields:
                    chart_data = {
                        'type': suggested_chart,
                        'x_field': text_fields[0],
                        'y_field': numeric_fields[0],
                        'title': explanation
                    }
            
            file_content = ReportExporter.to_pdf(results, 'reporte', report_metadata, chart_data)
            content_type = 'application/pdf'
            filename = f'reporte_{report_type}_{timezone.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        
        # 8. Guardar log
        execution_time = time.time() - start_time
        
        report_log = ReportLog.objects.create(
            user=user,
            report_type=report_type,
            input_type=input_type,
            original_prompt=prompt,
            transcription=transcription,
            generated_sql=sql_query,
            results_count=len(results),
            export_format=export_format,
            execution_time=execution_time,
            tokens_used=tokens_used,
            success=True
        )
        
        # 9. Devolver archivo
        response = HttpResponse(file_content.read(), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['X-Report-Id'] = str(report_log.id)
        response['X-Execution-Time'] = str(execution_time)
        response['X-Results-Count'] = str(len(results))
        
        return response
        
    except Exception as e:
        # Log de error
        execution_time = time.time() - start_time
        
        ReportLog.objects.create(
            user=user,
            report_type='custom',
            input_type=input_type if 'input_type' in locals() else 'text',
            original_prompt=prompt if 'prompt' in locals() else 'N/A',
            generated_sql='',
            results_count=0,
            export_format=export_format,
            execution_time=execution_time,
            tokens_used=0,
            success=False,
            error_message=str(e)
        )
        
        return Response(
            {
                'error': 'Error al generar reporte',
                'detail': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_report(request):
    """
    Vista previa del reporte sin exportar (solo JSON)
    
    Body:
        {
            "prompt": "string",
            "limit": integer (default: 50)
        }
    """
    
    user = request.user
    
    if user.role not in ['admin', 'employee']:
        return Response(
            {'error': 'No tienes permisos para generar reportes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        prompt = request.data.get('prompt')
        limit = request.data.get('limit', 50)
        if not prompt:
            return Response(
                {'error': 'Debes proporcionar un prompt'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Interpretar prompt
        ai_service = AIReportService()
        ai_response = ai_service.interpret_prompt(prompt)
        
        sql_query = ai_response['sql_query']
        
        # Agregar LIMIT si no lo tiene
        if 'LIMIT' not in sql_query.upper():
            sql_query += f' LIMIT {limit}'
        
        # Validar y ejecutar
        ai_service.validate_sql_safety(sql_query)
        
        with connection.cursor() as cursor:
            cursor.execute(sql_query)
            columns = [col[0] for col in cursor.description]
            results = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
        
        return Response({
            'success': True,
            'report_type': ai_response['report_type'],
            'explanation': ai_response['explanation'],
            'sql_query': sql_query,
            'results_count': len(results),
            'results': results,
            'suggested_chart_type': ai_response.get('suggested_chart_type'),
            'filters_applied': ai_response.get('filters_applied', [])
        })
        
    except Exception as e:
        return Response(
            {
                'error': 'Error al generar vista previa',
                'detail': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_history(request):
    """
    Historial de reportes generados por el usuario
    """
    
    user = request.user
    
    if user.role == 'admin':
        # Admin ve todos los reportes
        reports = ReportLog.objects.all()
    else:
        # Empleados solo ven sus propios reportes
        reports = ReportLog.objects.filter(user=user)
    
    # Filtros opcionales
    report_type = request.query_params.get('type')
    success_only = request.query_params.get('success_only')
    
    if report_type:
        reports = reports.filter(report_type=report_type)
    
    if success_only == 'true':
        reports = reports.filter(success=True)
    
    # Paginación simple
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    
    start = (page - 1) * page_size
    end = start + page_size
    
    total = reports.count()
    reports_page = reports[start:end]
    
    serializer = ReportLogSerializer(reports_page, many=True)
    
    return Response({
        'total': total,
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_suggestions(request):
    """
    Sugerencias de reportes comunes
    """
    
    user = request.user
    
    suggestions = {
        'sales': [
            'Ventas del último mes',
            'Productos más vendidos esta semana',
            'Comparar ventas online vs tienda física del último trimestre',
            'Top 5 clientes con mayor gasto este año',
            'Ventas por día de la semana del último mes',
        ],
        'inventory': [
            'Productos con stock bajo (menos de 10 unidades)',
            'Productos sin ventas en el último mes',
            'Valor total del inventario actual',
        ],
        'financial': [
            'Ingresos totales del último mes',
            'Comparar ingresos mes a mes del último año',
            'Métodos de pago más usados',
        ],
        'customers': [
            'Nuevos clientes este mes',
            'Clientes con más pedidos',
            'Clientes inactivos (sin compras en 3 meses)',
        ]
    }
    
    # Si es empleado, limitar sugerencias
    if user.role == 'employee':
        suggestions = {
            'sales': suggestions['sales'][:3],
            'financial': suggestions['financial'][:2]
        }
    
    return Response({
        'suggestions': suggestions,
        'user_role': user.role
    })
