#!/bin/bash
set -e

echo "========================================="
echo "🚀 Iniciando Backend Django E-Commerce"
echo "========================================="

# Esperar a que PostgreSQL esté disponible
echo "⏳ Esperando a que la base de datos esté lista..."
until python manage.py check --database default 2>/dev/null; do
  echo "   Base de datos no disponible aún, esperando..."
  sleep 2
done

echo "✅ Base de datos disponible!"

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de base de datos..."
python manage.py migrate --noinput

# Crear superusuario si no existe
echo "👤 Verificando/creando superusuario..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

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
EOF

# Cargar datos de prueba si la base de datos está vacía
echo "📊 Verificando datos de prueba..."
python manage.py shell <<EOF
from products.models import Product
from authentication.models import User

product_count = Product.objects.count()
customer_count = User.objects.filter(role='customer').count()

print(f'Productos existentes: {product_count}')
print(f'Clientes existentes: {customer_count}')

if product_count == 0:
    print('⚙️  Base de datos vacía, cargando datos de prueba...')
    import subprocess
    subprocess.run(['python', 'manage.py', 'load_test_data'], check=False)
else:
    print('✅ Datos ya existen, omitiendo carga de datos de prueba')
EOF

# Iniciar servidor
echo ""
echo "========================================="
echo "✅ Configuración completa!"
echo "🌐 Iniciando servidor en puerto 8000..."
echo "========================================="
echo ""

exec "$@"
