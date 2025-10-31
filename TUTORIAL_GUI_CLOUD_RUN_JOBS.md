# 🖱️ Tutorial: Crear Cloud Run Job desde GUI (Paso a Paso)

## 📋 Pre-requisitos

Antes de empezar, necesitas:
- ✅ Backend desplegado en Cloud Run
- ✅ Acceso a Google Cloud Console
- ✅ Credenciales: `DB_PASSWORD` y `DJANGO_SECRET_KEY`

---

## 🎯 Paso 1: Acceder a Cloud Run Jobs

### 1.1 Abrir Google Cloud Console

Ve a: https://console.cloud.google.com

### 1.2 Seleccionar Proyecto

- En la parte superior, haz clic en el selector de proyecto
- Busca y selecciona: **`big-axiom-474503-m5`**

### 1.3 Ir a Cloud Run

- En el menú lateral (☰), busca: **"Cloud Run"**
- Haz clic en: **"Jobs"**

O directamente: https://console.cloud.google.com/run/jobs?project=big-axiom-474503-m5

---

## 🔧 Paso 2: Crear Primer Job (load-base-data)

### 2.1 Iniciar Creación

Haz clic en el botón azul: **"CREAR JOB"**

---

### 2.2 Configuración Básica

#### **Campo: Nombre del job***
```
load-base-data
```

#### **Campo: Región***
```
us-central1 (Iowa)
```

---

### 2.3 Configuración del Contenedor

#### **Campo: URL de la imagen del contenedor***

```
us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest
```

💡 **Tip:** Esta es la misma imagen que usa tu backend desplegado.

---

#### **Sección: Punto de entrada y argumentos**

Haz clic en: **▼ Mostrar opciones avanzadas**

**Campo: Punto de entrada del contenedor (opcional)**
```
python
```

**Campo: Argumentos (uno por línea)**
```
ejecutarDatos/1_generate_test_data.py
--auto
```

💡 **Cómo se ve:**
```
Argumento 1: ejecutarDatos/1_generate_test_data.py
Argumento 2: --auto
```

---

### 2.4 Variables de Entorno

Haz clic en la pestaña: **"Variables y secretos"**

Haz clic en: **"+ AGREGAR VARIABLE"** para cada una:

| Nombre | Valor |
|--------|-------|
| `DB_NAME` | `ecommerce` |
| `DB_USER` | `ecommerce-user` |
| `DB_PASSWORD` | `[TU_PASSWORD_AQUI]` ⚠️ |
| `DB_HOST` | `/cloudsql/big-axiom-474503-m5:us-central1:myproject-db` |
| `DJANGO_SECRET_KEY` | `[TU_SECRET_KEY_AQUI]` ⚠️ |
| `DEBUG` | `False` |

⚠️ **IMPORTANTE:** Reemplaza `[TU_PASSWORD_AQUI]` y `[TU_SECRET_KEY_AQUI]` con tus credenciales reales.

---

### 2.5 Conexión a Cloud SQL

Haz clic en la pestaña: **"Conexiones"**

En **"Conexiones de Cloud SQL"**, haz clic en: **"+ AGREGAR CONEXIÓN"**

Selecciona de la lista:
```
big-axiom-474503-m5:us-central1:myproject-db
```

---

### 2.6 Recursos

Haz clic en la pestaña: **"Recursos"**

#### **Memoria**
```
2 GiB
```

#### **CPU**
```
2
```

#### **Tiempo de espera de la tarea**
```
1800 segundos
```

#### **Número máximo de reintentos**
```
0
```

💡 **Por qué 0 reintentos:** Si falla, queremos verlo inmediatamente y no reintentar automáticamente para evitar datos duplicados.

---

### 2.7 Crear Job

Haz clic en el botón azul: **"CREAR"**

Espera ~30 segundos mientras se crea el job.

---

## ▶️ Paso 3: Ejecutar Job

### 3.1 Encontrar Job

En la lista de Jobs, busca: **`load-base-data`**

### 3.2 Ejecutar

Haz clic en el nombre del job: **`load-base-data`**

Haz clic en el botón: **"EJECUTAR"**

### 3.3 Monitorear Ejecución

Verás una nueva ejecución en la lista con estado: **"En ejecución"**

Haz clic en la ejecución para ver detalles.

### 3.4 Ver Logs

Haz clic en la pestaña: **"REGISTROS"**

