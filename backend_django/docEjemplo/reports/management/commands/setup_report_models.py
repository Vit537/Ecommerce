"""
Management command para inicializar los modelos disponibles para reportes
"""
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.db import models

from reports.models import AvailableReportModel
from tenant.models import Tenant


class Command(BaseCommand):
    help = 'Inicializa los modelos disponibles para la generación de reportes dinámicos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-slug',
            type=str,
            help='Slug del tenant para el que crear los modelos'
        )

    def handle(self, *args, **options):
        tenant_slug = options.get('tenant_slug')
        
        if tenant_slug:
            try:
                tenant = Tenant.objects.get(slug=tenant_slug)
                tenants = [tenant]
            except Tenant.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Tenant con slug "{tenant_slug}" no encontrado'))
                return
        else:
            tenants = Tenant.objects.filter(status='active')
        
        # Modelos disponibles para reportes
        models_config = [
            {
                'app': 'orders',
                'model': 'Order',
                'name': 'Órdenes',
                'order': 1,
            },
            {
                'app': 'orders',
                'model': 'OrderItem',
                'name': 'Ítems de Órdenes',
                'order': 2,
            },
            {
                'app': 'inventory',
                'model': 'Product',
                'name': 'Productos',
                'order': 3,
            },
            {
                'app': 'inventory',
                'model': 'Stock',
                'name': 'Inventario',
                'order': 4,
            },
            {
                'app': 'finance',
                'model': 'Payment',
                'name': 'Pagos',
                'order': 5,
            },
            {
                'app': 'finance',
                'model': 'Invoice',
                'name': 'Facturas',
                'order': 6,
            },
            {
                'app': 'accounts',
                'model': 'User',
                'name': 'Usuarios',
                'order': 7,
            },
        ]
        
        for tenant in tenants:
            self.stdout.write(f'\nConfigurando modelos de reportes para tenant: {tenant.name}')
            
            for config in models_config:
                try:
                    model_class = apps.get_model(config['app'], config['model'])
                    content_type = ContentType.objects.get_for_model(model_class)
                    
                    # Introspeccionar campos del modelo
                    fields_info = {}
                    related_models = []
                    
                    for field in model_class._meta.get_fields():
                        if field.concrete and not field.many_to_many:
                            field_type = field.get_internal_type()
                            
                            fields_info[field.name] = {
                                'label': str(field.verbose_name) if hasattr(field, 'verbose_name') else field.name,
                                'type': field_type,
                                'filterable': True,
                                'sortable': not isinstance(field, (models.TextField, models.JSONField)),
                            }
                        
                        # Detectar relaciones
                        if field.is_relation and not field.many_to_many:
                            related_models.append({
                                'field': field.name,
                                'model': field.related_model.__name__,
                                'label': str(field.verbose_name) if hasattr(field, 'verbose_name') else field.name,
                            })
                    
                    # Crear o actualizar modelo disponible
                    report_model, created = AvailableReportModel.objects.update_or_create(
                        tenant=tenant,
                        app_label=config['app'],
                        model_name=config['model'],
                        defaults={
                            'name': config['name'],
                            'content_type': content_type,
                            'available_fields': fields_info,
                            'related_models': related_models,
                            'is_active': True,
                            'display_order': config['order'],
                        }
                    )
                    
                    action = 'Creado' if created else 'Actualizado'
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✓ {action}: {config["name"]} ({len(fields_info)} campos)')
                    )
                
                except LookupError:
                    self.stdout.write(
                        self.style.WARNING(f'  ✗ Modelo {config["app"]}.{config["model"]} no encontrado')
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Error con {config["name"]}: {str(e)}')
                    )
        
        self.stdout.write(self.style.SUCCESS('\n✓ Configuración de modelos de reportes completada'))
