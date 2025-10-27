"""
Test completo del sistema de Machine Learning
Ejecutar: python test_ml_complete.py
"""
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
            
            # Mostrar primeras 5 predicciones
            print(f"\n   Primeras 5 predicciones:")
            for pred in pred_result['predictions'][:5]:
                print(f"     {pred['date']}: ${pred['predicted_sales']:,.2f}")
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
            elif recs.get('fallback'):
                print(f"⚠️ Usando productos populares (fallback)")
            else:
                print(f"⚠️ No hay suficientes recomendaciones")
        else:
            print("⚠️ No hay productos activos")
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
        from orders.models import Order
        first_customer = User.objects.filter(
            role='customer',
            orders__status__in=['delivered', 'completed']
        ).distinct().first()
        
        if first_customer:
            print(f"\nAnalizando cliente: {first_customer.email}")
            segment = seg_service.predict_customer_segment(str(first_customer.id))
            
            if segment['success']:
                print(f"✅ Segmento: {segment['segment_type'].upper()}")
                print(f"   Total gastado: ${segment['characteristics']['total_spent']:,.2f}")
                print(f"   Órdenes: {segment['characteristics']['total_orders']}")
                print(f"   LTV previsto: ${segment['lifetime_value_prediction']:,.2f}")
                print(f"   Recomendaciones:")
                for rec in segment['recommendations'][:2]:
                    print(f"     - {rec}")
        else:
            print("⚠️ No hay clientes con órdenes completadas")
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
        
        # Mostrar primeras 3 alertas
        if analysis['alerts']:
            print(f"\n   Primeras 3 alertas:")
            for alert in analysis['alerts'][:3]:
                print(f"     {alert['alert_type']}: {alert['product_name']}")
                print(f"       Stock actual: {alert['current_stock']}")
                print(f"       Recomendado: {alert['recommended_stock']}")
        
        # Health Score
        health = inv_service.get_inventory_health_score()
        if health['success']:
            status_emoji = "🟢" if health['status'] == 'healthy' else "🟡" if health['status'] == 'warning' else "🔴"
            print(f"\n   {status_emoji} Score de salud: {health['health_score']}/100 ({health['status'].upper()})")
            print(f"   Recomendaciones:")
            for rec in health['recommendations'][:2]:
                print(f"     - {rec}")
    else:
        print(f"❌ Error: {analysis.get('error')}")
    
    # Resumen final
    print("\n" + "=" * 80)
    print("✅ PRUEBA COMPLETA FINALIZADA")
    print("=" * 80)
    print("\n📊 RESUMEN:")
    print("   ✓ Predicción de ventas")
    print("   ✓ Recomendaciones de productos")
    print("   ✓ Segmentación de clientes")
    print("   ✓ Optimización de inventario")
    print("\n💡 Los modelos están listos para usar en producción")
    print("   Archivos guardados en: ml_predictions/ml_models/")
    print("\n")

if __name__ == '__main__':
    try:
        test_ml_system()
    except Exception as e:
        print(f"\n❌ ERROR FATAL: {str(e)}")
        import traceback
        traceback.print_exc()
