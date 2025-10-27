# 🚀 Despliegue del Backend - E-commerce

## ✅ Pre-requisitos Completados en GCP

Según el archivo `datos.txt`, ya tienes configurado:

- ✅ Proyecto GCP: `big-axiom-474503-m5`
- ✅ Cloud SQL: `myproject-db` 
- ✅ Base de datos: `ecommerce`
- ✅ Usuario DB: `ecommerce-user`
- ✅ Artifact Registry: `ecommerce-registry`
- ✅ Service Account: `ecommerce-github-actions@...`

## 📦 Secrets de GitHub a Configurar

Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Crea los siguientes secrets con los valores de `datos.txt`:

| Secret Name | Valor |
|-------------|-------|
| `GCP_PROJECT_ID` | `big-axiom-474503-m5` |
| `GCP_SA_KEY` | El JSON completo del service account |
| `DB_NAME` | `ecommerce` |
| `DB_USER` | `ecommerce-user` |
| `DB_PASSWORD` | `ecommerce123secure` |
| `DJANGO_SECRET_KEY` | `gf@b8m&+elx2g!r=j03=0!)i7le*+79=wf3q^wu5+^r9q4t3o(` |
| `GROQ_API_KEY` | (tu API key de Groq, opcional) |
| `OPENAI_API_KEY` | (tu API key de OpenAI, opcional) |

## 🔧 Archivos Creados

### Docker
- ✅ `Dockerfile` - Configuración de la imagen Docker
- ✅ `docker-entrypoint.sh` - Script de inicialización
- ✅ `.dockerignore` - Archivos a ignorar en build

### Django
- ✅ `core/management/commands/load_test_data.py` - Comando para cargar datos
- ✅ Settings actualizados para producción con Cloud SQL
- ✅ Requirements con gunicorn y whitenoise

### GitHub Actions
- ✅ `.github/workflows/backend-deploy.yml` - Workflow de despliegue automático

## 🎯 Cómo Desplegar

### Opción 1: Despliegue Automático (Recomendado)

1. **Configura los secrets en GitHub** (ver arriba)

2. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Configure backend for Cloud Run deployment"
   git push origin main
   ```

3. **El workflow se ejecutará automáticamente** y:
   - Construirá la imagen Docker
   - La subirá a Artifact Registry
   - La desplegará en Cloud Run
   - Ejecutará migraciones
   - Creará el superusuario
   - Cargará datos de prueba si la BD está vacía

4. **Espera 5-10 minutos** y obtén la URL en los logs del workflow

### Opción 2: Despliegue Manual

```bash
# 1. Autenticar con GCP
gcloud auth login
gcloud config set project big-axiom-474503-m5

# 2. Build imagen
cd backend_django
docker build -t us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest .

# 3. Push a Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
docker push us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest

# 4. Deploy a Cloud Run
gcloud run deploy ecommerce-backend \
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances big-axiom-474503-m5:us-central1:myproject-db \
  --set-env-vars DEBUG=False \
  --set-env-vars DJANGO_SECRET_KEY="gf@b8m&+elx2g!r=j03=0!)i7le*+79=wf3q^wu5+^r9q4t3o(" \
  --set-env-vars DB_NAME=ecommerce \
  --set-env-vars DB_USER=ecommerce-user \
  --set-env-vars DB_PASSWORD=ecommerce123secure \
  --set-env-vars DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db \
  --set-env-vars ALLOWED_HOSTS=* \
  --memory 1Gi \
  --cpu 1
```

## 📊 Datos de Prueba

El sistema cargará automáticamente:

### Usuarios de Prueba
- **Super Admin**: `superadmin@boutique.com` / `admin123`
- **Admin**: `admin@boutique.com` / `admin123`
- **Cajero**: `cajero@boutique.com` / `cajero123`
- **Gerente**: `gerente@boutique.com` / `gerente123`
- **Clientes**: varios con password `cliente123`

### Datos Generados
1. **Permisos y Roles** completos del sistema
2. **Categorías** de productos (Ropa, Calzado, Accesorios)
3. **Marcas** reconocidas (Nike, Adidas, Zara, etc.)
4. **Productos** con variantes (tallas y colores)
5. **Órdenes** distribuidas en 18 meses
6. **Datos ML** para predicciones

## 🧪 Probar el Backend

Una vez desplegado, prueba estos endpoints:

```bash
# URL de tu servicio (obtener de Cloud Run)
URL="https://ecommerce-backend-xxxxx.run.app"

# Health check
curl $URL/api/

# Admin panel
open $URL/admin/

# API endpoints
curl $URL/api/products/
curl $URL/api/auth/login/ -X POST -H "Content-Type: application/json" -d '{"email":"admin@boutique.com","password":"admin123"}'
```

## 🔍 Ver Logs

```bash
# Logs en tiempo real
gcloud run services logs tail ecommerce-backend --region us-central1

# Ver últimos logs
gcloud run services logs read ecommerce-backend --region us-central1 --limit 50
```

## 🛠️ Troubleshooting

### Error de conexión a Cloud SQL
- Verifica que el nombre de conexión sea exacto: `big-axiom-474503-m5:us-central1:myproject-db`
- Confirma que la cuenta de servicio tenga el rol "Cloud SQL Client"

### Error 500 en el despliegue
- Revisa los logs: `gcloud run services logs read ecommerce-backend --region us-central1`
- Verifica que todas las variables de entorno estén configuradas

### Base de datos vacía
- El script automático cargará datos solo si la BD está vacía
- Para forzar recarga: conecta a Cloud SQL y elimina las tablas

## 📝 Notas Importantes

1. **Datos de Prueba**: Se cargan automáticamente en el primer despliegue
2. **Machine Learning**: Los datos incluyen 18 meses de historial para ML
3. **Seguridad**: En producción, cambia el `DJANGO_SECRET_KEY`
4. **CORS**: Actualiza `CORS_ALLOWED_ORIGINS` con la URL de tu frontend
5. **CSRF**: Actualiza `CSRF_TRUSTED_ORIGINS` con la URL de tu frontend

## 🎉 Siguiente Paso

Una vez que el backend esté funcionando:
1. Anota la URL del servicio
2. Actualiza las variables de entorno para el frontend
3. Despliega el frontend siguiendo su guía
