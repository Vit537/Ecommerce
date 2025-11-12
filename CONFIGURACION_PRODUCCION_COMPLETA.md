# ✅ Checklist de Configuración para Producción

## 🎯 Estado Actual de la Configuración

### ✅ CORRECTO (Ya configurado)
- ✅ CORS configurado correctamente
- ✅ ALLOWED_HOSTS con wildcard y dominio específico
- ✅ CSRF_TRUSTED_ORIGINS configurado
- ✅ Middleware de seguridad habilitado
- ✅ Middleware custom para CSRF en API
- ✅ JWT configurado correctamente
- ✅ Permisos IsAuthenticatedOrReadOnly en productos
- ✅ Variables de entorno usando decouple
- ✅ Dockerfile optimizado con multi-stage
- ✅ Nginx configurado para SPA
- ✅ Health checks implementados
- ✅ WhiteNoise para archivos estáticos
- ✅ Gunicorn con timeout adecuado

### ⚠️ MEJORABLE (Recomendaciones)

#### 1. Variables de Entorno en Cloud Run

**Verificar que estén configuradas:**

```bash
# Backend - Cloud Run
DEBUG=False
DJANGO_SECRET_KEY=<tu_secret_key_segura>
ALLOWED_HOSTS=*,ecommerce-backend-930184937279.us-central1.run.app
CORS_ALLOWED_ORIGINS=https://ecommerce-frontend-930184937279.us-central1.run.app,https://tu-dominio-custom.com
CSRF_TRUSTED_ORIGINS=https://ecommerce-frontend-930184937279.us-central1.run.app,https://tu-dominio-custom.com

# Base de datos
DB_HOST=<IP_PRIVADA_CLOUD_SQL>
DB_NAME=mistore_db
DB_USER=postgres
DB_PASSWORD=<password_segura>
DB_PORT=5432

# Cloud Storage
USE_CLOUD_STORAGE=True
GS_BUCKET_NAME=<tu_bucket>
GS_PROJECT_ID=<tu_proyecto>

# APIs externas (si usas)
GROQ_API_KEY=<tu_key>
OPENAI_API_KEY=<tu_key>
STRIPE_SECRET_KEY=<tu_key>
STRIPE_WEBHOOK_SECRET=<tu_key>

# JWT
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7
```

**Frontend - Cloud Run:**

```bash
VITE_API_URL=https://ecommerce-backend-930184937279.us-central1.run.app
VITE_APP_NAME=Boutique E-commerce
VITE_APP_VERSION=1.0.0
```

#### 2. Cloud SQL - Mejoras de Seguridad

**Configuración recomendada:**

```yaml
# Aumentar recursos
Machine Type: db-g1-small (1.7 GB RAM)
Storage: 20 GB SSD
Storage Auto-increase: Habilitado

# Seguridad
Public IP: Deshabilitado (usar IP privada)
SSL/TLS: Requerido
Authorized Networks: Solo Cloud Run (o ninguna si usa IP privada)

# Backups
Automated Backups: Habilitado
Backup Window: 03:00-04:00 (hora con menos tráfico)
Point-in-time Recovery: Habilitado
Retention: 7 días

# Flags recomendados
cloudsql.iam_authentication=on
cloudsql.enable_pgaudit=on (si necesitas auditoría)
log_connections=on
log_disconnections=on
log_min_duration_statement=1000 (logs de queries lentas >1s)
```

#### 3. Cloud Run - Configuraciones Óptimas

**Backend:**

```yaml
Service Name: ecommerce-backend
Region: us-central1
Min Instances: 0 (desarrollo) / 1 (producción)
Max Instances: 10
CPU: 1
Memory: 512 MB (mínimo) / 1 GB (recomendado)
Timeout: 300s
Concurrency: 80

# Autoscaling
CPU Utilization: 70%
Request Rate: 100 requests/second

# Security
Allow Unauthenticated: Yes (para API pública)
Ingress: All traffic
Egress: Private ranges only (si usas VPC)

# Variables de entorno
Ver sección 1 arriba
```

**Frontend:**

```yaml
Service Name: ecommerce-frontend
Region: us-central1
Min Instances: 0
Max Instances: 5
CPU: 1
Memory: 256 MB
Timeout: 60s
Concurrency: 100

# Security
Allow Unauthenticated: Yes (frontend público)
Ingress: All traffic

# Variables de entorno
Ver sección 1 arriba
```

