@echo off
echo ========================================
echo Obteniendo logs de Cloud Run...
echo ========================================
echo.

REM Obtener los últimos 100 logs
gcloud run services logs read ecommerce-backend --region us-central1 --limit 100 --format="table(timestamp,severity,textPayload)"

echo.
echo ========================================
echo Para ver logs en tiempo real:
echo gcloud run services logs tail ecommerce-backend --region us-central1
echo.
echo Para ver en la consola web:
echo https://console.cloud.google.com/run/detail/us-central1/ecommerce-backend/logs
echo ========================================
