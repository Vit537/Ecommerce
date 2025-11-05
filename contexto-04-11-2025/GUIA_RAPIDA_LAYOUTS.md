# 🎨 GUÍA RÁPIDA - NUEVOS LAYOUTS SPORTSWEAR

## 🚀 Inicio Rápido

### 1. Instalar dependencias (si es necesario)
```bash
cd frontend
npm install
```

### 2. Iniciar el servidor
```bash
npm run dev
```

### 3. Abrir en el navegador

#### 🔗 URLs de Demostración:

- **Panel Administrador**: http://localhost:5173/demo/admin
- **Sistema POS (Cajero)**: http://localhost:5173/demo/cashier
- **Tienda Cliente**: http://localhost:5173/demo/customer

---

## 📱 Qué esperar en cada layout

### 👨‍💼 Panel Administrador (`/demo/admin`)
- Menú lateral con navegación jerárquica
- Dashboard con estadísticas
- Diseño tipo Google Cloud / AWS Console
- Responsive con drawer colapsable

**Prueba:**
- Click en las secciones del menú lateral
- Expande/colapsa subsecciones
- Prueba en móvil (drawer lateral)

### 💰 Sistema POS - Cajero (`/demo/cashier`)
- Grid de productos en la izquierda
- Carrito de compras en la derecha
- Control de cantidad y eliminación
- Métodos de pago (Efectivo/Tarjeta/QR)
- Cálculo automático con IVA

**Prueba:**
- Busca productos
- Agrega/elimina del carrito (mock)
- Cambia cantidad (+/-)
- Selecciona método de pago

### 🛍️ Tienda Cliente (`/demo/customer`)
- Header sticky con navegación
- Hero section promocional
- Grid de productos con filtros
- Sistema de favoritos
- Footer completo

**Prueba:**
- Filtra por categorías
- Click en favoritos (corazón)
- Busca productos
- Scroll para ver el footer

---

## 🎨 Características del Diseño

### Paleta de Colores
- **Negro**: `#1a1a1a` (Principal)
- **Gris claro**: `#f5f5f5` (Secundario)
- **Dorado**: `#d4af37` (Acento)
- **Verde**: `#4caf50` (Success)
- **Rojo**: `#f44336` (Error)

### Tipografía
- **Inter**: Texto general
- **Poppins**: Títulos y encabezados

---

## 🔧 Cómo Integrar en tu Proyecto

### Opción 1: Usar los layouts directamente

```tsx
// En tus rutas protegidas
import AdminLayout from './components/admin/Layout/AdminLayout';

<Route path="/admin/*" element={<AdminLayout />}>
  <Route index element={<Dashboard />} />
  <Route path="products" element={<Products />} />
</Route>
```

### Opción 2: Usar como template

Copia el código de los layouts y adapta:
- Cambia los datos mock por llamadas a tu backend
- Agrega funcionalidad real (agregar al carrito, etc.)
- Integra con tu sistema de autenticación

---

## 📦 Archivos Creados

```
frontend/src/
├── theme/
│   └── sportswearTheme.ts          ← Tema Material-UI
├── components/
│   ├── admin/Layout/
│   │   └── AdminLayout.tsx         ← Panel Admin
│   ├── cashier/POS/
│   │   └── CashierLayout.tsx       ← Sistema POS
│   ├── customer/Shop/
│   │   └── CustomerLayout.tsx      ← Tienda
│   └── layouts.ts                  ← Exportaciones
└── pages/
    └── AdminDashboardDemo.tsx      ← Demo dashboard
```

---

## ✅ Checklist de Pruebas

- [ ] El servidor de desarrollo está corriendo
- [ ] Puedes acceder a `/demo/admin`
- [ ] El menú lateral se expande/colapsa
- [ ] El drawer funciona en móvil
- [ ] Puedes acceder a `/demo/cashier`
- [ ] Los controles del carrito funcionan
- [ ] Puedes acceder a `/demo/customer`
- [ ] Los filtros de categorías funcionan
- [ ] Los favoritos se pueden togglear
- [ ] Todo se ve bien en móvil

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
cd frontend
npm install
npm run dev
```

### Error de TypeScript
Los componentes están completamente tipados. Si ves errores:
```bash
npm run type-check
```

### Estilos no se aplican
Verifica que `sportswearTheme` esté importado en `main.tsx`:
```tsx
import { sportswearTheme } from './theme/sportswearTheme'
```

---

## 🎯 Siguiente Fase

Una vez que confirmes que todo funciona:

1. ✅ **Fase 1 Completada**: Layouts y diseño
2. 🔄 **Fase 2 Siguiente**: Mejoras de la bolsa de compra
   - Checkout de 3 pasos
   - Estado global del carrito
   - Integración con backend

---

## 💬 Feedback

Confirma que:
- ✅ Los layouts se ven correctamente
- ✅ Son responsive
- ✅ Te gusta el diseño minimalista
- ✅ Quieres proceder con la Fase 2

---

**¡Disfruta explorando los nuevos layouts!** 🎉
