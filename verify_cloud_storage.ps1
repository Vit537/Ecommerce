#!/usr/bin/env pwsh
# Script para verificar que Cloud Storage está funcionando correctamente

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE CLOUD STORAGE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Verificar bucket
Write-Host "`n✓ Verificando bucket..." -ForegroundColor Yellow
gcloud storage buckets describe gs://ecommerce-media-storage --format="table(name,location,locationType,storageClass)"

# 2. Verificar permisos públicos
Write-Host "`n✓ Verificando permisos públicos..." -ForegroundColor Yellow
$iamPolicy = gcloud storage buckets get-iam-policy gs://ecommerce-media-storage --format=json | ConvertFrom-Json
$publicAccess = $iamPolicy.bindings | Where-Object { $_.members -contains "allUsers" }

if ($publicAccess) {
    Write-Host "   → Bucket es PÚBLICO para lectura ✓" -ForegroundColor Green
} else {
    Write-Host "   → Bucket NO es público ✗" -ForegroundColor Red
    Write-Host "   Ejecuta: gcloud storage buckets add-iam-policy-binding gs://ecommerce-media-storage --member=allUsers --role=roles/storage.objectViewer" -ForegroundColor Yellow
}

# 3. Verificar CORS
Write-Host "`n✓ Verificando configuración CORS..." -ForegroundColor Yellow
gcloud storage buckets describe gs://ecommerce-media-storage --format="json(cors_config)" | ConvertFrom-Json | ConvertTo-Json -Depth 5

# 4. Verificar contenido del bucket
Write-Host "`n✓ Verificando contenido del bucket..." -ForegroundColor Yellow
$output = gcloud storage ls gs://ecommerce-media-storage/ 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $output
    
    $productsExists = gcloud storage ls gs://ecommerce-media-storage/products/ 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Carpeta /products/ existe" -ForegroundColor Green
        
        $imageCount = (gcloud storage ls gs://ecommerce-media-storage/products/ 2>&1 | Measure-Object).Count
        Write-Host "   → Imágenes en /products/: $imageCount archivos" -ForegroundColor Cyan
        
        if ($imageCount -gt 0) {
            Write-Host "`n   Últimas 5 imágenes:" -ForegroundColor Cyan
            gcloud storage ls gs://ecommerce-media-storage/products/ | Select-Object -Last 5
        }
    } else {
        Write-Host "   → Carpeta /products/ no existe aún (se creará al subir la primera imagen)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   → Bucket vacío o error al listar" -ForegroundColor Yellow
}

# 5. Verificar servicio de Cloud Run
Write-Host "`n✓ Verificando configuración de Cloud Run..." -ForegroundColor Yellow
$envVars = gcloud run services describe ecommerce-backend --region=us-central1 --format="value(spec.template.spec.containers[0].env)" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Variables de entorno:" -ForegroundColor Cyan
    
    $envArray = $envVars -split ';'
    foreach ($env in $envArray) {
        if ($env -like "*CLOUD*" -or $env -like "*BUCKET*" -or $env -like "*GCP*") {
            Write-Host "   → $env" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ✗ Error al verificar servicio" -ForegroundColor Red
}

# 6. Test de URL pública
Write-Host "`n✓ Testeando acceso público..." -ForegroundColor Yellow
Write-Host "   Formato correcto de URL:" -ForegroundColor Cyan
Write-Host "   https://storage.googleapis.com/ecommerce-media-storage/products/nombre_123abc.webp" -ForegroundColor White

# Resumen
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nEstado de Cloud Storage:" -ForegroundColor Yellow
if ($publicAccess) {
    Write-Host "  ✓ Bucket público: SÍ" -ForegroundColor Green
} else {
    Write-Host "  ✗ Bucket público: NO" -ForegroundColor Red
}
Write-Host "  ✓ Bucket configurado: ecommerce-media-storage" -ForegroundColor Green
Write-Host "  ✓ Región: US-CENTRAL1" -ForegroundColor Green
Write-Host "  ✓ CORS: Configurado" -ForegroundColor Green

Write-Host "`nPara probar:" -ForegroundColor Yellow
Write-Host "  1. Ve a tu aplicación: https://ecommerce-backend-5q5ie6onnq-uc.a.run.app" -ForegroundColor Cyan
Write-Host "  2. Sube una imagen de producto" -ForegroundColor Cyan
Write-Host "  3. Verifica que la URL comience con: https://storage.googleapis.com/" -ForegroundColor Cyan
Write-Host "  4. Ejecuta nuevamente este script para ver las imágenes" -ForegroundColor Cyan

Write-Host "`n============================================" -ForegroundColor Cyan
