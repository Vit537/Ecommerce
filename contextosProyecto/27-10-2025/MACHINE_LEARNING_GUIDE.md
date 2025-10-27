# 🤖 SISTEMA DE MACHINE LEARNING - GUÍA COMPLETA

## 📋 DESCRIPCIÓN GENERAL

Sistema de Machine Learning integrado en la boutique usando **Scikit-learn** (100% GRATIS).

### ✨ Funcionalidades Implementadas

1. **📈 Predicción de Ventas Futuras**
   - Predice ventas de los próximos 7, 15, 30 o 90 días
   - Basado en histórico de ventas
   - Incluye intervalos de confianza

2. **🛍️ Recomendación de Productos**
   - Productos comprados juntos (collaborative filtering)
   - Productos similares (content-based)
   - Sistema híbrido combinado

3. **👥 Segmentación de Clientes**
   - Clustering automático usando K-Means
   - 6 segmentos: VIP, Frecuente, Ocasional, En Riesgo, Nuevo, Inactivo
   - Análisis RFM (Recency, Frequency, Monetary)
   - Predicción de Lifetime Value

4. **📦 Optimización de Inventario**
   - Alertas de stock bajo
   - Detección de productos de baja rotación
   - Recomendaciones de reabastecimiento
   - Score de salud del inventario

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### Paso 1: Instalar dependencias

```bash
cd backend_django
pip install -r requirements.txt
```

### Paso 2: Aplicar migraciones

```bash
python manage.py makemigrations ml_predictions
python manage.py migrate
```

### Paso 3: Generar datos de prueba (IMPORTANTE)

```bash
python generate_ml_data.py
```

Este script genera:
- ✅ 2 años de datos históricos de ventas
- ✅ 1,000+ órdenes realistas
- ✅ Patrones estacionales (diciembre, julio)
- ✅ Comportamiento de clientes (VIP, frecuentes, ocasionales)

**Tiempo estimado:** 2-5 minutos

---

## 📚 GUÍA DE USO - API ENDPOINTS

### 🔐 PERMISOS

**SOLO Admin y Superusuario** tienen acceso a los endpoints de ML.

Headers requeridos:
```
Authorization: Bearer <tu_token_jwt>
```

---

### 1️⃣ PREDICCIÓN DE VENTAS

#### Entrenar Modelo

```http
POST /api/ml/train-sales-forecast/
Content-Type: application/json

{
  "model_type": "random_forest"
}
```

**Opciones de model_type:**
- `random_forest` ⭐ (Recomendado)
- `gradient_boosting` (Más preciso pero lento)
- `linear` (Simple, rápido)

**Respuesta:**
```json
{
  "success": true,
  "message": "Modelo entrenado exitosamente",
  "model_id": "uuid-del-modelo",
  "metrics": {
    "test_r2": 0.85,
    "test_rmse": 45.23,
    "train_r2": 0.92,
    "cv_r2_mean": 0.83
  },
  "duration_seconds": 15
}
```

#### Predecir Ventas Futuras

```http
POST /api/ml/predict-sales/
Content-Type: application/json

{
  "days_ahead": 30
}
```

**Respuesta:**
```json
{
  "success": true,
  "predictions": [
    {
      "date": "2025-10-20",
      "predicted_sales": 1250.50,
      "predicted_quantity": 12,
      "confidence_lower": 1062.93,
      "confidence_upper": 1438.07
    },
    // ... más días
  ],
  "summary": {
    "total_predicted_sales": 37515.00,
    "avg_daily_sales": 1250.50,
    "total_predicted_quantity": 360
  }
}
```

---

### 2️⃣ RECOMENDACIÓN DE PRODUCTOS

#### Entrenar Modelo

```http
POST /api/ml/train-product-recommendation/
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Modelo de recomendaciones entrenado exitosamente",
  "model_id": "uuid",
  "metrics": {
    "total_products": 150,
    "matrix_shape": [150, 150],
    "avg_similarity": 0.23,
    "method": "hybrid"
  }
}
```

#### Obtener Recomendaciones

```http
GET /api/ml/product-recommendations/{product_id}/?top_n=10
```

**Respuesta:**
```json
{
  "success": true,
  "source_product_id": "uuid-producto-base",
  "recommendations": [
    {
      "product_id": "uuid",
      "product_name": "Camisa Polo Azul",
      "similarity_score": 0.87,
      "price": 150.00,
      "image_url": "https://...",
      "rank": 1
    },
    // ... más recomendaciones
  ]
}
```

