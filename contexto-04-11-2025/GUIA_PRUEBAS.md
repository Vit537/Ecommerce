# 🔧 GUÍA DE PRUEBAS - E-COMMERCE

## 📋 **ESTADO ACTUAL:**

### ✅ **Completado:**
1. ✅ Servicios de frontend creados:
   - `productAdminService.ts` - CRUD completo de productos
   - `categoryService.ts` - CRUD de categorías
   - `employeeService.ts` - CRUD de empleados
   - `permissions.ts` - Sistema de permisos por rol

2. ✅ Páginas de administración:
   - `ProductsManagement.tsx` - Gestión de productos
   - `CategoriesManagement.tsx` - Gestión de categorías

3. ✅ Sistema de autenticación:
   - LoginPage con redirección automática por rol
   - Rutas protegidas con verificación de permisos
   - AuthContext actualizado

4. ✅ Rutas configuradas:
   - `/login` - Página de login
   - `/admin` - Dashboard admin (Admin y Gerente)
   - `/admin/products` - Gestión de productos (Admin y Gerente)
   - `/admin/categories` - Gestión de categorías (Admin y Gerente)
   - `/pos` - Sistema POS (Cajero, Admin, Gerente)
   - `/shop` - Tienda online (Cliente autenticado)
   - `/checkout` - Proceso de compra (Cliente autenticado)

---

## 🚀 **PASOS PARA PROBAR:**

### **1. Iniciar Backend**
```bash
cd backend_django
python manage.py runserver
```

**Backend corriendo en:** `http://localhost:8000`

### **2. Iniciar Frontend**
```bash
cd frontend
npm run dev
```

**Frontend corriendo en:** `http://localhost:5173`

---

## 🔐 **CUENTAS DE PRUEBA:**

### **Admin (Acceso completo):**
- **Email:** `admin@boutique.com`
- **Password:** `admin123`
- **Redirección:** → `/admin`

### **Gerente (Gestión de operaciones):**
- **Email:** `gerente@boutique.com`
- **Password:** `gerente123`
- **Redirección:** → `/admin`

### **Cajero (Sistema POS):**
- **Email:** `cajero@boutique.com`
- **Password:** `cajero123`
- **Redirección:** → `/pos`

### **Cliente (Compras online):**
- **Email:** `ana.martinez@email.com`
- **Password:** `cliente123`
- **Redirección:** → `/shop`

---

## 🧪 **PRUEBAS A REALIZAR:**

### **Test 1: Login y Redirección**
1. Ve a `http://localhost:5173/login`
2. Haz clic en una tarjeta de cuenta de prueba (esto autocompleta)
3. Presiona "Iniciar Sesión"
4. ✅ **Verificar:** Deberías ser redirigido automáticamente a:
   - Admin → `/admin` (Dashboard)
   - Gerente → `/admin` (Dashboard)
   - Cajero → `/pos` (Sistema POS)
   - Cliente → `/shop` (Tienda)

### **Test 2: Vista de Admin**
**Login como:** Admin o Gerente

1. Deberías ver el **AdminNavbar** con el sidebar colapsable
2. Verifica que aparecen las secciones:
   - 📊 Dashboard
   - 📦 Productos
   - 🏷️ Categorías
   - 👥 Empleados (próximamente)
   - 📈 Reportes

### **Test 3: Gestión de Productos**
**Login como:** Admin o Gerente

**Acceso:** Desde AdminNavbar → Click en "Productos"  
**Ruta:** `/admin/products`

**Pruebas:**
1. ✅ Ver lista de productos (si hay datos en el backend)
2. ✅ Buscar productos por nombre
3. ✅ Filtrar por categoría, marca, estado
4. ✅ Ver estadísticas (Total, Activos, Destacados)
5. ✅ Click en "Nuevo Producto" - Debería abrir modal
6. ✅ Click en "Editar" en un producto - Debería abrir modal de edición
7. ✅ Click en estrella - Marcar/desmarcar como destacado
8. ✅ Click en estado - Activar/desactivar producto
9. ✅ Paginación (si hay más de 10 productos)

### **Test 4: Gestión de Categorías**
**Login como:** Admin o Gerente

**Acceso:** Desde AdminNavbar → Click en "Categorías"  
**Ruta:** `/admin/categories`

**Pruebas:**
1. ✅ Ver grid de categorías
2. ✅ Ver estadísticas (Total, Raíz, Subcategorías)
3. ✅ Click en "Nueva Categoría" - Abrir modal
4. ✅ Crear categoría con nombre y descripción
5. ✅ Crear subcategoría (seleccionar categoría padre)
6. ✅ Editar categoría existente
7. ✅ Eliminar categoría (con confirmación)
8. ✅ Ver subcategorías dentro de cada card

### **Test 5: Sistema POS (Cajero)**
**Login como:** Cajero

**Acceso:** Redirección automática a `/pos`

**Pruebas:**
1. ✅ Ver grid de productos
2. ✅ Buscar productos
3. ✅ Agregar productos al carrito
4. ✅ Cambiar cantidades
5. ✅ Ver totales (subtotal, IVA, total)
6. ✅ Seleccionar método de pago
7. ✅ Procesar venta
8. ✅ Generar factura/ticket

