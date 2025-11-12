# 📦 Guía de Instalación - E-commerce Backend

Esta guía te ayudará a instalar y configurar el proyecto en tu máquina local.

## 📋 Requisitos Previos

### Para Windows:
- **Python 3.11 o superior** - [Descargar aquí](https://www.python.org/downloads/)
- **PostgreSQL 14 o superior** - [Descargar aquí](https://www.postgresql.org/download/windows/)
- **Git** - [Descargar aquí](https://git-scm.com/download/win)

### Para Linux/Mac:
- Python 3.11+
- PostgreSQL 14+
- Git

---

## 🚀 Instalación Paso a Paso

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Vit537/Ecommerce.git
cd Ecommerce/backend_django
```

### 2️⃣ Crear Entorno Virtual

#### Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### Linux/Mac:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Actualizar pip (IMPORTANTE)

```bash
python -m pip install --upgrade pip
```

### 4️⃣ Instalar Dependencias

```bash
pip install -r requirements.txt
```

#### ⚠️ Si hay errores con pandas/numpy en Windows:

**Opción 1 - Instalar precompilados desde whl:**
```powershell
pip install numpy==1.26.4
pip install pandas==2.2.3
pip install -r requirements.txt
```

**Opción 2 - Usar conda (recomendado para ciencia de datos):**
```powershell
# Instalar Anaconda o Miniconda primero
conda create -n ecommerce python=3.11
conda activate ecommerce
conda install pandas numpy scikit-learn matplotlib
pip install -r requirements.txt
```

---

## 🗄️ Configurar Base de Datos

### 1️⃣ Crear Base de Datos PostgreSQL

```sql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'tu_password_seguro';
ALTER ROLE ecommerce_user SET client_encoding TO 'utf8';
ALTER ROLE ecommerce_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE ecommerce_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

### 2️⃣ Crear Archivo `.env`

Crea el archivo `backend_django/.env` con:

```env
# Django Core
DJANGO_SECRET_KEY=tu-secret-key-super-segura-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Local
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=tu_password_seguro
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS & CSRF
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173

# AI Services (Opcional)
GROQ_API_KEY=tu_groq_api_key
OPENAI_API_KEY=tu_openai_api_key

# Stripe (Opcional para pagos)
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_WEBHOOK_SECRET=

# Google Cloud Storage (Solo producción)
USE_CLOUD_STORAGE=False
```

---

## 🔄 Ejecutar Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

Deberías ver **63 migraciones** ejecutándose correctamente.

---

## 👤 Crear Superusuario

```bash
python manage.py createsuperuser
```

O usa el comando personalizado:
```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser(
    email='admin@ecommerce.com',
    first_name='Admin',
    last_name='User',
    password='admin123',
    role='admin',
    user_type='admin'
)
```

---

## 📊 Cargar Datos de Prueba (Opcional)

```bash
# Cargar datos básicos
python ejecutarDatos/1_generate_test_data.py

# Generar datos para ML
python ejecutarDatos/2_generate_ml_data_v2.py

# Ajustar fechas de órdenes
python ejecutarDatos/3_fix_order_dates.py
```

---

## ▶️ Iniciar el Servidor

```bash
python manage.py runserver
```

El servidor estará disponible en: **http://localhost:8000**

- Admin panel: http://localhost:8000/admin/
- API: http://localhost:8000/api/

---

## 🧪 Verificar Instalación

```bash
# Verificar tablas creadas
python manage.py showmigrations

# Revisar apps instaladas
python manage.py shell -c "from django.conf import settings; print(len(settings.INSTALLED_APPS), 'apps instaladas')"

# Probar conexión a BD
python manage.py check --database default
```

---

## ❗ Solución de Problemas Comunes

### Error: "No module named 'pandas'"
```bash
pip install pandas==2.2.3 numpy==1.26.4
```

### Error: "psycopg2 installation error"
**Windows:**
```bash
pip install psycopg2-binary
```

**Linux:**
```bash
sudo apt-get install python3-dev libpq-dev
pip install psycopg2-binary
```

### Error: "Permission denied" al activar venv (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Faltan migraciones (menos de 63 tablas)
```bash
python manage.py migrate --run-syncdb
```

### Error con matplotlib en Windows
```bash
pip install matplotlib==3.9.3
```

---

## 📚 Apps del Proyecto

El proyecto incluye las siguientes apps:

1. **authentication** - Gestión de usuarios y autenticación
2. **products** - Catálogo de productos
3. **cart** - Carrito de compras
4. **orders** - Gestión de órdenes
5. **employees** - Gestión de empleados y cajeros
6. **permissions** - Sistema de permisos
7. **reports** - Generación de reportes
8. **ml_predictions** - Predicciones con Machine Learning
9. **assistant** - Chatbot asistente con IA
10. **finance** - Gestión financiera
11. **notifications** - Notificaciones por email

**Total esperado:** 63 tablas en la base de datos

---

## 🌐 Despliegue en Producción

Ver la documentación de despliegue en [DEPLOYMENT.md](./DEPLOYMENT.md) (si existe).

Para desplegar en Google Cloud Run, asegúrate de configurar:
- Google Cloud SQL (PostgreSQL)
- Google Cloud Storage (para imágenes)
- Variables de entorno en Cloud Run
- Secrets en GitHub Actions

---

## 📞 Soporte

Si encuentras problemas, revisa:
1. Los logs de la terminal
2. El archivo `.env` está configurado correctamente
3. PostgreSQL está corriendo
4. Todas las dependencias se instalaron

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.
