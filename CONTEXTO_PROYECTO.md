# 🎯 CONTEXTO DEL PROYECTO - SPORTSWEAR E-COMMERCE

> **Este documento es ESENCIAL para mantener la coherencia del proyecto en cualquier nueva implementación**

---

## 📋 RESUMEN EJECUTIVO

**Nombre del Proyecto:** SPORTSWEAR E-commerce  
**Tipo:** Sistema de comercio electrónico para ropa deportiva  
**Estilo de Diseño:** Minimalista - Monocromático (Negro/Blanco/Gris)  
**Stack Tecnológico:** React + TypeScript + Django REST Framework  
**Sistema de Estilos:** Tailwind CSS + Material-UI (MUI)

---

## 🎨 IDENTIDAD VISUAL Y DISEÑO

### Paleta de Colores (OBLIGATORIA)

```typescript
// COLORES PRINCIPALES
primary: {
  main: '#1a1a1a',      // Negro principal - Botones, textos principales
  dark: '#000000',      // Negro puro - Estados hover, énfasis
  light: '#2d2d2d',     // Gris oscuro - Backgrounds sutiles
}

secondary: {
  main: '#f5f5f5',      // Gris muy claro - Backgrounds secundarios
  dark: '#e8e8e8',      // Gris claro - Bordes sutiles
  light: '#fafafa',     // Casi blanco - Backgrounds principales
}

accent: {
  main: '#d4af37',      // Dorado elegante - Elementos destacados
  hover: '#c09e2f',     // Dorado hover - Estados interactivos
}

// GRISES SISTEMA (Escala completa)
gray: {
  50: '#fafafa',   // Más claro
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',  // Para bordes visibles
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',  // Más oscuro
}

// COLORES FUNCIONALES (Status)
success: '#4caf50'   // Verde - Confirmaciones
warning: '#ff9800'   // Naranja - Advertencias
error: '#f44336'     // Rojo - Errores
info: '#2196f3'      // Azul - Información
```

### Tipografía

```css
/* Fuentes del Sistema */
heading: 'Poppins', sans-serif     /* Para títulos (h1-h6) */
body: 'Inter', sans-serif           /* Para texto general */

/* Pesos de Fuente */
light: 300
regular: 400
medium: 500
semibold: 600
bold: 700

/* Tamaños Comunes */
text-xs: 0.75rem    (12px)  /* Etiquetas pequeñas */
text-sm: 0.875rem   (14px)  /* Texto secundario */
text-base: 1rem     (16px)  /* Texto principal */
text-lg: 1.125rem   (18px)  /* Destacados */
text-xl: 1.25rem    (20px)  /* Subtítulos */
text-2xl: 1.5rem    (24px)  /* Títulos */
text-3xl: 1.875rem  (30px)  /* Títulos grandes */
```

### Principios de Diseño

1. **MINIMALISMO ESTRICTO**
   - Espacios en blanco generosos
   - Borders sutiles (`border-gray-300`)
   - Shadows mínimos o inexistentes
   - Decoraciones solo cuando sean funcionales

2. **MONOCROMÁTICO**
   - Negro para elementos principales
   - Blanco/Gris para backgrounds
   - Colores funcionales solo para estados (success, error, warning)
   - Dorado accent SOLO para elementos premium o destacados

3. **FORMAS Y ESPACIADOS**
   - Bordes rectangulares o ligeramente redondeados (`rounded-lg` máximo)
   - Padding compacto pero respirable (`p-4`, `p-6`, `p-8`)
   - Gaps consistentes (`gap-4`, `gap-6`)
   - Margins mínimos, preferir gaps

4. **TIPOGRAFÍA**
   - Títulos en uppercase con `tracking-wider` para énfasis
   - Texto en lowercase/normal para lectura
   - Font weights semibold/bold solo para destacar
   - Jerarquía visual clara (h1 > h2 > h3 > body)

5. **INTERACCIONES**
   - Hover: `bg-black` o `border-black`
   - Focus: `border-black` con `ring-0` (sin outline azul)
   - Active/Selected: `bg-black text-white`
   - Disabled: `opacity-50 cursor-not-allowed`

---

## 🔌 CONFIGURACIÓN BACKEND

### Base URL y Entornos

**Archivo:** `frontend/src/config/env.ts`

