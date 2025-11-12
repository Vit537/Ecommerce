# 🚨 Solución a Errores de Producción en Google Cloud

## 📋 Resumen del Problema

### Error Principal
- **Error 400**: "Your client has issued a malformed or illegal request"
- **Síntoma**: Login funciona ✅, pero Products falla ❌
- **Causa**: Google Cloud está rechazando las peticiones ANTES de llegar a Django

### Problemas Identificados

#### 1. ❌ Error 400 en `/api/products/`
- El error viene de Google, no de Django
- Google está bloqueando/rechazando la petición antes de llegar a tu aplicación
- El HTML de respuesta es de Google, no de tu backend

#### 2. ⚠️ Seguridad de PostgreSQL
- 5 alertas de seguridad activas
- Sin política de contraseñas
- Permite conexiones sin encriptar
- Memoria insuficiente (628 MB)

#### 3. ⚙️ Configuración de Producción
- Settings de Django están bien configurados
- CORS y ALLOWED_HOSTS correctos
- Middleware adecuado

---

## 🔧 Soluciones Paso a Paso

### SOLUCIÓN 1: Verificar y Corregir URL del Backend

#### Paso 1: Verificar la URL exacta en Cloud Run

```bash
# En Cloud Console, ve a Cloud Run y copia la URL EXACTA del servicio
# Debe ser algo como:
https://ecommerce-backend-930184937279.us-central1.run.app
# https://ecommerce-backend-930184937279.us-central1.run.app
```

#### Paso 2: Probar con curl en lugar de Postman

```bash
# 1. Primero hacer login para obtener el token
curl -X POST https://ecommerce-backend-930184937279.us-central1.run.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boutique.com","password":"admin123"}'

# 2. Copiar el token y usarlo para products (REEMPLAZA <TOKEN> con tu token real)
curl -X GET https://ecommerce-backend-930184937279.us-central1.run.app/api/products/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

**Si curl funciona pero Postman no**, el problema es la configuración de Postman.

---

### SOLUCIÓN 2: Revisar Configuración de Cloud Run

#### Paso 1: Verificar que el servicio está corriendo

```bash
# En Cloud Console > Cloud Run > Tu servicio
# Verifica:
# 1. Estado: ✅ (verde)
# 2. Tráfico: 100% a la última revisión
# 3. Logs: No debe haber errores
```

#### Paso 2: Verificar Variables de Entorno

En Cloud Run, verifica que estas variables estén configuradas:

```bash
# Variables REQUERIDAS en Cloud Run:
DEBUG=False
ALLOWED_HOSTS=*,ecommerce-backend-930184937279.us-central1.run.app
CORS_ALLOWED_ORIGINS=https://ecommerce-frontend-930184937279.us-central1.run.app
CSRF_TRUSTED_ORIGINS=https://ecommerce-frontend-930184937279.us-central1.run.app
DB_HOST=<IP_DE_TU_CLOUD_SQL>
DB_NAME=mistore_db
DB_USER=postgres
DB_PASSWORD=<TU_PASSWORD>
DB_PORT=5432
```

#### Paso 3: Verificar Logs de Cloud Run

```bash
# En Cloud Console > Cloud Run > Logs
# Busca errores cuando haces la petición a /api/products/
# Si no ves NINGÚN log, significa que la petición NO está llegando al backend
```

---

### SOLUCIÓN 3: Corregir Postman si es el Problema

#### Configuración de Postman para Cloud Run:

**En la pestaña Headers:**
```
Authorization: Bearer <tu_token>
Content-Type: application/json
Accept: application/json
```

**En la pestaña Settings de la Request:**
- ❌ Desactiva "Automatically follow redirects" temporalmente
- ❌ Desactiva "Enable SSL certificate verification" solo para pruebas
- ✅ Activa "Send no-cache headers"

**URL Correcta:**
```
GET https://ecommerce-backend-930184937279.us-central1.run.app/api/products/
```
(Nota la `/` final)

---

### SOLUCIÓN 4: Verificar desde el Frontend

#### Paso 1: Verifica que el Frontend usa la URL correcta

El frontend debería estar configurado con:
```javascript
VITE_API_URL=https://ecommerce-backend-930184937279.us-central1.run.app
```

#### Paso 2: Prueba desde el Frontend en producción

1. Abre tu frontend en producción
2. Abre las DevTools (F12)
3. Ve a la pestaña Network
4. Intenta ver productos
5. Revisa el request a `/api/products/`:
   - ¿Qué status code devuelve?
   - ¿Qué headers se están enviando?
   - ¿La URL es correcta?

---

### SOLUCIÓN 5: Mejorar Seguridad de Cloud SQL (IMPORTANTE)

#### Paso 1: Aumentar Recursos de la BD

```bash
# En Cloud Console > SQL > Tu instancia
# 1. Editar configuración
# 2. Machine type: db-f1-micro → db-g1-small (1.7 GB RAM mínimo)
# 3. Storage: 10 GB mínimo
```

#### Paso 2: Habilitar Política de Contraseñas

```bash
# En Cloud Console > SQL > Tu instancia > Configuración
# 1. Flags de BD > Agregar flag
# 2. cloudsql.iam_authentication = on
# 3. Guardar
```

#### Paso 3: Habilitar Conexiones Seguras

```bash
# En Cloud Console > SQL > Conexiones
# 1. ❌ Desactiva "Public IP" si no es necesario
# 2. ✅ Usa "Private IP" con VPC
# 3. ✅ O usa "Cloud SQL Auth Proxy"
```

#### Paso 4: Habilitar Auditoría

```bash
# En Cloud Console > SQL > Configuración > Flags
# Agregar estos flags:
cloudsql.enable_pgaudit=on
pgaudit.log='DDL,WRITE'
```

---

## 🧪 Pruebas de Diagnóstico

### Test 1: Verificar que Django responde

```bash
# Desde Cloud Console > Cloud Run > Tu servicio > Terminal
python manage.py check
python manage.py showmigrations
```

### Test 2: Probar directamente en el contenedor

```bash
# Desde Cloud Console > Cloud Run > Terminal
curl http://localhost:8080/api/products/
# Debería responder (aunque sin autenticación)
```

### Test 3: Ver logs en tiempo real

```bash
# En Cloud Console > Cloud Run > Logs
# Filtra por:
severity=ERROR
# Y haz una petición desde Postman
```

---

## 🎯 Lista de Verificación (Checklist)

### Backend (Django + Cloud Run)

- [ ] El servicio de Cloud Run está en estado "Running" (verde)
- [ ] Las variables de entorno están configuradas correctamente
- [ ] ALLOWED_HOSTS incluye el dominio de Cloud Run
- [ ] CORS_ALLOWED_ORIGINS incluye el frontend de Cloud Run
- [ ] La base de datos Cloud SQL está accesible
- [ ] Los logs de Cloud Run no muestran errores
- [ ] El health check responde correctamente
- [ ] La URL termina con `/` en los endpoints

### Frontend (React + Cloud Run)

- [ ] El archivo `config.js` se genera correctamente con la URL del backend
- [ ] VITE_API_URL apunta al backend de Cloud Run
- [ ] El token se guarda en localStorage después del login
- [ ] El token se envía en el header Authorization
- [ ] Las peticiones van a HTTPS (no HTTP)
- [ ] No hay errores CORS en la consola del navegador

### Cloud SQL (PostgreSQL)

- [ ] La instancia tiene al menos 1.7 GB de RAM
- [ ] Cloud Run puede conectarse a Cloud SQL
- [ ] La base de datos tiene datos (productos, usuarios, etc.)
- [ ] El usuario y password son correctos
- [ ] La conexión usa IP privada o Cloud SQL Proxy
- [ ] Las políticas de seguridad están configuradas

### Postman

- [ ] La URL es EXACTAMENTE la de Cloud Run (con HTTPS)
- [ ] El token se copia correctamente (sin espacios extra)
- [ ] El header Authorization usa el formato: `Bearer <token>`
- [ ] Content-Type es `application/json`
- [ ] La URL termina con `/` si es necesario
- [ ] No hay redirects automáticos activados

---

## 🔍 Comandos de Diagnóstico Útiles

### Ver logs de Cloud Run en tiempo real:

```bash
gcloud run services logs read ecommerce-backend \
  --region=us-central1 \
  --limit=50 \
  --format="table(timestamp,severity,textPayload)"
