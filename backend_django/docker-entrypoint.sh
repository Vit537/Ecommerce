#!/bin/bash
set -e

echo "========================================="
echo "🚀 Iniciando Backend Django E-Commerce"
echo "========================================="

# Esperar BD con timeout
echo "⏳ Esperando base de datos..."
for i in {1..30}; do
  if python manage.py check --database default 2>/dev/null; then
    echo "✅ BD disponible!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠️  BD no disponible, continuando de todas formas..."
    break
  fi
  sleep 2
done

# Ejecutar migraciones SINCRÓNICAMENTE (NO en background)
echo "📦 Ejecutando migraciones..."
python manage.py migrate --noinput || echo "⚠️  Migraciones fallaron"

# Crear superusuario
echo "👤 Creando superusuario..."
python manage.py shell <<'EOF' || echo "⚠️  Superusuario no creado"
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(email='superadmin@boutique.com').exists():
        User.objects.create_superuser(
            email='superadmin@boutique.com',
            first_name='Super',
            last_name='Admin',
            password='admin123',
            role='admin',
            user_type='admin',
            is_email_verified=True
        )
        print('✅ Superusuario creado: superadmin@boutique.com')
    else:
        print('✅ Superusuario ya existe')
except Exception as e:
    print(f'⚠️  Error: {e}')
EOF

# ============================================================================
# 🚫 CARGA AUTOMÁTICA DE DATOS DESACTIVADA
# ============================================================================
# La carga de datos se realizará manualmente después del despliegue
# usando Cloud Run Jobs o comandos manuales en la Cloud Console
# 
# Para cargar datos manualmente en producción:
# 1. Usar Cloud Run Jobs (recomendado)
# 2. O ejecutar desde Cloud Console Shell:
#    - python ejecutarDatos/1_generate_test_data.py --auto
#    - python ejecutarDatos/2_generate_ml_data_v2.py
#    - python ejecutarDatos/3_fix_order_dates.py
# ============================================================================

# ❌ CÓDIGO ANTERIOR (DESACTIVADO):
# (
#   sleep 5
#   python manage.py shell <<'EOF' 2>&1 || true
# from products.models import Product
# try:
#     if Product.objects.count() == 0:
#         print('⚙️  Cargando datos...')
#         import subprocess
#         subprocess.run(['python', 'manage.py', 'load_test_data', '--skip-ml'], check=False)
#     else:
#         print('✅ Datos existen')
# except Exception as e:
#     print(f'⚠️  Error: {e}')
# EOF
# ) &

# Iniciar servidor
echo ""
echo "========================================="
echo "✅ Configuración completa!"
echo "🌐 Iniciando servidor Gunicorn en puerto ${PORT:-8080}..."
echo "========================================="
echo ""

# Ejecutar Gunicorn con el puerto dinámico de Cloud Run
exec gunicorn core.wsgi:application \
    --bind "0.0.0.0:${PORT:-8080}" \
    --workers 2 \
    --timeout 300 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
