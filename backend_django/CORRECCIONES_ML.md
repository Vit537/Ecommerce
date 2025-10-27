# Script para corregir errores en los servicios de ML

Los servicios tienen varios errores que necesito corregir:

## 1. sales_forecast.py
- `order_items` → `items`
- Agregar timezone awareness para datetime

## 2. product_recommendation.py  
- `order_items` → `items`
- `sale_price` → usar solo `price` (no existe sale_price)

## 3. customer_segmentation.py
- Timezone awareness para cálculos de fecha

## 4. inventory_optimization.py
- `stock_quantity` está en ProductVariant, no en Product
- Usar `total_stock` property del Product

Voy a corregir cada archivo:
