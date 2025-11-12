#!/usr/bin/env pwsh
# Script para configurar Cloud Storage en el servicio de Cloud Run

param(
    [string]$ServiceName = "",
    [string]$Region = "us-central1",
    [string]$ProjectId = "big-axiom-474503-m5"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN DE CLOUD STORAGE EN CLOUD RUN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Verificar proyecto
Write-Host "`n1. Verificando proyecto..." -ForegroundColor Yellow
$currentProject = gcloud config get-value project
Write-Host "   Proyecto actual: $currentProject" -ForegroundColor Green

if ($currentProject -ne $ProjectId) {
    Write-Host "   Cambiando a proyecto $ProjectId..." -ForegroundColor Yellow
    gcloud config set project $ProjectId
}

# 2. Listar servicios de Cloud Run
if ([string]::IsNullOrEmpty($ServiceName)) {
    Write-Host "`n2. Servicios disponibles en Cloud Run:" -ForegroundColor Yellow
    gcloud run services list --region=$Region --format="table(name,region,url)"
    
    $ServiceName = Read-Host "`nIngresa el nombre del servicio BACKEND"
}

Write-Host "`n   Servicio seleccionado: $ServiceName" -ForegroundColor Green

# 3. Obtener Service Account
Write-Host "`n3. Obteniendo Service Account..." -ForegroundColor Yellow
$serviceAccount = gcloud run services describe $ServiceName --region=$Region --format="value(spec.template.spec.serviceAccountName)"

if ([string]::IsNullOrEmpty($serviceAccount)) {
    Write-Host "   No hay service account configurado, usando el default..." -ForegroundColor Yellow
    $serviceAccount = "$ProjectId@appspot.gserviceaccount.com"
}

Write-Host "   Service Account: $serviceAccount" -ForegroundColor Green

# 4. Dar permisos de Storage al Service Account
Write-Host "`n4. Configurando permisos de Storage..." -ForegroundColor Yellow
Write-Host "   Dando rol storage.objectAdmin a $serviceAccount..." -ForegroundColor Cyan

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$serviceAccount" `
    --role="roles/storage.objectAdmin" `
    --condition=None

Write-Host "   ✓ Permisos configurados" -ForegroundColor Green

# 5. Actualizar variables de entorno del servicio
Write-Host "`n5. Actualizando variables de entorno..." -ForegroundColor Yellow

gcloud run services update $ServiceName `
    --region=$Region `
    --set-env-vars="USE_CLOUD_STORAGE=True,GS_BUCKET_NAME=ecommerce-media-storage,GCP_PROJECT_ID=$ProjectId"

Write-Host "   ✓ Variables de entorno actualizadas" -ForegroundColor Green

# 6. Verificar configuración
Write-Host "`n6. Verificando configuración..." -ForegroundColor Yellow
$envVars = gcloud run services describe $ServiceName --region=$Region --format="value(spec.template.spec.containers[0].env)"

Write-Host "`n   Variables de entorno configuradas:" -ForegroundColor Cyan
Write-Host $envVars

# 7. Verificar bucket
Write-Host "`n7. Verificando bucket de Cloud Storage..." -ForegroundColor Yellow
$bucketInfo = gcloud storage buckets describe gs://ecommerce-media-storage --format="value(name,location)"
Write-Host "   Bucket: $bucketInfo" -ForegroundColor Green

# 8. Resumen
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nPasos completados:" -ForegroundColor Yellow
Write-Host "  ✓ Service Account configurado con permisos de Storage" -ForegroundColor Green
Write-Host "  ✓ Variables de entorno actualizadas en Cloud Run" -ForegroundColor Green
Write-Host "  ✓ Bucket configurado y verificado" -ForegroundColor Green

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Redesplegar el servicio (si es necesario)" -ForegroundColor Cyan
Write-Host "  2. Probar subiendo una imagen de producto" -ForegroundColor Cyan
Write-Host "  3. Verificar que la URL sea: https://storage.googleapis.com/ecommerce-media-storage/..." -ForegroundColor Cyan

Write-Host "`nURL del servicio:" -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
Write-Host "  $serviceUrl" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Cyan
