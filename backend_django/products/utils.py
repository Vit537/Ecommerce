"""
Utilidades para manejo de imágenes de productos
"""
import os
import uuid
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings


def convert_to_webp(image_file, quality=85):
    """
    Convierte una imagen a formato WebP
    
    Args:
        image_file: Archivo de imagen (UploadedFile)
        quality: Calidad de compresión (1-100)
    
    Returns:
        ContentFile con la imagen convertida
    """
    try:
        # Abrir la imagen
        img = Image.open(image_file)
        
        # Convertir a RGB si es necesario (para PNGs con transparencia)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Crear fondo blanco
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            if 'transparency' in img.info:
                background.paste(img, mask=img.split()[-1])
            else:
                background.paste(img, (0, 0))
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Optimizar tamaño si es muy grande
        max_size = (2000, 2000)
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Guardar como WebP en memoria
        output = BytesIO()
        img.save(output, format='WEBP', quality=quality, method=6)
        output.seek(0)
        
        return ContentFile(output.read())
    
    except Exception as e:
        raise ValueError(f"Error al convertir imagen a WebP: {str(e)}")


def generate_image_filename(product_name, index=0):
    """
    Genera un nombre de archivo único para la imagen
    
    Args:
        product_name: Nombre del producto
        index: Índice de la imagen (para múltiples imágenes)
    
    Returns:
        Nombre de archivo formateado
    """
    # Limpiar el nombre del producto
    clean_name = "".join(c for c in product_name if c.isalnum() or c in (' ', '-', '_')).strip()
    clean_name = clean_name.replace(' ', '_').lower()
    
    # Generar ID único
    unique_id = uuid.uuid4().hex[:8]
    
    # Formato: producto-nombre_uuid_index.webp
    if index > 0:
        return f"{clean_name}_{unique_id}_{index}.webp"
    return f"{clean_name}_{unique_id}.webp"


def save_product_image(image_file, product_name, index=0, use_cloud=None):
    """
    Guarda una imagen de producto (local o cloud storage)
    
    Args:
        image_file: Archivo de imagen
        product_name: Nombre del producto
        index: Índice de la imagen
        use_cloud: True para cloud, False para local, None para auto-detectar
    
    Returns:
        URL de la imagen guardada
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"🖼️ Iniciando guardado de imagen: {product_name} (index: {index})")
        
        # Convertir a WebP
        webp_content = convert_to_webp(image_file)
        logger.info(f"✅ Imagen convertida a WebP")
        
        # Generar nombre de archivo
        filename = generate_image_filename(product_name, index)
        logger.info(f"📝 Nombre de archivo generado: {filename}")
        
        # Determinar si usar cloud storage
        if use_cloud is None:
            use_cloud = getattr(settings, 'USE_CLOUD_STORAGE', False)
        
        logger.info(f"☁️ Usando Cloud Storage: {use_cloud}")
        
        if use_cloud:
            # Usar Google Cloud Storage directamente
            from google.cloud import storage
            
            filepath = f"products/{filename}"
            logger.info(f"📤 Subiendo a GCS: {filepath}")
            
            try:
                # Obtener cliente y bucket
                bucket_name = getattr(settings, 'GS_BUCKET_NAME', 'ecommerce-media-storage')
                project_id = getattr(settings, 'GCP_PROJECT_ID', 'big-axiom-474503-m5')
                
                logger.info(f"🔧 Conectando a proyecto: {project_id}, bucket: {bucket_name}")
                
                # Crear cliente (usa credenciales automáticas de Cloud Run)
                client = storage.Client(project=project_id)
                bucket = client.bucket(bucket_name)
                blob = bucket.blob(filepath)
                
                # Configurar metadata
                blob.content_type = 'image/webp'
                blob.cache_control = 'public, max-age=31536000'
                
                # Subir el archivo
                webp_content.seek(0)
                blob.upload_from_file(webp_content, content_type='image/webp')
                
                # Hacer el blob público
                blob.make_public()
                
                logger.info(f"✅ Guardado en GCS: {filepath}")
                
                # Retornar URL pública
                url = f"https://storage.googleapis.com/{bucket_name}/{filepath}"
                logger.info(f"🔗 URL generada: {url}")
                return url
                
            except Exception as e:
                logger.error(f"❌ Error al guardar en GCS: {str(e)}", exc_info=True)
                raise
        else:
            # Guardar localmente
            filepath = os.path.join('products', filename)
            full_path = os.path.join(settings.MEDIA_ROOT, filepath)
            logger.info(f"💾 Guardando localmente: {full_path}")
            
            # Crear directorio si no existe
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Guardar archivo
            with open(full_path, 'wb') as f:
                webp_content.seek(0)
                f.write(webp_content.read())
            
            # Retornar URL relativa
            url = f"{settings.MEDIA_URL}{filepath}".replace('\\', '/')
            logger.info(f"🔗 URL generada: {url}")
            return url
    
    except Exception as e:
        logger.error(f"❌ Error al guardar imagen: {str(e)}", exc_info=True)
        raise ValueError(f"Error al guardar imagen: {str(e)}")


def delete_product_image(image_url, use_cloud=None):
    """
    Elimina una imagen de producto
    
    Args:
        image_url: URL de la imagen a eliminar
        use_cloud: True para cloud, False para local, None para auto-detectar
    """
    try:
        if not image_url:
            return
        
        # Determinar si usar cloud storage
        if use_cloud is None:
            use_cloud = not settings.DEBUG
        
        if use_cloud:
            # Extraer path del storage
            if 'storage.googleapis.com' in image_url:
                # URL completa de GCS
                path = image_url.split('/')[-2:]
                path = '/'.join(path)
            else:
                path = image_url.replace(settings.MEDIA_URL, '')
            
            # Eliminar de cloud storage
            if default_storage.exists(path):
                default_storage.delete(path)
        else:
            # Eliminar localmente
            path = image_url.replace(settings.MEDIA_URL, '')
            full_path = os.path.join(settings.MEDIA_ROOT, path)
            
            if os.path.exists(full_path):
                os.remove(full_path)
    
    except Exception as e:
        print(f"Error al eliminar imagen: {str(e)}")


def process_product_images(image_files, product_name, existing_images=None):
    """
    Procesa múltiples imágenes de producto
    
    Args:
        image_files: Lista de archivos de imagen
        product_name: Nombre del producto
        existing_images: Lista de URLs de imágenes existentes (para actualización)
    
    Returns:
        Lista de URLs de imágenes procesadas
    """
    if existing_images is None:
        existing_images = []
    
    # Eliminar imágenes antiguas si se están reemplazando
    if image_files and existing_images:
        for old_image in existing_images:
            delete_product_image(old_image)
    
    # Procesar nuevas imágenes
    new_images = []
    for index, image_file in enumerate(image_files):
        try:
            image_url = save_product_image(image_file, product_name, index)
            new_images.append(image_url)
        except Exception as e:
            print(f"Error procesando imagen {index}: {str(e)}")
            continue
    
    return new_images
