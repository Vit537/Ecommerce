from django.core.management.base import BaseCommand
from orders.models import ShippingMethod


class Command(BaseCommand):
    help = 'Carga métodos de envío iniciales'

    def handle(self, *args, **kwargs):
        shipping_methods = [
            {
                'name': 'Envío Estándar a Domicilio',
                'shipping_type': 'home_delivery',
                'description': 'Envío a tu domicilio en 3-5 días hábiles',
                'cost': 5.00,
                'estimated_days': 4,
                'is_active': True,
                'store_address': {}
            },
            {
                'name': 'Envío Express a Domicilio',
                'shipping_type': 'home_delivery',
                'description': 'Envío rápido a tu domicilio en 1-2 días hábiles',
                'cost': 10.00,
                'estimated_days': 1,
                'is_active': True,
                'store_address': {}
            },
            {
                'name': 'Retiro en Tienda - Centro',
                'shipping_type': 'store_pickup',
                'description': 'Retira tu pedido en nuestra tienda del centro. Sin costo.',
                'cost': 0.00,
                'estimated_days': 0,
                'is_active': True,
                'store_address': {
                    'store_name': 'SPORTSWEAR Centro',
                    'address': 'Av. Principal 123',
                    'city': 'Ciudad',
                    'phone': '+123 456 7890',
                    'hours': 'Lunes a Sábado 9:00 - 20:00'
                }
            },
            {
                'name': 'Retiro en Tienda - Mall',
                'shipping_type': 'store_pickup',
                'description': 'Retira tu pedido en nuestra tienda del mall. Sin costo.',
                'cost': 0.00,
                'estimated_days': 0,
                'is_active': True,
                'store_address': {
                    'store_name': 'SPORTSWEAR Mall Plaza',
                    'address': 'Centro Comercial Mall Plaza, Local 205',
                    'city': 'Ciudad',
                    'phone': '+123 456 7891',
                    'hours': 'Lunes a Domingo 10:00 - 22:00'
                }
            },
        ]

        created_count = 0
        updated_count = 0

        for method_data in shipping_methods:
            method, created = ShippingMethod.objects.get_or_create(
                name=method_data['name'],
                defaults=method_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Creado: {method.name}')
                )
            else:
                # Actualizar si ya existe
                for key, value in method_data.items():
                    setattr(method, key, value)
                method.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Actualizado: {method.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Proceso completado: {created_count} creados, {updated_count} actualizados'
            )
        )