#### 4. Logging y Monitoring

**Cloud Run - Logs:**

```yaml
# Habilitar logs estructurados en Django settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

**Alertas recomendadas:**

```yaml
# Error Rate
Metric: cloud.run.io/request_count
Condition: Error rate > 5%
Duration: 5 minutes

# Latency
Metric: cloud.run.io/request_latencies
Condition: P95 > 2000ms
Duration: 5 minutes

# Instance Count
Metric: cloud.run.io/container/instance_count
Condition: Count > 8 (80% del máximo)
Duration: 5 minutes

# Database Connections
Metric: cloudsql.googleapis.com/database/postgresql/num_backends
Condition: > 80% of max_connections
Duration: 5 minutes
```

#### 5. Seguridad Adicional

**HTTPS y SSL:**

```yaml
# Backend Django (settings.py)
SECURE_SSL_REDIRECT = True (ya configurado ✅)
SESSION_COOKIE_SECURE = True (ya configurado ✅)
CSRF_COOKIE_SECURE = True (ya configurado ✅)
SECURE_HSTS_SECONDS = 31536000 (ya configurado ✅)

# Agregar estos también:
SECURE_REFERRER_POLICY = 'same-origin'
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
```

**Headers de seguridad en Nginx (frontend):**

```nginx
# Ya tienes estos ✅
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Agregar estos:
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

#### 6. Performance

**Backend - Gunicorn:**

```python
# Ya tienes workers=2 ✅
# Considera usar más workers en producción:
workers = (2 * CPU_COUNT) + 1  # Para 1 CPU = 3 workers
worker_class = 'sync'  # O 'gevent' para mayor concurrencia
worker_connections = 1000
max_requests = 1000  # Reiniciar worker después de N requests
max_requests_jitter = 100
timeout = 300  # Ya configurado ✅
keepalive = 5
```

**Database Connection Pooling:**

```python
# En settings.py, agregar:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
        'CONN_MAX_AGE': 60,  # Reutilizar conexiones por 60s
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30s timeout por query
        }
    }
}
```

**Cache con Redis (opcional pero recomendado):**

```python
# Si decides agregar Redis:
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'mistore',
        'TIMEOUT': 300,
    }
}

# Cache para sesiones
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

#### 7. Dominio Personalizado (Opcional)

**Si quieres usar tu propio dominio:**

```bash
# 1. En Cloud Run, mapear dominio
gcloud run domain-mappings create \
  --service ecommerce-backend \
  --domain api.tudominio.com \
  --region us-central1

gcloud run domain-mappings create \
  --service ecommerce-frontend \
  --domain www.tudominio.com \
  --region us-central1

# 2. Configurar DNS en tu proveedor
# Tipo: CNAME
# Nombre: api
# Valor: ghs.googlehosted.com

# 3. Actualizar CORS y CSRF en backend
CORS_ALLOWED_ORIGINS=https://www.tudominio.com
CSRF_TRUSTED_ORIGINS=https://www.tudominio.com
ALLOWED_HOSTS=api.tudominio.com,www.tudominio.com

# 4. Actualizar frontend
VITE_API_URL=https://api.tudominio.com
```

#### 8. CI/CD (Opcional pero recomendado)

**GitHub Actions para deploy automático:**

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'backend_django/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ecommerce-backend \
            --source ./backend_django \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated
```

#### 9. Backup y Disaster Recovery

**Estrategia de backups:**

```bash
# Cloud SQL
- Automated Backups: Diario a las 3:00 AM
- Retention: 7 días
- Point-in-time Recovery: Habilitado (últimos 7 días)
- Manual Backups: Semanal antes de cambios importantes

# Cloud Storage (para media files)
- Versioning: Habilitado
- Lifecycle: Mover a Nearline después de 90 días
- Lifecycle: Eliminar después de 365 días

# Código
- Git: Repository privado en GitHub
- Tags: Para cada release
- Branches: main (producción), develop (desarrollo)
```

#### 10. Monitoreo de Costos

**Configurar alertas de presupuesto:**

```bash
# En Google Cloud Console > Billing > Budgets
Budget Name: E-commerce Monthly
Amount: $50/month (ajustar según tu uso)
Alerts:
  - 50% = $25
  - 90% = $45
  - 100% = $50
```

**Servicios a monitorear:**

- Cloud Run (Backend + Frontend)
- Cloud SQL
- Cloud Storage
- Cloud Load Balancing (si usas)
- Egress Traffic

