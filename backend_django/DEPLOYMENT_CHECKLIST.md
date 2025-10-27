# ✅ Checklist de Despliegue - Backend E-Commerce

## 📋 Pre-Despliegue

### ✅ Google Cloud Platform (YA CONFIGURADO)
- [x] Proyecto GCP creado: `big-axiom-474503-m5`
- [x] Cloud SQL instancia: `myproject-db`
- [x] Base de datos: `ecommerce`
- [x] Usuario DB: `ecommerce-user`
- [x] Artifact Registry: `ecommerce-registry`
- [x] Service Account con permisos
- [x] APIs habilitadas (Cloud Run, Cloud SQL, Artifact Registry)

### ✅ Archivos de Configuración (YA CREADOS)
- [x] `Dockerfile`
- [x] `docker-entrypoint.sh`
- [x] `.dockerignore`
- [x] `.github/workflows/backend-deploy.yml`
- [x] `core/management/commands/load_test_data.py`
- [x] `settings.py` actualizado
- [x] `requirements.txt` actualizado
- [x] `.env.example` actualizado

---

## 🚀 Pasos de Despliegue

### Paso 1: Configurar GitHub Secrets ⏳

Ve a: `https://github.com/TU_USUARIO/TU_REPO/settings/secrets/actions`

**Secrets a crear:**

- [ ] **GCP_PROJECT_ID**
  ```
  big-axiom-474503-m5
  ```

- [ ] **GCP_SA_KEY** (copiar TODO el JSON del archivo datos.txt)
  ```json
  {
    "type": "service_account",
    "project_id": "big-axiom-474503-m5",
    ...
  }
  ```

- [ ] **DB_NAME**
  ```
  ecommerce
  ```

- [ ] **DB_USER**
  ```
  ecommerce-user
  ```

- [ ] **DB_PASSWORD**
  ```
  ecommerce123secure
  ```

- [ ] **DJANGO_SECRET_KEY**
  ```
  gf@b8m&+elx2g!r=j03=0!)i7le*+79=wf3q^wu5+^r9q4t3o(
  ```

- [ ] **GROQ_API_KEY** (opcional)
  ```
  tu-groq-api-key
  ```

- [ ] **OPENAI_API_KEY** (opcional)
  ```
  tu-openai-api-key
  ```

### Paso 2: Push a GitHub ⏳

```bash
# Verificar cambios
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: Configure backend for Cloud Run deployment with auto data loading"

# Push
git push origin main
# o
git push origin master
```

**Checklist:**
- [ ] Sin errores al hacer push
- [ ] Código en rama correcta (main/master)

### Paso 3: Monitorear GitHub Actions ⏳

1. [ ] Ir a: `https://github.com/TU_USUARIO/TU_REPO/actions`
2. [ ] Ver workflow "Deploy Backend to Cloud Run" ejecutándose
3. [ ] Esperar a que termine (5-10 minutos)
4. [ ] Verificar que termine con ✅ (verde)

**Si falla:**
- Ver logs del workflow
- Verificar que todos los secrets estén correctos
- Verificar nombres de servicios en GCP

### Paso 4: Obtener URL del Backend ⏳

En los logs del workflow, buscar:
```
🎉 Backend deployed successfully!
🌐 Service URL: https://ecommerce-backend-xxxxx.run.app
```

**O desde Cloud Console:**
1. [ ] Ir a: https://console.cloud.google.com/run
2. [ ] Buscar servicio: `ecommerce-backend`
3. [ ] Copiar URL

**Anota tu URL aquí:**
```
Backend URL: _________________________________
```

### Paso 5: Verificar Despliegue ⏳

#### Prueba 1: Health Check
```bash
curl https://TU-BACKEND-URL.run.app/api/
```
**Esperado:** Respuesta JSON con información del API

- [ ] ✅ Respuesta exitosa

#### Prueba 2: Admin Panel
```bash
# Abre en navegador
https://TU-BACKEND-URL.run.app/admin/
```
**Esperado:** Página de login de Django Admin

- [ ] ✅ Admin panel accesible
- [ ] ✅ Login funciona con `superadmin@boutique.com` / `admin123`

#### Prueba 3: API Login
```bash
curl https://TU-BACKEND-URL.run.app/api/auth/login/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boutique.com","password":"admin123"}'
```
**Esperado:** Token JWT

- [ ] ✅ Login API funciona

#### Prueba 4: Endpoints de Productos
```bash
curl https://TU-BACKEND-URL.run.app/api/products/
```
**Esperado:** Lista de productos

- [ ] ✅ Productos disponibles

---

## 📊 Verificación de Datos

### Datos Básicos (Cargados Automáticamente)

- [ ] Superusuario creado
- [ ] Usuarios de prueba creados
- [ ] Categorías creadas
- [ ] Productos con variantes
- [ ] Órdenes iniciales (~10)

**Verificar en Admin Panel:**
1. Login en `/admin/`
2. Revisar secciones:
   - Authentication > Users
   - Products > Products
   - Orders > Orders

---

## 🎯 Post-Despliegue (Opcional)

### Cargar Datos ML (Recomendado) ⏳

**Opción 1: Cloud Shell**
```bash
# 1. Conectar a Cloud Run
gcloud run services proxy ecommerce-backend --region us-central1

# 2. En otra terminal
curl http://localhost:8080/api/ml/generate-data/
```

**Opción 2: Ejecutar Script Manualmente**
```bash
# Ver README para instrucciones completas
```

- [ ] Datos ML cargados (100+ órdenes)
- [ ] Verificado en Admin Panel

### Actualizar CORS para Frontend ⏳

Cuando despliegues el frontend, actualiza:

```bash
gcloud run services update ecommerce-backend \
  --region us-central1 \
  --update-env-vars CORS_ALLOWED_ORIGINS=https://tu-frontend.run.app,http://localhost:5173 \
  --update-env-vars CSRF_TRUSTED_ORIGINS=https://tu-frontend.run.app,https://tu-backend.run.app
```

- [ ] CORS actualizado con URL frontend
- [ ] CSRF actualizado

---

## 🎉 Completado

### Backend Status
- [ ] ✅ Desplegado en Cloud Run
- [ ] ✅ URL funcionando
- [ ] ✅ Admin panel accesible
- [ ] ✅ API endpoints respondiendo
- [ ] ✅ Datos de prueba cargados
- [ ] ✅ (Opcional) Datos ML cargados

### URLs Importantes

**Backend:**
```
Producción: https://_____________________________.run.app
Admin: https://_____________________________.run.app/admin/
API: https://_____________________________.run.app/api/
```

**Credenciales:**
```
Super Admin: superadmin@boutique.com / admin123
Admin: admin@boutique.com / admin123
Cajero: cajero@boutique.com / cajero123
Gerente: gerente@boutique.com / gerente123
```

---

## 📞 Soporte

### Ver Logs
```bash
gcloud run services logs tail ecommerce-backend --region us-central1
```

### Redeploy
```bash
# Solo hacer push de nuevo
git push origin main
```

### Rollback
```bash
gcloud run services update-traffic ecommerce-backend \
  --region us-central1 \
  --to-revisions PREVIOUS_REVISION=100
```

---

## ➡️ Siguiente Paso

**Ahora puedes:**
1. ✅ Configurar y desplegar el frontend
2. ✅ Entrenar modelos de Machine Learning
3. ✅ Comenzar a usar tu aplicación

---

**Fecha de despliegue:** __________

**Notas adicionales:**
```
_____________________________________
_____________________________________
_____________________________________
```
