#!/bin/bash
set -e

echo "========================================="
echo "🚀 Iniciando Backend Django E-Commerce"
echo "========================================="

# Esperar a que PostgreSQL esté disponible (con timeout)
echo "⏳ Esperando a que la base de datos esté lista..."
MAX_TRIES=30
COUNT=0
until python manage.py check --database default 2>/dev/null; do
  COUNT=$((COUNT+1))
  if [ $COUNT -gt $MAX_TRIES ]; then
    echo "❌ Error: Base de datos no disponible después de $MAX_TRIES intentos"
    echo "⚠️  Continuando sin verificación de BD..."
    break
  fi
  echo "   Intento $COUNT/$MAX_TRIES - Base de datos no disponible aún..."
  sleep 2
done

if [ $COUNT -le $MAX_TRIES ]; then
  echo "✅ Base de datos disponible!"
  
  # Ejecutar migraciones
  echo "📦 Ejecutando migraciones de base de datos..."
  python manage.py migrate --noinput || echo "⚠️  Advertencia: Migraciones fallaron"
  
  # Crear superusuario si no existe (en background para no bloquear)
  echo "👤 Configurando usuarios en segundo plano..."
  (
    python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

try:
    if not User.objects.filter(email='superadmin@boutique.com').exists():
        print('Creando superusuario...')
        User.objects.create_superuser(
            email='superadmin@boutique.com',
            first_name='Super',
            last_name='Admin',
            password='admin123',
            role='admin',
            user_type='admin',
            is_email_verified=True
        )
        print('✅ Superusuario creado: superadmin@boutique.com / admin123')
    else:
        print('✅ Superusuario ya existe')
except Exception as e:
    print(f'⚠️  Error creando superusuario: {e}')
EOF
  ) &
  
  # Cargar datos de prueba en background (no bloquear inicio)
  echo "📊 Datos de prueba se cargarán en segundo plano..."
  (
    sleep 5
    python manage.py shell <<'EOF'
from products.models import Product

try:
    product_count = Product.objects.count()
    print(f'Productos existentes: {product_count}')
    
    if product_count == 0:
        print('⚙️  Cargando datos de prueba...')
        import subprocess
        subprocess.run(['python', 'manage.py', 'load_test_data', '--skip-ml'], check=False)
    else:
        print('✅ Datos ya existen')
except Exception as e:
    print(f'⚠️  Error en datos de prueba: {e}')
EOF
  ) &
fi

# Iniciar servidor
echo ""
echo "========================================="
echo "✅ Configuración completa!"
echo "🌐 Iniciando servidor en puerto 8000..."
echo "========================================="
echo ""

exec "$@"
