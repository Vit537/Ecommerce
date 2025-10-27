#!/bin/bash
set -e

echo "🚀 Iniciando Backend Django E-Commerce"
echo "========================================"

# PRIORIDAD: Iniciar el servidor INMEDIATAMENTE en background
echo "✨ Iniciando servidor Gunicorn..."
gunicorn core.wsgi:application \
    --bind "0.0.0.0:${PORT:-8080}" \
    --workers 2 \
    --timeout 300 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --daemon

# Dar tiempo al servidor para iniciar
sleep 3

# Ahora hacer tareas de BD en background (no bloquean)
(
  echo "📦 Configurando base de datos en segundo plano..."
  
  # Esperar BD con timeout corto
  for i in {1..10}; do
    if python manage.py check --database default 2>/dev/null; then
      echo "✅ BD disponible"
      
      # Migraciones
      python manage.py migrate --noinput 2>&1 || echo "⚠️  Migraciones fallaron"
      
      # Superusuario
      python manage.py shell <<'EOF' 2>&1 || true
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
        print('✅ Superusuario creado')
    else:
        print('✅ Superusuario existe')
except Exception as e:
    print(f'⚠️  {e}')
EOF
      
      # Datos de prueba
      sleep 2
      python manage.py shell <<'EOF' 2>&1 || true
from products.models import Product
try:
    if Product.objects.count() == 0:
        print('⚙️  Cargando datos...')
        import subprocess
        subprocess.run(['python', 'manage.py', 'load_test_data', '--skip-ml'], check=False)
    else:
        print('✅ Datos existen')
except Exception as e:
    print(f'⚠️  {e}')
EOF
      break
    fi
    echo "   Esperando BD... ($i/10)"
    sleep 2
  done
) &

# Mantener el proceso principal vivo (el servidor está en daemon)
echo "✅ Servidor iniciado en puerto ${PORT:-8080}"
echo "========================================"

# Traer el proceso de gunicorn al foreground para que Docker no termine
wait
