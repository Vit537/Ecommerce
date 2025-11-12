# Script para Redesplegar Frontend con el Fix
# Ejecutar con: .\redesplegar_frontend.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 Redesplegando Frontend a Cloud Run" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = Read-Host "Ingresa tu PROJECT_ID de Google Cloud"
$REGION = "us-central1"
$SERVICE_NAME = "ecommerce-frontend"
$BACKEND_URL = "https://ecommerce-backend-930184937279.us-central1.run.app"

Write-Host ""
Write-Host "📋 Configuración:" -ForegroundColor Yellow
Write-Host "Project ID: $PROJECT_ID"
Write-Host "Region: $REGION"
Write-Host "Service: $SERVICE_NAME"
Write-Host "Backend URL: $BACKEND_URL"
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path ".\frontend\index.html")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   (debe contener la carpeta 'frontend')" -ForegroundColor Yellow
    exit 1
}

# Verificar que index.html tiene el script de config.js
$indexContent = Get-Content ".\frontend\index.html" -Raw
if ($indexContent -notmatch "config\.js") {
    Write-Host "❌ Error: index.html no contiene el script de config.js" -ForegroundColor Red
    Write-Host "   Verifica que se haya aplicado el fix correctamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ index.html contiene el script de config.js" -ForegroundColor Green
Write-Host ""

# Confirmar
$confirm = Read-Host "¿Deseas continuar con el despliegue? (s/n)"
if ($confirm -ne "s") {
    Write-Host "Despliegue cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📦 Construyendo y Desplegando..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Opción 1: Deploy directo desde código fuente (más fácil)
Write-Host "🔨 Desplegando desde código fuente..." -ForegroundColor Yellow
Write-Host ""

try {
    gcloud run deploy $SERVICE_NAME `
        --source ./frontend `
        --region $REGION `
        --platform managed `
        --allow-unauthenticated `
        --set-env-vars "VITE_API_URL=$BACKEND_URL,VITE_APP_NAME=Boutique E-commerce,VITE_APP_VERSION=1.0.0" `
        --min-instances 0 `
        --max-instances 5 `
        --memory 256Mi `
        --cpu 1 `
        --timeout 60 `
        --port 8080 `
        --project $PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "✅ Despliegue Exitoso!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Green
        Write-Host ""
        
        $SERVICE_URL = "https://$SERVICE_NAME-930184937279.us-central1.run.app"
        Write-Host "🌐 URL del Frontend: $SERVICE_URL" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "1. Abre la URL en tu navegador"
        Write-Host "2. Abre DevTools (F12)"
        Write-Host "3. Busca en la consola:"
        Write-Host "   '[ApiService] Base URL configurada:'" -ForegroundColor Cyan
        Write-Host "4. Verifica que apunte a:" -ForegroundColor Cyan
        Write-Host "   $BACKEND_URL/api" -ForegroundColor Green
        Write-Host ""
        
        # Verificar que config.js se sirve correctamente
        Write-Host "🔍 Verificando config.js..." -ForegroundColor Yellow
        try {
            $configResponse = Invoke-WebRequest -Uri "$SERVICE_URL/config.js" -UseBasicParsing
            Write-Host "✅ config.js se sirve correctamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "Contenido:" -ForegroundColor Yellow
            Write-Host $configResponse.Content -ForegroundColor White
        } catch {
            Write-Host "⚠️  No se pudo verificar config.js" -ForegroundColor Yellow
            Write-Host "   Verifica manualmente en: $SERVICE_URL/config.js" -ForegroundColor Yellow
        }
        
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

# Pausar al final
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
