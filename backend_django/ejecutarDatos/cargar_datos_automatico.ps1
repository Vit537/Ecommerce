# Script de PowerShell para cargar datos en 3 pasos automáticamente
# Ejecuta este script después de hacer migrate

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🚀 CARGA AUTOMÁTICA DE DATOS - E-COMMERCE" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "generate_test_data.py")) {
    Write-Host "❌ ERROR: Este script debe ejecutarse desde la carpeta backend_django" -ForegroundColor Red
    Write-Host "   Ejecuta: cd backend_django" -ForegroundColor Yellow
    exit 1
}

Write-Host "⚠️  ADVERTENCIA: Este proceso tomará 15-30 minutos" -ForegroundColor Yellow
Write-Host "⚠️  Asegúrate de que la base de datos esté vacía y migrada" -ForegroundColor Yellow
Write-Host ""

$respuesta = Read-Host "¿Deseas continuar? (s/n)"
if ($respuesta -ne "s" -and $respuesta -ne "S") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "📦 PASO 1/3: Generando datos base..." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "⏱️  Tiempo estimado: 5-10 minutos" -ForegroundColor Yellow
Write-Host ""

python generate_test_data.py --auto

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR en Paso 1. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Paso 1 completado!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================================================================" -ForegroundColor Green
Write-Host "🤖 PASO 2/3: Generando datos ML + Facturas + Pagos..." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "⏱️  Tiempo estimado: 10-15 minutos" -ForegroundColor Yellow
Write-Host ""

python generate_ml_data_v2.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR en Paso 2. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Paso 2 completado!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "================================================================================" -ForegroundColor Green
Write-Host "📅 PASO 3/3: Redistribuyendo fechas..." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "⏱️  Tiempo estimado: 1-2 minutos" -ForegroundColor Yellow
Write-Host ""

python fix_order_dates.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR en Paso 3. Revisa los mensajes anteriores." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Paso 3 completado!" -ForegroundColor Green
Write-Host ""

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🎉 ¡CARGA DE DATOS COMPLETADA EXITOSAMENTE!" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Ejecutando verificación final..." -ForegroundColor Yellow
Write-Host ""

python check_data.py

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "✅ SISTEMA LISTO" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 CREDENCIALES:" -ForegroundColor Cyan
Write-Host "   Admin:   superadmin@boutique.com / admin123" -ForegroundColor White
Write-Host "   Gerente: gerente@boutique.com / gerente123" -ForegroundColor White
Write-Host "   Cajero:  cajero@boutique.com / cajero123" -ForegroundColor White
Write-Host "   Cliente: ana.martinez@email.com / cliente123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Iniciar servidor:    python manage.py runserver" -ForegroundColor White
Write-Host "   2. Entrenar modelos ML: python test_ml_complete.py" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Admin: http://localhost:8000/admin/" -ForegroundColor Yellow
Write-Host ""
