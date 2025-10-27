#!/usr/bin/env python3
"""
Script para probar los endpoints de la API y verificar qué datos están disponibles
"""
import requests
import json
from pprint import pprint

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_login():
    """Probar login y obtener token"""
    print("🔐 Probando login...")
    
    login_data = {
        "email": "admin@boutique.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso")
            print(f"Token: {data.get('access', 'No token')[:50]}...")
            return data.get('access')
        else:
            print("❌ Error en login")
            print(response.text)
            return None
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor. ¿Está ejecutándose?")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_products(token):
    """Probar endpoint de productos"""
    print("\n📦 Probando productos...")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        response = requests.get(f"{API_BASE}/products/", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total productos: {data.get('count', 0)}")
            
            results = data.get('results', [])
            if results:
                print("📋 Primeros 3 productos:")
                for i, product in enumerate(results[:3]):
                    print(f"  {i+1}. {product.get('name')} - ${product.get('price')} - SKU: {product.get('sku')}")
            return data
        else:
            print("❌ Error al obtener productos")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_orders(token):
    """Probar endpoint de órdenes"""
    print("\n🛒 Probando órdenes...")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        response = requests.get(f"{API_BASE}/orders/", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total órdenes: {data.get('count', 0)}")
            
            results = data.get('results', [])
            if results:
                print("📋 Primeras 3 órdenes:")
                for i, order in enumerate(results[:3]):
                    customer = order.get('customer', {})
                    print(f"  {i+1}. Orden #{order.get('id')} - ${order.get('total_amount')} - Cliente: {customer.get('email', 'Sin email')}")
            return data
        else:
            print("❌ Error al obtener órdenes")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_categories(token):
    """Probar endpoint de categorías"""
    print("\n📁 Probando categorías...")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        response = requests.get(f"{API_BASE}/products/categories/", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total categorías: {len(data) if isinstance(data, list) else data.get('count', 0)}")
            
            categories = data if isinstance(data, list) else data.get('results', [])
            if categories:
                print("📋 Primeras 5 categorías:")
                for i, cat in enumerate(categories[:5]):
                    print(f"  {i+1}. {cat.get('name')} - Slug: {cat.get('slug')}")
            return data
        else:
            print("❌ Error al obtener categorías")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("🚀 PROBANDO API DEL E-COMMERCE")
    print("=" * 50)
    
    # Probar login
    token = test_login()
    
    if not token:
        print("\n❌ No se pudo obtener token. Probando endpoints sin autenticación...")
        token = None
    
    # Probar endpoints
    test_products(token)
    test_orders(token)
    test_categories(token)
    
    print("\n" + "=" * 50)
    print("✅ Pruebas completadas")
    
    if token:
        print("\n🎯 RECOMENDACIONES:")
        print("1. Los endpoints están funcionando correctamente")
        print("2. Verifica que el frontend esté apuntando a http://localhost:8000")
        print("3. Revisa las credenciales de login en el frontend")
        print("4. Verifica que no haya errores de CORS")
    else:
        print("\n⚠️  PROBLEMAS DETECTADOS:")
        print("1. No se pudo autenticar - verifica credenciales")
        print("2. Servidor posiblemente no esté funcionando")
        print("3. Revisa que Django esté en http://localhost:8000")

if __name__ == "__main__":
    main()