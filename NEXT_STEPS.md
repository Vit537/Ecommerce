# 🎯 Pasos Siguientes para Completar el Despliegue

## ✅ Estado Actual
- ✅ Backend desplegado en Cloud Run
- ✅ Servidor funcionando correctamente
- ✅ Django Admin accesible
- ⚠️  **Base de datos vacía** (sin migraciones ejecutadas)

## 📋 Próximos Pasos

### 1. Ejecutar Migraciones (URGENTE)

Opción A: Usar Cloud Run Jobs
```bash
# Crear job de migraciones
gcloud run jobs create django-migrate \
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest \
  --region us-central1 \
  --set-cloudsql-instances big-axiom-474503-m5:us-central1:myproject-db \
  --set-env-vars "DB_NAME=ecommerce" \
  --set-env-vars "DB_USER=prueba" \
  --set-env-vars "DB_PASSWORD=prueba123secure" \
  --set-env-vars "DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db" \
  --set-env-vars "DB_PORT=5432" \
  --set-env-vars "DJANGO_SECRET_KEY=temp-key-123" \
  --command python \
  --args manage.py,migrate,--noinput \
  --project big-axiom-474503-m5

# Ejecutar migraciones
gcloud run jobs execute django-migrate --region us-central1 --wait --project big-axiom-474503-m5
```

Opción B: Conectarse directamente a Cloud SQL (más fácil)
```bash
# Desde tu máquina local con Cloud SQL Proxy
# 1. Instalar Cloud SQL Proxy (si no lo tienes)
# 2. Conectar:
cd backend_django
python manage.py migrate --settings=core.settings --database default
```

Opción C: Forzar migraciones en próximo deploy
```bash
# Modificar docker-entrypoint.sh para forzar migraciones
# Ya está configurado pero puede no ejecutarse si la BD ya existe vacía
```

### 2. Crear Superusuario

Después de las migraciones:
```bash
# Via Cloud Run Job
gcloud run jobs create django-createsuperuser \
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest \
  --region us-central1 \
  --set-cloudsql-instances big-axiom-474503-m5:us-central1:myproject-db \
  --set-env-vars "DB_NAME=ecommerce" \
  --set-env-vars "DB_USER=prueba" \
  --set-env-vars "DB_PASSWORD=prueba123secure" \
  --set-env-vars "DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db" \
  --set-env-vars "DB_PORT=5432" \
  --set-env-vars "DJANGO_SECRET_KEY=temp-key-123" \
  --command python \
  --args manage.py,shell,-c,"from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='admin@boutique.com', first_name='Admin', last_name='User', password='admin123', role='admin', user_type='admin', is_email_verified=True) if not User.objects.filter(email='admin@boutique.com').exists() else None" \
  --project big-axiom-474503-m5

gcloud run jobs execute django-createsuperuser --region us-central1 --wait --project big-axiom-474503-m5
```

O más simple:
```bash
python manage.py createsuperuser --email admin@boutique.com
```

### 3. Cargar Datos de Prueba

```bash
# Via Cloud Run Job
gcloud run jobs create django-loaddata \
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest \
  --region us-central1 \
  --set-cloudsql-instances big-axiom-474503-m5:us-central1:myproject-db \
  --set-env-vars "DB_NAME=ecommerce" \
  --set-env-vars "DB_USER=prueba" \
  --set-env-vars "DB_PASSWORD=prueba123secure" \
  --set-env-vars "DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db" \
  --set-env-vars "DB_PORT=5432" \
  --set-env-vars "DJANGO_SECRET_KEY=temp-key-123" \
  --command python \
  --args manage.py,load_test_data,--skip-ml \
  --project big-axiom-474503-m5

gcloud run jobs execute django-loaddata --region us-central1 --wait --project big-axiom-474503-m5
```

### 4. Configurar Frontend

Una vez que el backend tenga datos:

1. **Actualizar URL del backend en el frontend:**
   ```typescript
   // frontend/src/config.ts o donde esté la configuración
   export const API_URL = 'https://ecommerce-backend-930184937279.us-central1.run.app';
   ```

2. **Desplegar frontend:**
   - Opciones: Vercel, Netlify, Firebase Hosting, o Cloud Run también
   - El frontend solo necesita conectarse al backend via API

3. **Actualizar CORS en backend:**
   - Agregar URL del frontend a `CSRF_TRUSTED_ORIGINS`
   - Actualizar `ALLOWED_HOSTS` si es necesario

### 5. Pruebas Completas

Probar todos los flujos:
- [ ] Registro de usuarios
- [ ] Login
- [ ] Ver productos
- [ ] Agregar al carrito
- [ ] Crear orden
- [ ] Panel de administración
- [ ] Chatbot (si tienes GROQ_API_KEY)

### 6. Monitoreo

```bash
# Ver logs en tiempo real
gcloud run services logs tail ecommerce-backend --region us-central1 --project big-axiom-474503-m5

# Ver métricas en consola
# https://console.cloud.google.com/run/detail/us-central1/ecommerce-backend/metrics
```

## 🚨 Forma Más Rápida (Recomendada)

Si quieres hacerlo manual y rápido:

1. **Conectar a Cloud SQL directamente desde tu máquina:**
   ```bash
   # Instalar Cloud SQL Proxy
   # Descargar de: https://cloud.google.com/sql/docs/postgres/sql-proxy
   
   # Ejecutar proxy
   cloud-sql-proxy big-axiom-474503-m5:us-central1:myproject-db
   
   # En otra terminal, ejecutar migraciones localmente
   cd backend_django
   export DB_HOST=127.0.0.1
   export DB_NAME=ecommerce
   export DB_USER=prueba  
   export DB_PASSWORD=prueba123secure
   python manage.py migrate
   python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='admin@boutique.com', first_name='Admin', last_name='User', password='admin123', role='admin', user_type='admin', is_email_verified=True)"
   python manage.py load_test_data --skip-ml
   ```

2. **Recargar la página del backend** y debería funcionar todo!

## 📝 URLs Importantes

- **Backend**: https://ecommerce-backend-930184937279.us-central1.run.app
- **Admin**: https://ecommerce-backend-930184937279.us-central1.run.app/admin/
- **Consola Cloud Run**: https://console.cloud.google.com/run
- **Cloud SQL**: https://console.cloud.google.com/sql

---

**¿Qué prefieres hacer primero?**
1. Ejecutar migraciones con Cloud SQL Proxy (más fácil)
2. Configurar Cloud Run Jobs (más automatizado)
3. Pasar directamente a configurar el frontend
