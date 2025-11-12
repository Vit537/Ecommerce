"""
Vista para diagnosticar el servicio de IA
Solo accesible para admins
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from groq import Groq


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_ai_connection(request):
    """
    Prueba la conexión con Groq y retorna información de diagnóstico
    Solo para admins
    """
    # Verificar que sea admin
    if request.user.role != 'admin':
        return Response(
            {'error': 'Solo los administradores pueden acceder a este endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    diagnostics = {
        'groq_api_key_configured': bool(settings.GROQ_API_KEY),
        'groq_api_key_length': len(settings.GROQ_API_KEY) if settings.GROQ_API_KEY else 0,
        'groq_api_key_preview': f"{settings.GROQ_API_KEY[:10]}..." if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 10 else None,
        'openai_api_key_configured': bool(settings.OPENAI_API_KEY),
    }
    
    # Intentar crear cliente de Groq
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        diagnostics['groq_client_created'] = True
        
        # Intentar hacer una petición simple
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": "Di solo 'Hola' sin más"
                    }
                ],
                max_tokens=10,
                temperature=0.1
            )
            
            diagnostics['groq_api_works'] = True
            diagnostics['groq_test_response'] = response.choices[0].message.content
            diagnostics['status'] = 'success'
            diagnostics['message'] = '✅ Groq está funcionando correctamente'
            
        except Exception as e:
            diagnostics['groq_api_works'] = False
            diagnostics['groq_error'] = str(e)
            diagnostics['groq_error_type'] = type(e).__name__
            diagnostics['status'] = 'error'
            diagnostics['message'] = f'❌ Error al llamar a la API de Groq: {str(e)}'
            
    except Exception as e:
        diagnostics['groq_client_created'] = False
        diagnostics['groq_client_error'] = str(e)
        diagnostics['groq_error_type'] = type(e).__name__
        diagnostics['status'] = 'error'
        diagnostics['message'] = f'❌ Error al crear el cliente de Groq: {str(e)}'
    
    return Response(diagnostics)
