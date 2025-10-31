# ✅ Checklist: Despliegue a Producción Google Cloud

## 📋 Pre-Despliegue (Local)

### 1. Verificar Cambios Locales

- [ ] Ejecutar script de prueba local:
  ```powershell
  cd backend_django\ejecutarDatos
  .\PROBAR_LOCALMENTE.ps1
  ```

- [ ] Verificar resultados esperados:
  - [ ] 50 clientes creados
  - [ ] ~600 órdenes generadas
  - [ ] Promedio ~12 órdenes por cliente
  - [ ] ~595 facturas (99%)
  - [ ] ~598 pagos (99%)

- [ ] Verificar logs sin errores:
  - [ ] No hay warnings sobre modelos duplicados
  - [ ] No hay errores de integridad
  - [ ] Todos los scripts terminaron con éxito

### 2. Revisar Archivos Modificados

- [ ] `backend_django/ejecutarDatos/1_generate_test_data.py`
  - [ ] 50 clientes (antes 5)
  - [ ] Distribuidos en segmentos

- [ ] `backend_django/ejecutarDatos/2_generate_ml_data_v2.py`
  - [ ] Órdenes reducidas (2-4/día vs 2-5/día)
  - [ ] Multiplicadores moderados

- [ ] `backend_django/docker-entrypoint.sh`
  - [ ] Carga automática desactivada
  - [ ] Solo migraciones + superusuario

---

## 🚀 Despliegue

### 3. Subir Cambios a GitHub

```powershell
cd "d:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado"

git status
git add .
git commit -m "Fix: 50 clientes realistas + ~600 órdenes. Desactivada carga automática"
git push origin main
```

- [ ] Push exitoso a GitHub
- [ ] GitHub Actions iniciado automáticamente

### 4. Verificar Despliegue en Cloud Run

1. [ ] Ir a: https://console.cloud.google.com/run?project=big-axiom-474503-m5
2. [ ] Ver servicio `ecommerce-backend`
3. [ ] Estado: **"Serving"** ✅
4. [ ] Revisión nueva desplegada
5. [ ] Ver logs:
   - [ ] Migraciones ejecutadas correctamente
   - [ ] Superusuario creado
   - [ ] Gunicorn iniciado en puerto 8080
   - [ ] **NO debe aparecer "Cargando datos..."**

---

## 📦 Carga de Datos (Manual)

### 5. Preparar Credenciales

Antes de crear los Jobs, necesitas:

- [ ] `DB_PASSWORD` de Cloud SQL
  - Dónde encontrarlo: En tus secrets de GitHub o Cloud Console
  
- [ ] `DJANGO_SECRET_KEY`
  - Dónde encontrarlo: En tus secrets de GitHub o `.env.example`

### 6. Crear Cloud Run Job #1: Base Data

1. [ ] Ir a: https://console.cloud.google.com/run/jobs?project=big-axiom-474503-m5

2. [ ] Click **"CREAR JOB"**

3. [ ] Configurar:
   - [ ] Nombre: `load-base-data`
   - [ ] Región: `us-central1`
   - [ ] Imagen: `us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest`

4. [ ] Punto de entrada:
   - [ ] `python`

5. [ ] Argumentos (uno por línea):
   ```
   ejecutarDatos/1_generate_test_data.py
   --auto
   ```

6. [ ] Variables de entorno:
   ```
   DB_NAME = ecommerce
   DB_USER = ecommerce-user
   DB_PASSWORD = [TU_PASSWORD]
   DB_HOST = /cloudsql/big-axiom-474503-m5:us-central1:myproject-db
   DJANGO_SECRET_KEY = [TU_SECRET_KEY]
   DEBUG = False
   ```

7. [ ] Conexión Cloud SQL:
   - [ ] Agregar: `big-axiom-474503-m5:us-central1:myproject-db`

