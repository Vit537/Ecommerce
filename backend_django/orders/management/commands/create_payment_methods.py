"""
Comando de Django para crear los métodos de pago necesarios
"""
from django.core.management.base import BaseCommand
from orders.models import PaymentMethod


class Command(BaseCommand):
    help = 'Crea los métodos de pago predeterminados (stripe, qr_code, cash)'

    def handle(self, *args, **options):
        payment_methods = [
            {
                'name': 'Tarjeta de Crédito/Débito',
                'description': 'Pago seguro con tarjeta a través de Stripe',
                'payment_type': 'stripe',
                'is_active': True,
            },
            {
                'name': 'Código QR',
                'description': 'Pago mediante código QR bancario',
                'payment_type': 'qr_code',
                'is_active': True,
            },
            {
                'name': 'Efectivo',
                'description': 'Pago en efectivo al recibir el pedido',
                'payment_type': 'cash',
                'is_active': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for method_data in payment_methods:
            payment_method, created = PaymentMethod.objects.update_or_create(
                payment_type=method_data['payment_type'],
                defaults={
                    'name': method_data['name'],
                    'description': method_data['description'],
                    'is_active': method_data['is_active'],
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Creado: {payment_method.name} ({payment_method.payment_type})'
                    )
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Actualizado: {payment_method.name} ({payment_method.payment_type})'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Proceso completado: {created_count} creados, {updated_count} actualizados'
            )
        )
