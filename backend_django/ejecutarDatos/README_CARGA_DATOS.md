# 📊 Guía de Carga de Datos - E-Commerce Mejorado

## 📋 Descripción General

Este directorio contiene scripts para cargar datos de prueba realistas en la base de datos del sistema de e-commerce. Los datos incluyen todo lo necesario para probar y desarrollar el sistema completo.

## 🎯 ¿Qué se Carga?

### Paso 1: Datos Base (`1_generate_test_data.py`)
- **Usuarios y Permisos**
  - Roles y permisos del sistema
  - 1 Super Admin
  - 1 Administrador
  - 1 Gerente
  - 1 Cajero
  - 50 Clientes (VIP, frecuentes, ocasionales, nuevos)

- **Estructura Organizacional**
  - 5 Departamentos (Ventas, Gestión, Inventario, etc.)
  - 8 Puestos de trabajo
  - 3 Perfiles de empleados

- **Productos**
  - 40 Productos (ropa, calzado, accesorios)
  - 200+ Variantes (combinaciones de talla y color)
  - 10 Categorías
  - 10 Marcas
  - 14 Colores
  - 16 Tallas

- **Proveedores**
  - 5 Proveedores con información completa
  - Relaciones producto-proveedor

- **Métodos de Pago y Envío**
  - 6 Métodos de pago
  - 4 Métodos de envío

- **Finanzas**
  - 10 Categorías de gastos

- **Notificaciones**
  - 5 Plantillas de notificación
  - Configuración de notificaciones

- **Órdenes Iniciales**
  - 10 órdenes de prueba

### Paso 2: Datos Históricos (`2_generate_ml_data_v2.py`)
- **Ventas Históricas**
  - ~600 órdenes en los últimos 6 meses
  - Distribución realista por días, estaciones y tipos de cliente
  - Pagos y facturas completos
  - Órdenes online y en tienda

- **Órdenes de Compra**
  - 15-25 órdenes de compra a proveedores
  - Items recibidos y actualizaciones de stock

- **Movimientos de Inventario**
  - 20-40 movimientos de ajuste
  - Registros de devoluciones, pérdidas, daños

- **Turnos de Cajero**
  - Turnos de los últimos 60 días
  - Arqueos de caja completos
  - Resumen de ventas por turno

- **Gastos de la Empresa**
  - Gastos fijos mensuales (alquiler, salarios, servicios)
  - Gastos variables (marketing, mantenimiento, transporte)
  - ~100 registros de gastos

- **Transacciones Consolidadas**
  - Registro completo de ingresos y egresos
  - Para análisis de flujo de caja

### Paso 3: Redistribución de Fechas (`3_fix_order_dates.py`)
- Distribuye las fechas de órdenes de manera más realista
- Asegura que haya datos recientes para reportes en tiempo real

### Paso 4: Verificación (`4_check_data.py`)
- Muestra un resumen completo de todos los datos cargados
- Verifica integridad y consistencia

## 🚀 Cómo Ejecutar

### Opción 1: Ejecución Automática (Recomendado)

#### En Windows:
```batch
# Navega al directorio
cd backend_django\ejecutarDatos

# Ejecuta el script batch
cargar_datos_automatico.bat
```

#### En PowerShell:
```powershell
# Navega al directorio
cd backend_django\ejecutarDatos

# Ejecuta el script PowerShell
.\cargar_datos_automatico.ps1
```

### Opción 2: Ejecución Manual

```bash
# 1. Asegúrate de estar en el directorio correcto
cd backend_django\ejecutarDatos

# 2. Ejecuta cada script en orden
python 1_generate_test_data.py
python 2_generate_ml_data_v2.py
python 3_fix_order_dates.py
python 4_check_data.py
```

## ⚠️ Requisitos Previos

1. **Base de datos migrada**
   ```bash
   python manage.py migrate
   ```

2. **Base de datos vacía**
   - Los scripts limpian datos automáticamente
   - Pero es recomendable empezar con BD limpia

3. **Entorno virtual activo**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

## ⏱️ Tiempo de Ejecución

| Paso | Tiempo Estimado | Descripción |
|------|----------------|-------------|
| Paso 1 | 5-10 minutos | Datos base |
| Paso 2 | 15-25 minutos | Datos históricos |
| Paso 3 | 1-2 minutos | Ajuste de fechas |
| Paso 4 | <1 minuto | Verificación |
| **TOTAL** | **~20-40 minutos** | Proceso completo |

*Nota: Los tiempos pueden variar según el hardware*