8. [ ] Recursos:
   - [ ] Memoria: 2 GiB
   - [ ] CPU: 2
   - [ ] Timeout: 1800 segundos

9. [ ] Click **"CREAR"**

### 7. Ejecutar Job #1

- [ ] Click en job `load-base-data`
- [ ] Click **"EJECUTAR"**
- [ ] Esperar estado: ✅ **"Correctamente"** (~5-10 min)
- [ ] Ver logs:
  - [ ] 50 clientes creados
  - [ ] Permisos y roles creados
  - [ ] Productos, categorías, marcas creados
  - [ ] Sin errores críticos

### 8. Crear Cloud Run Job #2: ML Data

1. [ ] Repetir pasos del Job #1 con estos cambios:
   - [ ] Nombre: `load-ml-data`
   - [ ] Argumentos:
     ```
     ejecutarDatos/2_generate_ml_data_v2.py
     ```
   - [ ] Todo lo demás igual

### 9. Ejecutar Job #2

- [ ] Click en job `load-ml-data`
- [ ] Click **"EJECUTAR"**
- [ ] Esperar estado: ✅ **"Correctamente"** (~5-10 min)
- [ ] Ver logs:
  - [ ] ~600 órdenes creadas
  - [ ] Facturas generadas automáticamente
  - [ ] Pagos generados automáticamente
  - [ ] Sin errores de integridad

### 10. Crear Cloud Run Job #3: Fix Dates

1. [ ] Repetir pasos del Job #1 con estos cambios:
   - [ ] Nombre: `fix-order-dates`
   - [ ] Argumentos:
     ```
     ejecutarDatos/3_fix_order_dates.py
     ```
   - [ ] Todo lo demás igual

### 11. Ejecutar Job #3

- [ ] Click en job `fix-order-dates`
- [ ] Click **"EJECUTAR"**
- [ ] Esperar estado: ✅ **"Correctamente"** (~2-3 min)
- [ ] Ver logs:
  - [ ] Fechas redistribuidas
  - [ ] Órdenes actualizadas
  - [ ] Sin errores

---

## ✅ Verificación Post-Despliegue

### 12. Verificar Datos en Cloud SQL

1. [ ] Ir a: https://console.cloud.google.com/sql/instances?project=big-axiom-474503-m5

2. [ ] Click en `myproject-db`

3. [ ] Click **"ABRIR CLOUD SHELL"**

4. [ ] Conectar:
   ```bash
   gcloud sql connect myproject-db --user=ecommerce-user --database=ecommerce
   ```

5. [ ] Ejecutar queries:
   ```sql
   -- Contar registros
   SELECT 
       (SELECT COUNT(*) FROM authentication_user WHERE role='customer') as clientes,
       (SELECT COUNT(*) FROM orders_order) as ordenes,
       (SELECT COUNT(*) FROM orders_invoice) as facturas,
       (SELECT COUNT(*) FROM orders_payment) as pagos;
   
   -- Top 10 clientes
   SELECT 
       CONCAT(u.first_name, ' ', u.last_name) as cliente,
       COUNT(o.id) as ordenes
   FROM authentication_user u
   LEFT JOIN orders_order o ON o.customer_id = u.id
   WHERE u.role = 'customer'
   GROUP BY u.id, u.first_name, u.last_name
   ORDER BY ordenes DESC
   LIMIT 10;
   
   -- Verificar promedio
   SELECT 
       COUNT(DISTINCT customer_id) as total_clientes,
       COUNT(*) as total_ordenes,
       ROUND(COUNT(*)::numeric / COUNT(DISTINCT customer_id), 2) as promedio_ordenes_por_cliente
   FROM orders_order;
   ```

6. [ ] Resultados esperados:
   - [ ] 50 clientes
   - [ ] ~600 órdenes
   - [ ] ~595 facturas
   - [ ] ~598 pagos
   - [ ] Promedio: ~12 órdenes/cliente

### 13. Probar API

