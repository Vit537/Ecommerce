# 🧪 Guía de Pruebas - Redirecciones y Páginas Admin

## 🚀 Inicio Rápido

### 1️⃣ Iniciar el Backend
```powershell
cd backend_django
python manage.py runserver
```
El backend debe estar en: `http://localhost:8000`

### 2️⃣ Iniciar el Frontend
```powershell
cd frontend
npm run dev
```
El frontend debe estar en: `http://localhost:5173`

---

## 🔐 Pruebas de Login y Redirección

### Test 1: Admin Login
```
1. Ir a: http://localhost:5173/login
2. Email: admin@boutique.com
3. Password: Admin123!
4. Click en "Iniciar Sesión"
5. ✅ Verificar: Debe redirigir a /admin
6. ✅ Verificar: Consola muestra "✅ Redirigiendo a /admin"
```

### Test 2: Gerente Login
```
1. Ir a: http://localhost:5173/login
2. Email: gerente@boutique.com
3. Password: Gerente123!
4. Click en "Iniciar Sesión"
5. ✅ Verificar: Debe redirigir a /admin
6. ✅ Verificar: Consola muestra "✅ Redirigiendo a /admin (gerente)"
```

### Test 3: Cajero Login
```
1. Ir a: http://localhost:5173/login
2. Email: cajero@boutique.com
3. Password: Cajero123!
4. Click en "Iniciar Sesión"
5. ✅ Verificar: Debe redirigir a /pos
6. ✅ Verificar: Consola muestra "✅ Redirigiendo a /pos"
```

### Test 4: Cliente Login
```
1. Ir a: http://localhost:5173/login
2. Email: ana.martinez@email.com
3. Password: Cliente123!
4. Click en "Iniciar Sesión"
5. ✅ Verificar: Debe redirigir a /shop
6. ✅ Verificar: Consola muestra "✅ Redirigiendo a /shop"
```

### ⚠️ Si NO funciona la redirección:

**Abrir DevTools (F12) → Console y buscar:**
```javascript
🔄 Usuario: {email: "...", role: "...", ...}
🔄 Rol detectado: admin / gerente / cajero / cliente
```

**Problemas comunes:**
- ❌ `❌ No se encontró usuario en localStorage` → Problema en authService
- ❌ `⚠️ Rol no reconocido` → El backend devuelve un rol diferente
- ❌ No aparece ningún log → Problema en LoginPage.tsx

**Solución rápida:**
```javascript
// En la consola del navegador:
localStorage.getItem('user')    // Ver el usuario guardado
localStorage.getItem('token')   // Ver el token guardado
```

---

## 🛍️ Pruebas de Products Management

### Acceso a la Página
```
1. Login como admin o gerente
2. Ir a: http://localhost:5173/admin/products
3. ✅ Verificar: Se carga la página con grid de productos
4. ✅ Verificar: Se muestran estadísticas en el header
```

### Test 1: Vista Grid (Cuadrícula)
```
✅ Verificar:
  - Se muestran tarjetas con imágenes grandes
  - Cada tarjeta tiene: foto, nombre, precio, stock, categoría, marca
  - Badges: Destacado (⭐), Inactivo (🔴), Agotado (📦)
  - Al hacer hover aparecen 3 botones: Star, Edit, Delete
```

### Test 2: Vista List (Lista)
```
1. Click en el botón "Lista" (icono de líneas) en la parte superior
2. ✅ Verificar: Se cambia a vista de tabla
3. ✅ Verificar: Se muestran columnas: Producto, Categoría, Precio, Stock, Estado, Acciones
4. ✅ Verificar: Imágenes miniatura (16x16)
```

### Test 3: Búsqueda
```
1. Escribir en el campo de búsqueda: "camisa"
2. ✅ Verificar: Se filtran productos en tiempo real
3. ✅ Verificar: Aparece contador "Mostrando X de Y productos"
4. Click en "Limpiar filtros"
5. ✅ Verificar: Se resetean todos los filtros
```

### Test 4: Filtro por Categoría
```
1. Abrir dropdown "Todas las categorías"
2. Seleccionar una categoría (ej: "Camisetas")
3. ✅ Verificar: Solo se muestran productos de esa categoría
4. ✅ Verificar: Contador actualizado
```

### Test 5: Filtro por Marca
```
1. Abrir dropdown "Todas las marcas"
2. Seleccionar una marca (ej: "Nike")
3. ✅ Verificar: Solo se muestran productos de esa marca
4. ✅ Verificar: Se puede combinar con filtro de categoría
```

### Test 6: Filtro por Estado
```
1. Abrir dropdown "Todos los estados"
2. Seleccionar "Activos"
3. ✅ Verificar: Solo se muestran productos activos (botón verde)
4. Seleccionar "Inactivos"
5. ✅ Verificar: Solo se muestran productos inactivos (botón gris)
```

