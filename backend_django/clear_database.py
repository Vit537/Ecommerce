"""
Script para limpiar la base de datos completamente
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

print("Limpiando base de datos...")

# Eliminar todos los usuarios
User.objects.all().delete()
print(f"✓ Todos los usuarios eliminados")

# Limpiar tablas adicionales si existen
with connection.cursor() as cursor:
    try:
        cursor.execute("DELETE FROM auth_user WHERE username IS NULL OR username = ''")
        print("✓ Registros inválidos eliminados de auth_user")
    except Exception as e:
        print(f"Info: {e}")

print("✅ Base de datos limpiada correctamente")
