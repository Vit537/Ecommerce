# 🚀 PLAN DE TRABAJO - Próximas Tareas

## ✅ COMPLETADO HOY

1. ✅ Sistema de Temas (5 paletas + modo oscuro)
2. ✅ AppHeader en páginas principales
3. ✅ **CRUD Completo de Empleados**
   - Lista con búsqueda y filtros
   - Crear nuevos empleados
   - Editar empleados existentes
   - Activar/desactivar cuentas

---

## 🎯 TAREAS PRIORITARIAS PENDIENTES

### 1. **Verificar CRUD de Productos** 🛍️
**Tiempo estimado:** 20 minutos  
**Prioridad:** 🔥 Alta

**Archivo a revisar:**
- `frontend/src/pages/InventoryManagement.tsx`

**Tests a realizar:**
```
[ ] Abrir página de inventario
[ ] Intentar crear un producto nuevo
[ ] Probar editar un producto existente
[ ] Verificar eliminación (soft delete)
[ ] Probar actualización de stock
[ ] Verificar carga de imágenes
[ ] Revisar gestión de variantes
```

**Si hay errores:**
- Documentar qué no funciona
- Verificar endpoints del backend
- Corregir componente si es necesario

---

### 2. **Mejorar Gestión de Clientes** 👥
**Tiempo estimado:** 30 minutos  
**Prioridad:** 🔥 Alta

**Archivo a modificar:**
- `frontend/src/pages/CustomerManagement.tsx`

**Mejoras necesarias:**
```typescript
[ ] Integrar AppHeader
[ ] Agregar búsqueda por nombre/email
[ ] Agregar filtros (segmento ML, estado)
[ ] Botón para activar/desactivar cuenta
[ ] Vista de historial de compras del cliente
[ ] Mostrar segmento ML del cliente
[ ] Estadísticas de clientes
[ ] Diseño responsive
[ ] Modo oscuro
```

**Estructura sugerida:**
```typescript
// Similar a EmployeeManagement pero para clientes
interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  is_active: boolean;
  date_joined: string;
  total_orders: number;
  total_spent: number;
  ml_segment?: string;
}

Componentes:
- Lista de clientes con tabla
- Búsqueda y filtros
- Cards de estadísticas
- Detalle del cliente (opcional)
```

---

### 3. **Página de Perfil de Usuario** 👤
**Tiempo estimado:** 45 minutos  
**Prioridad:** 🟡 Media

**Archivo a crear:**
- `frontend/src/pages/UserProfile.tsx`

**Características:**
```typescript
Secciones:
1. 📋 Información Personal
   - Nombre, apellido, email, teléfono
   - Avatar con iniciales
   - Botón "Editar perfil"

2. 🔒 Seguridad
   - Cambiar contraseña
   - Últimos accesos

3. 🎨 Preferencias
   - Tema actual
   - Botón para abrir ThemeSettingsDialog
   - Notificaciones (futuro)

4. 📊 Actividad (según rol)
   - [Admin] Resumen de gestión
   - [Employee] Ventas realizadas
   - [Customer] Historial de compras

5. 💾 Acciones
   - Guardar cambios
   - Cerrar sesión
```

**Endpoint necesario:**
```typescript
GET   /api/auth/profile/        → Obtener perfil actual
PATCH /api/auth/profile/        → Actualizar perfil
POST  /api/auth/change-password/ → Cambiar contraseña
```

---

### 4. **Agregar Logo Real** 🖼️
**Tiempo estimado:** 5 minutos  
**Prioridad:** 🟢 Baja

**Pasos:**
```bash
1. Usuario debe copiar logo-bs.png a:
   frontend/public/images/logo-bs.png

2. Verificar en AppHeader que se vea:
   http://localhost:3000/admin/employees
   
3. Si no se ve:
   - Verificar ruta del archivo
   - Verificar nombre del archivo (exacto)
   - Refrescar navegador (Ctrl+F5)

4. Ajustar tamaño si es necesario:
   En AppHeader.tsx, línea ~35:
   className="h-12 w-auto" → Cambiar h-12 si necesario
```

**También actualizar favicon:**
```bash
Copiar archivo a:
frontend/public/favicon.ico
```

---

### 5. **Integrar AppHeader en AdminDashboard** 🏠
**Tiempo estimado:** 5 minutos  
**Prioridad:** 🟢 Baja

**Archivo a modificar:**
- `frontend/src/pages/AdminDashboard.tsx`

**Verificar:**
```typescript
import AppHeader from '../components/AppHeader';

// En el return:
<>
  <AppHeader title="Panel de Administración" />
  {/* resto del componente */}
</>
```

**Si ya está importado:**
- Solo verificar que se renderice correctamente
- Ajustar estilos si es necesario

---

## 📋 TAREAS SECUNDARIAS

### 6. **Sincronización de Base de Datos** 🔄
**Tiempo estimado:** 30 minutos  
**Prioridad:** 🟢 Baja

