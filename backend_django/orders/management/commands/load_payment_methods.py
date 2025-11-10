from django.core.management.base import BaseCommand
from orders.models import PaymentMethod


class Command(BaseCommand):
    help = 'Carga métodos de pago iniciales'

    def handle(self, *args, **kwargs):
        payment_methods = [
            {
                'name': 'Tarjeta de Crédito',
                'payment_type': 'credit_card',
                'description': 'Pago con tarjeta de crédito (Visa, Mastercard, American Express)',
                'is_active': True,
                'requires_approval': False,
                'processing_fee_percentage': 2.5,
                'processing_fee_fixed': 0
            },
            {
                'name': 'Tarjeta de Débito',
                'payment_type': 'debit_card',
                'description': 'Pago con tarjeta de débito',
                'is_active': True,
                'requires_approval': False,
                'processing_fee_percentage': 1.5,
                'processing_fee_fixed': 0
            },
            {
                'name': 'Transferencia Bancaria',
                'payment_type': 'bank_transfer',
                'description': 'Transferencia directa a nuestra cuenta bancaria',
                'is_active': True,
                'requires_approval': True,
                'processing_fee_percentage': 0,
                'processing_fee_fixed': 0
            },
            {
                'name': 'Pago Móvil QR',
                'payment_type': 'mobile_payment',
                'description': 'Pago a través de código QR con tu app bancaria',
                'is_active': True,
                'requires_approval': False,
                'processing_fee_percentage': 1.0,
                'processing_fee_fixed': 0
            },
            {
                'name': 'Efectivo (Tienda)',
                'payment_type': 'cash',
                'description': 'Pago en efectivo al momento del retiro en tienda',
                'is_active': True,
                'requires_approval': False,
                'processing_fee_percentage': 0,
                'processing_fee_fixed': 0
            },
        ]

        created_count = 0
        updated_count = 0

        for method_data in payment_methods:
            method, created = PaymentMethod.objects.get_or_create(
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