Deberías ver:
```
🗑️  Limpiando datos existentes...
✅ Datos limpiados correctamente

🔐 Creando permisos...
  ✓ Permiso creado: Ver Productos
  ✓ Permiso creado: Crear Productos
  ...

👥 Creando roles...
  ✓ Rol: Administrador (43 permisos)
  ...

👤 Creando usuarios...
  ✓ Superusuario: superadmin@boutique.com
  ✓ Administrador: admin@boutique.com
  ✓ Cajero: cajero@boutique.com
  ✓ Gerente: gerente@boutique.com
  ✓ Cliente: Ana Martínez
  ✓ Cliente: Pedro López
  ... (50 clientes en total)

✅ 50 clientes creados

📦 Creando productos...
✅ 40 productos creados

===============================================
✅ DATOS BASE CARGADOS CORRECTAMENTE
===============================================
```

### 3.5 Verificar Estado Final

Espera hasta que el estado cambie a: ✅ **"Correctamente"**

Tiempo estimado: **5-10 minutos**

---

## 🔄 Paso 4: Crear Segundo Job (load-ml-data)

### 4.1 Repetir Paso 2

Repite **TODO** el Paso 2, pero con estos cambios:

**Campo: Nombre del job**
```
load-ml-data
```

**Campo: Argumentos (uno por línea)**
```
ejecutarDatos/2_generate_ml_data_v2.py
```

💡 **Todo lo demás es IGUAL:**
- Misma imagen
- Mismas variables de entorno
- Misma conexión Cloud SQL
- Mismos recursos

### 4.2 Crear y Ejecutar

Haz clic en **"CREAR"**

Luego haz clic en **"EJECUTAR"**

### 4.3 Ver Logs

Deberías ver:
```
🤖 GENERANDO DATOS COMPLEMENTARIOS PARA MACHINE LEARNING

📊 VERIFICANDO DATOS EXISTENTES...
   ✓ Clientes existentes: 50
   ✓ Productos existentes: 40
   ✓ Órdenes existentes: 0

💳 Verificando métodos de pago...
   Creado: Efectivo
   Creado: Tarjeta de Crédito Visa
   ...

👥 Usando clientes existentes...
   ✓ 50 clientes disponibles para simulación

🎯 Segmentando clientes...
   ✓ VIP: 5
   ✓ Frecuentes: 12
   ✓ Ocasionales: 17
   ✓ Nuevos: 16

💰 Generando ventas históricas...
   Período: Últimos 6 meses
   Con 50 clientes → Promedio 12 órdenes por cliente en 6 meses
   Este proceso puede tomar varios minutos...

[10%] 18 días procesados (45 órdenes)...
[20%] 36 días procesados (92 órdenes)...
[30%] 54 días procesados (138 órdenes)...
...
[100%] 180 días procesados (602 órdenes)

✅ DATOS ML GENERADOS CORRECTAMENTE
Total de órdenes creadas: 602
Total de facturas creadas: 596
Total de pagos creados: 598
```

Tiempo estimado: **5-10 minutos**

---

## 📅 Paso 5: Crear Tercer Job (fix-order-dates)

### 5.1 Repetir Paso 2

Repite **TODO** el Paso 2, pero con estos cambios:

**Campo: Nombre del job**
```
fix-order-dates
```

**Campo: Argumentos (uno por línea)**
```
ejecutarDatos/3_fix_order_dates.py
```

💡 **Todo lo demás es IGUAL**

### 5.2 Crear y Ejecutar

Haz clic en **"CREAR"**

Luego haz clic en **"EJECUTAR"**

### 5.3 Ver Logs

Deberías ver:
```
📅 REDISTRIBUYENDO FECHAS DE ÓRDENES

📊 Estadísticas actuales:
   • Total de órdenes: 602
   • Primera orden: 2025-05-03 10:15:23
   • Última orden: 2025-10-31 18:42:56
   • Rango actual: 181 días

🔄 Redistribuyendo fechas en 6 meses...
   [█████████████████████] 100% (602/602)

✅ Fechas redistribuidas correctamente
   • 602 órdenes actualizadas
   • Nueva primera orden: 2025-05-01 08:00:00
   • Nueva última orden: 2025-10-31 23:59:59
```

Tiempo estimado: **2-3 minutos**

---

## ✅ Paso 6: Verificar Datos

### 6.1 Ir a Cloud SQL

Ve a: https://console.cloud.google.com/sql/instances?project=big-axiom-474503-m5

### 6.2 Abrir Cloud Shell

Haz clic en tu instancia: **`myproject-db`**

Haz clic en: **"ABRIR CLOUD SHELL"**

### 6.3 Conectar a la Base de Datos

En Cloud Shell, ejecuta:

```bash
gcloud sql connect myproject-db --user=ecommerce-user --database=ecommerce
```

