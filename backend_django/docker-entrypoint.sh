#!/bin/bash
set -e

echo "========================================="
echo "🚀 Iniciando Backend Django E-Commerce"
echo "========================================="

# TODO lo pesado va en background - servidor inicia YA
(
  # Esperar BD
  echo "📦 Configuración de BD en segundo plano..."
  for i in {1..15}; do
    if python manage.py check --database default 2>/dev/null; then
      echo "✅ BD conectada"
      python manage.py migrate --noinput 2>&1 || echo "⚠️  Migraciones fallaron"
      
      # Superusuario
      python manage.py shell <<'EOF' 2>&1 || true
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(email='superadmin@boutique.com').exists():
        User.objects.create_superuser(email='superadmin@boutique.com', first_name='Super', last_name='Admin', password='admin123', role='admin', user_type='admin', is_email_verified=True)
        print('✅ Superusuario creado')
except: pass
EOF
      
      # Datos
      sleep 2
      python manage.py shell <<'EOF' 2>&1 || true
from products.models import Product
try:
    if Product.objects.count() == 0:
        import subprocess
        subprocess.run(['python', 'manage.py', 'load_test_data', '--skip-ml'], check=False)
except: pass
EOF
      break
    fi
    sleep 2
  done
) &

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
