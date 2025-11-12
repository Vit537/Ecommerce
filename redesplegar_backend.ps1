# Script para Redesplegar Backend con Fixes
# Ejecutar con: .\redesplegar_backend.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 Redesplegando Backend a Cloud Run" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Correcciones aplicadas:" -ForegroundColor Yellow
Write-Host "  ✅ django-filter 23.2 → 24.3 (compatible con Django 5.x)" -ForegroundColor Green
Write-Host "  ✅ groq 0.9.0 → 0.11.0 (sin argumento 'proxies' obsoleto)" -ForegroundColor Green
Write-Host ""

$PROJECT_ID = Read-Host "Ingresa tu PROJECT_ID de Google Cloud"
$REGION = "us-central1"
$SERVICE_NAME = "ecommerce-backend"

Write-Host ""
Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Region: $REGION"
Write-Host "Service: $SERVICE_NAME"
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path ".\backend_django\requirements.txt")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   (debe contener la carpeta 'backend_django')" -ForegroundColor Yellow
    exit 1
}

# Verificar que requirements.txt tiene las versiones correctas
$reqContent = Get-Content ".\backend_django\requirements.txt" -Raw
if ($reqContent -notmatch "django-filter==24\.3") {
    Write-Host "⚠️  Advertencia: django-filter no está en versión 24.3" -ForegroundColor Yellow
}
if ($reqContent -notmatch "groq==0\.11\.0") {
    Write-Host "⚠️  Advertencia: groq no está en versión 0.11.0" -ForegroundColor Yellow
}

Write-Host "✅ requirements.txt verificado" -ForegroundColor Green
Write-Host ""

# Confirmar
$confirm = Read-Host "¿Deseas continuar con el despliegue? (s/n)"
if ($confirm -ne "s") {
    Write-Host "Despliegue cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📦 Desplegando Backend..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Necesitas configurar tus variables de entorno aquí
Write-Host "⚠️  IMPORTANTE: Asegúrate de tener configuradas estas variables en Cloud Run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Variables requeridas:" -ForegroundColor Cyan
Write-Host "  - DEBUG=False"
Write-Host "  - DJANGO_SECRET_KEY=<tu_secret_key>"
Write-Host "  - ALLOWED_HOSTS=*,ecommerce-backend-930184937279.us-central1.run.app"
Write-Host "  - DB_HOST=<IP_CLOUD_SQL>"
Write-Host "  - DB_NAME=mistore_db"
Write-Host "  - DB_USER=postgres"
Write-Host "  - DB_PASSWORD=<password>"
Write-Host "  - GROQ_API_KEY=<tu_groq_key>"
Write-Host ""

$continue = Read-Host "¿Ya tienes configuradas estas variables en Cloud Run? (s/n)"
if ($continue -ne "s") {
    Write-Host ""
    Write-Host "Configura las variables primero en Cloud Console:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/variables" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "🔨 Desplegando..." -ForegroundColor Yellow
Write-Host ""

try {
    gcloud run deploy $SERVICE_NAME `
        --source ./backend_django `
        --region $REGION `
        --platform managed `
        --allow-unauthenticated `
        --min-instances 0 `
        --max-instances 10 `
        --memory 1Gi `
        --cpu 1 `
        --timeout 300 `
        --port 8080 `
        --project $PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "✅ Despliegue Exitoso!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Green
        Write-Host ""
        
        $SERVICE_URL = "https://$SERVICE_NAME-930184937279.us-central1.run.app"
        Write-Host "🌐 URL del Backend: $SERVICE_URL" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "1. Espera 1-2 minutos a que el servicio se inicie completamente"
        Write-Host "2. Prueba el endpoint de productos:"
        Write-Host "   curl $SERVICE_URL/api/products/" -ForegroundColor Cyan
        Write-Host "3. Revisa los logs para verificar que no haya errores:"
        Write-Host "   gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50" -ForegroundColor Cyan
        Write-Host ""
        
        # Esperar un poco y verificar logs
        Write-Host "⏳ Esperando 30 segundos para que el servicio inicie..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "🔍 Verificando logs recientes..." -ForegroundColor Yellow
        gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=20 --format="table(timestamp,severity,textPayload)"
        
    } else {
        Write-Host ""
        Write-Host "❌ Error en el despliegue" -ForegroundColor Red
        Write-Host "Revisa los mensajes de error arriba" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error ejecutando gcloud" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Asegúrate de tener instalado Google Cloud SDK:" -ForegroundColor Yellow
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Proceso Completado" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 Para probar que funcione:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Test 1: Health check" -ForegroundColor Cyan
Write-Host "curl $SERVICE_URL/health"
Write-Host ""
Write-Host "# Test 2: Listar productos (debe funcionar ahora)" -ForegroundColor Cyan
Write-Host "curl $SERVICE_URL/api/products/"
Write-Host ""
Write-Host "# Test 3: Ver logs en tiempo real" -ForegroundColor Cyan
Write-Host "gcloud run services logs tail $SERVICE_NAME --region=$REGION"
Write-Host ""

# Pausar al final
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
