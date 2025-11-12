# Script de Diagnóstico para Producción - PowerShell
# Ejecutar con: .\diagnostico_produccion.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🔍 Diagnóstico de Producción" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$BackendURL = "https://ecommerce-backend-930184937279.us-central1.run.app"
$FrontendURL = "https://ecommerce-frontend-930184937279.us-central1.run.app"

Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "Backend: $BackendURL"
Write-Host "Frontend: $FrontendURL"
Write-Host ""

# Test 1: Health Check
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 1: Health Check del Backend" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "$BackendURL/health" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($health.StatusCode)" -ForegroundColor Green
    Write-Host $health.Content
} catch {
    Write-Host "❌ No se pudo conectar al health check" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Test 2: Login
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 2: Login (obtener token)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$loginBody = @{
    email = "admin@boutique.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BackendURL/api/auth/login/" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "Token obtenido: $($token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login falló" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor verifica:" -ForegroundColor Yellow
    Write-Host "1. El usuario admin@boutique.com existe en la BD"
    Write-Host "2. El password es correcto (admin123)"
    Write-Host "3. El backend está corriendo correctamente"
    exit 1
}
Write-Host ""

# Test 3: Products con Token
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 3: Listar Productos (con token)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $productsResponse = Invoke-RestMethod -Uri "$BackendURL/api/products/" -Method Get -Headers $headers
    Write-Host "✅ Status: 200 OK" -ForegroundColor Green
    Write-Host "Productos encontrados: $($productsResponse.count)" -ForegroundColor Green
    
    if ($productsResponse.results.Count -gt 0) {
        Write-Host ""
        Write-Host "Primeros productos:" -ForegroundColor Yellow
        $productsResponse.results | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.name) ($($_.price))" -ForegroundColor White
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Error $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 400) {
        Write-Host ""
        Write-Host "Error 400 - Petición malformada" -ForegroundColor Red
        Write-Host "Esto indica que Google Cloud está bloqueando la petición" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host "1. URL incorrecta o mal formada"
        Write-Host "2. Headers problemáticos"
        Write-Host "3. Token inválido o mal formateado"
        Write-Host "4. Configuración de Cloud Run incorrecta"
    }
    
    # Intentar leer el cuerpo de la respuesta
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    } catch {
        # No se pudo leer el cuerpo
    }
}
Write-Host ""

# Test 4: Products sin Token
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 4: Productos Sin Token (acceso público)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

try {
    $publicResponse = Invoke-RestMethod -Uri "$BackendURL/api/products/" -Method Get -ContentType "application/json"
    Write-Host "✅ Status: 200 OK (acceso público funciona)" -ForegroundColor Green
    Write-Host "Productos en BD: $($publicResponse.count)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "⚠️  Status: 401 - Requiere autenticación" -ForegroundColor Yellow
        Write-Host "   (El endpoint no debería requerir auth según IsAuthenticatedOrReadOnly)" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "❌ Status: 400 - Error incluso sin token" -ForegroundColor Red
        Write-Host "   Esto confirma que el problema es de Google Cloud, no del token" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Status: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 5: Frontend Health
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 5: Frontend Health Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
try {
    $frontendHealth = Invoke-WebRequest -Uri "$FrontendURL/health" -Method Get -UseBasicParsing
    Write-Host "✅ Status: $($frontendHealth.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend no responde" -ForegroundColor Red
}
Write-Host ""

# Test 6: Verificar CORS
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test 6: Verificar Headers CORS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
try {
    $corsResponse = Invoke-WebRequest -Uri "$BackendURL/api/products/" -Method Options -Headers @{
        "Origin" = $FrontendURL
        "Access-Control-Request-Method" = "GET"
    } -UseBasicParsing
    
    Write-Host "Status: $($corsResponse.StatusCode)" -ForegroundColor Green
    
    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Credentials"
    )
    
    foreach ($header in $corsHeaders) {
        if ($corsResponse.Headers[$header]) {
            Write-Host "✅ $header`: $($corsResponse.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "❌ $header`: No presente" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "⚠️  No se pudo verificar CORS" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}
Write-Host ""

# Resumen
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Resumen de Diagnóstico" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ = Funciona correctamente" -ForegroundColor Green
Write-Host "⚠️  = Funciona pero con advertencias" -ForegroundColor Yellow
Write-Host "❌ = Hay un problema" -ForegroundColor Red
Write-Host ""

# Recomendaciones
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "💡 Recomendaciones" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si Products con token funciona aquí pero no en Postman:" -ForegroundColor Yellow
Write-Host "1. Copia este token en Postman:" -ForegroundColor White
Write-Host "   $token" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. En Postman, configura el header:" -ForegroundColor White
Write-Host "   Authorization: Bearer $token" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verifica que la URL sea exactamente:" -ForegroundColor White
Write-Host "   $BackendURL/api/products/" -ForegroundColor Cyan
Write-Host ""

Write-Host "Si Products con token NO funciona aquí:" -ForegroundColor Yellow
Write-Host "1. Revisa los logs de Cloud Run" -ForegroundColor White
Write-Host "2. Verifica las variables de entorno en Cloud Run" -ForegroundColor White
Write-Host "3. Verifica que la BD tenga datos" -ForegroundColor White
Write-Host "4. Verifica la conexión entre Cloud Run y Cloud SQL" -ForegroundColor White
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🔗 Enlaces Útiles" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Cloud Run Logs: https://console.cloud.google.com/run" -ForegroundColor White
Write-Host "Cloud SQL: https://console.cloud.google.com/sql" -ForegroundColor White
Write-Host "Backend URL: $BackendURL" -ForegroundColor White
Write-Host "Frontend URL: $FrontendURL" -ForegroundColor White
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# Pausar al final para ver resultados
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