```typescript
// Configuración automática Desarrollo/Producción
export const config = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8000'),
  appName: 'SPORTSWEAR',
  appVersion: '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

**Entornos:**
- **Desarrollo:** `http://localhost:8000`
- **Producción:** Se inyecta dinámicamente desde `window._env_`

### Configuración de API

**Archivo:** `frontend/src/config/api.ts`

```typescript
export const API_CONFIG = {
  BASE_URL: config.apiUrl,        // Base URL dinámica
  API_PREFIX: '/api',              // Prefijo para todos los endpoints
  TIMEOUT: 30000,                  // 30 segundos
};

// URL completa: {BASE_URL}/api/{endpoint}
// Ejemplo: http://localhost:8000/api/products/
```

### Endpoints Disponibles

```typescript
API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
    ME: '/auth/me/',
    REFRESH: '/auth/token/refresh/',
  },
  
  // Productos
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (id) => `/products/${id}/`,
    CREATE: '/products/',
    UPDATE: (id) => `/products/${id}/`,
    DELETE: (id) => `/products/${id}/`,
    CATEGORIES: '/products/categories/',
  },
  
  // Carrito
  CART: {
    GET: '/cart/',
    ADD_ITEM: '/cart/items/',
    UPDATE_ITEM: (id) => `/cart/items/${id}/`,
    REMOVE_ITEM: (id) => `/cart/items/${id}/`,
    CLEAR: '/cart/clear/',
  },
  
  // Órdenes
  ORDERS: {
    LIST: '/orders/',
    DETAIL: (id) => `/orders/${id}/`,
    CREATE: '/orders/',
    UPDATE: (id) => `/orders/${id}/`,
    CANCEL: (id) => `/orders/${id}/cancel/`,
  },
  
  // Reportes
  REPORTS: {
    DYNAMIC: '/reports/dynamic/',
    MANUAL: '/reports/manual/',
    PREVIEW_DYNAMIC: '/reports/preview/dynamic/',
    PREVIEW_MANUAL: '/reports/preview/manual/',
  },
  
  // Empleados
  EMPLOYEES: {
    LIST: '/employees/',
    DETAIL: (id) => `/employees/${id}/`,
    CREATE: '/employees/',
    UPDATE: (id) => `/employees/${id}/`,
  },
  
  // Usuarios
  USERS: {
    LIST: '/auth/users/',
    DETAIL: (id) => `/auth/users/${id}/`,
    ME: '/auth/me/',
  },
};
```

---

## 🛠️ SERVICIOS (SERVICES)

### Estructura de Servicios

**Ubicación:** `frontend/src/services/`

Todos los servicios siguen el mismo patrón:

```typescript
// Ejemplo: productService.ts
import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Product {
  id: string;
  name: string;
  // ... más propiedades
}

class ProductService {
  // GET - Listar
  async getProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
  }
  
  // GET - Detalle
  async getProduct(id: string): Promise<Product> {
    return apiService.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }
  
  // POST - Crear
  async createProduct(data: CreateProductDTO): Promise<Product> {
    return apiService.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  }
  
  // PUT - Actualizar
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    return apiService.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  }
  
  // DELETE - Eliminar
  async deleteProduct(id: string): Promise<void> {
    return apiService.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }
}

export const productService = new ProductService();
```

### ApiService Base

**Archivo:** `frontend/src/services/apiService.ts`

```typescript
class ApiService {
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request: Agregar token automáticamente
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response: Manejar errores 401 (token expirado)
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Métodos HTTP
  async get<T>(url: string): Promise<T>
  async post<T>(url: string, data: any): Promise<T>
  async put<T>(url: string, data: any): Promise<T>
  async delete<T>(url: string): Promise<T>
}

export const apiService = new ApiService();
```

### Servicios Disponibles

- ✅ `authService.ts` - Autenticación y autorización
- ✅ `productService.ts` - Gestión de productos
- ✅ `categoryService.ts` - Gestión de categorías
- ✅ `cartService.ts` - Carrito de compras
- ✅ `orderService.ts` - Órdenes de compra
- ✅ `userService.ts` - Gestión de usuarios
- ✅ `employeeService.ts` - Gestión de empleados
- ✅ `reportService.ts` - Reportes dinámicos y manuales
- ✅ `mlService.ts` - Predicciones con Machine Learning
- ✅ `assistantService.ts` - Asistente virtual

