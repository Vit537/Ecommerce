# 🚀 Guía de Despliegue del Frontend a Google Cloud Run

## 📋 Requisitos Previos

✅ Backend ya desplegado y funcionando
✅ Artifact Registry configurado: `ecommerce-registry`
✅ GitHub Actions configurado con secretos
✅ Variables de entorno configuradas

## 🏗️ Arquitectura

```
Frontend (React + Vite)
    ↓
Docker (Node.js build + Nginx serve)
    ↓
Artifact Registry
    ↓
Cloud Run (Servicio frontend)
    ↓
Backend API (Cloud Run)
```

## 📦 Archivos Creados

### 1. `Dockerfile`
- **Etapa 1**: Build de la aplicación React con Node.js
- **Etapa 2**: Servir con Nginx en producción
- Puerto: **8080** (requerido por Cloud Run)

### 2. `nginx.conf`
- Configuración del servidor Nginx
- Compresión gzip habilitada
- Cache para assets estáticos
- Manejo de rutas SPA (React Router)
- Health check endpoint: `/health`

### 3. `docker-entrypoint.sh`
- Inyecta variables de entorno en runtime
- Crea `config.js` con las variables
- Permite cambiar configuración sin rebuild

### 4. `.github/workflows/frontend-deploy.yml`
- Workflow de GitHub Actions
- Trigger: Push a `main` con cambios en `frontend/**`
- Usa el mismo registry que el backend

### 5. `src/config/env.ts`
- Manejo unificado de variables de entorno
- Funciona en desarrollo y producción
- Fallback a valores por defecto

### 6. `.dockerignore`
- Optimiza el build de Docker
- Excluye archivos innecesarios

## 🔐 Secretos de GitHub

Los siguientes secretos ya están configurados (son los mismos del backend):

```
GCP_SA_KEY          ✓ Service Account JSON
GCP_PROJECT_ID      ✓ big-axiom-474503-m5
```

## 🌐 Variables de Entorno

### En Cloud Run (configuradas automáticamente):
```bash
VITE_API_URL=https://ecommerce-backend-930184937279.us-central1.run.app
VITE_APP_NAME=Boutique E-commerce
VITE_APP_VERSION=1.0.0
```

### En desarrollo local (`.env`):
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Boutique E-commerce
VITE_APP_VERSION=1.0.0
```

## 🚀 Proceso de Despliegue

### Opción 1: Automático (Recomendado)

1. **Hacer commit de los cambios**:
```bash
git add .
git commit -m "Configure frontend for Cloud Run deployment"
git push origin main
```

2. **GitHub Actions se ejecutará automáticamente**:
   - Build de la imagen Docker
   - Push al Artifact Registry
   - Deploy a Cloud Run

3. **Monitorear el progreso**:
   - Ir a: https://github.com/Vit537/Ecommerce/actions
   - Ver el workflow: "Deploy Frontend to Cloud Run"

### Opción 2: Manual (Solo si es necesario)

```bash
# 1. Autenticarse en GCP
gcloud auth login

# 2. Configurar el proyecto
gcloud config set project big-axiom-474503-m5

# 3. Build de la imagen
cd frontend
docker build -t us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/frontend:latest .

# 4. Push al registry
docker push us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/frontend:latest

# 5. Deploy a Cloud Run
gcloud run deploy ecommerce-frontend \
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=https://ecommerce-backend-930184937279.us-central1.run.app" \
  --port 8080 \
  --memory 512Mi
```

## 🧪 Verificación Post-Despliegue

### 1. Verificar que el servicio está corriendo:
```bash
gcloud run services describe ecommerce-frontend --region us-central1
```

### 2. Obtener la URL del frontend:
```bash
gcloud run services describe ecommerce-frontend --region us-central1 --format="value(status.url)"
```

### 3. Probar el health check:
```bash
curl https://ecommerce-frontend-XXXXXXX.us-central1.run.app/health
# Debe retornar: healthy
```

### 4. Verificar en el navegador:
```
https://ecommerce-frontend-XXXXXXX.us-central1.run.app
```

### 5. Verificar que se conecta al backend:
- Abrir DevTools (F12)
- Ver la consola para verificar que no hay errores de CORS
- Verificar que las llamadas API van al backend correcto

## 📊 Características de Cloud Run

| Característica | Valor |
|----------------|-------|
| **Memoria** | 512Mi |
| **CPU** | 1 |
| **Timeout** | 300s |
| **Min Instances** | 0 (escala a cero) |
| **Max Instances** | 10 |
| **Puerto** | 8080 |
| **Autenticación** | Público |

## 🔄 Actualizar el Frontend

Simplemente hacer push de los cambios:

```bash
git add frontend/
git commit -m "Update frontend: [descripción]"
git push origin main
```

GitHub Actions se encargará del resto automáticamente.

## 🐛 Troubleshooting

### Problema: La imagen no se construye

**Solución**:
```bash
# Probar build local
cd frontend
docker build -t test-frontend .

# Si falla, verificar:
- package.json tiene todas las dependencias
- No hay errores de TypeScript
- .dockerignore no excluye archivos necesarios
```

### Problema: El frontend no se conecta al backend

**Solución**:
1. Verificar que `VITE_API_URL` tiene la URL correcta del backend
2. Verificar CORS en el backend (settings.py):
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://ecommerce-frontend-XXXXXXX.us-central1.run.app",
   ]
   ```
3. Actualizar el backend con la URL del frontend

### Problema: Error 404 en rutas

**Solución**: Verificar que `nginx.conf` tiene:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: Variables de entorno no se cargan

**Solución**:
1. Verificar que `config.js` se genera correctamente
2. Ver logs del contenedor:
   ```bash
   gcloud run services logs read ecommerce-frontend --region us-central1
   ```

## 📝 Logs

### Ver logs en tiempo real:
```bash
gcloud run services logs tail ecommerce-frontend --region us-central1
```

### Ver logs de deploy:
```bash
gcloud run operations list --filter="metadata.serviceName:ecommerce-frontend"
```

## 💰 Costos Estimados

Con tráfico bajo:
- **Cloud Run**: ~$0 (capa gratuita cubre hasta 2 millones de solicitudes/mes)
- **Artifact Registry**: ~$0.10/mes (almacenamiento de imágenes)
- **Networking**: ~$0 (capa gratuita cubre 1GB de egress/mes)

## 🎯 Próximos Pasos

1. ✅ Deploy del frontend (este paso)
2. 🔄 Actualizar CORS en el backend con la URL del frontend
3. 🔒 Configurar dominio personalizado (opcional)
4. 📊 Configurar Cloud Monitoring (opcional)
5. 🔐 Configurar SSL/TLS (Cloud Run lo hace automáticamente)

## 📚 Recursos Adicionales

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

## 🆘 Soporte

Si tienes problemas, revisa:
1. GitHub Actions logs
2. Cloud Run logs
3. Browser DevTools Console
4. Network tab en DevTools

---

**¡Listo para desplegar! 🚀**
