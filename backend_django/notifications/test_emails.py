"""
Script de prueba para las funcionalidades de email con Resend
"""
import requests
import json

# URL base del API (ajustar según tu entorno)
BASE_URL = "http://localhost:8000/api"

# Token de autenticación (debes obtenerlo después de hacer login como admin)
# Reemplaza con un token válido
AUTH_TOKEN = "your_admin_token_here"

headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}


def test_connection():
    """Prueba la conexión con Resend"""
    print("\n🔍 Probando conexión con Resend...")
    
    url = f"{BASE_URL}/notifications/settings/test_connection/"
    response = requests.post(url, headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_broadcast_email():
    """Prueba el envío de email personalizado"""
    print("\n📧 Probando envío de email broadcast...")
    
    url = f"{BASE_URL}/notifications/settings/broadcast_email/"
    data = {
        "recipients": [
            "henrysalas2558@gmail.com",
            "sure.pencil@gmail.com"
        ],
        "subject": "🎉 Prueba de Email - SPORTSWEAR",
        "message": "Este es un email de prueba desde el sistema.\n\n¡Todo está funcionando correctamente!",
        "is_html": False
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_daily_report():
    """Prueba el envío del reporte diario"""
    print("\n📊 Probando envío de reporte diario...")
    
    url = f"{BASE_URL}/notifications/settings/send_daily_report/"
    # Opcional: enviar fecha específica
    # data = {"date": "2025-01-15"}
    
    response = requests.post(url, headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def list_notifications():
    """Lista las notificaciones enviadas"""
    print("\n📋 Listando notificaciones...")
    
    url = f"{BASE_URL}/notifications/notifications/"
    response = requests.get(url, headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total: {data.get('count', 0)} notificaciones")
        for notif in data.get('results', [])[:5]:
            print(f"  - {notif['title']} ({notif['status']})")


if __name__ == "__main__":
    print("=" * 60)
    print("PRUEBA DE SISTEMA DE EMAILS - SPORTSWEAR")
    print("=" * 60)
    
    print("\n⚠️  IMPORTANTE:")
    print("1. Asegúrate de tener el servidor corriendo (python manage.py runserver)")
    print("2. Actualiza el AUTH_TOKEN con un token válido de admin")
    print("3. Los emails solo se enviarán a contactos permitidos en Resend")
    
    # Descomentar las pruebas que quieras ejecutar:
    
    # test_connection()
    # test_broadcast_email()
    # test_daily_report()
    # list_notifications()
    
    print("\n✅ Script de prueba listo")
    print("Descomenta las funciones que quieras probar en el código")
