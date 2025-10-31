# 🎨 Guía: Cargar Datos usando Google Cloud Console (GUI)

## 📋 Resumen de Cambios Realizados

### ✅ **1. Más Clientes (5 → 50 clientes)**
- **Antes:** 5 clientes con ~336 órdenes cada uno (irreal)
- **Ahora:** 50 clientes con ~12 órdenes cada uno en 6 meses (realista)
- **Distribución:**
  - 10 clientes VIP (compran frecuentemente, 4-10 items)
  - 15 clientes frecuentes (compran regularmente, 2-6 items)
  - 15 clientes ocasionales (compran ocasionalmente, 1-4 items)
  - 10 clientes nuevos/esporádicos (1-2 compras, 1-2 items)

### ✅ **2. Órdenes Reducidas (1,676 → ~600 órdenes)**
- **Antes:** 2-5 órdenes/día con multiplicadores altos
- **Ahora:** 2-4 órdenes/día con multiplicadores moderados
- **Total esperado:** ~600 órdenes en 6 meses
- **Promedio por cliente:** 12 órdenes/semestre = 2 órdenes/mes

### ✅ **3. Desactivada Carga Automática**
- `docker-entrypoint.sh` ya NO carga datos automáticamente
- El backend solo ejecuta migraciones y crea superusuario
- Los datos se cargan manualmente después del despliegue

---

## 🚀 Proceso Completo (Usando Google Cloud Console)

### **FASE 1: Desplegar Backend (GitHub Actions Automático)**

#### 1. Verificar que los cambios estén en GitHub

```powershell
# En tu carpeta del proyecto
cd "d:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado"

# Verificar estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Fix: 50 clientes y ~600 órdenes. Desactivada carga automática"

# Push (esto dispara el despliegue automático)
git push origin main
```

#### 2. Verificar Despliegue en Cloud Console

1. Ve a: https://console.cloud.google.com/run?project=big-axiom-474503-m5
2. Busca el servicio: **`ecommerce-backend`**
3. Verás que se está desplegando (tarda ~3-5 minutos)
4. Espera a que el estado sea: ✅ **"Serving"**

---

### **FASE 2: Cargar Datos Manualmente (GUI de Google Cloud)**

## 📌 **Opción A: Cloud Shell (MÁS FÁCIL)** ⭐ RECOMENDADO

### **Paso 1: Conectarse a Cloud SQL**

1. Ve a: https://console.cloud.google.com/sql/instances?project=big-axiom-474503-m5

2. Haz clic en tu instancia: **`myproject-db`**

3. Haz clic en el botón **"ABRIR CLOUD SHELL"** (arriba a la derecha)

4. En Cloud Shell, ejecuta:
   ```bash
   # Obtener URL del servicio
   SERVICE_URL=$(gcloud run services describe ecommerce-backend \
     --region us-central1 \
     --format="value(status.url)")
   
   echo "Backend URL: $SERVICE_URL"
   ```

### **Paso 2: Cargar Scripts en Cloud Shell**

```bash
# Clonar repositorio en Cloud Shell
git clone https://github.com/Vit537/Ecommerce.git
cd Ecommerce/backend_django

# O subir archivos manualmente:
# - Haz clic en los 3 puntos ⋮ en Cloud Shell
# - Selecciona "Subir archivo"
# - Sube los 3 scripts desde ejecutarDatos/
```

### **Paso 3: Configurar Variables de Entorno**

```bash
# Configurar variables para conectarse a Cloud SQL
export DB_NAME=ecommerce
export DB_USER=ecommerce-user
export DB_PASSWORD="TU_PASSWORD_AQUI"  # ⚠️ CAMBIAR
export DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db
export DJANGO_SECRET_KEY="TU_SECRET_KEY_AQUI"  # ⚠️ CAMBIAR
export DEBUG=False
```

### **Paso 4: Ejecutar Scripts desde Cloud Shell**

⚠️ **IMPORTANTE:** Cloud Shell NO tiene acceso directo a Cloud SQL.
Necesitas usar Cloud Run Jobs (ver Opción B) o Cloud SQL Proxy:

