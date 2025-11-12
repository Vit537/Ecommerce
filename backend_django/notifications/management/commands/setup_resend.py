"""
Management command para configurar Resend
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from notifications.models import NotificationSettings


class Command(BaseCommand):
    help = 'Configura las credenciales de Resend para envío de emails'

    def handle(self, *args, **options):
        # Obtener configuración desde variables de entorno
        resend_api_key = settings.RESEND_API_KEY
        from_email = settings.RESEND_FROM_EMAIL
        
        if not resend_api_key:
            self.stdout.write(
                self.style.ERROR('❌ ERROR: RESEND_API_KEY no está configurada en .env')
            )
            self.stdout.write('')
            self.stdout.write('Agrega estas líneas a tu archivo .env:')
            self.stdout.write('  RESEND_API_KEY=re_Bzg3g6B4_JYMa8eD5FhpMfmrRF7j2f35W')
            self.stdout.write('  RESEND_FROM_EMAIL=onboarding@resend.dev')
            return
        
        # Lista de contactos permitidos en Resend (desde la imagen)
        allowed_contacts = [
            "henrysalas2558@gmail.com",
            "sure.pencil@gmail.com",
            "goku02820@gmail.com"
        ]
        
        # Obtener o crear configuración
        settings, created = NotificationSettings.objects.get_or_create(
            id=1,
            defaults={
                'resend_api_key': resend_api_key,
                'from_email': from_email,
                'from_name': 'SPORTSWEAR',
                'admin_email': allowed_contacts[0],  # Usar el primer contacto como admin
                'enable_order_confirmation': True,
                'enable_payment_notifications': True,
                'enable_low_stock_alerts': True,
                'enable_daily_reports': True,
            }
        )
        
        if not created:
            # Actualizar configuración existente
            settings.resend_api_key = resend_api_key
            settings.from_email = from_email
            settings.from_name = 'SPORTSWEAR'
            if not settings.admin_email:
                settings.admin_email = allowed_contacts[0]
            settings.save()
            
            self.stdout.write(
                self.style.SUCCESS('✓ Configuración de Resend actualizada exitosamente')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('✓ Configuración de Resend creada exitosamente')
            )
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Configuración aplicada:'))
        self.stdout.write(f'  - API Key: {resend_api_key[:20]}...')
        self.stdout.write(f'  - From Email: {from_email}')
        self.stdout.write(f'  - From Name: {settings.from_name}')
        self.stdout.write(f'  - Admin Email: {settings.admin_email}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Contactos permitidos en Resend:'))
        for email in allowed_contacts:
            self.stdout.write(f'  - {email}')
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                '¡Listo! Ahora puedes enviar emails usando estos contactos.'
            )
        )