```

### Ver detalles del servicio:

```bash
gcloud run services describe ecommerce-backend \
  --region=us-central1 \
  --format=yaml
```

### Probar conectividad a Cloud SQL:

```bash
gcloud sql instances describe <INSTANCE_NAME> \
  --format="get(ipAddresses[0].ipAddress)"
```

---

## 📊 Siguiente Paso CRÍTICO

**LO MÁS IMPORTANTE:** Necesitas verificar si el problema es:

1. **Postman configurado incorrectamente** → Prueba con curl
2. **URL mal formada** → Copia exacta de Cloud Run
3. **Cloud Run no recibe las peticiones** → Revisa logs
4. **Token inválido/expirado** → Genera uno nuevo

### 🎯 Haz esto AHORA:

```bash
# 1. Obtén token fresco
curl -X POST https://ecommerce-backend-930184937279.us-central1.run.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boutique.com","password":"admin123"}' \
  -v

# 2. Copia el token y úsalo inmediatamente
curl -X GET https://ecommerce-backend-930184937279.us-central1.run.app/api/products/ \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -v

# El flag -v te mostrará TODO el proceso de la petición
```

Si curl **FUNCIONA**, el problema es Postman.
Si curl **FALLA con el mismo error**, el problema es Cloud Run.

---

## 💡 Notas Finales

- El error 400 de Google indica que la petición está siendo bloqueada ANTES de llegar a Django
- Si login funciona, significa que Cloud Run está corriendo y Django responde
- El problema más probable es la URL o los headers en Postman
- Usa `-v` en curl para ver TODOS los detalles de la petición
- Revisa los logs de Cloud Run para ver si las peticiones llegan