---

## 🚀 Deployment Checklist Final

Antes de considerar el proyecto listo para producción:

### Backend

- [ ] DEBUG=False en producción
- [ ] SECRET_KEY segura y única
- [ ] Todas las variables de entorno configuradas
- [ ] CORS y CSRF correctamente configurados
- [ ] ALLOWED_HOSTS con dominios correctos
- [ ] Base de datos con IP privada
- [ ] SSL/TLS habilitado en BD
- [ ] Backups automáticos configurados
- [ ] Logs estructurados habilitados
- [ ] Alertas de monitoring configuradas
- [ ] Health checks respondiendo
- [ ] Migraciones aplicadas
- [ ] Datos de prueba cargados
- [ ] Superusuario creado

### Frontend

- [ ] Build de producción optimizado
- [ ] Variables de entorno correctas
- [ ] VITE_API_URL apuntando al backend correcto
- [ ] Headers de seguridad configurados
- [ ] Compresión gzip habilitada
- [ ] Cache configurado para assets
- [ ] Rutas SPA funcionando
- [ ] Health check respondiendo

### Infraestructura

- [ ] Cloud Run backend con recursos adecuados
- [ ] Cloud Run frontend con recursos adecuados
- [ ] Cloud SQL con recursos adecuados
- [ ] VPC y redes configuradas (si aplica)
- [ ] IAM roles configurados correctamente
- [ ] Service accounts creadas
- [ ] Secrets Manager para credenciales sensibles
- [ ] Cloud Storage bucket para media files

### Seguridad

- [ ] Todas las contraseñas son seguras
- [ ] No hay secrets en el código
- [ ] HTTPS forzado
- [ ] Headers de seguridad configurados
- [ ] Auditoría habilitada en BD
- [ ] Política de contraseñas configurada
- [ ] Rate limiting considerado

### Testing

- [ ] Login funciona en producción
- [ ] CRUD de productos funciona
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] APIs de ML responden
- [ ] Sistema de notificaciones funciona
- [ ] Reportes se generan correctamente
- [ ] Frontend conecta con backend
- [ ] No hay errores CORS
- [ ] Performance aceptable (< 2s carga)

---

## 📝 Comandos Útiles de Gestión

### Ver estado de servicios

```bash
# Backend
gcloud run services describe ecommerce-backend --region=us-central1

# Frontend
gcloud run services describe ecommerce-frontend --region=us-central1

# Base de datos
gcloud sql instances describe <INSTANCE_NAME>
```

### Ver logs en tiempo real

```bash
# Backend
gcloud run services logs read ecommerce-backend --region=us-central1 --limit=100

# Frontend
gcloud run services logs read ecommerce-frontend --region=us-central1 --limit=100

# Base de datos
gcloud sql operations list --instance=<INSTANCE_NAME>
```

### Ejecutar comandos en el backend

```bash
# Conectar al contenedor
gcloud run services proxy ecommerce-backend --region=us-central1

# O usar Cloud Shell
# 1. Ir a Cloud Run > Tu servicio
# 2. Click en "CONNECT" > "Cloud Shell"
# 3. python manage.py <comando>
```

### Backup manual de la BD

```bash
gcloud sql backups create \
  --instance=<INSTANCE_NAME> \
  --description="Manual backup before major changes"
```

---

## 🎯 Próximos Pasos Recomendados

1. **Corto plazo (1-2 semanas):**
   - ✅ Resolver el problema del error 400
   - ✅ Aumentar recursos de Cloud SQL
   - ✅ Habilitar backups automáticos
   - ✅ Configurar alertas básicas

2. **Mediano plazo (1 mes):**
   - 🔄 Implementar Redis para cache
   - 🔄 Configurar CI/CD con GitHub Actions
   - 🔄 Agregar dominio personalizado
   - 🔄 Implementar rate limiting
   - 🔄 Mejorar logging estructurado

3. **Largo plazo (3 meses):**
   - 🔄 Implementar CDN para assets
   - 🔄 Añadir tests automatizados
   - 🔄 Implementar canary deployments
   - 🔄 Añadir APM (Application Performance Monitoring)
   - 🔄 Implementar disaster recovery plan

---

## 📚 Documentación Útil

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Django Production Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Optimization](https://www.nginx.com/blog/tuning-nginx/)
- [Google Cloud Security](https://cloud.google.com/security/best-practices)