```bash
# 1. Instalar Cloud SQL Proxy
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# 2. Iniciar proxy en background
./cloud_sql_proxy -instances=big-axiom-474503-m5:us-central1:myproject-db=tcp:5432 &

# 3. Cambiar DB_HOST a localhost
export DB_HOST=localhost
export DB_PORT=5432

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Ejecutar scripts
cd ejecutarDatos
python 1_generate_test_data.py --auto
python 2_generate_ml_data_v2.py
python 3_fix_order_dates.py

# 6. Verificar
python 4_check_data.py
```

---

## 📌 **Opción B: Cloud Run Jobs (GUI COMPLETO)** ⭐⭐ MÁS RECOMENDADO

### **Paso 1: Crear Job en Cloud Console**

1. Ve a: https://console.cloud.google.com/run/jobs?project=big-axiom-474503-m5

2. Haz clic en **"CREAR JOB"**

3. Configura:
   - **Nombre del job:** `load-base-data`
   - **Región:** `us-central1`
   - **Imagen del contenedor:** 
     ```
     us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest
     ```
   
4. **Comando y argumentos:**
   - Haz clic en **"Mostrar opciones avanzadas"**
   - En **"Punto de entrada del contenedor (opcional)"**, pon:
     ```
     python
     ```
   - En **"Argumentos (uno por línea)"**, pon:
     ```
     ejecutarDatos/1_generate_test_data.py
     --auto
     ```

5. **Variables de entorno:**
   - Haz clic en **"Variables y secretos"**
   - Agregar cada una:
     ```
     DB_NAME = ecommerce
     DB_USER = ecommerce-user
     DB_PASSWORD = TU_PASSWORD  ⚠️ CAMBIAR
     DB_HOST = /cloudsql/big-axiom-474503-m5:us-central1:myproject-db
     DJANGO_SECRET_KEY = TU_SECRET_KEY  ⚠️ CAMBIAR
     DEBUG = False
     ```

6. **Conexión a Cloud SQL:**
   - En **"Conexiones"**
   - Haz clic en **"Agregar conexión de Cloud SQL"**
   - Selecciona: `big-axiom-474503-m5:us-central1:myproject-db`

7. **Recursos:**
   - **Memoria:** 2 GiB
   - **CPU:** 2
   - **Tiempo de espera de la tarea:** 1800 segundos (30 min)
   - **Número máximo de reintentos:** 0

8. Haz clic en **"CREAR"**

### **Paso 2: Ejecutar el Job**

1. En la lista de Jobs, busca **`load-base-data`**

2. Haz clic en el nombre del job

3. Haz clic en **"EJECUTAR"**

4. Espera a que el estado sea: ✅ **"Correctamente"** (~5-10 minutos)

5. Para ver logs:
   - Haz clic en la ejecución
   - Ve a la pestaña **"REGISTROS"**

### **Paso 3: Crear y Ejecutar Segundo Job (ML Data)**

Repite el **Paso 1** pero con estos cambios:

- **Nombre del job:** `load-ml-data`
- **Argumentos:**
  ```
  ejecutarDatos/2_generate_ml_data_v2.py
  ```
- Todo lo demás igual

Luego ejecuta el job (Paso 2).

### **Paso 4: Crear y Ejecutar Tercer Job (Fix Dates)**

Repite el **Paso 1** pero con estos cambios:

- **Nombre del job:** `fix-order-dates`
- **Argumentos:**
  ```
  ejecutarDatos/3_fix_order_dates.py
  ```
- Todo lo demás igual

Luego ejecuta el job (Paso 2).

---

## 📌 **Opción C: Usar Cloud Console Terminal (EN EL CONTENEDOR)**

### **Paso 1: Acceder al Contenedor en Ejecución**

1. Ve a: https://console.cloud.google.com/run/detail/us-central1/ecommerce-backend?project=big-axiom-474503-m5

2. Haz clic en la pestaña **"REVISIONES"**

3. Haz clic en la revisión activa (la primera)

4. Haz clic en **"REGISTROS"**

5. En la parte superior, haz clic en **"ABRIR CLOUD SHELL"**

### **Paso 2: Conectarse al Contenedor**

⚠️ **Problema:** Cloud Run NO permite SSH directo al contenedor.