**Scripts a crear:**

**A. verify_data_integrity.py**
```python
# Verificar:
- Órdenes sin items
- Productos sin variantes
- Usuarios sin rol
- Relaciones FK rotas
- Datos huérfanos
```

**B. sync_database.py**
```python
# Sincronizar:
- Contadores de productos
- Totales de órdenes
- Estadísticas de clientes
- Índices de búsqueda ML
```

---

### 7. **Implementar en Flutter** 📱
**Tiempo estimado:** 2-3 horas  
**Prioridad:** 🟢 Baja (futuro)

**Archivos a modificar:**
```
mobile_flutter/lib/
  - screens/settings_screen.dart → Sistema de temas
  - utils/theme_manager.dart → Gestión de paletas
  - main.dart → Integrar temas
```

**Características:**
```dart
- 5 paletas de colores (mismo que web)
- Modo claro/oscuro
- Persistencia en SharedPreferences
- Sincronización con preferencias de usuario
```

---

### 8. **Mejorar Sistema de Reportes** 📊
**Tiempo estimado:** 1-2 horas  
**Prioridad:** 🟢 Baja (futuro)

**Problema actual:**
- Groq API funciona en standalone pero falla en Django

**Soluciones a intentar:**
```python
1. Actualizar versión de groq
2. Usar httpx directamente
3. Implementar fallback con consultas predefinidas
4. Agregar cache de reportes
5. Mejorar UX con loading states
```

---

## 🎯 PLAN DE EJECUCIÓN SUGERIDO

### Sesión 1 (1 hora) - Verificación y Clientes
```
1. Verificar CRUD de Productos (20 min)
   └─ Probar todas las funciones
   └─ Documentar errores encontrados

2. Mejorar Gestión de Clientes (30 min)
   └─ Integrar AppHeader
   └─ Agregar búsqueda y filtros
   └─ Mostrar historial

3. Agregar logo real (5 min)
   └─ Copiar archivo
   └─ Verificar visualización

4. Buffer para correcciones (5 min)
```

### Sesión 2 (45 min) - Perfil de Usuario
```
1. Crear UserProfile.tsx (30 min)
   └─ Estructura básica
   └─ Información personal
   └─ Cambiar contraseña
   └─ Preferencias

2. Integrar en rutas (5 min)
3. Probar funcionalidad (10 min)
```

### Sesión 3 (30 min) - Sincronización y Pulido
```
1. Scripts de sincronización BD (20 min)
2. Correcciones finales (10 min)
3. Testing general (opcional)
```

---

## 📊 PROGRESO ESTIMADO

### Actual
```
Frontend:     85% completado
Backend:      95% completado
Mobile:       60% completado
Documentación: 90% completada
```

### Después de completar prioridades altas
```
Frontend:     95% completado  ⬆️ +10%
Backend:      95% completado
Mobile:       60% completado
Documentación: 95% completada ⬆️ +5%
```

---

## 🎉 HITOS ALCANZADOS

✅ Sistema de autenticación completo  
✅ Sistema de temas y personalización  
✅ CRUD de empleados funcional  
✅ Sistema ML implementado  
✅ Dashboard de analytics  
✅ Sistema POS básico  
✅ Reportes dinámicos (backend)  
✅ App móvil Flutter básica  

---

## 🔧 HERRAMIENTAS Y COMANDOS ÚTILES

### Desarrollo
```bash
# Backend
cd backend_django
python manage.py runserver

# Frontend
cd frontend
npm run dev

# Verificar errores TypeScript
npm run build
```

### Testing
```bash
# Backend
python manage.py test

# Frontend
npm run test (si está configurado)
```

### Base de Datos
```bash
# Crear migración
python manage.py makemigrations

# Aplicar migración
python manage.py migrate

# Shell de Django
python manage.py shell
```

---

## 📞 CONTACTO Y RECURSOS

### Documentación Útil
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/docs
- Django REST: https://www.django-rest-framework.org/
- TypeScript: https://www.typescriptlang.org/docs/

### Recursos del Proyecto
- Plan general: `PLAN_MEJORAS_SISTEMA.md`
- Estado actual: `ESTADO_ACTUAL_DETALLADO.md`
- Reportes: `REPORTES_ESTADO_FINAL.md`
- ML Guide: `MACHINE_LEARNING_GUIDE.md`

---

## ✅ CHECKLIST RÁPIDO ANTES DE CONTINUAR

- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 3000
- [ ] Login como admin funcionando
- [ ] CRUD de empleados verificado
- [ ] Sin errores en consola del navegador
- [ ] Sin errores de TypeScript

Si todo está ✅, estás listo para continuar con las siguientes tareas!

---

**Creado:** 21 Octubre 2025, 20:45 hrs  
**Estado:** 📋 PLAN LISTO PARA EJECUTAR  
**Próxima acción:** Verificar CRUD de Productos