---

### 3️⃣ SEGMENTACIÓN DE CLIENTES

#### Entrenar Modelo

```http
POST /api/ml/train-customer-segmentation/
Content-Type: application/json

{
  "n_clusters": 6
}
```

**Respuesta:**
```json
{
  "success": true,
  "metrics": {
    "n_clusters": 6,
    "n_customers": 250,
    "silhouette_score": 0.65,
    "cluster_sizes": {
      "0": 50,
      "1": 40,
      "2": 60,
      "3": 30,
      "4": 45,
      "5": 25
    },
    "cluster_names": {
      "0": "vip",
      "1": "frequent",
      "2": "occasional",
      "3": "at_risk",
      "4": "new",
      "5": "inactive"
    }
  }
}
```

#### Obtener Segmento de un Cliente

```http
GET /api/ml/customer-segment/{customer_id}/
```

**Respuesta:**
```json
{
  "success": true,
  "customer_id": "uuid",
  "cluster": 0,
  "segment_type": "vip",
  "confidence_score": 0.85,
  "characteristics": {
    "recency_days": 5,
    "total_orders": 15,
    "total_spent": 3500.00,
    "avg_order_value": 233.33,
    "purchase_frequency_monthly": 1.25
  },
  "lifetime_value_prediction": 8400.00,
  "recommendations": [
    "Ofrecer descuentos exclusivos VIP",
    "Acceso anticipado a nuevas colecciones",
    "Programa de lealtad premium"
  ]
}
```

---

### 4️⃣ OPTIMIZACIÓN DE INVENTARIO

#### Análisis Completo del Inventario

```http
GET /api/ml/inventory-analysis/
```

**Respuesta:**
```json
{
  "success": true,
  "total_products_analyzed": 150,
  "alerts": [
    {
      "product_id": "uuid",
      "product_name": "Jean Skinny Negro",
      "alert_type": "reorder_now",
      "current_stock": 3,
      "recommended_stock": 25,
      "predicted_demand_7days": 8,
      "predicted_demand_30days": 32,
      "urgency_level": 5,
      "estimated_stockout_date": "2025-10-25"
    },
    // ... más alertas
  ],
  "summary": {
    "total_alerts": 23,
    "by_type": {
      "reorder_now": 5,
      "low_stock": 8,
      "slow_moving": 6,
      "overstock": 3,
      "high_demand": 1
    },
    "total_stock_value_at_risk": 4500.00
  }
}
```

#### Recomendaciones de Reorden

```http
GET /api/ml/reorder-recommendations/
```

**Respuesta:**
```json
{
  "success": true,
  "recommendations": [
    {
      "product_id": "uuid",
      "product_name": "Vestido Floral",
      "current_stock": 2,
      "reorder_point": 15,
      "recommended_order_quantity": 30,
      "safety_stock": 8,
      "daily_demand": 1.2,
      "estimated_cost": 900.00,
      "priority": "high"
    }
  ],
  "total_recommendations": 15,
  "estimated_total_cost": 12500.00
}
```

#### Score de Salud del Inventario

```http
GET /api/ml/inventory-health/
```

**Respuesta:**
```json
{
  "success": true,
  "health_score": 78.5,
  "status": "warning",
  "metrics": {
    "total_products": 150,
    "low_stock": 8,
    "overstock": 3,
    "slow_moving": 6,
    "optimal": 133
  },
  "recommendations": [
    "Reabastecer 8 productos con stock bajo",
    "Considerar promociones para 3 productos con sobrestock",
    "Aplicar estrategia de liquidación para 6 productos de baja rotación"
  ]
}
```

---

### 5️⃣ DASHBOARD GENERAL

```http
GET /api/ml/dashboard-summary/
```

**Respuesta:**
```json
{
  "success": true,
  "summary": {
    "total_active_models": 4,
    "total_predictions": 150,
    "predictions_last_7days": 23,
    "active_inventory_alerts": 18,
    "critical_inventory_alerts": 5
  },
  "recent_models": [ /* últimos 5 modelos */ ],
  "recent_trainings": [ /* últimos 10 entrenamientos */ ]
}
```

---

## 📊 VIEWSETS DISPONIBLES

### MLModelViewSet
```http
GET /api/ml/models/          # Listar modelos entrenados
GET /api/ml/models/{id}/     # Detalle de modelo
```

### PredictionViewSet
```http
GET /api/ml/predictions/     # Historial de predicciones
GET /api/ml/predictions/{id}/
```

