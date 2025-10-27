# Sistema de E-commerce para Tienda de Ropa

## Resumen de Implementación

He implementado un sistema completo de e-commerce para una tienda de ropa basado en el diagrama de permisos y roles que proporcionaste. El sistema está diseñado para ser utilizado en un negocio físico y también tener presencia online.

## Funcionalidades Implementadas

### 1. Sistema de Autenticación y Roles

**Modelos actualizados:**
- **Usuario (User)**: Modelo extendido con campos específicos para tienda de ropa
  - Roles: Administrador, Gerente, Empleado, Cliente
  - Tipos: admin, staff, customer
  - Información adicional: teléfono, dirección, datos de empleado

**Sistema de Permisos:**
- **Permission**: Permisos granulares por categoría (inventario, ventas, compras, etc.)
- **Role**: Roles con permisos asociados
- **UserRole**: Relación usuario-rol (según diagrama)
- **PermissionUserRole**: Permisos directos a usuarios (permiso_usuario del diagrama)

### 2. Gestión de Productos y Inventario

**Modelos para tienda de ropa:**
- **Product**: Productos con información específica (material, género, temporada)
- **ProductVariant**: Variantes por talla, color, etc.
- **Category**: Categorías específicas (Ropa, Calzado, Accesorios)
- **Brand**: Marcas de productos
- **Size**: Tallas (ropa, zapatos, accesorios)
- **Color**: Colores disponibles
- **Supplier**: Proveedores

### 3. Sistema de Órdenes y Facturación

**Modelos implementados:**
- **Order**: Órdenes de venta (online y en tienda)
- **OrderItem**: Items de cada orden
- **Payment**: Pagos con múltiples métodos
- **PaymentMethod**: Métodos de pago disponibles
- **Invoice**: Facturas de venta
- **PurchaseOrder**: Órdenes de compra a proveedores
- **StockMovement**: Movimientos de inventario

### 4. Gestión de Empleados

**Modelos para RRHH:**
- **Employee**: Perfil extendido de empleados
- **Department**: Departamentos de la empresa
- **Position**: Puestos de trabajo
- **Attendance**: Control de asistencia
- **Payroll**: Nómina de empleados

### 5. Métodos de Pago

Soporte para múltiples métodos:
- Efectivo
- Tarjetas de crédito/débito
- Transferencias bancarias
- Pago móvil
- Crédito de tienda

### 6. Control de Inventario

- Stock por variante de producto
- Niveles mínimos de stock
- Reservas de inventario
- Movimientos automáticos
- Alertas de reabastecimiento

### 7. Vistas Diferenciadas por Rol

**Dashboard personalizado:**
- **Administrador**: Vista completa con estadísticas, gestión de empleados, reportes
- **Empleado**: Vista de ventas, productos, clientes
- **Cliente**: Vista de tienda, carrito, órdenes

## Usuarios de Prueba Creados

### Comando: `python manage.py init_store_data`

**1. Administrador:**
- Email: admin@tienda.com
- Password: admin123
- Acceso completo al sistema

**2. Gerente:**
- Email: gerente@tienda.com
- Password: gerente123
- Gestión operativa

**3. Empleado:**
- Email: empleado@tienda.com
- Password: empleado123
- Operaciones de venta

**4. Clientes (3):**
- cliente1@email.com / cliente123
- cliente2@email.com / cliente123
- cliente3@email.com / cliente123

## Permisos por Rol

### Administrador
- Acceso completo a todas las funcionalidades
- Gestión de empleados y nómina
- Reportes financieros
- Configuración del sistema

### Gerente
- Gestión de inventario
- Ventas y compras
- Gestión de clientes
- Reportes operativos
- Gestión de empleados

### Empleado
- Ventas básicas
- Consulta de inventario
- Gestión de clientes
- Facturación

### Cliente
- Navegación de productos
- Carrito de compras
- Historial de órdenes
- Perfil personal

## Estructura de Base de Datos

El sistema está diseñado con:
- **6 aplicaciones Django**: authentication, permissions, products, orders, employees, cart
- **25+ modelos** con relaciones optimizadas
- **Índices** para consultas eficientes
- **Campos UUID** como primary keys para seguridad
- **Campos JSON** para datos flexibles

## Funcionalidades de Negocio

### Para el Negocio Físico:
- Sistema POS (Point of Sale)
- Control de inventario en tiempo real
- Gestión de empleados y asistencia
- Múltiples métodos de pago
- Facturación automática

### Para Ventas Online:
- Catálogo de productos
- Carrito de compras
- Gestión de órdenes
- Seguimiento de envíos
- Perfiles de cliente

## Próximos Pasos

1. **Aplicar migraciones**: `python manage.py migrate`
2. **Inicializar datos**: `python manage.py init_store_data`
3. **Crear superusuario**: `python manage.py createsuperuser`
4. **Probar sistema** con los usuarios creados

## Arquitectura

El sistema está construido con:
- **Django REST Framework** para APIs
- **Sistema de permisos personalizado** basado en el diagrama
- **Middleware de permisos** para control de acceso
- **Vistas diferenciadas** según tipo de usuario
- **Decoradores de permisos** para funciones específicas

Este sistema proporciona una base sólida para una tienda de ropa moderna que puede operar tanto físicamente como online, con control granular de permisos y roles según las necesidades del negocio.