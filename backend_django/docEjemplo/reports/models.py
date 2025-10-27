from django.db import models
from django.contrib.contenttypes.models import ContentType
from tenant.models import TenantAwareModel
from accounts.models import User
import uuid


class ReportTemplate(TenantAwareModel):
    """
    Plantillas de reportes personalizables
    """
    REPORT_TYPES = [
        ('list', 'Lista/Tabla'),
        ('chart', 'Gráfico'),
        ('summary', 'Resumen'),
        ('comparison', 'Comparativo'),
        ('timeline', 'Línea de Tiempo'),
    ]
    
    EXPORT_FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('html', 'HTML'),
        ('json', 'JSON'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='Nombre del Reporte')
    description = models.TextField(blank=True, verbose_name='Descripción')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, verbose_name='Tipo de Reporte')
    
    # Modelo base del reporte
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name='Modelo Base')
    
    # Configuración del reporte
    fields = models.JSONField(default=list, verbose_name='Campos a Mostrar')
    filters = models.JSONField(default=dict, verbose_name='Filtros')
    ordering = models.JSONField(default=list, verbose_name='Ordenamiento')
    grouping = models.JSONField(default=list, verbose_name='Agrupación')
    aggregations = models.JSONField(default=dict, verbose_name='Agregaciones')
    
    # Configuración visual
    layout_config = models.JSONField(default=dict, verbose_name='Configuración de Layout')
    chart_config = models.JSONField(default=dict, verbose_name='Configuración de Gráficos')
    
    # Metadatos
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Creado por')
    is_public = models.BooleanField(default=False, verbose_name='Público')
    is_system = models.BooleanField(default=False, verbose_name='Reporte del Sistema')
    
    # Formatos de exportación permitidos
    allowed_exports = models.JSONField(default=list, verbose_name='Formatos de Exportación')
    
    class Meta:
        verbose_name = 'Plantilla de Reporte'
        verbose_name_plural = 'Plantillas de Reportes'
        unique_together = ['tenant', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class ReportExecution(TenantAwareModel):
    """
    Registro de ejecuciones de reportes
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('running', 'Ejecutando'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE, verbose_name='Plantilla')
    executed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Ejecutado por')
    
    # Parámetros de ejecución
    parameters = models.JSONField(default=dict, verbose_name='Parámetros')
    filters_applied = models.JSONField(default=dict, verbose_name='Filtros Aplicados')
    
    # Estado y resultados
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Estado')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Iniciado')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Completado')
    
    # Resultados
    result_count = models.IntegerField(null=True, blank=True, verbose_name='Número de Registros')
    result_data = models.JSONField(default=dict, verbose_name='Datos del Resultado')
    error_message = models.TextField(blank=True, verbose_name='Mensaje de Error')
    
    # Archivos generados
    pdf_file = models.FileField(upload_to='reports/pdf/', blank=True, verbose_name='Archivo PDF')
    excel_file = models.FileField(upload_to='reports/excel/', blank=True, verbose_name='Archivo Excel')
    
    class Meta:
        verbose_name = 'Ejecución de Reporte'
        verbose_name_plural = 'Ejecuciones de Reportes'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.template.name} - {self.executed_by.email if self.executed_by else 'Sistema'}"


class DashboardWidget(TenantAwareModel):
    """
    Widgets personalizables para dashboards
    """
    WIDGET_TYPES = [
        ('metric', 'Métrica'),
        ('chart', 'Gráfico'),
        ('table', 'Tabla'),
        ('progress', 'Barra de Progreso'),
        ('gauge', 'Medidor'),
        ('calendar', 'Calendario'),
        ('map', 'Mapa'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Nombre del Widget')
    widget_type = models.CharField(max_length=20, choices=WIDGET_TYPES, verbose_name='Tipo de Widget')
    
    # Fuente de datos
    report_template = models.ForeignKey(
        ReportTemplate, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name='Plantilla de Reporte'
    )
    
    # Configuración del widget
    config = models.JSONField(default=dict, verbose_name='Configuración')
    refresh_interval = models.IntegerField(default=300, verbose_name='Intervalo de Actualización (segundos)')
    
    # Posición y tamaño
    position_x = models.IntegerField(default=0, verbose_name='Posición X')
    position_y = models.IntegerField(default=0, verbose_name='Posición Y')
    width = models.IntegerField(default=4, verbose_name='Ancho')
    height = models.IntegerField(default=3, verbose_name='Alto')
    
    # Permisos
    visible_to_groups = models.ManyToManyField(
        'accounts.TenantGroup', 
        blank=True, 
        related_name='dashboard_widgets',
        verbose_name='Visible para Grupos'
    )
    visible_to_users = models.ManyToManyField(
        User, 
        blank=True, 
        related_name='visible_widgets',
        verbose_name='Visible para Usuarios'
    )
    
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_widgets',
        verbose_name='Creado por'
    )
    
    class Meta:
        verbose_name = 'Widget de Dashboard'
        verbose_name_plural = 'Widgets de Dashboard'
        
    def __str__(self):
        return f"{self.name} ({self.get_widget_type_display()})"


class SavedFilter(TenantAwareModel):
    """
    Filtros guardados para reportes y vistas
    """
    name = models.CharField(max_length=200, verbose_name='Nombre del Filtro')
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    # Modelo al que se aplica
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name='Modelo')
    
    # Configuración del filtro
    filter_config = models.JSONField(default=dict, verbose_name='Configuración del Filtro')
    
    # Permisos
    is_public = models.BooleanField(default=False, verbose_name='Público')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Creado por')
    
    class Meta:
        verbose_name = 'Filtro Guardado'
        verbose_name_plural = 'Filtros Guardados'
        unique_together = ['tenant', 'name', 'content_type']
        
    def __str__(self):
        return f"{self.name} - {self.content_type.name}"


class AvailableReportModel(TenantAwareModel):
    """
    Modelos disponibles para generación de reportes dinámicos
    """
    name = models.CharField(max_length=200, verbose_name='Nombre del Modelo')
    app_label = models.CharField(max_length=100, verbose_name='App')
    model_name = models.CharField(max_length=100, verbose_name='Modelo')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name='Content Type')
    
    # Campos disponibles para reportes
    available_fields = models.JSONField(default=dict, verbose_name='Campos Disponibles')
    # Formato: {"field_name": {"label": "Label", "type": "CharField|IntegerField|etc", "filterable": true, "sortable": true}}
    
    # Relaciones disponibles
    related_models = models.JSONField(default=list, verbose_name='Modelos Relacionados')
    # Formato: [{"field": "customer", "model": "Customer", "label": "Cliente"}]
    
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    display_order = models.IntegerField(default=0, verbose_name='Orden de Visualización')
    
    class Meta:
        verbose_name = 'Modelo Disponible para Reportes'
        verbose_name_plural = 'Modelos Disponibles para Reportes'
        unique_together = ['tenant', 'app_label', 'model_name']
        ordering = ['display_order', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.app_label}.{self.model_name})"


class UserSavedReport(TenantAwareModel):
    """
    Reportes personalizados guardados por usuarios
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name='Nombre del Reporte')
    description = models.TextField(blank=True, verbose_name='Descripción')
    
    # Modelo base
    report_model = models.ForeignKey(
        AvailableReportModel, 
        on_delete=models.CASCADE, 
        verbose_name='Modelo del Reporte'
    )
    
    # Configuración del reporte personalizado
    selected_fields = models.JSONField(default=list, verbose_name='Campos Seleccionados')
    # Formato: ["field1", "field2", "related__field3"]
    
    filters = models.JSONField(default=list, verbose_name='Filtros')
    # Formato: [{"field": "status", "operator": "equals", "value": "active"}]
    
    ordering = models.JSONField(default=list, verbose_name='Ordenamiento')
    # Formato: [{"field": "created_at", "direction": "desc"}]
    
    grouping = models.JSONField(default=list, verbose_name='Agrupación')
    aggregations = models.JSONField(default=dict, verbose_name='Agregaciones')
    
    # Opciones de visualización
    show_totals = models.BooleanField(default=False, verbose_name='Mostrar Totales')
    page_size = models.IntegerField(default=50, verbose_name='Registros por Página')
    
    # Permisos y compartir
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_reports', verbose_name='Creado por')
    is_shared = models.BooleanField(default=False, verbose_name='Compartido')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_reports', verbose_name='Compartido con')
    
    # Estadísticas
    execution_count = models.IntegerField(default=0, verbose_name='Veces Ejecutado')
    last_executed_at = models.DateTimeField(null=True, blank=True, verbose_name='Última Ejecución')
    
    class Meta:
        verbose_name = 'Reporte Guardado del Usuario'
        verbose_name_plural = 'Reportes Guardados de Usuarios'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.created_by.email}"