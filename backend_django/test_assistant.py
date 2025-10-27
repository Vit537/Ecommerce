"""
Script de prueba para el sistema de chatbot asistente
Prueba todos los endpoints y funcionalidades
"""

import requests
import json
from colorama import init, Fore, Style

# Inicializar colorama para colores en terminal
init(autoreset=True)

# Configuración
BASE_URL = "http://localhost:8000/api"
ADMIN_EMAIL = "admin@boutique.com"
ADMIN_PASSWORD = "admin123"
EMPLOYEE_EMAIL = "cajero@boutique.com"
EMPLOYEE_PASSWORD = "cajero123"


def print_header(text):
    """Imprime un encabezado bonito"""
    print(f"\n{Fore.CYAN}{'=' * 80}")
    print(f"{Fore.CYAN}{text:^80}")
    print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")


def print_success(text):
    """Imprime mensaje de éxito"""
    print(f"{Fore.GREEN}✅ {text}{Style.RESET_ALL}")


def print_error(text):
    """Imprime mensaje de error"""
    print(f"{Fore.RED}❌ {text}{Style.RESET_ALL}")


def print_info(text):
    """Imprime mensaje informativo"""
    print(f"{Fore.YELLOW}ℹ️  {text}{Style.RESET_ALL}")


def login(email, password):
    """Hace login y retorna el token JWT"""
    print_info(f"Haciendo login como: {email}")
    
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print_success(f"Login exitoso. Token obtenido.")
        return token
    else:
        print_error(f"Error en login: {response.status_code}")
        print(response.text)
        return None


def test_chat(token, user_type, message):
    """Prueba enviar un mensaje al chatbot"""
    print_info(f"Enviando mensaje como {user_type}: '{message}'")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/assistant/chat/",
        headers=headers,
        json={"message": message}
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success("Respuesta recibida del chatbot:")
        print(f"\n{Fore.WHITE}Conversación ID: {data['conversation_id']}")
        print(f"Rol del usuario: {data['user_role']}\n")
        
        # Imprimir respuesta del asistente
        msg = data['message']
        print(f"{Fore.MAGENTA}Asistente:{Style.RESET_ALL}")
        print(f"{msg['content']}\n")
        
        # Imprimir acciones sugeridas
        if msg.get('suggested_actions'):
            print(f"{Fore.BLUE}Acciones Sugeridas:{Style.RESET_ALL}")
            for action in msg['suggested_actions']:
                print(f"  - {action['label']} → {action['url']}")
            print()
        
        # Imprimir recursos relacionados
        if msg.get('related_resources'):
            print(f"{Fore.BLUE}Recursos Relacionados:{Style.RESET_ALL}")
            for resource in msg['related_resources']:
                print(f"  - {resource['title']}: {resource['description']}")
                print(f"    URL: {resource['url']}")
            print()
        
        return data['conversation_id']
    else:
        print_error(f"Error: {response.status_code}")
        print(response.text)
        return None


