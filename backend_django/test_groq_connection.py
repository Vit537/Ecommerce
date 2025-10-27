"""
Script de prueba para verificar la conexión con Groq API
"""

import os
import django
import sys
from pathlib import Path

# Setup Django
sys.path.append(str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from reports.ai_service import AIReportService

print("🧪 Probando conexión con Groq API...")
print("=" * 60)

try:
    ai_service = AIReportService()
    
    # Prueba simple
    prompt = "Muestra todas las órdenes del último mes"
    print(f"\n📝 Prompt de prueba: '{prompt}'")
    print("\n⏳ Enviando solicitud a Groq...")
    
    result = ai_service.interpret_prompt(prompt)
    
    print("\n✅ Respuesta recibida:")
    print(f"   📊 Tipo de reporte: {result['report_type']}")
    print(f"   💬 Explicación: {result['explanation']}")
    print(f"   🔍 SQL Query:")
    print(f"   {result['sql_query']}")
    print(f"\n   📈 Gráfico sugerido: {result.get('suggested_chart_type', 'N/A')}")
    print(f"   🎯 Tokens usados: {result.get('tokens_used', 'N/A')}")
    
    print("\n" + "=" * 60)
    print("✨ ¡Conexión exitosa! El servicio de IA está funcionando.")
    print("=" * 60)
    
except Exception as e:
    print("\n" + "=" * 60)
    print("❌ ERROR al conectar con Groq:")
    print("=" * 60)
    print(f"\n{str(e)}\n")
    import traceback
    traceback.print_exc()
