# 🚀 Guía de Despliegue: Frontend Next.js a Google Cloud Run

Esta guía te llevará paso a paso para desplegar tu frontend Next.js en Google Cloud Run, conectándolo con tu backend Django.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- ✅ Frontend Next.js funcionando correctamente en localhost
- ✅ Backend desplegado y funcionando en Cloud Run (ver `DEPLOY_BACKEND_GUIDE.md`)
- ✅ URL del backend en producción (ej: `https://libreria-backend-xxxxx.run.app`)
- ✅ Cuenta de Google Cloud Platform (GCP) ya configurada
- ✅ Repositorio de GitHub con tu código
- ✅ Artifact Registry ya creado (se usa el mismo del backend)

---

## 🎯 FASE 1: Obtener Información del Backend

### Paso 1.1: Obtener URL del Backend

1. Ve a [Cloud Run Console](https://console.cloud.google.com/run)
2. Busca tu servicio backend (ej: `libreria-backend`)
3. Copia la URL completa
4. **Importante**: Si tu backend usa `/api` como prefijo, anota:
   ```
   Backend URL: https://libreria-backend-xxxxx.run.app/api
   ```

### Paso 1.2: Verificar Artifact Registry

Ya debes tener un Artifact Registry creado en el backend. Si no:

1. Ve a **Artifact Registry** en Google Cloud Console
2. Verifica que existe (ej: `prueba-v2-registry`)
3. Verifica la región (ej: `us-central1`)

---

## 🐳 FASE 2: Preparar el Proyecto Next.js

### Paso 2.1: Configurar next.config.ts

Actualiza `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usar 'standalone' para Cloud Run
  output: 'standalone',
  
  // Configuración para producción
  compress: true,
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Paso 2.2: Configurar API Client

Actualiza `frontend/lib/api.ts` (o tu archivo de API):

```typescript
// API para consumir el backend Django

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getLibros() {
  const res = await fetch(`${API_URL}/libros/`, { 
    next: { revalidate: 60 } 
  });
  if (!res.ok) throw new Error('Error al obtener libros');
  return res.json();
}

export async function getLugares() {
  const res = await fetch(`${API_URL}/lugares/`, { 
    next: { revalidate: 60 } 
  });
  if (!res.ok) throw new Error('Error al obtener lugares');
  return res.json();
}

export async function createSugerencia(data: any) {
  const res = await fetch(`${API_URL}/sugerencias/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al enviar sugerencia');
  return res.json();
}
```

### Paso 2.3: Crear Dockerfile

Crea `frontend/Dockerfile`:

```dockerfile
# Imagen base
FROM node:20-alpine AS base

# Dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Paso 2.4: Verificar package.json

Asegúrate de tener el script de build:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🔧 FASE 3: Configurar GitHub Actions

### Paso 3.1: Crear Workflow de Despliegue

Crea `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Cloud Run

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

env:
  REGION: us-central1  # Misma región del backend
  REPOSITORY: prueba-v2-registry  # Mismo artifact registry del backend
  SERVICE_NAME: libreria-frontend
  IMAGE_NAME: frontend

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    concurrency:
      group: frontend-cloud-run
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
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=https://libreria-backend-xxxxx.run.app/api \
            -t "$IMAGE_URI" \
            ./frontend
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
            --set-env-vars "NEXT_PUBLIC_API_URL=https://libreria-backend-xxxxx.run.app/api" \
            --port 3000 \
            --memory 512Mi \
            --cpu 1

      - name: Show service URL
        run: |
          SERVICE_URL=$(gcloud run services describe "${{ env.SERVICE_NAME }}" --region "${{ env.REGION }}" --format="value(status.url)")
          echo "Frontend deployed at: $SERVICE_URL"
```

**⚠️ IMPORTANTE**: Reemplaza `https://libreria-backend-xxxxx.run.app/api` con la URL real de tu backend.

---

## 🔗 FASE 4: Actualizar CORS en el Backend

### Paso 4.1: Obtener URL del Frontend (Temporal)

Primero necesitamos desplegar el frontend para obtener su URL. Pero antes, actualiza el backend.

### Paso 4.2: Actualizar Backend settings.py

En `backend/config/settings.py`, actualiza CORS:

```python
# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,https://libreria-frontend-xxxxx.run.app'
).split(',')
```

**Nota**: Usa `https://libreria-frontend-xxxxx.run.app` (reemplaza con tu URL real una vez desplegado)

### Paso 4.3: Redesplegar Backend

```bash
git add backend/config/settings.py
git commit -m "Update CORS for frontend"
git push origin main
```

---

## 🚀 FASE 5: Desplegar Frontend

### Paso 5.1: Commit y Push

```bash
git add .
git commit -m "Add frontend deployment configuration"
git push origin main
```

### Paso 5.2: Monitorear el Despliegue

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow `Deploy Frontend to Cloud Run` ejecutándose
4. Espera 5-10 minutos a que complete

### Paso 5.3: Obtener la URL del Frontend

1. Una vez completado, verás la URL en los logs del workflow
2. O ve a [Cloud Run Console](https://console.cloud.google.com/run)
3. Busca tu servicio `libreria-frontend`
4. Copia la URL (ej: `https://libreria-frontend-xxxxx.run.app`)

---

## ✅ FASE 6: Configuración Final

### Paso 6.1: Actualizar CORS del Backend (Final)

Ahora que tienes la URL real del frontend:

1. Actualiza `backend/config/settings.py` con la URL correcta
2. Commit y push:
```bash
git add backend/config/settings.py
git commit -m "Update CORS with final frontend URL"
git push origin main
```

### Paso 6.2: Verificar Conexión

Abre tu frontend en el navegador:
```
https://libreria-frontend-xxxxx.run.app
```

Verifica que:
- ✅ La página principal carga correctamente
- ✅ Los datos del backend se muestran (libros, lugares, etc.)
- ✅ Los formularios funcionan (sugerencias)
- ✅ No hay errores de CORS en la consola del navegador

---

## 🔍 Solución de Problemas

### Error: "Failed to load resource: net::ERR_CERT_COMMON_NAME_INVALID"
**Solución**: Espera unos minutos, Cloud Run está provisionando el certificado SSL.

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"
**Soluciones**:
1. Verifica que la URL del frontend esté en `CORS_ALLOWED_ORIGINS` del backend
2. Verifica que el backend se haya redesplegar después del cambio
3. Asegúrate de incluir `https://` en la URL

### Error: "Failed to fetch"
**Soluciones**:
1. Verifica que `NEXT_PUBLIC_API_URL` esté correcta en el workflow
2. Verifica que el backend esté funcionando: abre `https://tu-backend.run.app/api/libros/`
3. Revisa los logs del backend en Cloud Run Console

### La página carga pero no muestra datos
**Soluciones**:
1. Abre la consola del navegador (F12) y busca errores
2. Verifica que la URL de la API sea correcta
3. Prueba la API directamente en el navegador

### Error: "Application failed to respond"
**Soluciones**:
1. Verifica que el puerto sea 3000 en el Dockerfile y en el workflow
2. Verifica que `output: 'standalone'` esté en next.config.ts
3. Revisa los logs en Cloud Run Console

---

## 📊 Comparación de Recursos

### Recursos Usados (Frontend)

| Recurso | Reutilizado del Backend | Nuevo |
|---------|-------------------------|-------|
| Proyecto GCP | ✅ Mismo | - |
| Cuenta de Servicio | ✅ Misma | - |
| GCP_SA_KEY Secret | ✅ Mismo | - |
| GCP_PROJECT_ID Secret | ✅ Mismo | - |
| Artifact Registry | ✅ Mismo | - |
| Cloud Run Service | - | ✅ Nuevo |
| GitHub Workflow | - | ✅ Nuevo |

**Total de nuevos recursos**: Solo 2 (Cloud Run Service + Workflow)

---

## 💰 Costos Estimados

**Cloud Run (Frontend):**
- Gratis hasta 2 millones de requests/mes
- Después: ~$0.40 por millón de requests
- Memoria: 512MB (~$0.50/mes para tráfico moderado)

**Artifact Registry:**
- Compartido con backend
- Costo adicional mínimo (~$0.05/mes)

**Total Adicional Estimado**: $0-2/mes para proyectos pequeños

---

## 🎯 Resumen de Diferencias con el Backend

### Backend requería:
1. ✅ Crear proyecto en GCP
2. ✅ Crear Cloud SQL + Base de datos
3. ✅ Crear usuario de BD
4. ✅ Crear cuenta de servicio
5. ✅ Crear Artifact Registry
6. ✅ Configurar 5-6 secrets en GitHub
7. ✅ Crear Dockerfile
8. ✅ Crear GitHub workflow

### Frontend solo requiere:
1. ✅ Crear Dockerfile (usando imagen de Node)
2. ✅ Crear GitHub workflow (reutiliza cuenta de servicio y registry)
3. ✅ Actualizar CORS del backend
4. ⚡ **Mucho más rápido y simple**

---

## 🔄 Actualizaciones Futuras

Para actualizar tu frontend en producción:

1. Haz cambios en tu código
2. Commit:
   ```bash
   git add .
   git commit -m "Update frontend features"
   git push origin main
   ```
3. GitHub Actions desplegará automáticamente

**Nota**: Solo se despliega si hay cambios en `frontend/**` o en el workflow.

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 🎉 ¡Felicidades!

Tu aplicación completa (Backend Django + Frontend Next.js) está ahora en producción en Google Cloud Run.

### URLs de tu aplicación:
- 🔵 **Backend API**: `https://libreria-backend-xxxxx.run.app/api`
- 🟢 **Frontend**: `https://libreria-frontend-xxxxx.run.app`

### Arquitectura final:
```
GitHub (código)
    ↓
GitHub Actions (CI/CD)
    ↓
Artifact Registry (imágenes Docker)
    ↓
┌─────────────────┐         ┌──────────────────┐
│  Cloud Run      │────────→│  Cloud Run       │
│  (Frontend)     │         │  (Backend)       │
│  Next.js        │         │  Django + API    │
└─────────────────┘         └──────────────────┘
                                    │
                                    ↓
                            ┌──────────────────┐
                            │  Cloud SQL       │
                            │  PostgreSQL      │
                            └──────────────────┘
```

**¡Todo está automatizado y listo para escalar!** 🚀