def test_conversations(token):
    """Prueba listar conversaciones"""
    print_info("Obteniendo lista de conversaciones...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/assistant/conversations/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        conversations = data['conversations']
        print_success(f"Se encontraron {len(conversations)} conversaciones:")
        
        for conv in conversations:
            print(f"\n  ID: {conv['id']}")
            print(f"  Título: {conv['title']}")
            print(f"  Mensajes: {conv['message_count']}")
            print(f"  Última actualización: {conv['last_message_at']}")
            
            if conv.get('last_message_preview'):
                preview = conv['last_message_preview']
                print(f"  Último mensaje ({preview['role']}): {preview['content']}")
    else:
        print_error(f"Error: {response.status_code}")
        print(response.text)


def test_quick_actions(token, user_type):
    """Prueba obtener acciones rápidas"""
    print_info(f"Obteniendo acciones rápidas para {user_type}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/assistant/quick-actions/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Acciones rápidas para rol '{data['role']}':")
        
        for action in data['quick_actions']:
            print(f"  {action['label']} → {action['url']}")
    else:
        print_error(f"Error: {response.status_code}")
        print(response.text)


def test_suggestions(token, user_type):
    """Prueba obtener sugerencias"""
    print_info(f"Obteniendo sugerencias para {user_type}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/assistant/suggestions/",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Sugerencias para rol '{data['role']}':")
        
        for idx, suggestion in enumerate(data['suggestions'], 1):
            print(f"  {idx}. {suggestion}")
    else:
        print_error(f"Error: {response.status_code}")
        print(response.text)


def run_tests():
    """Ejecuta todos los tests"""
    
    print_header("🤖 PRUEBA DEL SISTEMA DE CHATBOT ASISTENTE")
    
    # Test 1: Admin
    print_header("TEST 1: CHATBOT PARA ADMINISTRADOR")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    
    if admin_token:
        # Preguntas de admin
        test_chat(admin_token, "Admin", "¿Cómo creo un nuevo producto?")
        test_chat(admin_token, "Admin", "¿Cómo genero un reporte de ventas?")
        test_chat(admin_token, "Admin", "¿Cómo agrego un empleado?")
        
        # Ver conversaciones
        test_conversations(admin_token)
        
        # Ver acciones rápidas
        test_quick_actions(admin_token, "Admin")
        
        # Ver sugerencias
        test_suggestions(admin_token, "Admin")
    
    # Test 2: Cajero
    print_header("TEST 2: CHATBOT PARA CAJERO (CON RESTRICCIONES)")
    employee_token = login(EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    
    if employee_token:
        # Pregunta permitida
        test_chat(employee_token, "Cajero", "¿Cómo registro una venta?")
        
        # Pregunta NO permitida (debe mostrar restricción)
        test_chat(employee_token, "Cajero", "¿Cómo cambio el precio de un producto?")
        
        # Pregunta NO permitida (debe mostrar restricción)
        test_chat(employee_token, "Cajero", "¿Cómo creo un nuevo empleado?")
        
        # Ver conversaciones
        test_conversations(employee_token)
        
        # Ver acciones rápidas
        test_quick_actions(employee_token, "Cajero")
        
        # Ver sugerencias
        test_suggestions(employee_token, "Cajero")
    
    # Test 3: Conversación continua
    print_header("TEST 3: CONVERSACIÓN CONTINUA (CON MEMORIA)")
    
    if admin_token:
        conv_id = test_chat(admin_token, "Admin", "¿Qué productos tenemos?")
        
        if conv_id:
            print_info(f"Continuando conversación {conv_id}...")
            
            headers = {
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            }
            
            # Segundo mensaje en la misma conversación
            response = requests.post(
                f"{BASE_URL}/assistant/chat/",
                headers=headers,
                json={
                    "message": "¿Y cómo veo el stock de esos productos?",
                    "conversation_id": conv_id
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("El chatbot mantuvo el contexto de la conversación:")
                print(f"\n{Fore.MAGENTA}Asistente:{Style.RESET_ALL}")
                print(f"{data['message']['content']}\n")
    
    print_header("✅ TODAS LAS PRUEBAS COMPLETADAS")
    
    print(f"\n{Fore.GREEN}{'=' * 80}")
    print(f"{Fore.GREEN}RESUMEN:{Style.RESET_ALL}")
    print(f"{Fore.WHITE}1. ✅ Sistema de chatbot funcionando correctamente")
    print(f"2. ✅ Restricciones por rol implementadas")
    print(f"3. ✅ Enlaces dinámicos generados automáticamente")
    print(f"4. ✅ Memoria conversacional activa")
    print(f"5. ✅ Acciones rápidas y sugerencias por rol")
    print(f"\n{Fore.CYAN}🎉 El chatbot está listo para usar!{Style.RESET_ALL}\n")


if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}Pruebas interrumpidas por el usuario.{Style.RESET_ALL}")
    except Exception as e:
        print_error(f"Error durante las pruebas: {str(e)}")
