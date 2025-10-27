# 🚀 Guía de Despliegue: Backend Django a Google Cloud Run

Esta guía te llevará paso a paso para desplegar tu backend Django con PostgreSQL en Google Cloud Run, desde cero hasta tener tu API en producción.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- ✅ Proyecto Django funcionando correctamente en localhost
- ✅ PostgreSQL funcionando localmente
- ✅ Cuenta de Google Cloud Platform (GCP)
- ✅ Cuenta de GitHub
- ✅ Git instalado en tu computadora

---

## 🎯 FASE 1: Configuración en Google Cloud Platform

### Paso 1.1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en el selector de proyectos (arriba a la izquierda)
3. Click en **"Nuevo Proyecto"**
4. Nombre del proyecto: `libreria` (o el nombre de tu proyecto)
5. Click en **"Crear"**
6. **Anota el ID del proyecto** (ej: `big-axiom-474503-m5`)

### Paso 1.2: Activar APIs Necesarias

Ve a **APIs y Servicios > Biblioteca** y activa:
- ✅ Cloud Run API
- ✅ Cloud SQL Admin API
- ✅ Artifact Registry API
- ✅ Cloud Build API

### Paso 1.3: Crear Instancia de Cloud SQL (PostgreSQL)

1. Ve a **SQL** en el menú lateral
2. Click en **"Crear Instancia"**
3. Selecciona **PostgreSQL**
4. Configura:
   - **ID de instancia**: `libreria-db-instance`
   - **Contraseña**: Genera una segura y guárdala
   - **Versión**: PostgreSQL 15
   - **Región**: `us-central1` (o la más cercana a ti)
   - **Configuración de máquina**: Selecciona según tu presupuesto
     - Desarrollo: `db-f1-micro` o `db-g1-small`
     - Producción: `db-n1-standard-1` o superior
5. Click en **"Crear Instancia"** (tomará unos 5-10 minutos)
6. **Anota el nombre de conexión** (ej: `big-axiom-474503-m5:us-central1:libreria-db-instance`)

### Paso 1.4: Crear Base de Datos

1. Una vez creada la instancia, entra a ella
2. Ve a la pestaña **"Bases de datos"**
3. Click en **"Crear base de datos"**
4. Nombre: `libreria_db`
5. Click en **"Crear"**

### Paso 1.5: Crear Usuario de Base de Datos

1. Ve a la pestaña **"Usuarios"**
2. Click en **"Agregar cuenta de usuario"**
3. Configura:
   - **Nombre de usuario**: `libreria_user`
   - **Contraseña**: Genera una segura y guárdala
4. Click en **"Agregar"**

**📝 Guarda estos datos:**
```
DB_NAME: libreria_db
DB_USER: libreria_user
DB_PASSWORD: [tu_contraseña]
DB_HOST: /cloudsql/[nombre_de_conexion]
CLOUD_SQL_CONNECTION: [nombre_de_conexion_completo]
```

### Paso 1.6: Crear Cuenta de Servicio

1. Ve a **IAM y Administración > Cuentas de servicio**
2. Click en **"Crear cuenta de servicio"**
3. Configura:
   - **Nombre**: `github-actions-deployer`
   - **Descripción**: `Cuenta para desplegar desde GitHub Actions`
4. Click en **"Crear y continuar"**
5. Asigna estos roles:
   - ✅ **Cloud Run Admin**
   - ✅ **Cloud SQL Client**
   - ✅ **Artifact Registry Administrator**
   - ✅ **Service Account User**
   - ✅ **Cloud Build Editor**
6. Click en **"Continuar"** y luego **"Listo"**

### Paso 1.7: Generar Clave JSON de la Cuenta de Servicio

1. En la lista de cuentas de servicio, busca la que acabas de crear
2. Click en los tres puntos (⋮) > **"Administrar claves"**
3. Click en **"Agregar clave" > "Crear clave nueva"**
4. Selecciona **JSON**
5. Click en **"Crear"**
6. **Guarda el archivo JSON** descargado (lo necesitarás para GitHub)

### Paso 1.8: Crear Artifact Registry

