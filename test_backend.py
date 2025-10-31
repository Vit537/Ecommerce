"""
Script para probar y configurar el backend desplegado en Cloud Run
"""
import requests
import json

BASE_URL = "https://ecommerce-backend-930184937279.us-central1.run.app"

def test_endpoints():
    """Prueba los endpoints principales del backend"""
    
    print("🧪 PROBANDO BACKEND DESPLEGADO")
    print("=" * 60)
    print(f"URL Base: {BASE_URL}")
    print("=" * 60)
    print()
    
    tests = [
        ("GET", "/api/", "API Root"),
        ("GET", "/admin/", "Django Admin"),
        ("GET", "/api/products/", "Productos"),
        ("GET", "/api/cart/", "Carrito (requiere auth)"),
        ("GET", "/api/orders/", "Órdenes (requiere auth)"),
        ("GET", "/api/assistant/health/", "Assistant Health Check"),
    ]
    
    for method, endpoint, description in tests:
        url = f"{BASE_URL}{endpoint}"
        print(f"\n📍 {description}")
        print(f"   {method} {url}")
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ OK")
                if response.headers.get('content-type', '').startswith('application/json'):
                    data = response.json()
                    print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            elif response.status_code == 401:
                print(f"   🔒 Requiere autenticación (esperado)")
            elif response.status_code == 404:
                print(f"   ⚠️  Endpoint no encontrado")
            else:
                print(f"   ⚠️  {response.text[:200]}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_endpoints()