### InventoryAlertViewSet
```http
GET /api/ml/inventory-alerts/          # Listar alertas
GET /api/ml/inventory-alerts/{id}/
POST /api/ml/inventory-alerts/{id}/resolve/  # Resolver alerta
```

### MLTrainingLogViewSet
```http
GET /api/ml/training-logs/   # Logs de entrenamientos
GET /api/ml/training-logs/{id}/
```

---

## 🎯 FLUJO RECOMENDADO DE USO

### Primera Vez (Configuración Inicial)

1. **Generar datos de prueba:**
   ```bash
   python generate_ml_data.py
   ```

2. **Entrenar todos los modelos:**
   ```bash
   # Predicción de ventas
   POST /api/ml/train-sales-forecast/

   # Recomendaciones
   POST /api/ml/train-product-recommendation/

   # Segmentación
   POST /api/ml/train-customer-segmentation/
   ```

3. **Verificar modelos:**
   ```bash
   GET /api/ml/models/
   ```

### Uso Diario

1. **Revisar Dashboard ML:**
   ```bash
   GET /api/ml/dashboard-summary/
   ```

2. **Revisar Alertas de Inventario:**
   ```bash
   GET /api/ml/inventory-analysis/
   GET /api/ml/inventory-health/
   ```

3. **Predecir Ventas Semanales:**
   ```bash
   POST /api/ml/predict-sales/
   {
     "days_ahead": 7
   }
   ```

### Uso Semanal

1. **Re-entrenar modelos** con nuevos datos:
   ```bash
   POST /api/ml/train-sales-forecast/
   POST /api/ml/train-product-recommendation/
   POST /api/ml/train-customer-segmentation/
   ```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Ajustar Parámetros de Modelos

Editar en `ml_predictions/services/`:

**Sales Forecast:**
```python
# sales_forecast.py
self.model = RandomForestRegressor(
    n_estimators=100,  # Aumentar para más precisión
    max_depth=10,      # Aumentar para más complejidad
    min_samples_split=5,
    random_state=42
)
```

**Segmentación:**
```python
# customer_segmentation.py
self.model = KMeans(
    n_clusters=6,      # Cambiar número de segmentos
    init='k-means++',
    max_iter=300
)
```

---

## 📈 MÉTRICAS Y EVALUACIÓN

### Predicción de Ventas

- **R² Score:** 0.7 - 0.9 (bueno)
- **RMSE:** Menor es mejor
- **MAE:** Error absoluto promedio

### Recomendaciones

- **Similarity Score:** 0 - 1 (mayor = más similar)
- **Cobertura:** % de productos con recomendaciones

### Segmentación

- **Silhouette Score:** 0.5 - 0.7 (bueno)
- **Inertia:** Menor es mejor (cohesión de clusters)

---

## 🐛 TROUBLESHOOTING

### Error: "No hay suficientes datos"

**Solución:** Ejecutar `python generate_ml_data.py`

### Error: "Modelo no encontrado"

**Solución:** Entrenar el modelo primero con los endpoints de training

### Predicciones extrañas

**Solución:** 
1. Verificar calidad de datos históricos
2. Re-entrenar modelo
3. Aumentar `n_estimators` en RandomForest

### Score de salud bajo

**Solución:** Revisar alertas de inventario y tomar acciones

---

## 💡 MEJORES PRÁCTICAS

1. **Re-entrenar modelos semanalmente** con nuevos datos
2. **Monitorear métricas** de los modelos (R², RMSE)
3. **Revisar alertas diariamente**
4. **Generar backups** de modelos entrenados (.pkl)
5. **Validar predicciones** comparando con ventas reales

---

## 📦 ARCHIVOS GENERADOS

Los modelos entrenados se guardan en:
```
backend_django/ml_predictions/ml_models/
├── sales_forecast.pkl                 # Modelo de ventas
├── product_recommendation.pkl         # Modelo de recomendaciones
└── customer_segmentation.pkl          # Modelo de segmentación
```

**Importante:** Hacer backup de estos archivos.

---

## 🆘 SOPORTE

Para problemas o preguntas:
1. Revisar logs: `backend_django/logs/ml.log`
2. Verificar migrations: `python manage.py showmigrations ml_predictions`
3. Revisar admin de Django: `http://localhost:8000/admin/`

---

## 🎉 ¡LISTO!

Ahora tienes un sistema completo de Machine Learning funcionando.

**Próximo paso:** Integrar con el frontend para visualizar las predicciones y alertas.