### **Test 6: Tienda Online (Cliente)**
**Login como:** Cliente

**Acceso:** Redirección automática a `/shop`

**Pruebas:**
1. ✅ Ver grid de productos
2. ✅ Ver categorías en header
3. ✅ Buscar productos
4. ✅ Ver detalles de producto
5. ✅ Agregar al carrito
6. ✅ Ver carrito (sidebar)
7. ✅ Ir a checkout
8. ✅ Completar proceso de compra

---

## 🔍 **VERIFICACIÓN DE ENDPOINTS:**

### **Productos:**
```
GET    /api/products/              # Listar productos
POST   /api/products/              # Crear producto
GET    /api/products/{id}/         # Ver detalle
PATCH  /api/products/{id}/         # Actualizar
DELETE /api/products/{id}/         # Eliminar
```

### **Categorías:**
```
GET    /api/products/categories/        # Listar categorías
POST   /api/products/categories/        # Crear categoría
GET    /api/products/categories/{id}/   # Ver detalle
PATCH  /api/products/categories/{id}/   # Actualizar
DELETE /api/products/categories/{id}/   # Eliminar
```

### **Empleados:**
```
GET    /api/employees/              # Listar empleados
POST   /api/employees/              # Crear empleado
GET    /api/employees/{id}/         # Ver detalle
PATCH  /api/employees/{id}/         # Actualizar
DELETE /api/employees/{id}/         # Eliminar
```

### **Autenticación:**
```
POST   /api/auth/login/             # Login
POST   /api/auth/register/          # Registro
GET    /api/auth/me/                # Obtener usuario actual
POST   /api/auth/logout/            # Logout
```

---

## 🐛 **SI ALGO NO FUNCIONA:**

### **Error: "Network Error" o "Failed to fetch"**
✅ **Solución:**
1. Verifica que el backend esté corriendo en `http://localhost:8000`
2. Verifica el archivo `.env` en frontend:
   ```
   VITE_API_URL=http://localhost:8000
   ```

### **Error: "401 Unauthorized"**
✅ **Solución:**
1. Vuelve a hacer login
2. Verifica que el token esté en localStorage: 
   - Abre DevTools → Application → Local Storage
   - Busca la key `token`

### **Error: "404 Not Found"**
✅ **Solución:**
1. Verifica que la ruta del endpoint sea correcta
2. Revisa las URLs del backend en `urls.py`

### **Error: "403 Forbidden"**
✅ **Solución:**
1. Verifica que tu rol tenga permisos para esa acción
2. Revisa el archivo `permissions.ts`

### **No se ve nada (página en blanco)**
✅ **Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que las rutas estén bien configuradas en `App.tsx`

---

## 📝 **CHECKLIST DE PRUEBAS:**

### Login y Redirección:
- [ ] Login como Admin → Redirige a `/admin`
- [ ] Login como Gerente → Redirige a `/admin`
- [ ] Login como Cajero → Redirige a `/pos`
- [ ] Login como Cliente → Redirige a `/shop`
- [ ] Credenciales incorrectas → Muestra error

### Permisos:
- [ ] Admin puede ver `/admin/products`
- [ ] Admin puede ver `/admin/categories`
- [ ] Gerente puede ver `/admin/products`
- [ ] Gerente puede ver `/admin/categories`
- [ ] Cajero NO puede ver `/admin` (redirige a unauthorized)
- [ ] Cliente NO puede ver `/admin` (redirige a unauthorized)
- [ ] Cliente NO puede ver `/pos` (redirige a unauthorized)

### Funcionalidad:
- [ ] Productos: Listar, buscar, filtrar
- [ ] Productos: Crear nuevo (modal se abre)
- [ ] Productos: Editar (modal se abre con datos)
- [ ] Productos: Marcar como destacado
- [ ] Productos: Activar/Desactivar
- [ ] Categorías: Listar en grid
- [ ] Categorías: Crear nueva
- [ ] Categorías: Editar existente
- [ ] Categorías: Eliminar (con confirmación)

---

## 🎯 **PRÓXIMOS PASOS:**

Una vez que todo funcione correctamente:

1. ✅ Crear página de Gestión de Empleados
2. ✅ Agregar links en AdminNavbar a las páginas
3. ✅ Mejorar vista del cliente con filtros laterales
4. ✅ Dashboard con estadísticas reales
5. ✅ Sistema de reportes

---

## 🚀 **COMANDOS RÁPIDOS:**

### Backend:
```bash
# Iniciar servidor
python manage.py runserver

# Ver rutas disponibles (si tienes django-extensions)
python manage.py show_urls

# Crear superusuario (si no existe)
python manage.py createsuperuser
```

### Frontend:
```bash
# Iniciar desarrollo
npm run dev

# Ver en navegador
http://localhost:5173

# Build para producción
npm run build
```

---

**¿Todo listo para probar? ¡Empecemos!** 🎉
