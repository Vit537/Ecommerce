#!/usr/bin/env python3
"""
Script para probar el sistema de reportes dinámicos
"""
import requests
import json
from pprint import pprint

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def get_token():
    """Obtener token de autenticación"""
    login_data = {
        "email": "admin@boutique.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
    if response.status_code == 200:
        return response.json().get('access')
    return None

def test_report_generation(token, query):
    """Probar generación de reporte"""
    print(f"🤖 Probando consulta: '{query}'")
    print("-" * 60)
    
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "prompt": query,
        "input_type": "text",
        "export_format": "json"
    }
    
    try:
        response = requests.post(f"{API_BASE}/reports/generate/", json=data, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Reporte generado exitosamente!")
            print(f"📊 Tipo: {result.get('report_type', 'N/A')}")
            print(f"🔍 SQL: {result.get('sql_query', 'N/A')[:100]}...")
            print(f"📈 Resultados: {result.get('results_count', 0)} filas")
            print(f"⏱️  Tiempo: {result.get('execution_time', 0):.2f}s")
            print(f"🎯 Tokens: {result.get('tokens_used', 0)}")
            
            # Mostrar primeros resultados si existen
            if result.get('data'):
                print(f"\n📋 Primeros resultados:")
                for i, row in enumerate(result.get('data', [])[:3]):
                    print(f"  {i+1}. {row}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return False
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_report_history(token):
    """Probar historial de reportes"""
    print("📋 PROBANDO HISTORIAL DE REPORTES")
    print("-" * 60)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{API_BASE}/reports/history/", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Historial obtenido: {data.get('count', 0)} reportes")
            
            for i, report in enumerate(data.get('results', [])[:3]):
                print(f"\n  {i+1}. {report.get('original_prompt', 'Sin prompt')}")
                print(f"     Tipo: {report.get('report_type', 'N/A')}")
                print(f"     Fecha: {report.get('created_at', 'N/A')[:10]}")
                print(f"     Tiempo: {report.get('execution_time', 0):.2f}s")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🚀 PROBANDO SISTEMA DE REPORTES DINÁMICOS")
    print("=" * 70)
    print()
    
    # Obtener token
    print("🔐 Obteniendo token de autenticación...")
    token = get_token()
    
    if not token:
        print("❌ No se pudo obtener token de autenticación")
        return
    
    print("✅ Token obtenido correctamente")
    print()
    
    # Consultas de prueba
    consultas_prueba = [
        "Ventas del último mes",
        "Productos más vendidos",
        "Clientes con más compras",
        "Órdenes por estado",
        "Stock bajo por categoría"
    ]
    
    # Probar cada consulta
    for i, consulta in enumerate(consultas_prueba, 1):
        print(f"\n🧪 PRUEBA {i}/{len(consultas_prueba)}")
        success = test_report_generation(token, consulta)
        
        if not success:
            print(f"⚠️  Falló la consulta: {consulta}")
        
        print()
    
    # Probar historial
    test_report_history(token)
    
    print("\n" + "=" * 70)
    print("✅ PRUEBAS COMPLETADAS")
    print()
    print("🎯 PRÓXIMOS PASOS:")
    print("1. Si las pruebas funcionaron, ve a: http://localhost:3000/reports")
    print("2. Login y prueba las mismas consultas desde el frontend")
    print("3. Experimenta con consultas más complejas")
    print("4. Prueba exportar en PDF y Excel")

if __name__ == "__main__":
    main()