---

## 🗺️ RUTAS Y NAVEGACIÓN

### Configuración de Rutas

**Archivo:** `frontend/src/App.tsx`

```typescript
<Routes>
  {/* Ruta Pública */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Rutas Admin - Requiere rol: admin o gerente */}
  <Route path="/admin" element={
    <ProtectedRoute allowedRoles={['admin', 'gerente']}>
      <AdminNavbar />
    </ProtectedRoute>
  } />
  
  <Route path="/admin/dashboard" element={
    <ProtectedRoute allowedRoles={['admin', 'gerente']}>
      <AdminNavbar />
    </ProtectedRoute>
  } />
  
  <Route path="/admin/products" element={
    <ProtectedRoute allowedRoles={['admin', 'gerente']}>
      <ProductsManagement />
    </ProtectedRoute>
  } />
  
  <Route path="/admin/categories" element={
    <ProtectedRoute allowedRoles={['admin', 'gerente']}>
      <CategoriesManagement />
    </ProtectedRoute>
  } />
  
  <Route path="/admin/reports" element={
    <ProtectedRoute allowedRoles={['admin', 'gerente']}>
      <ReportsPage />
    </ProtectedRoute>
  } />
  
  {/* Rutas Cajero - Requiere rol: cajero */}
  <Route path="/cashier" element={
    <ProtectedRoute allowedRoles={['cajero']}>
      <CashierLayout />
    </ProtectedRoute>
  } />
  
  {/* Rutas Cliente - Requiere rol: cliente */}
  <Route path="/shop" element={
    <ProtectedRoute allowedRoles={['cliente']}>
      <CustomerLayout />
    </ProtectedRoute>
  } />
  
  <Route path="/checkout" element={
    <ProtectedRoute allowedRoles={['cliente']}>
      <CheckoutPage />
    </ProtectedRoute>
  } />
  
  {/* Ruta de Perfil - Cualquier usuario autenticado */}
  <Route path="/profile" element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  } />
  
  {/* Redirección por defecto */}
  <Route path="/" element={<Navigate to="/login" replace />} />
</Routes>
```

### Sistema de Roles

```typescript
// Roles disponibles
type UserRole = 'admin' | 'gerente' | 'cajero' | 'cliente';

// ProtectedRoute Component
<ProtectedRoute 
  allowedRoles={['admin', 'gerente']}  // Array de roles permitidos
>
  {children}
</ProtectedRoute>

// Si el usuario no tiene el rol requerido:
// → Redirige a /unauthorized
```

---

## 📁 ESTRUCTURA DE CARPETAS

### Frontend

```
frontend/src/
├── components/              # Componentes reutilizables
│   ├── admin/              # Componentes de administración
│   │   ├── Navbar/         # Navbar del admin
│   │   └── ...
│   ├── cashier/            # Componentes de cajero
│   │   └── POS/            # Sistema punto de venta
│   ├── customer/           # Componentes de cliente
│   │   └── Shop/           # Tienda para clientes
│   ├── cart/               # Componentes de carrito
│   └── ProductCard.tsx     # Tarjeta de producto
│
├── pages/                   # Páginas completas (vistas)
│   ├── admin/              # Páginas de administración
│   │   ├── ProductsManagementGrid.tsx
│   │   ├── CategoriesManagementTable.tsx
│   │   └── ReportsPage.tsx
│   ├── LoginPage.tsx       # Página de login
│   ├── UserProfile.tsx     # Perfil de usuario
│   └── CheckoutPage.tsx    # Proceso de compra
│
├── services/               # Lógica de comunicación con API
│   ├── apiService.ts       # Servicio base con axios
│   ├── authService.ts      # Autenticación
│   ├── productService.ts   # Productos
│   ├── cartService.ts      # Carrito
│   ├── orderService.ts     # Órdenes
│   └── reportService.ts    # Reportes
│
├── config/                 # Configuración del proyecto
│   ├── env.ts             # Variables de entorno
│   └── api.ts             # Configuración de API y endpoints
│
├── contexts/              # Contextos de React
│   ├── AuthContext.tsx    # Contexto de autenticación
│   ├── CartContext.tsx    # Contexto de carrito
│   └── ThemeContext.tsx   # Contexto de tema
│
├── theme/                 # Configuración de tema
│   └── sportswearTheme.ts # Tema MUI personalizado
│
├── types/                 # Definiciones TypeScript
│   └── index.ts
│
├── utils/                 # Utilidades y helpers
│   └── formatters.ts
│
└── App.tsx                # Punto de entrada con rutas
```

