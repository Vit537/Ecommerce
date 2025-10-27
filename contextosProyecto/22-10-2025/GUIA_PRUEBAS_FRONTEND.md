# 🎯 GUÍA PARA PROBAR EL FRONTEND

## ✅ ESTADO ACTUAL DEL SISTEMA

### Backend (Django) - ✅ FUNCIONANDO
- **Servidor**: http://localhost:8000
- **Autenticación**: ✅ Funcionando
- **Productos**: ✅ 10 productos disponibles
- **Categorías**: ✅ 14 categorías
- **Usuarios**: ✅ 9 usuarios con roles

### Frontend (React) - ✅ FUNCIONANDO
- **Servidor**: http://localhost:3000
- **Dashboards**: ✅ Implementados

---

## 🔐 CREDENCIALES PARA PROBAR

| Rol | Email | Password | Acceso |
|-----|-------|----------|---------|
| **Super Admin** | superadmin@boutique.com | admin123 | Todos los dashboards |
| **Administrador** | admin@boutique.com | admin123 | Admin, Inventory, Reports |
| **Cajero** | cajero@boutique.com | cajero123 | Employee, POS, Inventory |
| **Gerente** | gerente@boutique.com | gerente123 | Employee, Inventory, Reports |
| **Cliente** | ana.martinez@email.com | cliente123 | Shop |

---

## 🎯 QUÉ PROBAR EN EL FRONTEND

### 1. **Login & Navegación**
```
1. Ir a: http://localhost:3000
2. Login con: admin@boutique.com / admin123
3. Verificar redirección automática según rol
```

### 2. **Dashboard de Administrador** (`/admin`)
**Debe mostrar:**
- ✅ **Estadísticas**: Total usuarios (9), productos (10), órdenes
- ✅ **Gráficos**: Ventas por mes, productos más vendidos
- ✅ **Tablas**: Órdenes recientes, productos con bajo stock
- ✅ **Alertas**: Notificaciones del sistema

### 3. **Tienda de Cliente** (`/shop`)
**Debe mostrar:**
- ✅ **Catálogo**: 10 productos con precios
- ✅ **Filtros**: Por categoría, marca, precio
- ✅ **Búsqueda**: Buscar por nombre
- ✅ **Carrito**: Agregar/quitar productos
- ✅ **Variantes**: Seleccionar color y talla

### 4. **Panel de Empleado** (`/employee`)
**Debe mostrar:**
- ✅ **Métricas**: Ventas del día, productos vendidos
- ✅ **Órdenes**: Lista de pedidos pendientes
- ✅ **Clientes**: Información de clientes

### 5. **Gestión de Inventario** (`/inventory`)
**Debe mostrar:**
- ✅ **Productos**: Lista completa con stock
- ✅ **Categorías**: 14 categorías organizadas
- ✅ **Stock bajo**: Productos que necesitan reposición
- ✅ **Edición**: Actualizar precios y stock

### 6. **Sistema POS** (`/pos`)
**Debe mostrar:**
- ✅ **Búsqueda**: Buscar productos por SKU/nombre
- ✅ **Carrito**: Agregar productos a venta
- ✅ **Pago**: 6 métodos de pago disponibles
- ✅ **Facturación**: Generar factura al completar venta

### 7. **Reportes** (`/reports`)
**Debe mostrar:**
- ✅ **Reportes AI**: Sistema con Groq/Llama
- ✅ **Exportación**: PDF y Excel
- ✅ **Consultas**: Generar reportes personalizados
- ✅ **Historial**: Log de reportes generados

---

## 🚨 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema 1: "No se muestran datos"
**Síntomas**: Dashboards vacíos, productos no cargan
**Solución**: 
```bash
# Verificar que ambos servidores estén ejecutándose
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Problema 2: "Error de autenticación"
**Síntomas**: Login falla, token inválido
**Solución**:
```bash
# Usar credenciales correctas
admin@boutique.com / admin123
```

### Problema 3: "Órdenes no aparecen"
**Síntomas**: Dashboard muestra 0 órdenes
**Status**: ⚠️ Problema conocido con permisos de API
**Solución temporal**: Los datos están en BD, problema de serialización

### Problema 4: "CORS errors"
**Síntomas**: Errores en consola del navegador
**Solución**: Backend ya configurado para CORS

---

## 🎯 PASOS ESPECÍFICOS PARA VERIFICAR DATOS

### Paso 1: Verificar Products API
```bash
# En navegador, ir a:
http://localhost:8000/api/products/
# Debe mostrar JSON con 10 productos
```

### Paso 2: Verificar Login
```bash
# En navegador, probar login en:
http://localhost:3000/login
# Con: admin@boutique.com / admin123
```

### Paso 3: Verificar Dashboard Data
```bash
# Después del login, ir a:
http://localhost:3000/admin
# Debe mostrar estadísticas y gráficos
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Backend Django funcionando en puerto 8000
- [ ] Frontend React funcionando en puerto 3000  
- [ ] Login exitoso con admin@boutique.com
- [ ] Dashboard admin muestra estadísticas
- [ ] Shop muestra 10 productos
- [ ] Filtros y búsqueda funcionan
- [ ] Carrito permite agregar productos
- [ ] Inventario muestra stock
- [ ] POS permite hacer ventas
- [ ] Reportes muestran opciones

---

## 🚀 SIGUIENTES PASOS SI TODO FUNCIONA

1. **Probar todos los roles** con diferentes usuarios
2. **Crear nuevos productos** desde el inventario
3. **Procesar ventas** usando el POS
4. **Generar reportes** con IA
5. **Exportar datos** en PDF/Excel

---

## 🆘 SI ALGO NO FUNCIONA

1. **Revisar consola** del navegador (F12)
2. **Verificar logs** del backend Django
3. **Comprobar URLs** de API en network tab
4. **Validar tokens** JWT en localStorage
5. **Reinstalar dependencias** si es necesario

---

## 📞 DATOS TÉCNICOS IMPORTANTES

- **Base de datos**: SQLite con 9 usuarios, 10 productos, 10 órdenes
- **Autenticación**: JWT tokens
- **API Base**: http://localhost:8000/api/
- **Frontend**: React + TypeScript + Tailwind
- **Dashboards**: 5 principales implementados
- **Permisos**: Sistema de roles granular