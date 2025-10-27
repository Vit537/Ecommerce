from django.urls import path
from . import views
# from . import simple_views

app_name = 'reports'

urlpatterns = [
    # Generar reporte completo (con exportación)
    path('generate/', views.generate_report, name='generate_report'),
    
  
    
    # Vista previa (solo JSON, sin exportar)
    path('preview/', views.preview_report, name='preview_report'),
    
    # Historial de reportes
    path('history/', views.report_history, name='report_history'),
    
    # Sugerencias de reportes
    path('suggestions/', views.report_suggestions, name='report_suggestions'),
]