### Convenciones de Nombres

```
Componentes:      PascalCase.tsx        (ProductCard.tsx)
Páginas:          PascalCase.tsx        (LoginPage.tsx)
Servicios:        camelCase.ts          (productService.ts)
Tipos:            PascalCase            (interface Product)
Hooks:            useCamelCase.ts       (useAuth.ts)
Contextos:        PascalCaseContext.tsx (AuthContext.tsx)
```

---

## 🎨 GUÍA DE IMPLEMENTACIÓN VISUAL

### Ejemplo: Crear una Nueva Página Admin

```tsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/Navbar/AdminNavbar';
import { newService } from '../../services/newService';

const NewFeaturePage: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await newService.getData();
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar del Admin */}
      <AdminNavbar />
      
      {/* Contenedor principal */}
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
              TÍTULO DE LA PÁGINA
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Descripción breve de la funcionalidad
            </p>
          </div>
          
          {/* Contenido principal */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Contenido aquí */}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default NewFeaturePage;
```

### Componentes Comunes

#### Botón Principal

```tsx
<button className="
  px-6 py-2.5 
  bg-black text-white 
  text-sm font-semibold 
  uppercase tracking-wider
  border border-black
  hover:bg-gray-900
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
">
  TEXTO BOTÓN
</button>
```

#### Botón Secundario

```tsx
<button className="
  px-6 py-2.5 
  bg-white text-black 
  text-sm font-semibold 
  uppercase tracking-wider
  border border-gray-300
  hover:border-black
  transition-colors
">
  TEXTO BOTÓN
</button>
```

#### Input de Texto

```tsx
<input
  type="text"
  className="
    w-full px-4 py-2.5
    text-sm
    border border-gray-300
    rounded-lg
    focus:outline-none focus:border-black
    transition-colors
  "
  placeholder="Placeholder..."
/>
```

#### Select/Dropdown

```tsx
<select className="
  w-full px-4 py-2.5
  text-sm
  border border-gray-300
  rounded-lg
  focus:outline-none focus:border-black
  bg-white
  cursor-pointer
">
  <option value="">Seleccionar...</option>
  <option value="1">Opción 1</option>
</select>
```

#### Tarjeta/Card

```tsx
<div className="
  bg-white 
  border border-gray-300 
  rounded-lg 
  p-6
  hover:border-gray-400
  transition-colors
">
  {/* Contenido */}
</div>
```

#### Tabla

```tsx
<div className="overflow-x-auto border border-gray-300 rounded-lg">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-300">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
          Columna 1
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
          Columna 2
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-900">Dato 1</td>
        <td className="px-4 py-3 text-sm text-gray-900">Dato 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Modal/Dialog

```tsx
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Overlay */}
    <div 
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={() => setShowModal(false)}
    />
    
    {/* Modal */}
    <div className="relative bg-white rounded-lg border border-gray-300 max-w-md w-full mx-4 p-6">
      <h2 className="text-xl font-semibold text-black uppercase tracking-wider mb-4">
        TÍTULO MODAL
      </h2>
      
      <div className="mb-6">
        {/* Contenido del modal */}
      </div>
      
      <div className="flex gap-3 justify-end">
        <button className="px-4 py-2 text-sm border border-gray-300 hover:border-black">
          CANCELAR
        </button>
        <button className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-900">
          CONFIRMAR
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 🚨 REGLAS CRÍTICAS

### ⛔ NUNCA HACER

1. ❌ **NO uses colores fuera de la paleta definida**
   - Nada de azules, verdes, morados personalizados
   - Solo negro, blanco, gris y los funcionales (success, error, warning)

2. ❌ **NO uses bordes redondeados excesivos**
   - Máximo `rounded-lg` (0.5rem)
   - Nunca `rounded-full` excepto para avatares/badges circulares

3. ❌ **NO ignores la autenticación**
   - Siempre verifica el token antes de hacer requests
   - Usa `apiService` que maneja esto automáticamente

