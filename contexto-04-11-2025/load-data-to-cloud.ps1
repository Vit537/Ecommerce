# Script PowerShell para cargar datos en Google Cloud
# Uso: .\load-data-to-cloud.ps1 [URL_DE_TU_BACKEND]

param(
    [string]$BackendUrl = "https://ecommerce-backend-930184937279.us-central1.run.app"
)

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 68 -ForegroundColor Cyan
Write-Host " CARGAR DATOS DE PRUEBA EN GOOGLE CLOUD " -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 68 -ForegroundColor Cyan
Write-Host ""

# Si no se proporciona URL, pedirla
if ($BackendUrl -eq "") {
    Write-Host "Por favor, ingresa la URL de tu backend en Google Cloud:" -ForegroundColor Yellow
    Write-Host "(Ejemplo: https://tu-servicio-12345.run.app)" -ForegroundColor Gray
    Write-Host ""
    $BackendUrl = Read-Host "URL"
    
    if ($BackendUrl -eq "") {
        Write-Host ""
        Write-Host "ERROR: Debes proporcionar una URL válida" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

# Limpiar URL (quitar / final si existe)
$BackendUrl = $BackendUrl.TrimEnd('/')

# Construir la URL del endpoint
$Endpoint = "$BackendUrl/api/temp-load-data/"

Write-Host ""
Write-Host "Conectando a: " -NoNewline -ForegroundColor White
Write-Host $Endpoint -ForegroundColor Cyan
Write-Host ""
Write-Host "Esto puede tardar 1-2 minutos..." -ForegroundColor Yellow
Write-Host ""

try {
    # Hacer la petición POST
    $response = Invoke-RestMethod -Uri $Endpoint -Method POST -ContentType "application/json" -TimeoutSec 300
    
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host "=" * 68 -ForegroundColor Green
    Write-Host " DATOS CARGADOS EXITOSAMENTE " -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Green
    Write-Host "=" * 68 -ForegroundColor Green
    Write-Host ""
    
    if ($response.success) {
        Write-Host "Status: " -NoNewline -ForegroundColor White
        Write-Host "SUCCESS" -ForegroundColor Green
        Write-Host ""
        
        if ($response.output) {
            Write-Host "Salida del script:" -ForegroundColor Cyan
            Write-Host $response.output -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "CREDENCIALES DE ACCESO:" -ForegroundColor Yellow
        Write-Host "-" * 70 -ForegroundColor Gray
        Write-Host "Super Admin: " -NoNewline -ForegroundColor White
        Write-Host "superadmin@boutique.com / admin123" -ForegroundColor Cyan
        Write-Host "Administrador: " -NoNewline -ForegroundColor White
        Write-Host "admin@boutique.com / admin123" -ForegroundColor Cyan
        Write-Host "Cajero: " -NoNewline -ForegroundColor White
        Write-Host "cajero@boutique.com / cajero123" -ForegroundColor Cyan
        Write-Host "Gerente: " -NoNewline -ForegroundColor White
        Write-Host "gerente@boutique.com / gerente123" -ForegroundColor Cyan
        Write-Host "Clientes: " -NoNewline -ForegroundColor White
        Write-Host "*.@email.com / cliente123" -ForegroundColor Cyan
        Write-Host "-" * 70 -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Prueba tu aplicacion en:" -ForegroundColor Yellow
        Write-Host "  Admin: " -NoNewline -ForegroundColor White
        Write-Host "$BackendUrl/admin/" -ForegroundColor Cyan
        Write-Host "  API: " -NoNewline -ForegroundColor White
        Write-Host "$BackendUrl/api/products/" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "IMPORTANTE: " -NoNewline -ForegroundColor Red
        Write-Host "Recuerda desactivar el endpoint temporal despues de las pruebas" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "Status: " -NoNewline -ForegroundColor White
        Write-Host "ERROR" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error: " -ForegroundColor Red
        Write-Host $response.error -ForegroundColor Gray
    }
    
} catch {
    Write-Host ""
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host "=" * 68 -ForegroundColor Red
    Write-Host " ERROR AL CONECTAR " -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Red
    Write-Host "=" * 68 -ForegroundColor Red
    Write-Host ""
    Write-Host "No se pudo conectar al backend." -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalles del error:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. La URL sea correcta" -ForegroundColor White
    Write-Host "  2. El servicio este activo en Google Cloud" -ForegroundColor White
    Write-Host "  3. El endpoint /api/temp-load-data/ este disponible" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
