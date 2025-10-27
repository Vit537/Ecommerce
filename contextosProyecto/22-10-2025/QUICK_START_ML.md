# 🧪 SCRIPT DE PRUEBA RÁPIDA - MACHINE LEARNING

## Uso con tus datos existentes

Si ya tienes datos en la base de datos, puedes entrenar los modelos directamente **sin necesidad de generar datos adicionales** (aunque tener más datos siempre es mejor para ML).

---

## 📊 VERIFICAR DATOS ACTUALES

Primero, verifica cuántos datos tienes:

```python
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from orders.models import Order
from products.models import Product

User = get_user_model()

# Verificar datos
print(f"Clientes: {User.objects.filter(role='customer').count()}")
print(f"Productos: {Product.objects.filter(status='active').count()}")
print(f"Órdenes completadas: {Order.objects.filter(status__in=['delivered', 'completed']).count()}")

# Ver distribución de órdenes por mes
from django.db.models import Count
from django.db.models.functions import TruncMonth

orders_by_month = Order.objects.filter(
    status__in=['delivered', 'completed']
).annotate(
    month=TruncMonth('created_at')
).values('month').annotate(
    count=Count('id')
).order_by('month')

print("\nÓrdenes por mes:")
for item in orders_by_month:
    print(f"  {item['month'].strftime('%Y-%m')}: {item['count']} órdenes")
```

---

## ✅ REQUISITOS MÍNIMOS PARA ML

| Modelo | Datos Mínimos | Recomendado |
|--------|---------------|-------------|
| **Predicción de Ventas** | 30+ órdenes | 200+ órdenes |
| **Recomendaciones** | 20+ productos, 30+ órdenes | 50+ productos, 200+ órdenes |
| **Segmentación** | 10+ clientes con compras | 50+ clientes |
| **Inventario** | Productos con variantes | - |

---

## 🚀 ENTRENAR MODELOS CON TUS DATOS

### Opción 1: Usar API (Recomendado)

**1. Obtener Token JWT:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@boutique.com",
    "password": "tu_password"
  }'
```

Guarda el token: `export TOKEN="tu_token_aqui"`

**2. Entrenar Predicción de Ventas:**
```bash
curl -X POST http://localhost:8000/api/ml/train-sales-forecast/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model_type": "random_forest"}'
```

**3. Hacer Predicción:**
```bash
curl -X POST http://localhost:8000/api/ml/predict-sales/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days_ahead": 30}'
```

**4. Entrenar Recomendaciones:**
```bash
curl -X POST http://localhost:8000/api/ml/train-product-recommendation/ \
  -H "Authorization: Bearer $TOKEN"
```

**5. Obtener Recomendaciones:**
```bash
# Reemplaza PRODUCT_ID con un UUID real de tu base de datos
curl http://localhost:8000/api/ml/product-recommendations/PRODUCT_ID/?top_n=10 \
  -H "Authorization: Bearer $TOKEN"
```

**6. Entrenar Segmentación:**
```bash
curl -X POST http://localhost:8000/api/ml/train-customer-segmentation/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"n_clusters": 6}'
```

**7. Analizar Inventario:**
```bash
curl http://localhost:8000/api/ml/inventory-analysis/ \
  -H "Authorization: Bearer $TOKEN"
```

**8. Dashboard ML:**
```bash
curl http://localhost:8000/api/ml/dashboard-summary/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### Opción 2: Usar Django Shell

```bash
python manage.py shell
```