### Test 7: Marcar como Destacado
```
1. En vista grid, hacer hover sobre un producto
2. Click en el botón de estrella (⭐)
3. ✅ Verificar: Aparece mensaje "Producto marcado como destacado"
4. ✅ Verificar: Aparece badge "Destacado" en la esquina
5. ✅ Verificar: Estadística "Destacados" se incrementa
6. Click en estrella de nuevo
7. ✅ Verificar: Se quita el badge y baja el contador
```

### Test 8: Activar/Desactivar
```
1. Click en el botón verde "✓ Activo"
2. ✅ Verificar: Cambia a gris "✗ Inactivo"
3. ✅ Verificar: Aparece mensaje de confirmación
4. ✅ Verificar: Estadística "Activos" se actualiza
5. Click de nuevo para reactivar
6. ✅ Verificar: Vuelve a verde
```

### Test 9: Eliminar Producto
```
1. Click en botón de eliminar (🗑️)
2. ✅ Verificar: Aparece modal de confirmación
3. ✅ Verificar: Muestra el nombre del producto
4. Click en "Eliminar"
5. ✅ Verificar: Producto desaparece de la lista
6. ✅ Verificar: Mensaje "Producto eliminado exitosamente"
7. ✅ Verificar: Estadísticas actualizadas
```

### Test 10: Paginación
```
1. Si hay más de 12 productos, se muestra paginación
2. Click en "Siguiente →"
3. ✅ Verificar: Carga siguiente página
4. ✅ Verificar: Contador "Página 2 de X"
5. Click en "← Anterior"
6. ✅ Verificar: Vuelve a página 1
```

### Test 11: Refresh
```
1. Click en botón de refrescar (🔄)
2. ✅ Verificar: Se recargan los datos
3. ✅ Verificar: Aparece brevemente spinner de carga
```

---

## 📂 Pruebas de Categories Management

### Acceso a la Página
```
1. Login como admin o gerente
2. Ir a: http://localhost:5173/admin/categories
3. ✅ Verificar: Se carga tabla de categorías
4. ✅ Verificar: Estadísticas: Total, Principales, Subcategorías
```

### Test 1: Vista de Tabla
```
✅ Verificar:
  - Columnas: ID, Nombre, Descripción, Categoría Padre, Tipo, Acciones
  - Badges: Principal (azul), Subcategoría (naranja)
  - Imágenes miniatura si existen
  - Nombres de categorías padre se muestran correctamente
```

### Test 2: Búsqueda
```
1. Escribir en campo de búsqueda: "camiseta"
2. ✅ Verificar: Se filtran categorías en tiempo real
3. ✅ Verificar: Busca en nombre Y descripción
4. ✅ Verificar: Contador "Mostrando X de Y categorías"
```

### Test 3: Crear Categoría Principal
```
1. Click en "Nueva Categoría"
2. Nombre: "Zapatos Deportivos"
3. Descripción: "Calzado para deportes"
4. Categoría Padre: Dejar en "Sin categoría padre"
5. Click en "Crear Categoría"
6. ✅ Verificar: Aparece en la tabla con badge "Principal"
7. ✅ Verificar: Mensaje "Categoría creada exitosamente"
8. ✅ Verificar: Estadística "Categorías Principales" se incrementa
```

### Test 4: Crear Subcategoría
```
1. Click en "Nueva Categoría"
2. Nombre: "Tenis Running"
3. Descripción: "Zapatos para correr"
4. Categoría Padre: Seleccionar "Zapatos Deportivos"
5. Click en "Crear Categoría"
6. ✅ Verificar: Aparece con badge "Subcategoría"
7. ✅ Verificar: Columna "Categoría Padre" muestra "Zapatos Deportivos"
8. ✅ Verificar: Estadística "Subcategorías" se incrementa
```

### Test 5: Editar Categoría
```
1. Click en botón de editar (✏️)
2. Cambiar nombre a "Zapatos Running"
3. Cambiar descripción
4. Click en "Guardar Cambios"
5. ✅ Verificar: Se actualiza en la tabla
6. ✅ Verificar: Mensaje "Categoría actualizada exitosamente"
```

### Test 6: Cambiar Padre de Subcategoría
```
1. Click en editar de una subcategoría
2. Cambiar "Categoría Padre" a otra categoría
3. Click en "Guardar Cambios"
4. ✅ Verificar: Se actualiza la columna "Categoría Padre"
```

### Test 7: Convertir a Categoría Principal
```
1. Click en editar de una subcategoría
2. Cambiar "Categoría Padre" a "Sin categoría padre"
3. Click en "Guardar Cambios"
4. ✅ Verificar: Badge cambia a "Principal"
5. ✅ Verificar: Estadísticas se actualizan
```

### Test 8: Eliminar Categoría
```
1. Click en botón de eliminar (🗑️)
2. ✅ Verificar: Aparece modal de confirmación
3. ✅ Verificar: Muestra el nombre de la categoría
4. Click en "Eliminar"
5. ✅ Verificar: Desaparece de la tabla
6. ✅ Verificar: Mensaje "Categoría eliminada exitosamente"
7. ✅ Verificar: Estadísticas actualizadas
```

