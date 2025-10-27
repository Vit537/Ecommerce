# 🛍️ E-Commerce Completo con Machine Learning

Sistema de e-commerce moderno con backend Django + PostgreSQL, frontend React/TypeScript, y modelos de Machine Learning para predicciones inteligentes.

## 🚀 Características Principales

### 🎯 Backend (Django REST Framework)
- ✅ **API RESTful completa** con Django REST Framework
- ✅ **PostgreSQL** con modelos optimizados
- ✅ **Sistema de autenticación** con JWT
- ✅ **Gestión de productos** con variantes (tallas, colores)
- ✅ **Sistema de órdenes** completo (carrito, checkout, pagos)
- ✅ **Sistema de roles y permisos** granular
- ✅ **Facturación** automatizada
- ✅ **Machine Learning** para predicciones de ventas
- ✅ **Chatbot asistente** con IA (Groq/OpenAI)
- ✅ **Reportes** con gráficos y exportación

### 💻 Frontend (React + TypeScript)
- ✅ **Interfaz moderna** con React 18 + TypeScript
- ✅ **Diseño responsivo** con TailwindCSS
- ✅ **Gestión de estado** con Context API
- ✅ **Rutas protegidas** con React Router
- ✅ **Componentes reutilizables**
- ✅ **Carrito de compras** persistente
- ✅ **Panel de administración** completo

### 📱 Mobile (Flutter)
- ✅ **App nativa** con Flutter
- ✅ **Multiplataforma** (iOS y Android)
- ✅ **Diseño Material**

### 🤖 Machine Learning
- ✅ **Predicción de demanda** de productos
- ✅ **Recomendaciones** personalizadas
- ✅ **Análisis de tendencias**
- ✅ **Forecasting** de ventas

### 🗄️ Base de Datos
- ✅ **PostgreSQL** con modelos relacionales
- ✅ **UUIDs** como claves primarias
- ✅ **Campos JSON** para flexibilidad
- ✅ **Índices optimizados**

## 🏗️ Estructura del Proyecto

```
mi-ecommerce-mejorado/
├── backend_django/           # 🐍 Backend Django + DRF
│   ├── authentication/       # Sistema de usuarios y autenticación
│   ├── products/            # Gestión de productos y variantes
│   ├── orders/              # Órdenes, pagos y facturas
│   ├── cart/                # Carrito de compras
│   ├── permissions/         # Sistema de roles y permisos
│   ├── employees/           # Gestión de empleados
│   ├── ml_predictions/      # Modelos de Machine Learning
│   ├── assistant/           # Chatbot con IA
│   ├── reports/             # Reportes y analytics
│   └── core/                # Configuración principal
│
├── frontend/                 # ⚛️ Frontend React + TypeScript
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios API
│   │   └── contexts/       # Context API
│   └── public/             # Archivos estáticos
│
├── mobile_flutter/          # 📱 App móvil Flutter
│   ├── lib/
│   │   ├── screens/        # Pantallas
│   │   ├── widgets/        # Widgets
│   │   └── services/       # Servicios
│   └── assets/             # Recursos
│
├── .github/                 # 🔄 CI/CD con GitHub Actions
│   └── workflows/          # Workflows de despliegue
│
└── docs/                    # 📚 Documentación
    ├── backend/            # Docs del backend
    ├── frontend/           # Docs del frontend
    └── api/                # Documentación de API

```

## 🚀 Despliegue

### Backend en Google Cloud Run

El backend está **completamente configurado** para despliegue automático en Google Cloud Run.

**📖 Ver guía completa:** [`backend_django/DEPLOYMENT_CHECKLIST.md`](./backend_django/DEPLOYMENT_CHECKLIST.md)

**Pasos rápidos:**

1. **Configurar secrets en GitHub** (ver datos.txt)
2. **Push a GitHub**
   ```bash
   git push origin main
   ```
3. **¡Listo!** El workflow desplegará automáticamente

**Archivos importantes:**
- ✅ `Dockerfile` - Configuración Docker
- ✅ `docker-entrypoint.sh` - Inicialización automática
- ✅ `.github/workflows/backend-deploy.yml` - CI/CD
- ✅ Scripts de datos de prueba incluidos

### Frontend & Mobile
Ver guías específicas en cada directorio.

## 📊 Datos de Prueba

El sistema carga automáticamente datos de prueba en el primer despliegue:

### Usuarios
```
Super Admin: superadmin@boutique.com / admin123
Admin:       admin@boutique.com / admin123
Cajero:      cajero@boutique.com / cajero123
Gerente:     gerente@boutique.com / gerente123
Clientes:    *.@email.com / cliente123
```