```python
from ml_predictions.services import (
    SalesForecastService,
    ProductRecommendationService,
    CustomerSegmentationService,
    InventoryOptimizationService
)

# 1. Entrenar predicción de ventas
print("Entrenando modelo de ventas...")
sales_service = SalesForecastService()
result = sales_service.train_model(model_type='random_forest')
print(result)

# 2. Hacer predicción
if result['success']:
    print("\nHaciendo predicción de 30 días...")
    predictions = sales_service.predict_future_sales(days_ahead=30)
    print(f"Predicción total: ${predictions['summary']['total_predicted_sales']:.2f}")
    print(f"Promedio diario: ${predictions['summary']['avg_daily_sales']:.2f}")

# 3. Entrenar recomendaciones
print("\n\nEntrenando modelo de recomendaciones...")
rec_service = ProductRecommendationService()
result = rec_service.train_model()
print(result)

# 4. Entrenar segmentación
print("\n\nEntrenando segmentación de clientes...")
seg_service = CustomerSegmentationService()
result = seg_service.train_model(n_clusters=6)
print(result)

# 5. Analizar inventario
print("\n\nAnalizando inventario...")
inv_service = InventoryOptimizationService()
result = inv_service.analyze_inventory()
print(f"Total alertas: {result['summary']['total_alerts']}")
print(f"Alertas por tipo: {result['summary']['by_type']}")

# 6. Obtener health score
health = inv_service.get_inventory_health_score()
print(f"\nSalud del inventario: {health['health_score']}/100 ({health['status']})")
```

---

## 🧪 EJEMPLO DE PRUEBA COMPLETA

