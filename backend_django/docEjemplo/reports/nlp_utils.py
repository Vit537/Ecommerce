"""
Utilidades para procesamiento de lenguaje natural en reportes
"""
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple

from django.db.models import Q, Sum, Count, Avg, Max, Min
from django.utils import timezone


class NLPReportProcessor:
    """Procesador de consultas en lenguaje natural para generar reportes"""
    
    # Patrones para detectar entidades
    ENTITY_PATTERNS = {
        'clientes': ['cliente', 'clientes', 'comprador', 'compradores'],
        'productos': ['producto', 'productos', 'artículo', 'artículos', 'item', 'items'],
        'ordenes': ['orden', 'ordenes', 'pedido', 'pedidos', 'venta', 'ventas'],
        'pagos': ['pago', 'pagos', 'cobro', 'cobros'],
        'facturas': ['factura', 'facturas'],
        'usuarios': ['usuario', 'usuarios', 'vendedor', 'vendedores'],
    }
    
    # Patrones para detectar períodos de tiempo
    TIME_PATTERNS = {
        'hoy': ['hoy', 'día de hoy'],
        'ayer': ['ayer'],
        'esta_semana': ['esta semana', 'semana actual'],
        'semana_pasada': ['semana pasada', 'última semana'],
        'este_mes': ['este mes', 'mes actual', 'mes en curso'],
        'mes_pasado': ['mes pasado', 'último mes'],
        'este_año': ['este año', 'año actual'],
        'trimestre': ['trimestre', 'últimos 3 meses'],
        'semestre': ['semestre', 'últimos 6 meses'],
    }
    
    # Patrones para detectar métricas
    METRIC_PATTERNS = {
        'cantidad': ['cantidad', 'número', 'cuánto', 'cuántos', 'total de'],
        'suma': ['suma', 'total', 'monto', 'valor'],
        'promedio': ['promedio', 'media', 'average'],
        'maximo': ['máximo', 'mayor', 'más alto', 'top', 'mejores'],
        'minimo': ['mínimo', 'menor', 'más bajo'],
    }
    
    # Patrones para detectar tipos de consulta
    QUERY_TYPE_PATTERNS = {
        'top_n': ['top', 'mejores', 'primeros', 'principales', 'más'],
        'ranking': ['ranking', 'clasificación', 'ordenar por'],
        'total': ['total', 'suma', 'cuánto'],
        'listado': ['lista', 'listado', 'muestra', 'dame', 'ver'],
        'comparacion': ['comparar', 'comparación', 'versus', 'vs'],
    }
    
    def __init__(self):
        self.query = ""
        self.interpretation = {
            'type': 'listado',
            'entity': 'ordenes',
            'period': 'este_mes',
            'metric': 'cantidad',
            'limit': 10,
            'order': 'desc',
        }
    
    def parse_query(self, query: str) -> Dict[str, Any]:
        """Analiza la consulta en lenguaje natural"""
        self.query = query.lower()
        
        # Detectar entidad
        self.interpretation['entity'] = self._detect_entity()
        
        # Detectar período
        self.interpretation['period'] = self._detect_period()
        
        # Detectar métrica
        self.interpretation['metric'] = self._detect_metric()
        
        # Detectar tipo de consulta
        self.interpretation['type'] = self._detect_query_type()
        
        # Detectar límite (para top N)
        self.interpretation['limit'] = self._detect_limit()
        
        return self.interpretation
    
    def _detect_entity(self) -> str:
        """Detecta la entidad principal de la consulta"""
        for entity, patterns in self.ENTITY_PATTERNS.items():
            for pattern in patterns:
                if pattern in self.query:
                    return entity
        return 'ordenes'  # Default
    
    def _detect_period(self) -> str:
        """Detecta el período de tiempo"""
        for period, patterns in self.TIME_PATTERNS.items():
            for pattern in patterns:
                if pattern in self.query:
                    return period
        return 'este_mes'  # Default
    
    def _detect_metric(self) -> str:
        """Detecta la métrica a calcular"""
        for metric, patterns in self.METRIC_PATTERNS.items():
            for pattern in patterns:
                if pattern in self.query:
                    return metric
        return 'cantidad'  # Default
    
    def _detect_query_type(self) -> str:
        """Detecta el tipo de consulta"""
        for qtype, patterns in self.QUERY_TYPE_PATTERNS.items():
            for pattern in patterns:
                if pattern in self.query:
                    return qtype
        return 'listado'  # Default
    
    def _detect_limit(self) -> int:
        """Detecta el límite de resultados (para top N)"""
        # Buscar números en la consulta
        numbers = re.findall(r'\d+', self.query)
        if numbers:
            # Tomar el primer número encontrado
            limit = int(numbers[0])
            return min(limit, 100)  # Máximo 100
        return 10  # Default
    
    def get_date_range(self, period: str) -> Tuple[datetime, datetime]:
        """Obtiene el rango de fechas para el período especificado"""
        now = timezone.now()
        today = now.date()
        
        if period == 'hoy':
            start = datetime.combine(today, datetime.min.time())
            end = now
        
        elif period == 'ayer':
            yesterday = today - timedelta(days=1)
            start = datetime.combine(yesterday, datetime.min.time())
            end = datetime.combine(yesterday, datetime.max.time())
        
        elif period == 'esta_semana':
            start_of_week = today - timedelta(days=today.weekday())
            start = datetime.combine(start_of_week, datetime.min.time())
            end = now
        
        elif period == 'semana_pasada':
            start_of_last_week = today - timedelta(days=today.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            start = datetime.combine(start_of_last_week, datetime.min.time())
            end = datetime.combine(end_of_last_week, datetime.max.time())
        
        elif period == 'este_mes':
            start = datetime.combine(today.replace(day=1), datetime.min.time())
            end = now
        
        elif period == 'mes_pasado':
            first_of_this_month = today.replace(day=1)
            last_month = first_of_this_month - timedelta(days=1)
            start = datetime.combine(last_month.replace(day=1), datetime.min.time())
            end = datetime.combine(last_month, datetime.max.time())
        
        elif period == 'este_año':
            start = datetime.combine(today.replace(month=1, day=1), datetime.min.time())
            end = now
        
        elif period == 'trimestre':
            start = now - timedelta(days=90)
            end = now
        
        elif period == 'semestre':
            start = now - timedelta(days=180)
            end = now
        
        else:
            # Default: último mes
            start = now - timedelta(days=30)
            end = now
        
        # Asegurar timezone awareness
        if timezone.is_naive(start):
            start = timezone.make_aware(start)
        if timezone.is_naive(end):
            end = timezone.make_aware(end)
        
        return start, end
    
    def build_queryset(self, model_class, interpretation: Dict[str, Any]):
        """Construye el queryset basado en la interpretación"""
        from django.apps import apps
        
        # Obtener el modelo correcto
        entity = interpretation['entity']
        
        model_map = {
            'clientes': ('orders', 'Customer'),
            'productos': ('inventory', 'Product'),
            'ordenes': ('orders', 'Order'),
            'pagos': ('finance', 'Payment'),
            'facturas': ('finance', 'Invoice'),
            'usuarios': ('accounts', 'User'),
        }
        
        if entity not in model_map:
            entity = 'ordenes'
        
        app_label, model_name = model_map[entity]
        model = apps.get_model(app_label, model_name)
        
        # Construir queryset base
        queryset = model.objects.all()
        
        # Aplicar filtro de fecha
        period = interpretation['period']
        start_date, end_date = self.get_date_range(period)
        
        # Determinar campo de fecha según el modelo
        date_field = 'created_at'
        if hasattr(model, 'created_date'):
            date_field = 'created_date'
        elif hasattr(model, 'date'):
            date_field = 'date'
        
        queryset = queryset.filter(**{
            f'{date_field}__gte': start_date,
            f'{date_field}__lte': end_date,
        })
        
        return queryset, model
    
    def generate_summary(self, interpretation: Dict[str, Any], result_count: int) -> str:
        """Genera un resumen en lenguaje natural del resultado"""
        entity_labels = {
            'clientes': 'clientes',
            'productos': 'productos',
            'ordenes': 'órdenes',
            'pagos': 'pagos',
            'facturas': 'facturas',
            'usuarios': 'usuarios',
        }
        
        period_labels = {
            'hoy': 'hoy',
            'ayer': 'ayer',
            'esta_semana': 'esta semana',
            'semana_pasada': 'la semana pasada',
            'este_mes': 'este mes',
            'mes_pasado': 'el mes pasado',
            'este_año': 'este año',
            'trimestre': 'el último trimestre',
            'semestre': 'el último semestre',
        }
        
        entity = entity_labels.get(interpretation['entity'], interpretation['entity'])
        period = period_labels.get(interpretation['period'], interpretation['period'])
        
        if interpretation['type'] == 'top_n':
            return f"Se encontraron los {interpretation['limit']} {entity} principales de {period}. Total de registros: {result_count}."
        else:
            return f"Se encontraron {result_count} {entity} en el período de {period}."
