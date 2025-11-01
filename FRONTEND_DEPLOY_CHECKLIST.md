# ✅ Checklist de Despliegue del Frontend

## 📋 Pre-Despliegue

### Archivos Necesarios
- [x] `frontend/Dockerfile` - Configuración de Docker
- [x] `frontend/nginx.conf` - Configuración de Nginx
- [x] `frontend/docker-entrypoint.sh` - Script de inicio
- [x] `frontend/.dockerignore` - Optimización de build
- [x] `.github/workflows/frontend-deploy.yml` - GitHub Actions
- [x] `frontend/src/config/env.ts` - Manejo de variables de entorno

### Configuración de Código
- [x] Variables de entorno configuradas en `src/config/env.ts`
- [x] API URL apunta al backend en producción
- [x] `index.html` carga el script `config.js`
- [x] Rutas configuradas correctamente en `nginx.conf`

### Secretos de GitHub (Ya configurados)
- [x] `GCP_SA_KEY` - Service Account JSON
- [x] `GCP_PROJECT_ID` - big-axiom-474503-m5

### Backend Configurado
- [x] Backend desplegado y funcionando
- [x] URL del backend: `https://ecommerce-backend-930184937279.us-central1.run.app`
- [ ] **PENDIENTE**: Actualizar CORS en backend con URL del frontend

## 🚀 Despliegue

### Paso 1: Commit y Push
```bash
git add .
git commit -m "Configure frontend for Cloud Run deployment"
git push origin main
```
- [ ] Cambios commiteados
- [ ] Push ejecutado exitosamente

### Paso 2: Monitorear GitHub Actions
- [ ] Ir a: https://github.com/Vit537/Ecommerce/actions
- [ ] Verificar que el workflow "Deploy Frontend to Cloud Run" se está ejecutando
- [ ] Esperar a que termine (aprox. 3-5 minutos)

### Paso 3: Verificar el Estado
```bash
gcloud run services describe ecommerce-frontend --region us-central1
```
- [ ] Servicio está en estado READY
- [ ] URL del servicio obtenida

## 🧪 Post-Despliegue

### Verificaciones Básicas
- [ ] **Health Check**: `curl https://FRONTEND-URL/health` retorna "healthy"
- [ ] **Frontend carga**: Abrir la URL en el navegador
- [ ] **Sin errores 404**: Las rutas de React Router funcionan

### Verificaciones de Conectividad
- [ ] Abrir DevTools (F12) → Console
- [ ] No hay errores de CORS
- [ ] Las llamadas API van a la URL correcta del backend
- [ ] Respuestas del backend son correctas

### Funcionalidades a Probar
- [ ] **Página de inicio** carga correctamente
- [ ] **Login/Registro** funciona
- [ ] **Listado de productos** se carga desde el backend
- [ ] **Detalle de producto** funciona
- [ ] **Carrito de compras** funciona
- [ ] **Dashboard de admin** (si aplica) funciona
- [ ] **Imágenes y assets** se cargan correctamente

### Configuración del Backend
- [ ] Actualizar `CORS_ALLOWED_ORIGINS` en `backend_django/core/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://ecommerce-frontend-XXXXXXX.us-central1.run.app",  # Agregar esta línea
]
```
- [ ] Actualizar `CSRF_TRUSTED_ORIGINS`:
```python
CSRF_TRUSTED_ORIGINS = [
    "https://ecommerce-frontend-XXXXXXX.us-central1.run.app",  # Agregar esta línea
]
```
- [ ] Commit y push del backend actualizado

## 📊 Métricas y Monitoreo

### Cloud Run Console
- [ ] Ir a: https://console.cloud.google.com/run
- [ ] Seleccionar `ecommerce-frontend`
- [ ] Verificar:
  - [ ] Request count > 0
  - [ ] Latency < 1000ms
  - [ ] Error rate = 0%
  - [ ] Memory usage < 512Mi

### Logs
```bash
# Ver logs recientes
gcloud run services logs read ecommerce-frontend --region us-central1 --limit 50

# Ver logs en tiempo real
gcloud run services logs tail ecommerce-frontend --region us-central1
```
- [ ] No hay errores críticos en los logs
- [ ] Mensaje "Environment configuration created" aparece
- [ ] Nginx está corriendo correctamente

## 🔄 Workflow de GitHub Actions

### Verificar el Workflow
- [ ] Build completado sin errores
- [ ] Push a Artifact Registry exitoso
- [ ] Deploy a Cloud Run exitoso
- [ ] URL del servicio mostrada en los logs

### En caso de error:
- [ ] Revisar logs del workflow en GitHub
- [ ] Verificar que los secretos están configurados
- [ ] Verificar que el Dockerfile no tiene errores
- [ ] Probar build localmente

## 🌐 URLs del Sistema

### Producción
- **Frontend**: `https://ecommerce-frontend-XXXXXXX.us-central1.run.app`
- **Backend**: `https://ecommerce-backend-930184937279.us-central1.run.app`

### Desarrollo Local
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`

## 📝 Documentación

- [ ] Anotar la URL del frontend en un lugar seguro
- [ ] Actualizar documentación del proyecto con las URLs
- [ ] Compartir URLs con el equipo

## 🎯 Tareas Opcionales

### Performance
- [ ] Verificar que gzip está habilitado
- [ ] Verificar que los assets tienen cache headers
- [ ] Medir tiempo de carga con Lighthouse

### Seguridad
- [ ] Verificar headers de seguridad (X-Frame-Options, etc.)
- [ ] Verificar que HTTPS está activo
- [ ] Probar con diferentes navegadores

### Dominio Personalizado (Opcional)
- [ ] Configurar Cloud DNS
- [ ] Mapear dominio personalizado a Cloud Run
- [ ] Actualizar CORS y CSRF con el nuevo dominio

### Monitoreo Avanzado (Opcional)
- [ ] Configurar Cloud Monitoring alerts
- [ ] Configurar uptime checks
- [ ] Configurar error reporting

## ❌ Troubleshooting

Si algo falla, revisar en orden:

1. **GitHub Actions Logs**
   - Ir a Actions tab en GitHub
   - Ver el workflow que falló
   - Leer los mensajes de error

2. **Cloud Run Logs**
   ```bash
   gcloud run services logs read ecommerce-frontend --region us-central1
   ```

3. **Browser DevTools**
   - Console para errores de JavaScript
   - Network para errores de API
   - Application para problemas de cache

4. **Dockerfile Local Build**
   ```bash
   cd frontend
   docker build -t test-frontend .
   docker run -p 8080:8080 test-frontend
   ```

## ✅ Checklist Final

- [ ] ✅ Frontend desplegado exitosamente
- [ ] ✅ Todas las verificaciones pasadas
- [ ] ✅ Backend actualizado con CORS
- [ ] ✅ Sistema end-to-end funcional
- [ ] ✅ Documentación actualizada
- [ ] ✅ URLs compartidas

---

**Estado del Despliegue**: 🟡 LISTO PARA DESPLEGAR

**Próximo Paso**: Ejecutar `git push origin main` y monitorear el deploy en GitHub Actions
