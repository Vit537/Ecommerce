@echo off
echo ========================================
echo Ejecutando migraciones en Cloud Run
echo ========================================
echo.

echo Creando Cloud Run Job para migraciones...
gcloud run jobs create django-migrate ^
  --image us-central1-docker.pkg.dev/big-axiom-474503-m5/ecommerce-registry/backend:latest ^
  --region us-central1 ^
  --set-cloudsql-instances big-axiom-474503-m5:us-central1:myproject-db ^
  --set-env-vars DB_NAME=ecommerce ^
  --set-env-vars DB_USER=prueba ^
  --set-env-vars DB_PASSWORD=prueba123secure ^
  --set-env-vars "DB_HOST=/cloudsql/big-axiom-474503-m5:us-central1:myproject-db" ^
  --set-env-vars DB_PORT=5432 ^
  --set-env-vars DJANGO_SECRET_KEY=temp-secret-for-migration ^
  --command python ^
  --args manage.py,migrate,--noinput

echo.
echo Ejecutando migraciones...
gcloud run jobs execute django-migrate --region us-central1 --wait

echo.
echo ========================================
echo Migraciones completadas!
echo ========================================
