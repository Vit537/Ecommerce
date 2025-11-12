# Script de Diagnóstico para Producción
# Ejecutar con: bash diagnostico_produccion.sh

echo "======================================"
echo "🔍 Diagnóstico de Producción"
echo "======================================"
echo ""

# Variables
BACKEND_URL="https://ecommerce-backend-930184937279.us-central1.run.app"
FRONTEND_URL="https://ecommerce-frontend-930184937279.us-central1.run.app"

echo "📋 Configuración:"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test 1: Health Check
echo "======================================"
echo "Test 1: Health Check del Backend"
echo "======================================"
curl -s -w "\nStatus: %{http_code}\n" "$BACKEND_URL/health" || echo "❌ No se pudo conectar al health check"
echo ""

# Test 2: Login
echo "======================================"
echo "Test 2: Login (obtener token)"
echo "======================================"
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boutique.com","password":"admin123"}')

echo "$LOGIN_RESPONSE" | python -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener el token. Login falló."
    echo "Por favor verifica:"
    echo "1. El usuario admin@boutique.com existe en la BD"
    echo "2. El password es correcto (admin123)"
    echo "3. El backend está corriendo correctamente"
    exit 1
else
    echo "✅ Token obtenido exitosamente"
fi
echo ""

# Test 3: Products List
echo "======================================"
echo "Test 3: Listar Productos (con token)"
echo "======================================"
PRODUCTS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BACKEND_URL/api/products/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$PRODUCTS_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
PRODUCTS_BODY=$(echo "$PRODUCTS_RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $HTTP_STATUS"
echo ""
echo "Response:"
echo "$PRODUCTS_BODY" | python -m json.tool 2>/dev/null || echo "$PRODUCTS_BODY"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Products endpoint funciona correctamente"
elif [ "$HTTP_STATUS" == "400" ]; then
    echo "❌ Error 400 - Petición malformada"
    echo "Esto indica que Google Cloud está bloqueando la petición"
    echo ""
    echo "Posibles causas:"
    echo "1. URL incorrecta o mal formada"
    echo "2. Headers problemáticos"
    echo "3. Token inválido o mal formateado"
    echo "4. Configuración de Cloud Run incorrecta"
else
    echo "⚠️  Status code inesperado: $HTTP_STATUS"
fi
echo ""

# Test 4: Products Sin Token (debe ser público)
echo "======================================"
echo "Test 4: Productos Sin Token (acceso público)"
echo "======================================"
PUBLIC_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BACKEND_URL/api/products/" \
  -H "Content-Type: application/json")

PUBLIC_STATUS=$(echo "$PUBLIC_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
PUBLIC_BODY=$(echo "$PUBLIC_RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $PUBLIC_STATUS"
echo ""

if [ "$PUBLIC_STATUS" == "200" ]; then
    echo "✅ El endpoint es público (correcto según IsAuthenticatedOrReadOnly)"
    COUNT=$(echo "$PUBLIC_BODY" | python -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)
    echo "Productos en BD: $COUNT"
elif [ "$PUBLIC_STATUS" == "401" ]; then
    echo "⚠️  El endpoint requiere autenticación (no debería según la configuración)"
elif [ "$PUBLIC_STATUS" == "400" ]; then
    echo "❌ Error 400 - Incluso sin token falla"
    echo "Esto confirma que el problema es de Google Cloud, no del token"
else
    echo "⚠️  Status code inesperado: $PUBLIC_STATUS"
fi
echo ""

# Test 5: Verbose Request
echo "======================================"
echo "Test 5: Request Verbose (detalles completos)"
echo "======================================"
echo "Haciendo petición con detalles completos..."
curl -v -X GET "$BACKEND_URL/api/products/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" 2>&1 | grep -E "(> |< |HTTP|Server:|Content-Type:|Location:)"
echo ""

# Test 6: Frontend Health
echo "======================================"
echo "Test 6: Frontend Health Check"
echo "======================================"
curl -s -w "\nStatus: %{http_code}\n" "$FRONTEND_URL/health" || echo "❌ Frontend no responde"
echo ""

# Resumen
echo "======================================"
echo "📊 Resumen de Diagnóstico"
echo "======================================"
echo ""
echo "✅ = Funciona correctamente"
echo "⚠️  = Funciona pero con advertencias"
echo "❌ = Hay un problema"
echo ""
echo "Tests realizados:"
echo "1. Health Check Backend: $(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/health")"
echo "2. Login: $([ -z "$TOKEN" ] && echo "❌ Falló" || echo "✅ OK")"
echo "3. Products con token: $HTTP_STATUS"
echo "4. Products sin token: $PUBLIC_STATUS"
echo ""

# Recomendaciones
echo "======================================"
echo "💡 Recomendaciones"
echo "======================================"
echo ""

if [ "$HTTP_STATUS" == "400" ]; then
    echo "🔴 PROBLEMA CRÍTICO DETECTADO:"
    echo "   El error 400 viene de Google Cloud, no de Django"
    echo ""
    echo "   Acciones recomendadas:"
    echo "   1. Verifica la URL exacta en Cloud Run Console"
    echo "   2. Revisa los logs de Cloud Run durante la petición"
    echo "   3. Verifica las variables de entorno en Cloud Run"
    echo "   4. Intenta desde el navegador del frontend en producción"
    echo ""
elif [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ TODO FUNCIONA CORRECTAMENTE"
    echo ""
    echo "   El problema puede ser:"
    echo "   1. Configuración incorrecta en Postman"
    echo "   2. Token expirado en Postman"
    echo "   3. URL diferente en Postman"
    echo ""
    echo "   Solución: Usa el token generado por este script en Postman"
    echo "   Token: $TOKEN"
    echo ""
else
    echo "⚠️  Hay un problema con el endpoint"
    echo "   Revisa los logs de Cloud Run para más detalles"
fi

echo "======================================"
echo "🔗 Enlaces Útiles"
echo "======================================"
echo "Cloud Run Logs: https://console.cloud.google.com/run"
echo "Cloud SQL: https://console.cloud.google.com/sql"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "======================================"