**Solución alternativa:**

```bash
# En Cloud Shell, ejecuta comandos remotos
gcloud run services proxy ecommerce-backend --region us-central1 --port 8080
```

Esto NO funciona para ejecutar scripts. **Usa Cloud Run Jobs (Opción B)** en su lugar.

---

## ✅ **Verificar Datos Cargados**

### **Opción 1: Desde Cloud SQL (GUI)**

1. Ve a: https://console.cloud.google.com/sql/instances?project=big-axiom-474503-m5

2. Haz clic en **`myproject-db`**

3. Haz clic en **"ABRIR CLOUD SHELL"** o **"CONECTAR CON CLOUD SHELL"**

4. Ejecuta:
   ```bash
   gcloud sql connect myproject-db --user=ecommerce-user --database=ecommerce
   ```

5. Ingresa tu password

6. Ejecuta SQL:
   ```sql
   SELECT COUNT(*) as total_usuarios FROM authentication_user;
   SELECT COUNT(*) as total_productos FROM products_product;
   SELECT COUNT(*) as total_ordenes FROM orders_order;
   SELECT COUNT(*) as total_facturas FROM orders_invoice;
   SELECT COUNT(*) as total_pagos FROM orders_payment;
   
   -- Ver distribución de órdenes por cliente
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

### **Opción 2: Desde el API (Postman/Browser)**

1. Obtén la URL del backend:
   ```
   https://ecommerce-backend-[ID].run.app
   ```

2. Prueba endpoints:
   ```
   GET https://ecommerce-backend-[ID].run.app/api/
   GET https://ecommerce-backend-[ID].run.app/api/products/
   GET https://ecommerce-backend-[ID].run.app/api/orders/
   ```

3. O desde tu frontend desplegado.

---

## 📊 Resultados Esperados

| Métrica | Antes | Ahora | Razón |
|---------|-------|-------|-------|
| **Clientes** | 5 | 50 | Más realista |
| **Órdenes Totales** | ~1,676 | ~600 | Distribuidas entre más clientes |
| **Órdenes/Cliente** | ~336 | ~12 | Promedio realista (2/mes) |
| **Items/Orden** | 1-10 | 1-10 | Según tipo de cliente |
| **Facturas** | ~1,658 | ~595 | ~99% de órdenes |
| **Pagos** | ~1,662 | ~598 | ~99% de órdenes |

---

## 🎯 **Recomendación Final**

**USA LA OPCIÓN B (Cloud Run Jobs desde GUI):**

✅ **Ventajas:**
- Todo desde la interfaz gráfica (GUI)
- No necesitas comandos complejos
- Fácil de reejecutar si algo falla
- Logs dedicados para cada paso
- Mayor control y visibilidad

❌ **Evitar:**
- Cloud Shell sin proxy (no tiene acceso a Cloud SQL)
- Intentar SSH al contenedor (Cloud Run no lo soporta)

---

## 🚨 **Troubleshooting**

### Error: "No module named 'django'"
**Solución:** El Job está usando la imagen incorrecta. Verifica que uses:
```
us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest
```

### Error: "FATAL: password authentication failed"
**Solución:** Verifica las credenciales en variables de entorno:
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### Error: "could not connect to server"
**Solución:** Verifica que agregaste la conexión de Cloud SQL al Job:
- En configuración del Job
- Sección "Conexiones"
- Agregar: `big-axiom-474503-m5:us-central1:myproject-db`

### Job tarda mucho o timeout
**Solución:** Aumenta recursos:
- Memoria: 2 GiB → 4 GiB
- CPU: 2 → 4
- Timeout: 1800 → 3600 segundos

---

## 📝 **Resumen del Proceso**

1. ✅ **Push a GitHub** → Despliegue automático
2. ✅ **Crear 3 Cloud Run Jobs** (base-data, ml-data, fix-dates)
3. ✅ **Ejecutar Jobs en orden** (uno por uno, esperando que termine)
4. ✅ **Verificar datos** en Cloud SQL o API
5. ✅ **Listo!** Backend con datos realistas en producción

---

¿Necesitas ayuda con algún paso específico? 🚀
