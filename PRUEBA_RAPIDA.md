# 🚀 PRUEBA RÁPIDA - 5 Minutos

## ⚡ Ejecuta ESTO AHORA para resolver tu problema

### Paso 1: Abre PowerShell

```powershell
# Presiona Windows + X
# Selecciona "Windows PowerShell"
```

### Paso 2: Ve a tu proyecto

```powershell
cd "d:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado"
```

### Paso 3: Ejecuta el diagnóstico

```powershell
.\diagnostico_produccion.ps1
```

**Espera 30 segundos mientras el script prueba todo...**

---

## 📊 Interpreta los Resultados

### ✅ Si ves "Products con token: 200 OK"

**¡TU BACKEND FUNCIONA PERFECTAMENTE!**

El problema es Postman. Haz esto:

1. **Copia el token que aparece en el script** (línea que dice "Token:")
2. **Abre Postman**
3. **Crea una nueva request:**
   - Method: `GET`
   - URL: `https://ecommerce-backend-930184937279.us-central1.run.app/api/products/`
   - Headers:
     - `Authorization`: `Bearer TU_TOKEN_AQUI` (pega el token del script)
     - `Content-Type`: `application/json`
4. **Click en SEND**

**Debería funcionar ahora.**

---

### ❌ Si ves "Error 400" en el script

**El problema ES real.**

Haz esto:

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/run

2. **Click en tu servicio "ecommerce-backend"**

3. **Click en "LOGS" arriba**

4. **Haz la petición desde Postman AHORA**

5. **Mira los logs - ¿aparece algo?**
   - **SI aparece algo:** El error está en Django, comparte los logs
   - **NO aparece nada:** La petición no llega al backend, hay un problema de red/configuración

---

## 🎯 Alternativa: Prueba Manual Rápida

Si no quieres usar el script, copia y pega esto en PowerShell:

```powershell
# Login
$body = '{"email":"admin@boutique.com","password":"admin123"}'
$loginUrl = "https://ecommerce-backend-930184937279.us-central1.run.app/api/auth/login/"
$response = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $body -ContentType "application/json"

Write-Host "✅ Token obtenido:" -ForegroundColor Green
Write-Host $response.token -ForegroundColor Cyan
Write-Host ""

# Products
$headers = @{
    "Authorization" = "Bearer $($response.token)"
    "Content-Type" = "application/json"
}
$productsUrl = "https://ecommerce-backend-930184937279.us-central1.run.app/api/products/"

try {
    $products = Invoke-RestMethod -Uri $productsUrl -Method Get -Headers $headers
    Write-Host "✅ FUNCIONA! Productos encontrados: $($products.count)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 TU BACKEND ESTÁ BIEN. El problema es Postman." -ForegroundColor Yellow
    Write-Host "Usa este token en Postman:" -ForegroundColor Yellow
    Write-Host $response.token -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los logs de Cloud Run" -ForegroundColor Yellow
}
```

---

## 🔧 Configuración Correcta de Postman

### Headers (pestaña Headers):
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...  (tu token completo)
Content-Type: application/json
Accept: application/json
```

### URL (exacta, con / al final):
```
https://ecommerce-backend-930184937279.us-central1.run.app/api/products/
```

### Settings de la Request:
- Ve a Settings (⚙️ junto a Send)
- ❌ Desactiva "Automatically follow redirects"
- ✅ Activa "Send no-cache headers"

---

## 📱 Contacto

Si después de esto sigue sin funcionar:

1. **Comparte:**
   - Screenshot del resultado del script
   - Screenshot de Postman (con headers visibles)
   - Los logs de Cloud Run

2. **Revisa:**
   - ¿La URL es exactamente la misma?
   - ¿El token está completo (sin espacios)?
   - ¿Los headers están en el formato correcto?

---

## ⏱️ ¿Cuánto tarda?

- ⚡ Script: **30 segundos**
- ⚡ Prueba manual: **1 minuto**
- ⚡ Configurar Postman: **2 minutos**

**Total: 5 minutos máximo.**

---

## 🎯 Resultado Esperado

Después de ejecutar el script sabrás:

✅ **Si el backend funciona** → El problema es Postman
❌ **Si el backend falla** → Hay que revisar Cloud Run
⚠️ **Si hay problemas de DB** → Hay que revisar Cloud SQL

**¡Ejecuta el script ahora y sabrás en 30 segundos!**
