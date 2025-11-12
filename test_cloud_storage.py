"""
Script para diagnosticar y probar la configuración de Cloud Storage
"""
import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_django'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO

print("=" * 80)
print("DIAGNÓSTICO DE CONFIGURACIÓN DE CLOUD STORAGE")
print("=" * 80)

# 1. Verificar configuración
print("\n1. CONFIGURACIÓN ACTUAL:")
print(f"   DEBUG: {settings.DEBUG}")
print(f"   USE_CLOUD_STORAGE: {getattr(settings, 'USE_CLOUD_STORAGE', 'NO DEFINIDO')}")
print(f"   DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'NO DEFINIDO')}")
print(f"   GS_BUCKET_NAME: {getattr(settings, 'GS_BUCKET_NAME', 'NO DEFINIDO')}")
print(f"   GS_PROJECT_ID: {getattr(settings, 'GS_PROJECT_ID', 'NO DEFINIDO')}")
print(f"   GS_CREDENTIALS: {getattr(settings, 'GS_CREDENTIALS', 'NO DEFINIDO')}")
print(f"   MEDIA_URL: {settings.MEDIA_URL}")
print(f"   Default Storage Class: {default_storage.__class__.__name__}")

# 2. Probar conexión al bucket
print("\n2. PROBANDO CONEXIÓN AL BUCKET:")
try:
    # Intentar listar archivos
    if hasattr(default_storage, 'bucket'):
        print(f"   ✓ Bucket conectado: {default_storage.bucket.name}")
        files = default_storage.listdir('products')
        print(f"   ✓ Archivos en /products/: {len(files[1])} archivos")
    else:
        print("   ✗ No es GoogleCloudStorage")
except Exception as e:
    print(f"   ✗ Error al conectar: {str(e)}")

# 3. Probar subida de imagen
print("\n3. PROBANDO SUBIDA DE IMAGEN:")
try:
    # Crear una imagen de prueba
    img = Image.new('RGB', (100, 100), color='red')
    img_io = BytesIO()
    img.save(img_io, 'JPEG')
    img_io.seek(0)
    
    # Crear archivo
    test_file = SimpleUploadedFile("test_diagnostic.jpg", img_io.read(), content_type="image/jpeg")
    
    # Subir usando el storage
    filepath = "products/test_diagnostic.webp"
    saved_path = default_storage.save(filepath, test_file)
    
    print(f"   ✓ Imagen guardada en: {saved_path}")
    
    # Obtener URL
    if hasattr(default_storage, 'url'):
        url = default_storage.url(saved_path)
    else:
        bucket_name = getattr(settings, 'GS_BUCKET_NAME', 'unknown')
        url = f"https://storage.googleapis.com/{bucket_name}/{saved_path}"
    
    print(f"   ✓ URL de la imagen: {url}")
    
    # Verificar que existe
    exists = default_storage.exists(saved_path)
    print(f"   ✓ La imagen existe en storage: {exists}")
    
    # Limpiar
    default_storage.delete(saved_path)
    print(f"   ✓ Imagen de prueba eliminada")
    
except Exception as e:
    print(f"   ✗ Error al subir imagen: {str(e)}")
    import traceback
    traceback.print_exc()

# 4. Verificar imágenes en la base de datos
print("\n4. VERIFICANDO IMÁGENES EN BASE DE DATOS:")
try:
    from products.models import Product
    
    products_with_images = Product.objects.exclude(images=[]).exclude(images__isnull=True)
    print(f"   Total de productos con imágenes: {products_with_images.count()}")
    
    if products_with_images.exists():
        product = products_with_images.first()
        print(f"\n   Ejemplo - Producto: {product.name}")
        print(f"   SKU: {product.sku}")
        print(f"   Imágenes guardadas:")
        for idx, img_url in enumerate(product.images, 1):
            print(f"      {idx}. {img_url}")
            
            # Verificar si es URL de Cloud Storage
            if 'storage.googleapis.com' in img_url:
                print(f"         → Es URL de Cloud Storage ✓")
            else:
                print(f"         → NO es URL de Cloud Storage ✗")
                
except Exception as e:
    print(f"   ✗ Error al consultar productos: {str(e)}")

print("\n" + "=" * 80)
print("RESUMEN:")
print("=" * 80)

if getattr(settings, 'USE_CLOUD_STORAGE', False):
    print("✓ Cloud Storage está ACTIVADO")
    print(f"✓ Bucket configurado: {getattr(settings, 'GS_BUCKET_NAME', 'NO DEFINIDO')}")
    print("\nPara que funcione en producción, asegúrate de:")
    print("1. Configurar las variables de entorno en Cloud Run")
    print("2. Dar permisos al service account de Cloud Run")
    print("3. Ver instrucciones completas en CLOUD_STORAGE_SETUP.md")
else:
    print("✗ Cloud Storage está DESACTIVADO")
    print("  Las imágenes se están guardando localmente")
    print("  Para activar, configura: USE_CLOUD_STORAGE=True")

print("=" * 80)
