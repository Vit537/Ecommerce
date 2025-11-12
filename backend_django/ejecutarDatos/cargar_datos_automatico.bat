@echo off
REM Script para cargar datos en 3 pasos automáticamente
REM Ejecuta este script después de hacer migrate

echo ================================================================================
echo CARGA AUTOMATICA DE DATOS - E-COMMERCE MEJORADO
echo ================================================================================
echo.

echo ADVERTENCIA: Este proceso tomara 20-40 minutos
echo Asegurate de que la base de datos este vacia y migrada
echo.
echo Este script cargara:
echo   - Usuarios, Roles y Permisos
echo   - Productos y Proveedores
echo   - Departamentos y Empleados
echo   - Ordenes de Venta y Compra
echo   - Gastos y Transacciones
echo   - Turnos de Cajero
echo   - Y mucho mas...
echo.

set /p respuesta="Deseas continuar? (s/n): "
if /i not "%respuesta%"=="s" (
    echo Operacion cancelada
    exit /b 0
)

echo.
echo ================================================================================
echo PASO 1/3: Generando datos base...
echo ================================================================================
echo Incluye: Usuarios, Productos, Proveedores, Empleados, Categorias de Gastos
echo Tiempo estimado: 5-10 minutos
echo.

python 1_generate_test_data.py

if errorlevel 1 (
    echo.
    echo ERROR en Paso 1. Revisa los mensajes anteriores.
    pause
    exit /b 1
)

echo.
echo ✓ Paso 1 completado!
echo.
timeout /t 2 /nobreak >nul

echo ================================================================================
echo PASO 2/3: Generando datos historicos y complementarios...
echo ================================================================================
echo Incluye: Ventas historicas, Compras, Turnos, Gastos, Transacciones
echo Tiempo estimado: 15-25 minutos
echo.

python 2_generate_ml_data_v2.py

if errorlevel 1 (
    echo.
    echo ERROR en Paso 2. Revisa los mensajes anteriores.
    pause
    exit /b 1
)

echo.
echo ✓ Paso 2 completado!
echo.
timeout /t 2 /nobreak >nul

echo ================================================================================
echo PASO 3/3: Redistribuyendo fechas...
echo ================================================================================
echo Tiempo estimado: 1-2 minutos
echo.

python 3_fix_order_dates.py

if errorlevel 1 (
    echo.
    echo ERROR en Paso 3. Revisa los mensajes anteriores.
    pause
    exit /b 1
)

echo.
echo ✓ Paso 3 completado!
echo.

echo ================================================================================
echo CARGA DE DATOS COMPLETADA EXITOSAMENTE!
echo ================================================================================
echo.

echo Ejecutando verificacion final...
echo.

python 4_check_data.py

echo.
echo ================================================================================
echo SISTEMA LISTO
echo ================================================================================
echo.
echo CREDENCIALES:
echo    Admin:        superadmin@boutique.com / admin123
echo    Administrador: admin@boutique.com / admin123
echo    Gerente:      gerente@boutique.com / gerente123
echo    Cajero:       cajero@boutique.com / cajero123
echo    Cliente:      ana.martinez@email.com / cliente123
echo.
echo.
echo NOTAS IMPORTANTES:
echo   - La base de datos contiene ~600 ordenes historicas
echo   - 50 clientes con comportamientos variados (VIP, frecuentes, ocasionales)
echo   - 40 productos con multiples variantes
echo   - Datos de los ultimos 6 meses para analisis ML
echo   - Turnos de cajero, compras, gastos y transacciones
echo.
pause
echo PROXIMOS PASOS:
echo    1. Iniciar servidor:    python manage.py runserver
echo    2. Entrenar modelos ML: python test_ml_complete.py
echo.
echo Admin: http://localhost:8000/admin/
echo.

pause
