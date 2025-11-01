# 🎨 Frontend - Boutique E-commerce

Frontend moderno construido con React, TypeScript, Vite y TailwindCSS.

## 🛠️ Stack Tecnológico

- **Framework**: React 18
- **Build Tool**: Vite 4
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Material-UI, HeadlessUI, Heroicons
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Markdown**: react-markdown

## 📁 Estructura del Proyecto

```
frontend/
├── public/               # Assets estáticos
│   └── config.js        # Configuración de entorno (runtime)
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas/Vistas
│   ├── services/       # Servicios API
│   ├── config/         # Configuración
│   │   ├── api.ts     # Endpoints de API
│   │   └── env.ts     # Variables de entorno
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript types
│   └── utils/         # Utilidades
├── Dockerfile         # Configuración de Docker
├── nginx.conf        # Configuración de Nginx
└── docker-entrypoint.sh  # Script de inicio
```

## 🚀 Desarrollo Local

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
cd frontend
npm install
```

### Variables de Entorno

Crear archivo `.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Boutique E-commerce
VITE_APP_VERSION=1.0.0
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

### Comandos Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Linter de TypeScript
npm run type-check # Verificación de tipos
```

## 🐳 Docker

### Build Local

```bash
docker build -t frontend .
```

### Ejecutar Localmente

```bash
docker run -p 8080:8080 \
  -e VITE_API_URL=http://localhost:8000 \
  frontend
```

## ☁️ Despliegue en Cloud Run

Ver documentación completa en: [FRONTEND_DEPLOY_GUIDE.md](../FRONTEND_DEPLOY_GUIDE.md)

### Despliegue Automático

Los cambios en `frontend/**` se despliegan automáticamente a Cloud Run mediante GitHub Actions.

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

### Verificar Despliegue

```bash
gcloud run services describe ecommerce-frontend --region us-central1
```

## 🔧 Configuración de Entorno

### Variables de Entorno

El frontend usa un sistema dual de configuración:

1. **Desarrollo** (`import.meta.env`): Variables de Vite
2. **Producción** (`window._env_`): Inyectadas en runtime

La clase `config` en `src/config/env.ts` maneja ambos casos automáticamente.

### Uso en el Código

```typescript
import { config } from '@/config/env';

// Usar configuración
const apiUrl = config.apiUrl;
const appName = config.appName;
```

## 📡 API Integration

### Configuración de API

Ver `src/config/api.ts` para todos los endpoints disponibles.

### Ejemplo de Uso

```typescript
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import axios from 'axios';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Hacer una llamada
const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
```

## 🎨 Estilizado

### TailwindCSS

Usa clases de Tailwind para estilizar:

```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

### Material-UI

Componentes de Material-UI disponibles:

```tsx
import { Button } from '@mui/material';

<Button variant="contained" color="primary">
  Click me
</Button>
```

## 🧪 Testing

```bash
npm run test
```

## 📦 Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/`.

## 🔍 Troubleshooting

### Error: "Cannot find module"

```bash
npm install
```

### Error de tipos TypeScript

```bash
npm run type-check
```

### Puerto en uso

Cambiar el puerto en `vite.config.ts`:

```typescript
server: {
  port: 3001,
}
```

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contribuir

1. Crear una rama: `git checkout -b feature/nueva-funcionalidad`
2. Commit cambios: `git commit -m "Add nueva funcionalidad"`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del sistema E-commerce.
