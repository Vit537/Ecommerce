# 📋 PLAN DE TRABAJO - FASE 2: AUTENTICACIÓN Y GESTIÓN

## ✅ **COMPLETADO - Fase 1:**
- ✅ Sistema de diseño minimalista sportswear
- ✅ 3 Layouts principales (Admin, Cashier, Customer)
- ✅ Sistema de carrito y checkout
- ✅ Rutas de demostración funcionando
- ✅ **ARREGLADO:** Botones ahora tienen bordes visibles (2px) y mejor contraste

---

## 🎯 **TAREAS PENDIENTES:**

### **TAREA 1: Sistema de Login y Autenticación** 🔐
**Prioridad:** ALTA  
**Tiempo estimado:** 2-3 horas

#### Subtareas:
1. **Crear página de Login moderna**
   - Formulario de email + password
   - Mostrar tarjetas de usuarios de prueba (solo para desarrollo)
   - Diseño minimalista acorde al sistema actual
   - Manejo de errores y validaciones

2. **Implementar lógica de autenticación**
   - Conectar con backend `/api/auth/login/`
   - Guardar token en localStorage
   - Actualizar AuthContext para funcionar correctamente
   - Redirección según rol del usuario

3. **Configurar rutas protegidas**
   - Descomentar y ajustar rutas en `App.tsx`
   - Implementar ProtectedRoute con verificación de roles
   - Redirigir usuarios no autenticados a login

4. **Roles y redirecciones:**
   ```
   Admin (admin@boutique.com)       → /admin
   Gerente (gerente@boutique.com)   → /admin (mismo acceso)
   Cajero (cajero@boutique.com)     → /pos
   Cliente (ana.martinez@email.com) → /shop (o sin login)
   ```

#### Usuarios de Prueba:
```javascript
Administrador: admin@boutique.com / admin123
Gerente: gerente@boutique.com / gerente123
Cajero: cajero@boutique.com / cajero123
Cliente: ana.martinez@email.com / cliente123
```

---

### **TAREA 2: Vista del Cliente (Public Store)** 🛍️
**Prioridad:** ALTA  
**Tiempo estimado:** 3-4 horas

#### Características:
1. **Navegación lateral izquierda:**
   - Categorías de productos
   - Filtros (precio, talla, color)
   - Ofertas especiales
   - Nuevos ingresos

2. **Funcionalidades sin autenticación:**
   - ✅ Ver todos los productos
   - ✅ Buscar productos
   - ✅ Ver detalles de producto
   - ✅ Filtrar y ordenar
   - ✅ Ver categorías

3. **Requiere autenticación:**
   - ❌ Agregar al carrito
   - ❌ Proceder al checkout
   - ❌ Ver historial de compras
   - ❌ Guardar favoritos

4. **Ventajas de estar autenticado:**
   - Recomendaciones personalizadas
   - Historial de compras
   - Lista de deseos
   - Direcciones guardadas
   - Métodos de pago guardados

#### Flujo:
```
Usuario visita tienda → Ve productos libremente
↓
Intenta agregar al carrito → Modal: "Inicia sesión para comprar"
↓
Se registra/inicia sesión → Puede comprar
↓
Completa checkout → Pedido registrado
```

---

### **TAREA 3: Gestión de Productos y Categorías** 📦
**Prioridad:** MEDIA-ALTA  
**Tiempo estimado:** 4-5 horas

#### Endpoints a revisar:
```
/api/products/                    # CRUD productos
/api/products/categories/         # CRUD categorías
/api/products/brands/             # CRUD marcas
/api/products/variants/           # Variantes (tallas/colores)
```

#### Funcionalidades para Admin:

**1. Productos:**
- ✅ Listar todos los productos (tabla paginada)
- ✅ Buscar productos (por nombre, SKU, categoría)
- ✅ Filtrar (categoría, marca, estado)
- ✅ Crear nuevo producto
  - Nombre, descripción, precio
  - Categoría, marca
  - Imágenes (múltiples)
  - Stock
  - Variantes (tallas, colores)
- ✅ Editar producto existente
- ✅ Eliminar producto (soft delete)
- ✅ Ver detalles completos

**2. Categorías:**
- ✅ Listar categorías (tabla o cards)
- ✅ Crear nueva categoría
  - Nombre
  - Descripción
  - Imagen
  - Categoría padre (para subcategorías)
- ✅ Editar categoría
- ✅ Eliminar categoría
- ✅ Ver productos por categoría

**Características UI:**
- Tabla con paginación (10-20 items por página)
- Buscador en tiempo real
- Filtros desplegables
- Acciones rápidas (editar, eliminar)
- Modal/drawer para crear/editar
- Confirmación antes de eliminar
- Carga de imágenes con preview
- Diseño minimalista acorde al sistema

---

