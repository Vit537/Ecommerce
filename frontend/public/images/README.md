# 📝 Instrucciones para Agregar Logos

## Ubicación de Imágenes

Coloca tus imágenes de logo en:
```
frontend/public/images/
```

## Archivos Necesarios

1. **logo-bs.png** - Logo principal "BS" (Blossom Studios)
   - Formato: PNG con fondo transparente
   - Dimensiones recomendadas: 200x200px o similar
   - Será usado en el header del sistema

2. **logo-us.png** - Logo alternativo "US" (si lo necesitas)
   - Formato: PNG con fondo transparente
   - Dimensiones recomendadas: 200x200px o similar

## Cómo Agregar las Imágenes

### Opción 1: Copiar manualmente
1. Guarda las imágenes que te mostré como PNG
2. Cópialas a: `frontend/public/images/`
3. Renombra como `logo-bs.png` y `logo-us.png`

### Opción 2: Desde el terminal
```bash
# Navega a la carpeta
cd "D:\All 02-2025\information system 2\segundo parcial\mi-ecommerce-mejorado\frontend\public\images"

# Copia tus imágenes aquí
# Ejemplo: copy C:\Users\TuUsuario\Downloads\logo.png logo-bs.png
```

## Formatos Soportados

El sistema acepta:
- ✅ PNG (recomendado para logos con transparencia)
- ✅ JPG/JPEG
- ✅ SVG
- ✅ WebP

## Verificación

Después de agregar las imágenes:
1. Recarga el navegador (Ctrl + Shift + R)
2. El logo debería aparecer en el header
3. Si no aparece, revisa la consola del navegador (F12)

---

**Nota:** Por ahora el código está configurado para buscar `logo-bs.png`. Si no existe, simplemente mostrará el texto sin imagen.