### Test 9: Prevención de Padre Circular
```
1. Editar una categoría principal
2. ✅ Verificar: En el dropdown "Categoría Padre" NO aparece ella misma
3. ✅ Verificar: Solo aparecen otras categorías principales
```

---

## 🐛 Checklist de Debugging

### Si la página no carga:
```
□ Verificar que el backend esté corriendo (http://localhost:8000)
□ Verificar que el frontend esté corriendo (http://localhost:5173)
□ Abrir DevTools → Network → Ver si hay errores 401/403/404/500
□ Abrir DevTools → Console → Ver errores de JavaScript
```

### Si no aparecen productos/categorías:
```
□ Verificar que hay datos en el backend:
  GET http://localhost:8000/api/products/
  GET http://localhost:8000/api/categories/
  
□ Verificar en DevTools → Network que la request se hizo
□ Verificar en DevTools → Console que no hay errores
□ Verificar que el token está en localStorage:
  localStorage.getItem('token')
```

### Si los filtros no funcionan:
```
□ Abrir DevTools → Console
□ Verificar que se llama a loadData() al cambiar filtro
□ Verificar que el query string está correcto en Network
□ Ejemplo: ?search=camisa&category=1&is_active=true
```

### Si las acciones (destacar/eliminar) no funcionan:
```
□ Verificar que el usuario tiene permisos (admin o gerente)
□ Verificar en Network que el request se envía
□ Verificar el response code (200 = éxito, 403 = sin permisos)
□ Verificar que el token es válido
```

---

## 📋 Checklist Completo de Testing

### Redirecciones ✅
- [ ] Admin redirige a /admin
- [ ] Gerente redirige a /admin
- [ ] Cajero redirige a /pos
- [ ] Cliente redirige a /shop
- [ ] Logs en consola son correctos

### Products Management ✅
- [ ] Vista grid funciona
- [ ] Vista list funciona
- [ ] Toggle grid/list funciona
- [ ] Búsqueda filtra en tiempo real
- [ ] Filtro por categoría funciona
- [ ] Filtro por marca funciona
- [ ] Filtro por estado funciona
- [ ] Limpiar filtros resetea todo
- [ ] Marcar destacado funciona
- [ ] Desmarcar destacado funciona
- [ ] Activar/desactivar funciona
- [ ] Eliminar producto funciona
- [ ] Modal de confirmación aparece
- [ ] Paginación funciona
- [ ] Refresh actualiza datos
- [ ] Estadísticas son correctas
- [ ] Badges se muestran correctamente
- [ ] Hover muestra acciones rápidas
- [ ] Alerts de éxito/error aparecen

### Categories Management ✅
- [ ] Tabla carga correctamente
- [ ] Búsqueda funciona
- [ ] Crear categoría principal funciona
- [ ] Crear subcategoría funciona
- [ ] Editar categoría funciona
- [ ] Cambiar padre funciona
- [ ] Eliminar categoría funciona
- [ ] Modal de confirmación aparece
- [ ] Badges (Principal/Subcategoría) correctos
- [ ] Dropdown no muestra categoría padre de sí misma
- [ ] Estadísticas son correctas
- [ ] Refresh actualiza datos
- [ ] Alerts de éxito/error aparecen

---

## 🎯 Tests de Integración

### Flujo Completo 1: Admin crea producto
```
1. Login como admin
2. Ir a /admin/products
3. Click "Nuevo Producto"
4. Llenar formulario (cuando esté implementado)
5. Crear producto
6. ✅ Verificar: Aparece en la grid
7. Marcar como destacado
8. ✅ Verificar: Badge aparece
9. Editar producto
10. ✅ Verificar: Cambios se guardan
11. Eliminar producto
12. ✅ Verificar: Desaparece
```

### Flujo Completo 2: Gerente organiza categorías
```
1. Login como gerente
2. Ir a /admin/categories
3. Crear categoría "Ropa Deportiva"
4. Crear subcategoría "Camisetas" → Padre: Ropa Deportiva
5. Crear subcategoría "Pantalones" → Padre: Ropa Deportiva
6. ✅ Verificar: Ambas subcategorías muestran "Ropa Deportiva" como padre
7. Editar "Camisetas" y cambiar padre a otra categoría
8. ✅ Verificar: Se actualiza
9. Buscar "camisetas"
10. ✅ Verificar: Solo aparece la buscada
```

---

## 📊 Resultados Esperados

Al finalizar todas las pruebas:
- ✅ **100% redirecciones funcionando**
- ✅ **Products grid visual y funcional**
- ✅ **Categories table organizada y clara**
- ✅ **Filtros y búsqueda en tiempo real**
- ✅ **CRUD completo funcional**
- ✅ **Estadísticas actualizadas**
- ✅ **Feedback visual inmediato**

---

**Última actualización:** 3 de Febrero 2025, 15:45
