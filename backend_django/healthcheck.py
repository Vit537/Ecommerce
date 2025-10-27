#!/usr/bin/env python
"""
Health check script para verificar que el servidor está listo.
"""
import sys
import time
import urllib.request
import urllib.error
import os

def check_health(port=8080, max_attempts=30):
    """Verifica que el servidor responda en el puerto especificado."""
    url = f"http://localhost:{port}/api/"
    
    print(f"🔍 Verificando servidor en {url}...")
    
    for attempt in range(max_attempts):
        try:
            response = urllib.request.urlopen(url, timeout=2)
            if response.status == 200:
                print(f"✅ Servidor respondiendo correctamente (intento {attempt + 1})")
                return True
        except (urllib.error.URLError, ConnectionRefusedError, TimeoutError) as e:
            if attempt < max_attempts - 1:
                print(f"   Intento {attempt + 1}/{max_attempts}: {e}")
                time.sleep(1)
            else:
                print(f"❌ Servidor no responde después de {max_attempts} intentos")
                return False
    
    return False

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8080))
    if check_health(port):
        sys.exit(0)
    else:
        sys.exit(1)
