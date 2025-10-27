"""
Script para solucionar el problema de la tabla auth_user
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

print("Solucionando problema de auth_user...")

with connection.cursor() as cursor:
    # Verificar si auth_user existe
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'auth_user'
        );
    """)
    exists = cursor.fetchone()[0]
    
    if exists:
        print("Tabla auth_user encontrada. Eliminando registros inválidos...")
        try:
            # Eliminar registros con username vacío
            cursor.execute("DELETE FROM auth_user WHERE username = '' OR username IS NULL")
            print(f"✓ Registros eliminados")
            
            # Eliminar la tabla si está vacía
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            count = cursor.fetchone()[0]
            if count == 0:
                print("La tabla auth_user está vacía. Considere eliminarla si no es necesaria.")
            else:
                print(f"La tabla auth_user tiene {count} registros")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("La tabla auth_user no existe (correcto)")

print("✅ Verificación completada")
