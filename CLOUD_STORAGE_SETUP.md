# Configuración de Google Cloud Storage para Producción

## Variables de Entorno Requeridas

Estas variables deben estar configuradas en tu Cloud Run service:

```bash
# Storage
USE_CLOUD_STORAGE=True
GS_BUCKET_NAME=ecommerce-media-storage
GCP_PROJECT_ID=big-axiom-474503-m5

# Database (ya configuradas)
DB_NAME=<tu-db-name>
DB_USER=<tu-db-user>
DB_PASSWORD=<tu-db-password>
DB_HOST=<tu-cloud-sql-host>
DB_PORT=5432

# Django
DEBUG=False
DJANGO_SECRET_KEY=<tu-secret-key>
ALLOWED_HOSTS=*
```

## Comandos para Configurar en Cloud Run

### 1. Actualizar variables de entorno del servicio backend

```bash
# Obtener el nombre del servicio
gcloud run services list --region=us-central1

# Actualizar variables de entorno
gcloud run services update <NOMBRE-SERVICIO-BACKEND> \
  --region=us-central1 \
  --set-env-vars="USE_CLOUD_STORAGE=True,GS_BUCKET_NAME=ecommerce-media-storage,GCP_PROJECT_ID=big-axiom-474503-m5"
```

### 2. Verificar permisos del Service Account

El service account de Cloud Run necesita permisos para escribir en Cloud Storage:

```bash
# Obtener el service account del servicio
gcloud run services describe <NOMBRE-SERVICIO-BACKEND> --region=us-central1 --format="value(spec.template.spec.serviceAccountName)"

# Dar permisos de Storage Object Admin al service account
gcloud projects add-iam-policy-binding big-axiom-474503-m5 \
  --member="serviceAccount:<SERVICE-ACCOUNT-EMAIL>" \
  --role="roles/storage.objectAdmin"
```

### 3. Configurar CORS (Ya hecho)

```bash
gcloud storage buckets update gs://ecommerce-media-storage --cors-file=cors-config.json
```

### 4. Hacer el bucket público para lectura (Ya hecho)

```bash
gcloud storage buckets add-iam-policy-binding gs://ecommerce-media-storage \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

## Verificación

### Probar subida de imagen localmente

```bash
cd backend_django
python manage.py shell
```

```python
from django.core.files.uploadedfile import SimpleUploadedFile
from products.utils import save_product_image
from PIL import Image
from io import BytesIO

# Crear una imagen de prueba
img = Image.new('RGB', (100, 100), color='red')
img_io = BytesIO()
img.save(img_io, 'JPEG')
img_io.seek(0)

# Crear archivo
test_file = SimpleUploadedFile("test.jpg", img_io.read(), content_type="image/jpeg")

# Subir imagen
url = save_product_image(test_file, "producto-prueba", 0, use_cloud=True)
print(f"URL de imagen: {url}")
```

### Verificar imágenes en el bucket

```bash
gcloud storage ls gs://ecommerce-media-storage/products/
```

## Troubleshooting

### Error: "Permission denied"
- Verificar que el service account tiene el rol `storage.objectAdmin`
- Verificar que `USE_CLOUD_STORAGE=True` está configurado

### Error: "Bucket not found"
- Verificar que `GS_BUCKET_NAME` tiene el valor correcto
- Verificar que el proyecto es el correcto con `gcloud config get-value project`

### Las imágenes no se ven en el frontend
- Verificar que el bucket es público: `gcloud storage buckets describe gs://ecommerce-media-storage`
- Verificar CORS con el comando de arriba
- Revisar las URLs en la base de datos (deben empezar con `https://storage.googleapis.com/`)

## URLs de Ejemplo

Las URLs de las imágenes deben tener este formato:
```
https://storage.googleapis.com/ecommerce-media-storage/products/nombre-producto_abc12345_0.webp
```
