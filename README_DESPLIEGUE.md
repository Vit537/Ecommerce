# 📖 README: Despliegue Google Cloud Run

## 🎯 ¿Qué Hicimos?

### ✅ Problema Identificado:
```
❌ ANTES: 5 clientes con 1,676 órdenes = 336 órdenes por cliente
         (Un cliente comprando 11 veces POR DÍA durante 6 meses)
         ¡IRREAL!
```

### ✅ Solución Aplicada:
```
✅ AHORA: 50 clientes con ~600 órdenes = 12 órdenes por cliente
         (Un cliente comprando 2 veces por mes durante 6 meses)
         ¡REALISTA!
```

---

## 📂 Documentos Creados

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **GUIA_CARGA_DATOS_GUI.md** | Guía completa paso a paso con GUI | Para entender el proceso completo |
| **CHECKLIST_DESPLIEGUE.md** | Lista de verificación interactiva | Durante el despliegue |
| **RESUMEN_CAMBIOS.md** | Resumen visual de cambios | Para ver qué cambió |
| **PROBAR_LOCALMENTE.ps1** | Script para probar local | Antes de desplegar |

---

## 🚀 Inicio Rápido

### **Paso 1: Probar Localmente** ✅ RECOMENDADO

```powershell
cd "d:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado\backend_django\ejecutarDatos"
.\PROBAR_LOCALMENTE.ps1
```

Esto ejecutará:
1. Carga 50 clientes
2. Genera ~600 órdenes
3. Crea facturas y pagos
4. Redistribuye fechas
5. Verifica datos

**Tiempo:** ~5-10 minutos

### **Paso 2: Desplegar a Producción**

```powershell
cd "d:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado"
git add .
git commit -m "Fix: 50 clientes realistas + carga manual"
git push origin main
```

Esto desplegará automáticamente el backend a Cloud Run (sin datos).

**Tiempo:** ~3-5 minutos

### **Paso 3: Cargar Datos en Cloud**

**Opción Recomendada: Cloud Run Jobs desde GUI** ⭐

1. Ir a: https://console.cloud.google.com/run/jobs?project=big-axiom-474503-m5

2. Crear 3 Jobs:
   - `load-base-data` → ejecutarDatos/1_generate_test_data.py --auto
   - `load-ml-data` → ejecutarDatos/2_generate_ml_data_v2.py
   - `fix-order-dates` → ejecutarDatos/3_fix_order_dates.py

3. Ejecutar cada Job en orden

**Ver:** `GUIA_CARGA_DATOS_GUI.md` para detalles completos

**Tiempo:** ~15-20 minutos total

---

## 📊 Estructura de Datos

### Clientes (50 total):

```
🌟 VIP (10 clientes)
├─ Compran cada 1-2 semanas
├─ 4-10 items por orden
└─ 30% tienen descuentos

⭐ Frecuentes (15 clientes)
├─ Compran cada 3-4 semanas
├─ 2-6 items por orden
└─ 15% tienen descuentos

💫 Ocasionales (15 clientes)
├─ Compran 1-2 veces por mes
├─ 1-4 items por orden
└─ 5% tienen descuentos

✨ Nuevos (10 clientes)
├─ 1-2 compras en 6 meses
├─ 1-2 items por orden
└─ Sin descuentos
```

### Órdenes (~600 total):

```
📈 Distribución temporal:
├─ Días normales: 2-4 órdenes/día
├─ Fines de semana: +50% más
├─ Diciembre (Navidad): +80%
├─ Junio-Julio (Invierno): +40%
└─ Febrero (San Valentín): +20%

📊 Estadísticas:
├─ Promedio: 12 órdenes por cliente
├─ Período: 6 meses (180 días)
├─ Facturas: ~99% de órdenes
└─ Pagos: ~99% de órdenes
```

---

## 🔧 Archivos Modificados

### 1. `ejecutarDatos/1_generate_test_data.py`
```diff
- 5 clientes
+ 50 clientes (distribuidos en segmentos)
```

### 2. `ejecutarDatos/2_generate_ml_data_v2.py`
```diff
- 2-5 órdenes/día con multiplicadores altos
+ 2-4 órdenes/día con multiplicadores moderados
```

### 3. `docker-entrypoint.sh`
```diff
- Carga datos automáticamente al desplegar
+ Solo migraciones + superusuario (sin datos)
```

### 4. `ejecutarDatos/4_check_data.py`
```diff
+ Muestra distribución de órdenes por cliente
+ Top 10 clientes con más órdenes
+ Promedio de órdenes por cliente
```

---

## 🎓 ¿Por Qué Este Cambio?