1. [ ] Obtener URL del backend:
   - Ve a Cloud Run
   - Copia URL del servicio `ecommerce-backend`

2. [ ] Probar endpoints:
   ```
   GET [URL]/api/
   GET [URL]/api/products/
   GET [URL]/api/orders/
   GET [URL]/admin/
   ```

3. [ ] Login en Admin:
   - [ ] Usuario: `superadmin@boutique.com`
   - [ ] Password: `admin123`

4. [ ] Verificar datos en Admin Panel:
   - [ ] Ver usuarios
   - [ ] Ver productos
   - [ ] Ver órdenes
   - [ ] Ver facturas

### 14. Probar desde Frontend (Si está desplegado)

- [ ] Login con cliente de prueba
- [ ] Ver catálogo de productos
- [ ] Agregar productos al carrito
- [ ] Crear orden de prueba
- [ ] Verificar que se crea correctamente

---

## 🧹 Limpieza Post-Despliegue

### 15. Opcional: Eliminar Jobs (Después de usar)

Si ya no necesitas ejecutar los jobs de carga:

- [ ] Ir a Cloud Run Jobs
- [ ] Eliminar: `load-base-data`
- [ ] Eliminar: `load-ml-data`
- [ ] Eliminar: `fix-order-dates`

**Nota:** NO es necesario eliminarlos, no generan costo mientras no se ejecuten.

---

## 📊 Resultados Finales Esperados

### Datos:
✅ 50 clientes  
✅ ~600 órdenes  
✅ ~12 órdenes por cliente (2/mes)  
✅ ~595 facturas (99%)  
✅ ~598 pagos (99%)  

### Despliegue:
✅ Backend desplegado en Cloud Run  
✅ Conectado a Cloud SQL  
✅ Migraciones aplicadas  
✅ Superusuario creado  
✅ Datos cargados manualmente  
✅ API funcionando  
✅ Admin panel accesible  

---

## 🚨 Troubleshooting

### Si algo falla:

#### Job falla con "No module named 'django'"
- **Causa:** Imagen incorrecta
- **Solución:** Verificar que uses la imagen correcta con tag `latest`

#### Job timeout después de 30 minutos
- **Causa:** Recursos insuficientes
- **Solución:** Aumentar memoria a 4 GiB y CPU a 4

#### Error "password authentication failed"
- **Causa:** Credenciales incorrectas
- **Solución:** Verificar `DB_PASSWORD` en variables de entorno

#### Error "could not connect to server"
- **Causa:** Cloud SQL no conectado
- **Solución:** Agregar conexión Cloud SQL al Job

#### Datos no se ven en API
- **Causa:** Jobs no ejecutados o fallaron
- **Solución:** Ver logs de cada Job en Cloud Console

---

## 📝 Notas Importantes

- ⚠️ **Solo cargar datos UNA VEZ en producción**
- 💾 **Hacer backup de BD antes de cargar datos**
- 🔄 **Si necesitas recargar, primero vacía las tablas manualmente**
- 📊 **Estos datos son SOLO para demostración/testing**
- 🚀 **En producción real, los clientes crearán sus propias órdenes**

---

## 🎯 ¿Todo Listo?

Si marcaste todos los checkboxes: **¡Felicidades! 🎉**

Tu backend está desplegado con datos realistas en Google Cloud.

**Próximo paso:** Desplegar frontend y conectarlo al backend 🚀

---

**Documentos de referencia:**
- `GUIA_CARGA_DATOS_GUI.md` - Guía detallada paso a paso
- `RESUMEN_CAMBIOS.md` - Resumen de cambios realizados
- `GUIA_DESPLIEGUE_PRODUCCION.md` - Opciones de despliegue

**Archivos útiles:**
- `backend_django/ejecutarDatos/PROBAR_LOCALMENTE.ps1` - Script de prueba local
- `backend_django/ejecutarDatos/4_check_data.py` - Script de verificación