1. Ve a **Artifact Registry** en el menú lateral
2. Click en **"Crear repositorio"**
3. Configura:
   - **Nombre**: `prueba-v2-registry` (o el nombre que prefieras)
   - **Formato**: **Docker**
   - **Modo**: **Estándar**
   - **Región**: `us-central1` (misma que tu Cloud SQL)
4. Click en **"Crear"**
5. **Anota el nombre del repositorio**

---

## 🐳 FASE 2: Preparar el Proyecto Django

### Paso 2.1: Crear Dockerfile

Crea `backend/Dockerfile`:

```dockerfile
# Usar imagen base de Python
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Colectar archivos estáticos
RUN python manage.py collectstatic --noinput || true

# Exponer puerto
EXPOSE 8000

# Script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Comando de inicio
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
```

### Paso 2.2: Crear Script de Entrada

Crea `backend/docker-entrypoint.sh`:

```bash
#!/bin/bash
set -e

echo "Esperando a que la base de datos esté lista..."
python manage.py wait_for_db || true

echo "Ejecutando migraciones..."
python manage.py migrate --noinput

echo "Creando superusuario si no existe..."
python manage.py shell < superuser.py || true

echo "Cargando datos iniciales..."
python manage.py load_data || true

echo "Iniciando servidor..."
exec "$@"
```

### Paso 2.3: Actualizar requirements.txt

Asegúrate de tener:

```txt
Django>=5.2.7
psycopg2-binary>=2.9.9
djangorestframework>=3.14.0
django-cors-headers>=4.3.1
python-decouple>=3.8
gunicorn>=21.2.0
whitenoise>=6.6.0
```

### Paso 2.4: Configurar settings.py

Actualiza `backend/config/settings.py`:

```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key-change-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)

# Hosts permitidos
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'libros',  # Tu app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database - PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='libreria_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='1234'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,https://tu-frontend.run.app'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in config(
        'CSRF_TRUSTED_ORIGINS', 
        default='https://tu-backend.run.app'
    ).split(',') if o.strip()
]

# Security Settings for Production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

---

## 🔧 FASE 3: Configurar GitHub Actions

### Paso 3.1: Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Click en **"New repository"**
3. Nombre: `libreria` (o el nombre de tu proyecto)
4. Selecciona **Public** o **Private**
5. Click en **"Create repository"**

### Paso 3.2: Subir tu Código

En tu terminal:

```bash
cd tu-proyecto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/libreria.git
git push -u origin main
```

### Paso 3.3: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **"New repository secret"** para cada uno:

**Secrets a crear:**

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| `GCP_PROJECT_ID` | `big-axiom-474503-m5` | ID de tu proyecto GCP |
| `GCP_SA_KEY` | Contenido del JSON | Pega TODO el contenido del archivo JSON de la cuenta de servicio |
| `DB_NAME` | `libreria_db` | Nombre de tu base de datos |
| `DB_USER` | `libreria_user` | Usuario de la base de datos |
| `DB_PASSWORD` | `tu_contraseña` | Contraseña del usuario DB |
| `DJANGO_SECRET_KEY` | Genera uno nuevo | Usa: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |

### Paso 3.4: Crear Workflow de GitHub Actions

Crea `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

