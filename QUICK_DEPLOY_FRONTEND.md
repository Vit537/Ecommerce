# ⚡ DESPLIEGUE RÁPIDO DEL FRONTEND

## 🚀 Para Desplegar AHORA:

```bash
# 1. Agregar todos los archivos
git add .

# 2. Commit
git commit -m "Configure frontend for Cloud Run deployment"

# 3. Push (esto despliega automáticamente)
git push origin main
```

## 📊 Monitorear el Despliegue:

Ir a: https://github.com/Vit537/Ecommerce/actions

## ⏱️ Tiempo: ~4-5 minutos

## ✅ Después del Despliegue:

### 1. Obtener URL del Frontend:
```bash
gcloud run services describe ecommerce-frontend --region us-central1 --format="value(status.url)"
```

### 2. Probar que funciona:
```bash
# Reemplaza FRONTEND-URL con la URL obtenida
curl https://FRONTEND-URL/health
```

### 3. Abrir en el navegador:
```
https://FRONTEND-URL
```

### 4. IMPORTANTE - Actualizar CORS en el Backend:

Edita `backend_django/core/settings.py` y agrega:

```python
CORS_ALLOWED_ORIGINS = [
    "https://ecommerce-backend-930184937279.us-central1.run.app",
    "https://TU-FRONTEND-URL.us-central1.run.app",  # ← AGREGAR ESTA LÍNEA
]

CSRF_TRUSTED_ORIGINS = [
    "https://ecommerce-backend-930184937279.us-central1.run.app",
    "https://TU-FRONTEND-URL.us-central1.run.app",  # ← AGREGAR ESTA LÍNEA
]
```

Luego:
```bash
git add backend_django/core/settings.py
git commit -m "Update CORS for frontend URL"
git push origin main
```

## 🎉 ¡Listo!

Tu sistema estará completo:
- ✅ Backend en Cloud Run
- ✅ Frontend en Cloud Run
- ✅ Base de datos PostgreSQL
- ✅ Artifact Registry compartido
- ✅ Deploy automático con GitHub Actions

---

## 📚 Documentación Completa:

- `FRONTEND_EXECUTIVE_SUMMARY.md` - Resumen ejecutivo
- `FRONTEND_DEPLOY_GUIDE.md` - Guía detallada
- `FRONTEND_DEPLOY_CHECKLIST.md` - Checklist paso a paso
- `frontend/README.md` - Documentación del frontend

## 🆘 Si Algo Falla:

1. Ver logs en GitHub Actions
2. Ejecutar: `gcloud run services logs read ecommerce-frontend --region us-central1`
3. Revisar Browser DevTools (F12)

---

**¿Listo para desplegar?** → `git push origin main` 🚀
