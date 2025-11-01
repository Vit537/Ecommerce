#!/bin/bash
set -e

# Crear archivo de configuración con variables de entorno en tiempo de ejecución
cat > /usr/share/nginx/html/config.js <<EOF
window._env_ = {
  VITE_API_URL: "${VITE_API_URL:-https://ecommerce-backend-930184937279.us-central1.run.app}",
  VITE_APP_NAME: "${VITE_APP_NAME:-Boutique E-commerce}",
  VITE_APP_VERSION: "${VITE_APP_VERSION:-1.0.0}"
};
EOF

echo "✅ Environment configuration created"
echo "VITE_API_URL: ${VITE_API_URL:-https://ecommerce-backend-930184937279.us-central1.run.app}"

# Ejecutar el comando pasado como argumento
exec "$@"
