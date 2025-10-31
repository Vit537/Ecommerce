# Script para probar localmente los nuevos datos (50 clientes)
# ============================================================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🧪 PROBANDO DATOS REALISTAS LOCALMENTE" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# 1. Cambiar a la carpeta correcta (backend_django)
$currentPath = Get-Location
if ($currentPath.Path -match "ejecutarDatos$") {
    Write-Host "📂 Cambiando a carpeta backend_django..." -ForegroundColor Yellow
    Set-Location ..
}

# Verificar que estamos en backend_django
if (-not (Test-Path "manage.py")) {
    Write-Host "❌ Error: No se encuentra manage.py" -ForegroundColor Red
    Write-Host "   Este script debe ejecutarse desde backend_django/ o backend_django/ejecutarDatos/" -ForegroundColor Yellow
    exit 1
}

# 2. Limpiar y cargar datos base
Write-Host ""
Write-Host "📦 Paso 1/4: Cargando datos base (50 clientes)..." -ForegroundColor Yellow
Write-Host "   Esto tomará aproximadamente 2-3 minutos..." -ForegroundColor Gray
python ejecutarDatos/1_generate_test_data.py --auto
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al cargar datos base" -ForegroundColor Red
    exit 1
}

# 3. Generar datos ML
Write-Host ""
Write-Host "🤖 Paso 2/4: Generando datos ML (~600 órdenes)..." -ForegroundColor Yellow
Write-Host "   Esto tomará aproximadamente 5-10 minutos..." -ForegroundColor Gray
Write-Host "   Generando órdenes distribuidas en 6 meses..." -ForegroundColor Gray
python ejecutarDatos/2_generate_ml_data_v2.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al generar datos ML" -ForegroundColor Red
    exit 1
}

# 4. Redistribuir fechas
Write-Host ""
Write-Host "📅 Paso 3/4: Redistribuyendo fechas..." -ForegroundColor Yellow
python ejecutarDatos/3_fix_order_dates.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al redistribuir fechas" -ForegroundColor Red
    exit 1
}

# 5. Verificar resultados
Write-Host ""
Write-Host "✅ Paso 4/4: Verificando datos..." -ForegroundColor Yellow
python ejecutarDatos/4_check_data.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencia: No se pudo verificar datos" -ForegroundColor Yellow
}

# Calcular tiempo total
$endTime = Get-Date
$duration = $endTime - $startTime
$minutes = [math]::Floor($duration.TotalMinutes)
$seconds = $duration.Seconds

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "✅ DATOS CARGADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen Esperado:" -ForegroundColor Cyan
Write-Host "   • 50 clientes (10 VIP + 15 frecuentes + 15 ocasionales + 10 nuevos)" -ForegroundColor White
Write-Host "   • ~600 órdenes distribuidas en 6 meses" -ForegroundColor White
Write-Host "   • ~12 órdenes por cliente (2/mes en promedio)" -ForegroundColor White
Write-Host "   • ~595 facturas (99%)" -ForegroundColor White
Write-Host "   • ~598 pagos (99%)" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Tiempo total: $minutes minutos, $seconds segundos" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Próximo paso:" -ForegroundColor Yellow
Write-Host "   1. Revisa los datos en tu BD local" -ForegroundColor White
Write-Host "   2. Si todo está bien, haz:" -ForegroundColor White
Write-Host "      git add ." -ForegroundColor Cyan
Write-Host "      git commit -m 'Fix: 50 clientes realistas'" -ForegroundColor Cyan
Write-Host "      git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. Luego carga datos en producción siguiendo:" -ForegroundColor White
Write-Host "      GUIA_CARGA_DATOS_GUI.md" -ForegroundColor Cyan
Write-Host ""