### Antes (Irreal):
- 5 clientes
- 1,676 órdenes
- **336 órdenes por cliente en 6 meses**
- = **11 órdenes por día por cliente**
- = Un cliente comprando cada 2 horas, todos los días 🤯

### Ahora (Realista):
- 50 clientes
- ~600 órdenes
- **12 órdenes por cliente en 6 meses**
- = **2 órdenes por mes por cliente**
- = Un cliente comprando 2 veces al mes ✅

---

## 🎯 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL (Testing)                                             │
├─────────────────────────────────────────────────────────────┤
│  1. Modificar scripts (50 clientes, ~600 órdenes)           │
│  2. Ejecutar PROBAR_LOCALMENTE.ps1                          │
│  3. Verificar datos con 4_check_data.py                     │
│  4. Todo OK ✅                                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  GITHUB (Version Control)                                    │
├─────────────────────────────────────────────────────────────┤
│  1. git add .                                                │
│  2. git commit -m "Fix: 50 clientes realistas"              │
│  3. git push origin main                                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS (CI/CD Automático)                          │
├─────────────────────────────────────────────────────────────┤
│  1. Detecta push a main                                      │
│  2. Build imagen Docker                                      │
│  3. Sube a Artifact Registry                                 │
│  4. Despliega a Cloud Run                                    │
│  5. Backend online ✅ (sin datos)                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  GOOGLE CLOUD CONSOLE (Carga Manual de Datos)               │
├─────────────────────────────────────────────────────────────┤
│  1. Crear Cloud Run Job: load-base-data                     │
│     → Carga 50 clientes + productos                          │
│  2. Crear Cloud Run Job: load-ml-data                       │
│     → Genera ~600 órdenes + facturas + pagos                 │
│  3. Crear Cloud Run Job: fix-order-dates                    │
│     → Redistribuye fechas en 6 meses                         │
│  4. Verificar datos en Cloud SQL                             │
│  5. Probar API                                               │
│  6. Todo funcionando ✅                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 Importante

### ⚠️ Solo cargar datos UNA VEZ

Los datos que cargas son solo para:
- **Demostración** del sistema
- **Testing** de funcionalidades
- **Entrenamiento** de modelos ML iniciales

**Después**, los clientes REALES crearán sus propias órdenes desde el frontend.

### ⚠️ No cargar automáticamente

El `docker-entrypoint.sh` ya NO carga datos automáticamente.

**Razones:**
- Cada vez que reinicia el contenedor NO debe recargar datos
- Los datos solo se cargan UNA VEZ manualmente
- Tienes control total sobre cuándo cargar

---

## 📖 Documentación Adicional

### Para Entender el Sistema:
- `GUIA_DESPLIEGUE_PRODUCCION.md` - Todas las opciones de despliegue
- `RESUMEN_CAMBIOS.md` - Comparación antes/después

### Para Ejecutar:
- `CHECKLIST_DESPLIEGUE.md` - Paso a paso con checkboxes
- `GUIA_CARGA_DATOS_GUI.md` - Guía detallada con GUI

### Para Verificar:
- `ejecutarDatos/4_check_data.py` - Script de verificación
- Consultas SQL en Cloud SQL Console

---

## 💬 FAQ

### ¿Puedo cambiar la cantidad de clientes?
Sí, edita `1_generate_test_data.py` y modifica el array `customers_data`.

### ¿Puedo cambiar la cantidad de órdenes?
Sí, edita `2_generate_ml_data_v2.py` y modifica `base_orders = random.randint(2, 4)`.

### ¿Qué pasa si ejecuto los scripts dos veces?
Los datos se duplicarán. Primero limpia la BD con SQL:
```sql
DELETE FROM orders_invoice;
DELETE FROM orders_payment;
DELETE FROM orders_orderitem;
DELETE FROM orders_order;
DELETE FROM authentication_user WHERE role='customer';
```

### ¿Puedo usar este mismo proceso para otros entornos?
Sí, este proceso funciona para:
- Desarrollo (local)
- Staging (Cloud Run)
- Producción (Cloud Run)

Solo cambia las credenciales y el proyecto de Google Cloud.

---

## ✅ Resumen Final

```
✅ 50 clientes realistas (10 VIP + 15 frecuentes + 15 ocasionales + 10 nuevos)
✅ ~600 órdenes distribuidas en 6 meses
✅ ~12 órdenes por cliente (2/mes) - REALISTA
✅ Despliegue automático desde GitHub
✅ Carga manual de datos con Cloud Run Jobs
✅ Backend listo para escalar con clientes reales
```

---

## 🚀 ¡Estás Listo!

Sigue el `CHECKLIST_DESPLIEGUE.md` paso a paso y tendrás tu backend en producción con datos realistas en ~30 minutos.

**¡Éxito! 🎉**