## 📊 Estadísticas de Datos Cargados

Al finalizar, tendrás aproximadamente:

- **Usuarios**: 54 (1 super admin + 1 admin + 1 gerente + 1 cajero + 50 clientes)
- **Productos**: 40 con ~200 variantes
- **Órdenes de Venta**: ~600 en 6 meses
- **Órdenes de Compra**: 15-25
- **Movimientos de Stock**: 20-40
- **Turnos de Cajero**: ~100 (últimos 60 días)
- **Gastos**: ~100 registros
- **Transacciones**: ~700 (ingresos + egresos)

## 🔑 Credenciales de Acceso

### Administración
- **Super Admin**: `superadmin@boutique.com` / `admin123`
- **Administrador**: `admin@boutique.com` / `admin123`
- **Gerente**: `gerente@boutique.com` / `gerente123`
- **Cajero**: `cajero@boutique.com` / `cajero123`

### Clientes (Ejemplos)
- **Cliente VIP**: `ana.martinez@email.com` / `cliente123`
- **Cliente Frecuente**: `pedro.lopez@email.com` / `cliente123`
- **Cliente Ocasional**: `daniel.vega@email.com` / `cliente123`

*Todos los clientes usan el password: `cliente123`*

## 🔍 Verificación

Después de la carga, verifica que todo esté correcto:

```bash
# Ejecuta el script de verificación
python 4_check_data.py

# O accede al admin de Django
python manage.py runserver
# Visita: http://localhost:8000/admin
```

## 📝 Estructura de Archivos

```
ejecutarDatos/
│
├── 1_generate_test_data.py          # Datos base
├── 2_generate_ml_data_v2.py         # Datos históricos
├── 3_fix_order_dates.py             # Ajuste de fechas
├── 4_check_data.py                  # Verificación
│
├── cargar_datos_automatico.bat      # Script automático Windows
├── cargar_datos_automatico.ps1      # Script automático PowerShell
├── PROBAR_LOCALMENTE.ps1            # Prueba local
│
└── README_CARGA_DATOS.md            # Este archivo
```

## 🐛 Solución de Problemas

### Error: "No module named 'django'"
```bash
# Activa el entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### Error: "Table doesn't exist"
```bash
# Ejecuta las migraciones
python manage.py migrate
```

### Error: "Foreign key constraint"
```bash
# Limpia la base de datos
python manage.py flush --no-input
python manage.py migrate

# Vuelve a ejecutar los scripts
```

### El proceso es muy lento
- Es normal, se están creando miles de registros
- El Paso 2 (datos históricos) es el más lento
- Puedes reducir la cantidad de órdenes editando `2_generate_ml_data_v2.py`

### Quiero menos datos
Edita los scripts y ajusta estas variables:
- `1_generate_test_data.py`: 
  - `customers_data` - reduce el número de clientes
  - `products_data` - reduce el número de productos
- `2_generate_ml_data_v2.py`:
  - `num_pos` - reduce órdenes de compra
  - `num_movements` - reduce movimientos de stock

## 💡 Consejos

1. **Primera vez**: Usa el script automático (`.bat` o `.ps1`)
2. **Desarrollo**: Ejecuta solo el Paso 1 para pruebas rápidas
3. **Producción**: NUNCA uses estos datos en producción
4. **Backups**: Haz backup antes de cargar datos nuevos
5. **ML/Analytics**: Necesitas el Paso 2 completo para datos suficientes

## 📞 Soporte

Si tienes problemas:
1. Revisa los mensajes de error en la consola
2. Verifica que las migraciones estén aplicadas
3. Asegúrate de tener el entorno virtual activo
4. Revisa que los modelos coincidan con los scripts

## 🔄 Actualización de Scripts

Los scripts se actualizaron para incluir:
- ✅ ShippingMethod (Métodos de envío)
- ✅ Supplier y ProductSupplier (Proveedores)
- ✅ Department, Position, Employee (Estructura organizacional)
- ✅ PurchaseOrder y PurchaseOrderItem (Compras)
- ✅ StockMovement (Movimientos de inventario)
- ✅ Shift (Turnos de cajero)
- ✅ ExpenseCategory y Expense (Gastos)
- ✅ Transaction (Transacciones consolidadas)
- ✅ NotificationTemplate y NotificationSettings (Notificaciones)

## 📅 Última Actualización

**Fecha**: Noviembre 2025
**Versión**: 2.0
**Cambios**: Sistema completo con todas las tablas del proyecto