env:
  REGION: us-central1
  REPOSITORY: prueba-v2-registry  # Tu artifact registry
  SERVICE_NAME: libreria-backend
  IMAGE_NAME: backend
  CLOUD_SQL_CONNECTION: big-axiom-474503-m5:us-central1:libreria-db-instance

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    concurrency:
      group: backend-cloud-run
      cancel-in-progress: true
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud SDK
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Configure Docker for Artifact Registry
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build and push Docker image
        id: build
        run: |
          IMAGE_URI="${{ env.REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/${{ env.REPOSITORY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}"
          echo "Building $IMAGE_URI"
          docker build -t "$IMAGE_URI" ./backend
          docker push "$IMAGE_URI"
          echo "IMAGE_URI=$IMAGE_URI" >> $GITHUB_ENV

      - name: Deploy to Cloud Run
        run: |
          echo "Deploying $IMAGE_URI to Cloud Run ${{ env.SERVICE_NAME }}"
          gcloud run deploy "${{ env.SERVICE_NAME }}" \
            --image "$IMAGE_URI" \
            --platform managed \
            --region "${{ env.REGION }}" \
            --allow-unauthenticated \
            --add-cloudsql-instances "${{ env.CLOUD_SQL_CONNECTION }}" \
            --set-env-vars "DEBUG=False" \
            --set-env-vars "SECRET_KEY=${{ secrets.DJANGO_SECRET_KEY }}" \
            --set-env-vars "DB_NAME=${{ secrets.DB_NAME }}" \
            --set-env-vars "DB_USER=${{ secrets.DB_USER }}" \
            --set-env-vars "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" \
            --set-env-vars "DB_HOST=/cloudsql/${{ env.CLOUD_SQL_CONNECTION }}" \
            --set-env-vars "ALLOWED_HOSTS=*" \
            --memory 512Mi \
            --cpu 1

      - name: Show service URL
        run: |
          SERVICE_URL=$(gcloud run services describe "${{ env.SERVICE_NAME }}" --region "${{ env.REGION }}" --format="value(status.url)")
          echo "Backend deployed at: $SERVICE_URL"
```

### Paso 3.5: Hacer Push y Desplegar

```bash
git add .
git commit -m "Add backend deployment configuration"
git push origin main
```

---

## ✅ FASE 4: Verificación

### Paso 4.1: Monitorear el Despliegue

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow ejecutándose
4. Espera 5-10 minutos a que complete

### Paso 4.2: Obtener la URL del Backend

1. Una vez completado el workflow, verás la URL en los logs
2. O ve a [Cloud Run Console](https://console.cloud.google.com/run)
3. Busca tu servicio `libreria-backend`
4. Copia la URL (ej: `https://libreria-backend-xxxxx.run.app`)

### Paso 4.3: Probar el Backend

Abre en tu navegador:
```
https://libreria-backend-xxxxx.run.app/api/libros/
https://libreria-backend-xxxxx.run.app/admin/
```

---

## 🔍 Solución de Problemas

### Error: "Could not connect to Cloud SQL"
- ✅ Verifica que `CLOUD_SQL_CONNECTION` esté correcto
- ✅ Verifica que la cuenta de servicio tenga rol "Cloud SQL Client"
- ✅ Verifica que `DB_HOST` use `/cloudsql/[connection_name]`

### Error: "Permission denied"
- ✅ Verifica que la cuenta de servicio tenga todos los roles necesarios
- ✅ Regenera la clave JSON si es necesario

### Error: "Database does not exist"
- ✅ Verifica que creaste la base de datos en Cloud SQL
- ✅ Verifica que `DB_NAME` coincida exactamente

### Error: "Static files not found"
- ✅ Verifica que `collectstatic` se ejecute en el Dockerfile
- ✅ Verifica que WhiteNoise esté instalado y configurado

---

## 📊 Costos Estimados

**Cloud SQL (PostgreSQL):**
- Desarrollo (`db-f1-micro`): ~$7-10/mes
- Producción (`db-n1-standard-1`): ~$50-70/mes

**Cloud Run:**
- Gratis hasta 2 millones de requests/mes
- Después: ~$0.40 por millón de requests

**Artifact Registry:**
- Primeros 0.5 GB gratis
- Después: ~$0.10/GB/mes

---

## 🎯 Próximos Pasos

Una vez que tu backend esté funcionando:
1. ✅ Anota la URL del backend
2. ✅ Actualiza `CORS_ALLOWED_ORIGINS` con la URL de tu frontend
3. ✅ Continúa con el despliegue del frontend (ver `DEPLOY_FRONTEND_GUIDE.md`)

---

## 📚 Recursos Adicionales

- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Documentación de Cloud SQL](https://cloud.google.com/sql/docs)
- [Documentación de Django](https://docs.djangoproject.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**¡Felicidades! Tu backend Django está ahora en producción en Google Cloud Run** 🎉
