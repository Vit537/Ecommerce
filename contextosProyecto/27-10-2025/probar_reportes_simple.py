#!/usr/bin/env python3
"""
Probar endpoint simplificado de reportes
"""
import requests
import json

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

def test_simple_report(token, query):
    """Probar endpoint simplificado"""
    print(f"🤖 Probando consulta: '{query}'")
    print("-" * 60)
    
    headers = {"Authorization": f"Bearer {token}"}
    data = {"prompt": query}
    
    try:
        response = requests.post(f"{API_BASE}/reports/simple/", json=data, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Reporte generado exitosamente!")
            print(f"📊 Tipo: {result.get('report_type', 'N/A')}")
            print(f"💬 Explicación: {result.get('explanation', 'N/A')}")
            print(f"🔍 SQL: {result.get('sql_query', 'N/A')[:100]}...")
            print(f"📈 Resultados: {result.get('results_count', 0)} filas")
            print(f"⏱️  Tiempo: {result.get('execution_time', 0)}s")
            print(f"🎯 Tokens: {result.get('tokens_used', 0)}")
            
            # Mostrar primeros resultados
            if result.get('data'):
                print(f"\n📋 Primeros resultados:")
                for i, row in enumerate(result.get('data', [])[:3]):
                    print(f"  {i+1}. {dict(list(row.items())[:3])}")  # Solo primeros 3 campos
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown')}")
                if 'details' in error_data:
                    print(f"Detalles: {error_data['details']}")
            except:
                print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    print("🚀 PROBANDO REPORTES DINÁMICOS SIMPLIFICADOS")
    print("=" * 70)
    print()
    
    # Obtener token
    print("🔐 Obteniendo token...")
    token = get_token()
    
    if not token:
        print("❌ No se pudo obtener token")
        return
    
    print("✅ Token obtenido")
    print()
    
    # Consultas de prueba
    consultas = [
        "Muestra todas las órdenes del último mes",
        "Productos más vendidos por cantidad",
        "Total de ventas por cliente",
        "Órdenes agrupadas por estado",
        "Lista de usuarios administradores"
    ]
    
    # Probar cada consulta
    for i, consulta in enumerate(consultas, 1):
        print(f"\n🧪 PRUEBA {i}/{len(consultas)}")
        success = test_simple_report(token, consulta)
        
        if not success:
            print(f"⚠️  Falló: {consulta}")
        
        print()
    
    print("=" * 70)
    print("✅ PRUEBAS COMPLETADAS")

if __name__ == "__main__":
    main()