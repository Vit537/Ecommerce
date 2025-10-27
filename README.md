# Mi E-commerce Mejorado

Un sistema de e-commerce completo basado en las mejores características de Saleor, con un enfoque en productos, facturas de compra y venta, carrito de compras y métodos de pago.

## 🚀 Características

### Backend (FastAPI)
- **API RESTful** completa con FastAPI
- **Base de datos PostgreSQL** con esquema optimizado
- **Gestión de productos** con categorías y stock
- **Sistema de carrito** con persistencia por sesión
- **Facturas de compra y venta** automatizadas
- **Múltiples métodos de pago** (tarjeta, PayPal, transferencia, efectivo)
- **Control de inventario** con movimientos automáticos
- **Validación de datos** con Pydantic

### Frontend (React + TypeScript)
- **Interfaz moderna** con React y TypeScript
- **Diseño responsivo** con TailwindCSS
- **Componentes reutilizables** y modulares
- **Gestión de estado** eficiente
- **Experiencia de usuario** optimizada
- **Proceso de checkout** completo en 3 pasos

### Base de Datos
- **8 tablas principales** con relaciones optimizadas
- **UUIDs** como claves primarias
- **Triggers automáticos** para control de inventario
- **Campos JSONB** para configuraciones flexibles
- **Índices optimizados** para consultas rápidas

### Backend (API Simplificado)
- 🐍 **Python/FastAPI** (más moderno que Django)
- 🗄️ **PostgreSQL** para datos principales
- ⚡ **Redis** para cache y sesiones
- 🔐 **JWT Authentication**
- 📡 **GraphQL + REST API**

## 🏗️ Estructura del Proyecto

```
mi-ecommerce-mejorado/
├── frontend/          # Storefront con Next.js
├── dashboard/         # Panel admin con React
├── backend/           # API con FastAPI
├── shared/            # Componentes y utilidades compartidas
└── docs/              # Documentación
```

## 🚀 Empezar

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