Guarda esto como `test_ml_complete.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ml_predictions.services import (
    SalesForecastService,
    ProductRecommendationService,
    CustomerSegmentationService,
    InventoryOptimizationService
)
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

def test_ml_system():
    print("=" * 80)
    print("🤖 PRUEBA COMPLETA DEL SISTEMA DE MACHINE LEARNING")
    print("=" * 80)
    
    # 1. Predicción de Ventas
    print("\n1️⃣ PREDICCIÓN DE VENTAS")
    print("-" * 80)
    sales_service = SalesForecastService()
    
    print("Entrenando modelo...")
    train_result = sales_service.train_model(model_type='random_forest')
    
    if train_result['success']:
        print(f"✅ Modelo entrenado exitosamente")
        print(f"   R² Score: {train_result['metrics']['test_r2']:.4f}")
        print(f"   RMSE: {train_result['metrics']['test_rmse']:.2f}")
        print(f"   Datos de entrenamiento: {train_result['training_data_size']} registros")
        
        print("\nGenerando predicciones para 30 días...")
        pred_result = sales_service.predict_future_sales(days_ahead=30)
        
        if pred_result['success']:
            print(f"✅ Predicciones generadas")
            print(f"   Total previsto: ${pred_result['summary']['total_predicted_sales']:,.2f}")
            print(f"   Promedio diario: ${pred_result['summary']['avg_daily_sales']:,.2f}")
            print(f"   Cantidad total: {pred_result['summary']['total_predicted_quantity']} unidades")
        else:
            print(f"❌ Error en predicción: {pred_result.get('error')}")
    else:
        print(f"❌ Error en entrenamiento: {train_result.get('error')}")
    
    # 2. Recomendaciones de Productos
    print("\n\n2️⃣ RECOMENDACIONES DE PRODUCTOS")
    print("-" * 80)
    rec_service = ProductRecommendationService()
    
    print("Entrenando modelo de recomendaciones...")
    train_result = rec_service.train_model()
    
    if train_result['success']:
        print(f"✅ Modelo entrenado exitosamente")
        print(f"   Total productos: {train_result['metrics']['total_products']}")
        print(f"   Método: {train_result['metrics']['method']}")
        
        # Probar con primer producto
        first_product = Product.objects.filter(status='active').first()
        if first_product:
            print(f"\nObteniendo recomendaciones para: {first_product.name}")
            recs = rec_service.get_recommendations(str(first_product.id), top_n=5)
            
            if recs['success'] and recs['recommendations']:
                print(f"✅ {len(recs['recommendations'])} recomendaciones:")
                for rec in recs['recommendations'][:3]:
                    print(f"   {rec['rank']}. {rec['product_name']} (score: {rec['similarity_score']:.2f})")
            else:
                print(f"⚠️ No hay suficientes recomendaciones")
    else:
        print(f"❌ Error: {train_result.get('error')}")
    
    # 3. Segmentación de Clientes
    print("\n\n3️⃣ SEGMENTACIÓN DE CLIENTES")
    print("-" * 80)
    seg_service = CustomerSegmentationService()
    
    print("Entrenando modelo de segmentación...")
    train_result = seg_service.train_model(n_clusters=6)
    
    if train_result['success']:
        print(f"✅ Modelo entrenado exitosamente")
        print(f"   Clientes analizados: {train_result['metrics']['n_customers']}")
        print(f"   Silhouette Score: {train_result['metrics']['silhouette_score']:.3f}")
        print(f"\n   Distribución de segmentos:")
        for cluster, name in train_result['metrics']['cluster_names'].items():
            size = train_result['metrics']['cluster_sizes'].get(str(cluster), 0)
            print(f"     {name}: {size} clientes")
        
        # Probar con primer cliente
        first_customer = User.objects.filter(role='customer', orders__isnull=False).first()
        if first_customer:
            print(f"\nAnalizando cliente: {first_customer.email}")
            segment = seg_service.predict_customer_segment(str(first_customer.id))
            
            if segment['success']:
                print(f"✅ Segmento: {segment['segment_type'].upper()}")
                print(f"   Total gastado: ${segment['characteristics']['total_spent']:,.2f}")
                print(f"   Órdenes: {segment['characteristics']['total_orders']}")
                print(f"   LTV previsto: ${segment['lifetime_value_prediction']:,.2f}")
    else:
        print(f"❌ Error: {train_result.get('error')}")
    
    # 4. Optimización de Inventario
    print("\n\n4️⃣ OPTIMIZACIÓN DE INVENTARIO")
    print("-" * 80)
    inv_service = InventoryOptimizationService()
    
    print("Analizando inventario...")
    analysis = inv_service.analyze_inventory()
    
    if analysis['success']:
        print(f"✅ Análisis completado")
        print(f"   Productos analizados: {analysis['total_products_analyzed']}")
        print(f"   Total alertas: {analysis['summary']['total_alerts']}")
        
        if analysis['summary']['by_type']:
            print(f"\n   Alertas por tipo:")
            for alert_type, count in analysis['summary']['by_type'].items():
                print(f"     {alert_type}: {count}")
        
        # Health Score
        health = inv_service.get_inventory_health_score()
        if health['success']:
            print(f"\n   Score de salud: {health['health_score']}/100 ({health['status'].upper()})")
    else:
        print(f"❌ Error: {analysis.get('error')}")
    
    print("\n" + "=" * 80)
    print("✅ PRUEBA COMPLETA FINALIZADA")
    print("=" * 80)

if __name__ == '__main__':
    try:
        test_ml_system()
    except Exception as e:
        print(f"\n❌ ERROR FATAL: {str(e)}")
        import traceback
        traceback.print_exc()
```

Ejecutar:
```bash
cd backend_django
python test_ml_complete.py
```

---

## 📝 NOTAS IMPORTANTES

1. **Calidad de Predicciones:**
   - Con 50-100 ventas: Predicciones básicas
   - Con 200-500 ventas: Predicciones buenas
   - Con 1000+ ventas: Predicciones excelentes

2. **Re-entrenar Modelos:**
   - Cada semana si tienes muchas ventas
   - Cada mes si tienes pocas ventas
   - Después de eventos especiales (Black Friday, etc.)

3. **Modelos guardados:**
   - Se guardan en `ml_predictions/ml_models/*.pkl`
   - Hacer backup regularmente
   - No subir a Git (muy pesados)

4. **Performance:**
   - Entrenamiento: 10-60 segundos
   - Predicción: < 1 segundo
   - Análisis inventario: 2-5 segundos

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Verificar datos actuales (script arriba)
2. ✅ Entrenar modelos con tus datos
3. ✅ Probar predicciones
4. 🚀 Integrar en frontend
5. 📊 Crear dashboard de ML
6. 🔄 Automatizar re-entrenamiento (Celery)

¡Listo para usar con tus datos existentes! 🎉
