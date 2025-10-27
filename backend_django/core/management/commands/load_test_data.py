"""
Django management command to load test data for e-commerce
"""
from django.core.management.base import BaseCommand
from django.db import transaction
import subprocess
import sys


class Command(BaseCommand):
    help = 'Load test data for the e-commerce application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-ml',
            action='store_true',
            help='Skip ML data generation',
        )
        parser.add_argument(
            '--fix-dates',
            action='store_true',
            help='Fix order dates distribution',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('🏪 Cargando datos de prueba...'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        try:
            # 1. Generar datos base
            self.stdout.write(self.style.WARNING('\n📦 Generando datos base...'))
            result = subprocess.run(
                [sys.executable, 'generate_test_data.py', '--auto'],
                capture_output=True,
                text=True,
                cwd='/app'  # Ruta en el contenedor
            )
            
            if result.returncode == 0:
                self.stdout.write(self.style.SUCCESS('✅ Datos base generados'))
                # Mostrar últimas líneas del output
                output_lines = result.stdout.split('\n')
                for line in output_lines[-15:]:
                    if line.strip():
                        self.stdout.write(f'   {line}')
            else:
                self.stdout.write(self.style.ERROR(f'❌ Error generando datos base: {result.stderr}'))
                return
            
            # 2. Generar datos para ML
            if not options['skip_ml']:
                self.stdout.write(self.style.WARNING('\n🤖 Generando datos para Machine Learning...'))
                result = subprocess.run(
                    [sys.executable, 'generate_ml_data_v2.py'],
                    capture_output=True,
                    text=True,
                    cwd='/app'
                )
                
                if result.returncode == 0:
                    self.stdout.write(self.style.SUCCESS('✅ Datos ML generados'))
                    output_lines = result.stdout.split('\n')
                    for line in output_lines[-10:]:
                        if line.strip():
                            self.stdout.write(f'   {line}')
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  Advertencia en datos ML: {result.stderr[:200]}'))
            
            # 3. Arreglar distribución de fechas
            if options['fix_dates']:
                self.stdout.write(self.style.WARNING('\n📅 Redistribuyendo fechas de órdenes...'))
                result = subprocess.run(
                    [sys.executable, 'fix_order_dates.py'],
                    capture_output=True,
                    text=True,
                    cwd='/app'
                )
                
                if result.returncode == 0:
                    self.stdout.write(self.style.SUCCESS('✅ Fechas redistribuidas'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  Advertencia: {result.stderr[:200]}'))
            
            self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))
            self.stdout.write(self.style.SUCCESS('✅ DATOS CARGADOS EXITOSAMENTE'))
            self.stdout.write(self.style.SUCCESS('=' * 80))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            raise