### **TAREA 4: Gestión de Empleados** 👥
**Prioridad:** MEDIA  
**Tiempo estimado:** 3-4 horas

#### Endpoints a revisar:
```
/api/employees/                   # CRUD empleados
/api/employees/{id}/              # Detalle empleado
```

#### Funcionalidades para Admin:

**1. Listar Empleados:**
- Tabla paginada con información básica
- Foto, nombre, email, rol, estado
- Buscador por nombre/email
- Filtro por rol (admin, gerente, cajero)
- Filtro por estado (activo, inactivo)

**2. Crear Empleado:**
- Información personal:
  - Nombre completo
  - Email
  - Teléfono
  - Dirección
  - Foto de perfil
- Información laboral:
  - Rol (admin, gerente, cajero)
  - Fecha de contratación
  - Salario
  - Horario
- Credenciales:
  - Email de acceso
  - Contraseña inicial

**3. Editar Empleado:**
- Actualizar cualquier información
- Cambiar rol
- Activar/desactivar cuenta
- Resetear contraseña

**4. Ver Detalle:**
- Información completa
- Historial de ventas (si es cajero)
- Actividad reciente
- Permisos asignados

---

## 📁 **Archivos a Revisar:**

### Modelos (Backend):
```python
backend_django/products/models.py          # Product, Category, Brand, Variant
backend_django/employees/models.py         # Employee
backend_django/authentication/models.py    # User, Customer
backend_django/cart/models.py              # Cart, CartItem
backend_django/orders/models.py            # Order, OrderItem
```

### Views (Backend):
```python
backend_django/products/views.py           # ProductViewSet, CategoryViewSet
backend_django/employees/views.py          # EmployeeViewSet
backend_django/authentication/views.py     # LoginView, RegisterView
```

### URLs (Backend):
```python
backend_django/products/urls.py
backend_django/employees/urls.py
backend_django/authentication/urls.py
```

### Serializers (Backend):
```python
backend_django/products/serializers.py
backend_django/employees/serializers.py
backend_django/authentication/serializers.py
```

### Services (Frontend):
```typescript
frontend/src/services/productService.ts
frontend/src/services/employeeService.ts    # Crear si no existe
frontend/src/services/authService.ts
```

---

## 🎨 **Diseño UI Consistente:**

### Colores ya definidos:
- **Negro:** `#1a1a1a` (Principal)
- **Gris claro:** `#f5f5f5` (Fondo)
- **Dorado:** `#d4af37` (Acento)
- **Blanco:** `#ffffff`

### Componentes a usar:
- `.btn-primary` - Botón negro
- `.btn-secondary` - Botón con borde
- `.btn-outline` - Botón transparente con borde
- `.btn-accent` - Botón dorado
- `.card` - Tarjetas
- `.input-primary` - Inputs
- Tablas con Tailwind: `table-auto`, `divide-y`
- Modals con Tailwind: `fixed inset-0`, `bg-black/50`

---

## 📊 **Prioridades de Hoy:**

### Mañana (4-5 horas):
1. ✅ Sistema de Login (1.5h)
2. ✅ Configurar rutas protegidas (1h)
3. ✅ Mejorar vista del cliente con nav lateral (1.5h)

### Tarde (4-5 horas):
4. ✅ Productos: Listar + Buscar + Filtrar (2h)
5. ✅ Productos: Crear + Editar (2h)

### Siguiente sesión:
6. Categorías completo (2h)
7. Empleados completo (3h)

---

## 🚀 **Comandos Útiles:**

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend_django
python manage.py runserver

# Ver modelos
python manage.py shell
>>> from products.models import Product, Category
>>> Product.objects.all()

# Ver rutas
python manage.py show_urls
```

---

## 📝 **Notas Importantes:**

1. **Cliente NO necesita login obligatorio** para ver productos
2. **Solo necesita login** cuando intenta COMPRAR (agregar al carrito)
3. **Admin y Cajero** tienen vistas completamente separadas
4. **Gerente = Admin** (mismo acceso por ahora)
5. **Paginación:** 10-20 items por página en tablas
6. **Imágenes:** Permitir múltiples imágenes por producto
7. **Validaciones:** Siempre validar en frontend Y backend

---

## ✨ **Cambios Recientes (Hoy):**

### Arreglo de Botones:
- ✅ Todos los botones ahora tienen **border: 2px solid**
- ✅ `.btn-primary` - Borde negro visible
- ✅ `.btn-secondary` - Borde gris oscuro visible
- ✅ `.btn-outline` - Borde negro, fondo transparente
- ✅ `.btn-accent` - Borde dorado visible
- ✅ Estados `:hover`, `:active`, `:disabled` mejorados
- ✅ Todos usan `display: inline-flex` para centrar contenido

---

**¿Todo claro? Empezamos con el Login primero.** 🚀