4. ❌ **NO crees endpoints hardcodeados**
   - Usa siempre `API_ENDPOINTS` de `config/api.ts`
   - Nunca escribas URLs directamente en componentes

5. ❌ **NO uses Material-UI sin personalizar**
   - Siempre aplica el tema `sportswearTheme`
   - O mejor aún, usa Tailwind para mantener consistencia

6. ❌ **NO mezcles estilos**
   - Si usas Tailwind, mantente en Tailwind
   - Si usas MUI, aplica el tema consistentemente

### ✅ SIEMPRE HACER

1. ✅ **Usa los servicios existentes**
   - `authService` para autenticación
   - `apiService` como base para nuevos servicios
   - Sigue el patrón establecido

2. ✅ **Aplica el diseño minimalista**
   - Espacios en blanco generosos
   - Borders sutiles
   - Colores monocromáticos

3. ✅ **Maneja estados de carga**
   - Loading spinner durante requests
   - Mensajes de error claros
   - Estados vacíos informativos

4. ✅ **Valida permisos**
   - Usa `ProtectedRoute` para rutas
   - Verifica roles en el backend también

5. ✅ **Documenta interfaces TypeScript**
   - Define tipos para respuestas de API
   - Usa interfaces claras y descriptivas

---

## 🔄 FLUJO DE TRABAJO ESTÁNDAR

### 1. Crear un Nuevo Feature

```bash
# 1. Crear servicio (si es necesario)
frontend/src/services/newFeatureService.ts

# 2. Definir tipos TypeScript
# En el mismo archivo del servicio

# 3. Crear componente/página
frontend/src/pages/admin/NewFeaturePage.tsx

# 4. Agregar ruta en App.tsx
<Route path="/admin/new-feature" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <NewFeaturePage />
  </ProtectedRoute>
} />

# 5. Agregar link en AdminNavbar (si aplica)
```

### 2. Conectar con Backend

```typescript
// 1. Agregar endpoint en config/api.ts
export const API_ENDPOINTS = {
  // ...existentes
  NEW_FEATURE: {
    LIST: '/new-feature/',
    DETAIL: (id: string) => `/new-feature/${id}/`,
    CREATE: '/new-feature/',
  },
};

// 2. Crear servicio
import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

class NewFeatureService {
  async getData() {
    return apiService.get(API_ENDPOINTS.NEW_FEATURE.LIST);
  }
}

export const newFeatureService = new NewFeatureService();

// 3. Usar en componente
const data = await newFeatureService.getData();
```

### 3. Aplicar Diseño

```tsx
// 1. Estructura base
<div className="min-h-screen bg-gray-50 pt-20">
  <div className="max-w-7xl mx-auto px-4 py-6">
    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
        TÍTULO
      </h1>
    </div>
    
    {/* Contenido */}
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      {/* Tu contenido aquí */}
    </div>
  </div>
</div>

// 2. Botones
<button className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase">
  ACCIÓN
</button>

// 3. Inputs
<input className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black" />
```

---

## 📚 RECURSOS Y REFERENCIAS

### Archivos Clave para Consultar

1. **Diseño Visual**
   - `frontend/src/theme/sportswearTheme.ts` - Tema MUI completo
   - `frontend/tailwind.config.js` - Configuración Tailwind
   - `frontend/src/pages/admin/ReportsPage.tsx` - Ejemplo de diseño minimalista

2. **Configuración Backend**
   - `frontend/src/config/env.ts` - Variables de entorno
   - `frontend/src/config/api.ts` - Endpoints y configuración

3. **Servicios**
   - `frontend/src/services/apiService.ts` - Servicio base
   - `frontend/src/services/productService.ts` - Ejemplo de servicio completo

4. **Rutas y Autenticación**
   - `frontend/src/App.tsx` - Configuración de rutas
   - `frontend/src/contexts/AuthContext.tsx` - Lógica de autenticación

### Comandos Útiles

```bash
# Desarrollo
cd frontend
npm run dev              # Inicia frontend en localhost:3000

cd backend_django
python manage.py runserver  # Inicia backend en localhost:8000

# Build para producción
cd frontend
npm run build            # Genera carpeta dist/

# Linters
npm run lint             # Verifica código
npm run format           # Formatea código
```

---

## 🎯 CHECKLIST PARA NUEVOS FEATURES

