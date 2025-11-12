"""
Script para migrar imágenes locales a Google Cloud Storage
"""
import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_django'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Forzar uso de Cloud Storage para este script
os.environ['USE_CLOUD_STORAGE'] = 'True'
os.environ['DEBUG'] = 'False'

django.setup()

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from products.models import Product
import requests

def migrate_images_to_cloud():
    """
    Migrar imágenes de almacenamiento local a Cloud Storage
    """
    print("=" * 80)
    print("MIGRACIÓN DE IMÁGENES A GOOGLE CLOUD STORAGE")
    print("=" * 80)
    
    # Verificar configuración
    print(f"\nConfigured storage: {default_storage.__class__.__name__}")
    print(f"Bucket: {getattr(settings, 'GS_BUCKET_NAME', 'NO DEFINIDO')}")
    print(f"Project: {getattr(settings, 'GS_PROJECT_ID', 'NO DEFINIDO')}")
    
    if default_storage.__class__.__name__ != 'GoogleCloudStorage':
        print("\n✗ ERROR: Cloud Storage no está configurado correctamente")
        print("Asegúrate de que:")
        print("  - USE_CLOUD_STORAGE=True")
        print("  - GS_BUCKET_NAME está configurado")
        print("  - GS_PROJECT_ID está configurado")
        return
    
    # Obtener productos con imágenes
    products = Product.objects.exclude(images=[]).exclude(images__isnull=True)
    total_products = products.count()
    
    print(f"\n✓ Productos con imágenes: {total_products}")
    
    if total_products == 0:
        print("\nNo hay productos con imágenes para migrar")
        return
    
    # Migrar cada producto
    migrated = 0
    errors = 0
    
    for idx, product in enumerate(products, 1):
        print(f"\n[{idx}/{total_products}] Procesando: {product.name}")
        
        new_images = []
        
        for img_idx, img_url in enumerate(product.images):
            print(f"  Imagen {img_idx + 1}/{len(product.images)}: {img_url}")
            
            # Verificar si ya es URL de Cloud Storage
            if 'storage.googleapis.com' in img_url:
                print(f"    → Ya está en Cloud Storage ✓")
                new_images.append(img_url)
                continue
            
            try:
                # Obtener el archivo local
                local_path = img_url.replace('/media/', '')
                full_path = os.path.join(settings.MEDIA_ROOT, local_path)
                
                if not os.path.exists(full_path):
                    print(f"    → Archivo no encontrado: {full_path} ✗")
                    errors += 1
                    continue
                
                # Leer el archivo
                with open(full_path, 'rb') as f:
                    file_content = f.read()
                
                # Subir a Cloud Storage
                filename = os.path.basename(local_path)
                cloud_path = f"products/{filename}"
                
                # Guardar en Cloud Storage
                saved_path = default_storage.save(cloud_path, ContentFile(file_content))
                
                # Construir URL pública
                bucket_name = getattr(settings, 'GS_BUCKET_NAME', 'ecommerce-media-storage')
                cloud_url = f"https://storage.googleapis.com/{bucket_name}/{saved_path}"
                
                new_images.append(cloud_url)
                print(f"    → Subido a Cloud Storage ✓")
                print(f"       {cloud_url}")
                
                migrated += 1
                
            except Exception as e:
                print(f"    → Error al migrar: {str(e)} ✗")
                errors += 1
                new_images.append(img_url)  # Mantener la URL original
        
        # Actualizar producto con nuevas URLs
        if new_images != product.images:
            product.images = new_images
            product.save(update_fields=['images'])
            print(f"  ✓ Producto actualizado con {len(new_images)} imágenes")
    
    print("\n" + "=" * 80)
    print("RESUMEN DE MIGRACIÓN")
    print("=" * 80)
    print(f"Total de productos procesados: {total_products}")
    print(f"Imágenes migradas exitosamente: {migrated}")
    print(f"Errores encontrados: {errors}")
    print("=" * 80)

if __name__ == '__main__':
    try:
        migrate_images_to_cloud()
    except Exception as e:
        print(f"\n✗ ERROR FATAL: {str(e)}")
        import traceback
        traceback.print_exc()