Ingresa tu password cuando te lo pida.

### 6.4 Ejecutar Consultas

```sql
-- Contar registros
SELECT 
    (SELECT COUNT(*) FROM authentication_user WHERE role='customer') as clientes,
    (SELECT COUNT(*) FROM orders_order) as ordenes,
    (SELECT COUNT(*) FROM orders_invoice) as facturas,
    (SELECT COUNT(*) FROM orders_payment) as pagos;
```

**Resultado esperado:**
```
 clientes | ordenes | facturas | pagos 
----------+---------+----------+-------
       50 |     602 |      596 |   598
```

```sql
-- Promedio de órdenes por cliente
SELECT 
    COUNT(DISTINCT customer_id) as total_clientes,
    COUNT(*) as total_ordenes,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT customer_id), 2) as promedio
FROM orders_order;
```

**Resultado esperado:**
```
 total_clientes | total_ordenes | promedio 
----------------+---------------+----------
             50 |           602 |    12.04
```

```sql
-- Top 10 clientes con más órdenes
SELECT 
    CONCAT(u.first_name, ' ', u.last_name) as cliente,
    COUNT(o.id) as ordenes
FROM authentication_user u
LEFT JOIN orders_order o ON o.customer_id = u.id
WHERE u.role = 'customer'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY ordenes DESC
LIMIT 10;
```

**Resultado esperado:**
```
      cliente       | ordenes 
--------------------+---------
 Ricardo Castro     |      28
 Ana Martínez       |      26
 Sofía Ramírez      |      24
 Pedro López        |      23
 ...
```

### 6.5 Salir

```sql
\q
```

---

## 🎉 ¡Felicidades!

Has cargado exitosamente:
- ✅ 50 clientes
- ✅ ~600 órdenes
- ✅ ~596 facturas
- ✅ ~598 pagos

Todo distribuido de forma realista en 6 meses.

---

## 🚀 Próximos Pasos

### 1. Probar API

Obtén la URL de tu backend:

```
https://ecommerce-backend-[ID].run.app
```

Prueba:
- `GET /api/` - Info de API
- `GET /api/products/` - Listar productos
- `GET /api/orders/` - Listar órdenes
- `GET /admin/` - Panel de administración

### 2. Login en Admin

Usuario: `superadmin@boutique.com`
Password: `admin123`

### 3. Conectar Frontend

Configura tu frontend para usar la URL del backend.

---

## 🧹 Limpiar (Opcional)

Si ya no necesitas los jobs, puedes eliminarlos:

1. Ve a: https://console.cloud.google.com/run/jobs?project=big-axiom-474503-m5
2. Marca los 3 jobs
3. Haz clic en **"ELIMINAR"**

**Nota:** NO generan costo mientras no se ejecuten, así que puedes dejarlos por si necesitas recargar datos.

---

## 🆘 Troubleshooting

### ❌ Job falla con "No module named 'django'"

**Problema:** Imagen incorrecta

**Solución:** Verifica que la imagen sea:
```
us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest
```

### ❌ Job falla con "password authentication failed"

**Problema:** Credenciales incorrectas

**Solución:** Verifica `DB_PASSWORD` en variables de entorno.

### ❌ Job falla con "could not connect to server"

**Problema:** Cloud SQL no conectado

**Solución:** Verifica que agregaste la conexión:
```
big-axiom-474503-m5:us-central1:myproject-db
```

### ❌ Job se queda en "En ejecución" por más de 30 min

**Problema:** Timeout o recursos insuficientes

**Solución:** 
1. Cancela la ejecución
2. Edita el job
3. Aumenta recursos:
   - Memoria: 4 GiB
   - CPU: 4
   - Timeout: 3600 segundos

### ❌ Datos duplicados

**Problema:** Ejecutaste los jobs múltiples veces

**Solución:** Limpia la BD antes de recargar:
```sql
DELETE FROM orders_invoice;
DELETE FROM orders_payment;
DELETE FROM orders_orderitem;
DELETE FROM orders_order;
DELETE FROM products_productvariant;
DELETE FROM products_product;
DELETE FROM authentication_user WHERE role='customer';
```

---

## 📚 Documentos Relacionados

- `CHECKLIST_DESPLIEGUE.md` - Lista de verificación completa
- `GUIA_CARGA_DATOS_GUI.md` - Guía con más detalles
- `RESUMEN_CAMBIOS.md` - Qué cambió y por qué

---

**¿Necesitas ayuda?** Consulta los logs de cada job para ver exactamente qué está pasando.

**¡Éxito con tu despliegue! 🚀**
