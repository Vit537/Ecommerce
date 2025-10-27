"""
Script de prueba para verificar autenticación y endpoints del asistente
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000/api"

def test_login():
    """Prueba de login para obtener token"""
    print("\n🔐 Probando login...")
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "email": "admin@boutique.com",
            "password": "admin123"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login exitoso")
        print(f"Token: {data['access'][:20]}...")
        return data['access']
    else:
        print(f"❌ Login fallido: {response.text}")
        return None

def test_quick_actions(token):
    """Prueba endpoint de acciones rápidas"""
    print("\n⚡ Probando quick-actions...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(
        f"{BASE_URL}/assistant/quick-actions/",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Quick actions obtenidas:")
        print(json.dumps(data, indent=2))
    else:
        print(f"❌ Error: {response.text}")

def test_suggestions(token):
    """Prueba endpoint de sugerencias"""
    print("\n💡 Probando suggestions...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(
        f"{BASE_URL}/assistant/suggestions/",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Sugerencias obtenidas:")
        print(json.dumps(data, indent=2))
    else:
        print(f"❌ Error: {response.text}")

def test_chat(token):
    """Prueba endpoint de chat"""
    print("\n💬 Probando chat...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        f"{BASE_URL}/assistant/chat/",
        headers=headers,
        json={
            "message": "¿Cómo registro una venta?"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Respuesta del chat:")
        print(f"Conversation ID: {data.get('conversation_id')}")
        print(f"Role: {data.get('user_role')}")
        print(f"Message: {data.get('message', {}).get('content', '')[:100]}...")
    else:
        print(f"❌ Error: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 PRUEBAS DE ENDPOINTS DEL ASISTENTE")
    print("=" * 60)
    
    token = test_login()
    
    if token:
        test_quick_actions(token)
        test_suggestions(token)
        test_chat(token)
        
        print("\n" + "=" * 60)
        print("✅ PRUEBAS COMPLETADAS")
        print("=" * 60)
    else:
        print("\n❌ No se pudo obtener token, abortando pruebas")