Antes de considerar un feature completo, verifica:

- [ ] Usa la paleta de colores oficial (negro/blanco/gris)
- [ ] Sigue el diseño minimalista (borders sutiles, espacios generosos)
- [ ] Usa `apiService` para comunicación con backend
- [ ] Define endpoints en `config/api.ts`
- [ ] Crea interfaces TypeScript para tipos
- [ ] Implementa manejo de errores
- [ ] Agrega estados de carga
- [ ] Protege rutas con `ProtectedRoute` si es necesario
- [ ] Usa componentes reutilizables cuando sea posible
- [ ] Mantiene consistencia tipográfica (uppercase para títulos/botones)
- [ ] Responsive design (mobile-first con Tailwind)
- [ ] Accesibilidad básica (labels, aria-labels)

---

## 💡 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Vista de Métodos de Pago

```tsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/Navbar/AdminNavbar';
import { paymentService } from '../../services/paymentService';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  is_active: boolean;
  icon?: string;
}

const PaymentMethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentMethods();
      setMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
                MÉTODOS DE PAGO
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona los métodos de pago disponibles
              </p>
            </div>
            
            <button className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-900">
              AGREGAR MÉTODO
            </button>
          </div>
          
          {/* Grid de métodos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
              </div>
            ) : (
              methods.map((method) => (
                <div 
                  key={method.id}
                  className="bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black uppercase">
                      {method.name}
                    </h3>
                    <span className={`
                      px-2 py-1 text-xs font-semibold uppercase
                      ${method.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {method.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Tipo: {method.type.replace('_', ' ')}
                  </p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 text-sm border border-gray-300 hover:border-black transition-colors">
                      EDITAR
                    </button>
                    <button className="px-4 py-2 text-sm text-red-600 border border-red-300 hover:border-red-600 transition-colors">
                      ELIMINAR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default PaymentMethodsPage;
```

### Ejemplo 2: Servicio para Métodos de Pago

```typescript
// frontend/src/services/paymentService.ts

import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  is_active: boolean;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodDTO {
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  is_active?: boolean;
  icon?: string;
}

class PaymentService {
  /**
   * Obtiene todos los métodos de pago
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiService.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENTS.METHODS);
  }

  /**
   * Crea un nuevo método de pago
   */
  async createPaymentMethod(data: CreatePaymentMethodDTO): Promise<PaymentMethod> {
    return apiService.post<PaymentMethod>(API_ENDPOINTS.PAYMENTS.METHODS, data);
  }

  /**
   * Actualiza un método de pago existente
   */
  async updatePaymentMethod(id: string, data: Partial<CreatePaymentMethodDTO>): Promise<PaymentMethod> {
    return apiService.put<PaymentMethod>(`${API_ENDPOINTS.PAYMENTS.METHODS}${id}/`, data);
  }

  /**
   * Elimina un método de pago
   */
  async deletePaymentMethod(id: string): Promise<void> {
    return apiService.delete(`${API_ENDPOINTS.PAYMENTS.METHODS}${id}/`);
  }
}

export const paymentService = new PaymentService();
```

---

## 🎨 PALETA VISUAL COMPLETA

### Fondos (Backgrounds)

```css
/* Principales */
bg-white          /* Fondo principal de cards/modals */
bg-gray-50        /* Fondo de página general */
bg-gray-100       /* Fondo hover sutil */
bg-black          /* Botones primarios, headers destacados */

/* Estados */
hover:bg-gray-50   /* Hover en filas de tabla */
hover:bg-gray-900  /* Hover en botones negros */
focus:bg-white     /* Focus en inputs */
```

### Bordes (Borders)

```css
/* Principales */
border-gray-300    /* Borde estándar (visible pero sutil) */
border-gray-200    /* Borde muy sutil */
border-black       /* Borde destacado/focus */

/* Estados */
hover:border-black    /* Hover en cards/inputs */
focus:border-black    /* Focus en inputs */
border-red-300        /* Error state */
border-green-300      /* Success state */
```

### Textos (Text)

```css
/* Principales */
text-black         /* Texto principal */
text-gray-900      /* Texto importante */
text-gray-600      /* Texto secundario */
text-gray-500      /* Texto deshabilitado/placeholder */
text-white         /* Texto en fondos oscuros */

/* Funcionales */
text-red-600       /* Errores */
text-green-600     /* Éxito */
text-orange-600    /* Advertencias */
text-blue-600      /* Información */
```

### Badges/Estados

```css
/* Success */
bg-green-100 text-green-800    /* Activo, Completado, Disponible */

/* Warning */
bg-orange-100 text-orange-800  /* Pendiente, En proceso */

/* Error */
bg-red-100 text-red-800        /* Error, Cancelado, Agotado */

/* Neutral */
bg-gray-100 text-gray-800      /* Inactivo, Deshabilitado */

/* Info */
bg-blue-100 text-blue-800      /* Información, Nueva */
```

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### Flujo de Autenticación

1. **Login:**
   ```typescript
   const { email, password } = loginForm;
   const response = await authService.login(email, password);
   
   // authService guarda automáticamente:
   // - localStorage.setItem('token', response.token)
   // - localStorage.setItem('user', JSON.stringify(response.user))
   ```

2. **Requests Autenticados:**
   ```typescript
   // apiService automáticamente agrega el header:
   // Authorization: Bearer {token}
   
   // Simplemente usa los servicios normalmente:
   const products = await productService.getProducts();
   ```

3. **Token Expirado:**
   ```typescript
   // Si el backend retorna 401:
   // - apiService limpia localStorage automáticamente
   // - AuthContext detecta cambio y actualiza estado
   // - Usuario es redirigido a /login
   ```

4. **Verificar Rol:**
   ```typescript
   const { user } = useAuth();
   const userRole = user?.role || 'cliente';
   
   if (userRole === 'admin') {
     // Mostrar funcionalidad admin
   }
   ```

### Protección de Rutas

```typescript
// Cualquier usuario autenticado
<ProtectedRoute>
  <ProfilePage />
</ProtectedRoute>

// Solo admin
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// Admin o Gerente
<ProtectedRoute allowedRoles={['admin', 'gerente']}>
  <ReportsPage />
</ProtectedRoute>

// Solo cajero
<ProtectedRoute allowedRoles={['cajero']}>
  <POSSystem />
</ProtectedRoute>
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints (Tailwind)

```css
sm:   640px   /* Tablet pequeña */
md:   768px   /* Tablet */
lg:   1024px  /* Desktop pequeño */
xl:   1280px  /* Desktop */
2xl:  1536px  /* Desktop grande */
```

### Patrón Mobile-First

```tsx
{/* Mobile: 1 columna, Tablet: 2, Desktop: 3 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

{/* Padding responsive */}
<div className="px-4 md:px-6 lg:px-8">
  {/* Contenido */}
</div>

{/* Font size responsive */}
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Título
</h1>

{/* Hide en mobile, show en desktop */}
<div className="hidden lg:block">
  {/* Contenido solo desktop */}
</div>

{/* Show en mobile, hide en desktop */}
<div className="block lg:hidden">
  {/* Contenido solo mobile */}
</div>
```

---

## 🎯 TIPS FINALES

1. **Antes de preguntar a IA:**
   - Lee este documento completo
   - Revisa archivos de ejemplo (ReportsPage.tsx, ProductsManagementGrid.tsx)
   - Verifica que los colores/estilos coincidan con la paleta

2. **Al crear algo nuevo:**
   - Copia la estructura de un archivo similar existente
   - Reemplaza solo la lógica específica
   - Mantén el diseño visual idéntico

3. **Al integrar con backend:**
   - Siempre usa `apiService` como base
   - Define endpoints en `config/api.ts`
   - Crea interfaces TypeScript para tipos

4. **Al probar:**
   - Verifica en mobile y desktop
   - Prueba estados de loading/error/vacío
   - Confirma que los colores coinciden exactamente

5. **Al documentar:**
   - Comenta código complejo
   - Usa JSDoc para funciones públicas
   - Mantén README actualizado

---

## 📞 CONTACTO Y SOPORTE

- **Proyecto:** SPORTSWEAR E-commerce
- **Stack:** React 18 + TypeScript + Django REST Framework
- **Última actualización:** Noviembre 2025

---

**Este documento debe ser el PRIMER y ÚNICO contexto que se proporcione a cualquier IA al iniciar un nuevo chat o implementación.**

**¡No más confusiones de diseño, colores o estructura!** 🎨✨