### Datos Incluidos
- ✅ 10+ productos con variantes (tallas y colores)
- ✅ Categorías completas (Ropa, Calzado, Accesorios)
- ✅ Marcas reconocidas (Nike, Adidas, Zara, H&M, etc.)
- ✅ Órdenes de prueba
- ✅ Sistema de permisos y roles
- ✅ (Opcional) Datos históricos para ML (18 meses)

## 🤖 Machine Learning

El sistema incluye modelos de ML pre-entrenables:

### Características
- **Predicción de demanda**: Predice ventas futuras de productos
- **Recomendaciones**: Sugerencias personalizadas por cliente
- **Análisis de tendencias**: Detecta patrones de compra
- **Forecasting**: Proyecciones de ventas

### Entrenar Modelos
```bash
# Después de cargar datos ML
python manage.py train_ml_models
```

## 🛠️ Tecnologías

### Backend
- Python 3.11
- Django 5.2.7
- Django REST Framework 3.16
- PostgreSQL 15
- JWT Authentication
- Gunicorn
- WhiteNoise

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Vite
- React Router
- Axios

### Mobile
- Flutter
- Dart
- Material Design

### ML & AI
- scikit-learn
- pandas
- numpy
- Groq API
- OpenAI API

### DevOps
- Docker
- Google Cloud Run
- Cloud SQL
- Artifact Registry
- GitHub Actions

## 📚 Documentación

### Backend
- [`BACKEND_EXECUTIVE_SUMMARY.md`](./BACKEND_EXECUTIVE_SUMMARY.md) - Resumen ejecutivo
- [`backend_django/DEPLOYMENT_CHECKLIST.md`](./backend_django/DEPLOYMENT_CHECKLIST.md) - Checklist de despliegue
- [`backend_django/READY_TO_DEPLOY.md`](./backend_django/READY_TO_DEPLOY.md) - Guía completa
- [`backend_django/CONFIGURATION_STATUS.md`](./backend_django/CONFIGURATION_STATUS.md) - Estado de configuración

### API
- `/api/` - Documentación interactiva de API
- `/admin/` - Panel de administración Django

## 🔐 Seguridad

- ✅ JWT tokens con refresh
- ✅ Permisos granulares por rol
- ✅ CORS configurado
- ✅ CSRF protection
- ✅ HTTPS en producción
- ✅ Variables de entorno para secrets
- ✅ Rate limiting
- ✅ Input validation

## 🎯 Características Destacadas

### Sistema de Variantes
Los productos tienen variantes completas:
- **Tallas**: XS, S, M, L, XL, XXL, 36-44
- **Colores**: 14 colores disponibles
- **Stock**: Control independiente por variante
- **Precios**: Ajustes por variante

### Sistema de Órdenes
Flujo completo de compra:
- **Carrito**: Persistente (usuario + sesión)
- **Checkout**: 3 pasos (dirección, pago, confirmación)
- **Métodos de pago**: Efectivo, tarjetas, transferencia, QR
- **Estados**: Pendiente → Confirmado → Procesando → Enviado → Entregado
- **Facturación**: Automática con número único

### Sistema de Roles
4 roles predefinidos:
- **Admin**: Acceso total
- **Gerente**: Gestión de tienda
- **Cajero**: Ventas y clientes
- **Cliente**: Compras online

### Reportes
- Ventas por período
- Productos más vendidos
- Clientes frecuentes
- Análisis de inventario
- Exportación a Excel/PDF

## 🚧 Roadmap

- [ ] Notificaciones push
- [ ] Integración con pasarelas de pago
- [ ] Sistema de cupones y descuentos
- [ ] Programa de lealtad
- [ ] Multi-idioma
- [ ] Multi-moneda
- [ ] Integración con envíos
- [ ] Analytics avanzado

## 👥 Contribuir

Este es un proyecto académico. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de uso académico.

## 📞 Contacto

Para preguntas sobre el proyecto, consulta la documentación en `/docs`.

---

**Estado**: ✅ Backend listo para desplegar | ⏳ Frontend en desarrollo | ⏳ Mobile en desarrollo

**Última actualización**: Octubre 2025


1. Clone este repositorio
2. Instale dependencias: `npm install`
3. Configure variables de entorno
4. Ejecute: `npm run dev`

## 🎨 Mejoras sobre Saleor original

- ✨ Interfaz más moderna y limpia
- 🚀 Mayor rendimiento
- 📱 Mejor experiencia móvil
- 🎯 Configuración simplificada
- 🛠️ Arquitectura más modular