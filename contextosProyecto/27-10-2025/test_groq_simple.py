#!/usr/bin/env python3
"""
Test simple para verificar si Groq funciona desde Django
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append('backend_django')
django.setup()

from groq import Groq
from django.conf import settings

print("🧪 Probando Groq directamente desde Django...")
print("=" * 60)

try:
    # Probar inicialización directa
    print("1. Inicializando cliente Groq...")
    client = Groq(api_key=settings.GROQ_API_KEY)
    print("✅ Cliente inicializado correctamente")
    
    # Probar consulta simple
    print("\n2. Enviando consulta simple...")
    response = client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": "Di 'hola mundo' en JSON"
        }],
        model="llama-3.3-70b-versatile",
        max_tokens=100
    )
    
    print("✅ Respuesta recibida:")
    print(f"   Contenido: {response.choices[0].message.content}")
    print(f"   Tokens: {response.usage.total_tokens}")
    
    print("\n3. Probando consulta SQL...")
    sql_prompt = """
    Genera un SQL para obtener todas las órdenes del último mes.
    La tabla se llama orders_order y tiene campos: id, created_at, total_amount, status.
    Responde solo con JSON: {"sql": "tu query aquí"}
    """
    
    response = client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": sql_prompt
        }],
        model="llama-3.3-70b-versatile",
        max_tokens=200
    )
    
    print("✅ SQL generado:")
    print(f"   {response.choices[0].message.content}")
    
    print("\n" + "=" * 60)
    print("✅ TODO FUNCIONA CORRECTAMENTE")
    print("El problema puede estar en otro lugar del código.")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()