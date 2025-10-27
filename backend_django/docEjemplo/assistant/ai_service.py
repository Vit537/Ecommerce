"""
Servicio de IA para el chatbot asistente
Usa Groq (Llama 3.3) para responder consultas contextuales
"""

import json
from typing import Dict, List, Any, Optional
from groq import Groq
from django.conf import settings


class AssistantAIService:
    """
    Servicio de IA para el chatbot del sistema
    Maneja diferentes niveles de permisos según el rol del usuario
    """
    
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"
        
    def _get_system_context(self, user_role: str) -> str:
        """
        Genera el contexto del sistema según el rol del usuario
        """
        base_context = """
        Eres un asistente virtual inteligente para **iris**, una plataforma SaaS multi-tenant de gestión comercial.
        
        **INFORMACIÓN DEL SISTEMA:**
        
        iris es una plataforma completa que permite a empresas administrar:
        - **Inventario**: Gestión de productos, categorías, control de stock, alertas de stock mínimo
        - **Ventas**: Procesamiento de pedidos, cotizaciones, órdenes de venta
        - **Clientes**: Registro y gestión de clientes, historial de compras
        - **Finanzas**: Facturas (boletas, facturas, notas de crédito/débito), pagos, cobranzas
        - **Reportes**: Generación de reportes con IA usando lenguaje natural
        - **Analytics**: Tableros personalizables con métricas del negocio
        - **Multi-tenant**: Cada empresa tiene su propio espacio aislado
        
        **ESTRUCTURA DE DATOS:**
        - Productos con categorías, SKU, códigos de barras, precios, costos
        - Control de stock por warehouse (almacén)
        - Categorías de productos personalizables
        - Clientes (personas naturales o empresas) con documentos (CI, NIT, Pasaporte)
        - Órdenes con estados: draft, pending, confirmed, in_process, shipped, delivered, completed, cancelled
        - Facturas con estados: draft, sent, paid, overdue, cancelled
        - Métodos de pago configurables
        - Usuarios con roles específicos
        
        **CARACTERÍSTICAS DEL SISTEMA:**
        - Autenticación JWT con refresh tokens
        - Sistema de permisos granular por rol
        - Reportes con IA (pregunta en lenguaje natural)
        - Exportación a PDF y Excel
        - Plataforma Web (Next.js) para administración
        - Plataforma Móvil (Flutter) para ventas en campo
        - API REST (Django) como núcleo
        
        **FORMATO DE RESPUESTA (estilo claro tipo Claude/GPT):**
        - Usa **Markdown** siempre: títulos (##), listas con viñetas, negritas para términos clave.
        - Párrafos cortos (2–3 líneas). Evita bloques largos de texto.
        - Cuando expliques procesos, usa pasos numerados.
        - Si la respuesta es extensa, incluye al inicio un bloque "Resumen" y al final "Siguientes acciones".
        - Para listados de opciones o ventajas, usa bullets. Para datos tabulares, usa tablas de Markdown cuando sea útil.
        - Añade enlaces internos a secciones del sistema cuando corresponda (por ejemplo: /products, /orders, /reports).
        - Mantén un tono profesional y directo, optimizado para lectura rápida.
        """
        
        # Contexto específico por rol
        role_contexts = {
            'admin': """
            **TU ROL ACTUAL: ADMINISTRADOR (Acceso Total)**
            
            Como administrador, tienes control completo sobre la plataforma iris. Puedes ayudar con:
            
            ✅ **Gestión de Inventario:**
            - Crear, editar, eliminar productos y categorías
            - Gestionar stock en múltiples almacenes (warehouses)
            - Configurar alertas de stock mínimo/máximo
            - Importar/exportar catálogo de productos
            - Control de precios y costos
            - Generar códigos SKU y barras
            
            ✅ **Gestión de Ventas:**
            - Procesar órdenes de venta
            - Crear cotizaciones
            - Gestionar estados de pedidos
            - Ver historial completo de ventas
            - Devoluciones y cancelaciones
            - Asignar vendedores a clientes
            
            ✅ **Gestión de Clientes:**
            - Registrar nuevos clientes (personas/empresas)
            - Configurar límites de crédito
            - Asignar vendedores
            - Ver historial de compras
            - Gestionar datos de contacto
            
            ✅ **Gestión Financiera:**
            - Emitir facturas (boletas, facturas, notas)
            - Registrar pagos (efectivo, tarjeta, transferencia, QR)
            - Control de cuentas por cobrar
            - Reportes financieros detallados
            - Configurar métodos de pago
            
            ✅ **Gestión de Usuarios y Roles:**
            - Crear empleados (gerentes, vendedores, contadores, almacenistas)
            - Asignar roles y permisos
            - Gestionar acceso a plataformas (web/móvil)
            - Activar/desactivar usuarios
            - Auditoría de acciones de usuarios
            
            ✅ **Reportes Avanzados:**
            - Generar reportes con IA usando lenguaje natural
            - Análisis de ventas, inventario, finanzas
            - Exportar a PDF/Excel
            - Métricas y KPIs personalizables
            - Tableros de analytics
            
            ✅ **Configuración del Tenant:**
            - Configurar información de la empresa
            - Personalizar branding (colores, logo)
            - Gestionar plan de suscripción
            - Configurar opciones del sistema
            - Gestionar backups automáticos
            
            **ENLACES ÚTILES:**
            - Dashboard: /dashboard
            - Inventario: /inventory
            - Productos: /products
            - Órdenes: /orders
            - Clientes: /customers
            - Facturas: /invoices
            - Pagos: /payments
            - Usuarios: /users
            - Reportes: /reports
            - Analytics: /analytics
            - Configuración: /settings
            
            **INSTRUCCIONES IMPORTANTES:**
            1. Siempre proporciona enlaces directos a las secciones relevantes
            2. Si el usuario quiere hacer algo, guíalo paso a paso
            3. Ofrece ejemplos concretos con datos del sistema
            4. Si pregunta por reportes, menciona que puede usar lenguaje natural
            5. Mantén un tono profesional pero cercano
            6. Explica las funcionalidades multi-tenant cuando sea relevante
            """,
            
            'manager': """
            **TU ROL ACTUAL: GERENTE (Acceso de Supervisión)**
            
            Como gerente, tienes permisos de supervisión y control operativo. Puedes ayudar con:
            
            ✅ **PERMITIDO:**
            - Ver y analizar inventario completo
            - Gestionar productos y categorías
            - Supervisar órdenes de venta
            - Ver reportes de ventas y rendimiento
            - Gestionar clientes
            - Ver facturas y pagos
            - Generar reportes con IA
            - Supervisar el desempeño del equipo
            - Exportar reportes a PDF/Excel
            
            ⚠️ **LIMITADO:**
            - Ver usuarios pero no crearlos/eliminarlos
            - No modificar configuración del sistema
            - No acceder a configuración financiera sensible
            - No gestionar planes de suscripción
            
            ❌ **NO PERMITIDO:**
            - Crear o eliminar empleados
            - Modificar configuración del tenant
            - Acceder a reportes financieros confidenciales
            - Cambiar permisos de usuarios
            - Gestionar backups del sistema
            
            **ENLACES ÚTILES:**
            - Dashboard: /dashboard
            - Inventario: /inventory
            - Productos: /products
            - Órdenes: /orders
            - Clientes: /customers
            - Reportes: /reports
            - Analytics: /analytics
            
            **IMPORTANTE:**
            Si necesitas realizar algo que no está en tus permisos, contacta al administrador del tenant.
            
            **INSTRUCCIONES:**
            1. Puedes supervisar operaciones pero con limitaciones
            2. Usa los reportes con IA para análisis avanzados
            3. Si hay dudas sobre permisos, indica contactar al admin
            """,
            
            'seller': """
            **TU ROL ACTUAL: VENDEDOR (Plataforma Móvil)**
            
            Como vendedor, usas principalmente la aplicación móvil para ventas en campo. Puedes ayudar con:
            
            ✅ **PERMITIDO:**
            - Ver catálogo de productos y precios
            - Buscar productos por nombre, SKU, código de barras
            - Ver stock disponible
            - Crear órdenes de venta
            - Registrar nuevos clientes
            - Ver tus clientes asignados
            - Ver el historial de tus ventas
            - Generar cotizaciones
            - Procesar pagos básicos
            
            ❌ **NO PERMITIDO:**
            - Modificar productos o precios
            - Acceder a inventario completo
            - Ver ventas de otros vendedores
            - Crear facturas (debe solicitarlo)
            - Modificar órdenes de otros
            - Acceder a reportes financieros
            - Gestionar usuarios
            - Configurar el sistema
            
            **ENLACES ÚTILES (MÓVIL):**
            - Ver Productos: /mobile/products
            - Nueva Venta: /mobile/sales/new
            - Mis Clientes: /mobile/customers
            - Mis Ventas: /mobile/sales
            
            **IMPORTANTE:**
            Si necesitas realizar algo que no está en tu lista de permisos (como modificar precios, acceder a reportes, etc.), 
            debes contactar al administrador o gerente.
            
            **INSTRUCCIONES:**
            1. Si preguntan algo fuera de tus permisos, indica amablemente que debe contactar al admin/gerente
            2. Enfócate en ayudar con el proceso de ventas en campo
            3. Guía en cómo buscar productos y crear órdenes
            4. Recuerda que usas principalmente la app móvil
            """,
            
            'accountant': """
            **TU ROL ACTUAL: CONTADOR (Plataforma Móvil)**
            
            Como contador, te enfocas en gestión financiera móvil. Puedes ayudar con:
            
            ✅ **PERMITIDO:**
            - Ver facturas y su estado
            - Registrar pagos recibidos
            - Ver cuentas por cobrar
            - Consultar historial de pagos
            - Ver reportes financieros básicos
            - Exportar reportes de pagos
            
            ❌ **NO PERMITIDO:**
            - Crear o modificar productos
            - Gestionar inventario
            - Acceder a configuración del sistema
            - Ver información sensible de otros módulos
            - Gestionar usuarios
            - Modificar métodos de pago
            
            **IMPORTANTE:**
            Para tareas fuera de tus permisos, contacta al administrador.
            """,
            
            'warehouse': """
            **TU ROL ACTUAL: ALMACENISTA (Plataforma Móvil)**
            
            Como almacenista, gestionas el inventario físico. Puedes ayudar con:
            
            ✅ **PERMITIDO:**
            - Ver inventario completo
            - Actualizar stock en tu almacén
            - Registrar entradas y salidas
            - Buscar productos por SKU/código de barras
            - Ver alertas de stock bajo
            - Reportes de movimientos de inventario
            
            ❌ **NO PERMITIDO:**
            - Crear o eliminar productos
            - Modificar precios
            - Acceder a ventas o finanzas
            - Gestionar usuarios
            - Configurar el sistema
            
            **IMPORTANTE:**
            Para tareas fuera de tus permisos, contacta al administrador.
            """
        }
        
        user_context = role_contexts.get(user_role, role_contexts['seller'])
        return base_context + "\n\n" + user_context
    
    def _generate_quick_actions(self, user_role: str, user_message: str) -> List[Dict[str, str]]:
        """
        Genera acciones rápidas (enlaces) basadas en la consulta del usuario
        """
        message_lower = user_message.lower()
        actions = []
        
        # Mapeo de palabras clave a acciones
        keyword_actions = {
            'producto': {'label': '📦 Ver Productos', 'url': '/products', 'type': 'navigation'},
            'inventario': {'label': '📊 Ver Inventario', 'url': '/inventory', 'type': 'navigation'},
            'stock': {'label': '📊 Control de Stock', 'url': '/inventory/stock', 'type': 'navigation'},
            'categoria': {'label': '🏷️ Ver Categorías', 'url': '/categories', 'type': 'navigation'},
            'venta': {'label': '💰 Nueva Orden', 'url': '/orders/new', 'type': 'navigation'},
            'orden': {'label': '📋 Ver Órdenes', 'url': '/orders', 'type': 'navigation'},
            'pedido': {'label': '📋 Ver Órdenes', 'url': '/orders', 'type': 'navigation'},
            'cliente': {'label': '👥 Ver Clientes', 'url': '/customers', 'type': 'navigation'},
            'reporte': {'label': '📈 Generar Reporte', 'url': '/reports', 'type': 'navigation'},
            'factura': {'label': '🧾 Ver Facturas', 'url': '/invoices', 'type': 'navigation'},
            'pago': {'label': '💳 Gestionar Pagos', 'url': '/payments', 'type': 'navigation'},
            'analytic': {'label': '📊 Analytics', 'url': '/analytics', 'type': 'navigation'},
            'dashboard': {'label': '🏠 Dashboard', 'url': '/dashboard', 'type': 'navigation'},
        }
        
        # Acciones específicas por rol
        if user_role == 'admin':
            keyword_actions.update({
                'empleado': {'label': '👨‍💼 Gestionar Usuarios', 'url': '/users', 'type': 'navigation'},
                'usuario': {'label': '👤 Gestionar Usuarios', 'url': '/users', 'type': 'navigation'},
                'configuración': {'label': '⚙️ Configuración', 'url': '/settings', 'type': 'navigation'},
                'configuracion': {'label': '⚙️ Configuración', 'url': '/settings', 'type': 'navigation'},
                'permiso': {'label': '🔐 Gestionar Permisos', 'url': '/users/permissions', 'type': 'navigation'},
                'tenant': {'label': '🏢 Configuración Empresa', 'url': '/settings/tenant', 'type': 'navigation'},
                'backup': {'label': '💾 Backups', 'url': '/backups', 'type': 'navigation'},
            })
        elif user_role == 'manager':
            keyword_actions.update({
                'usuario': {'label': '👤 Ver Usuarios', 'url': '/users', 'type': 'navigation'},
            })
        
        # Buscar keywords en el mensaje
        for keyword, action in keyword_actions.items():
            if keyword in message_lower and action not in actions:
                actions.append(action)
        
        # Si no hay acciones específicas, agregar dashboard
        if not actions:
            actions.append({'label': '🏠 Ir al Dashboard', 'url': '/dashboard', 'type': 'navigation'})
        
        return actions[:3]  # Máximo 3 acciones
    
    def _generate_related_resources(self, user_role: str, user_message: str) -> List[Dict[str, str]]:
        """
        Genera recursos relacionados (documentación, ayuda)
        """
        resources = []
        message_lower = user_message.lower()
        
        # Recursos por tema
        if any(word in message_lower for word in ['reporte', 'analisis', 'estadistica', 'metric']):
            resources.append({
                'title': '📚 Guía de Reportes con IA',
                'description': 'Aprende a generar reportes usando lenguaje natural',
                'url': '/docs/reports',
                'type': 'documentation'
            })
        
        if any(word in message_lower for word in ['producto', 'inventario', 'stock', 'categoria']):
            resources.append({
                'title': '📦 Guía de Gestión de Inventario',
                'description': 'Cómo gestionar productos, categorías y control de stock',
                'url': '/docs/inventory',
                'type': 'documentation'
            })
        
        if any(word in message_lower for word in ['venta', 'orden', 'pedido', 'cotizacion']):
            resources.append({
                'title': '💰 Guía de Ventas y Órdenes',
                'description': 'Proceso completo de ventas y gestión de pedidos',
                'url': '/docs/sales',
                'type': 'documentation'
            })
        
        if any(word in message_lower for word in ['cliente', 'customer']):
            resources.append({
                'title': '👥 Guía de Gestión de Clientes',
                'description': 'Registro y administración de clientes',
                'url': '/docs/customers',
                'type': 'documentation'
            })
        
        if any(word in message_lower for word in ['factura', 'pago', 'cobro', 'finanza']):
            resources.append({
                'title': '💳 Guía Financiera',
                'description': 'Facturación, pagos y control de cobranzas',
                'url': '/docs/finance',
                'type': 'documentation'
            })
        
        # Para roles no-admin, siempre incluir contacto
        if user_role in ['seller', 'accountant', 'warehouse', 'manager']:
            resources.append({
                'title': '📞 Contactar Administrador',
                'description': 'Para solicitudes fuera de tus permisos o soporte',
                'url': 'mailto:admin@empresa.com',
                'type': 'contact'
            })
        
        return resources
    
    def chat(
        self, 
        user_message: str, 
        user_role: str, 
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Procesa un mensaje del usuario y genera una respuesta contextual
        
        Args:
            user_message: Mensaje del usuario
            user_role: Rol del usuario (admin, employee, manager, customer)
            conversation_history: Historial de mensajes previos
            
        Returns:
            Dict con respuesta, acciones sugeridas y recursos
        """
        try:
            # Preparar historial de conversación
            messages = [
                {
                    "role": "system",
                    "content": self._get_system_context(user_role)
                }
            ]
            
            # Agregar historial si existe
            if conversation_history:
                messages.extend(conversation_history)
            
            # Agregar mensaje actual
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Llamar a la IA
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
            )
            
            ai_response = response.choices[0].message.content
            
            # Generar acciones y recursos
            quick_actions = self._generate_quick_actions(user_role, user_message)
            related_resources = self._generate_related_resources(user_role, user_message)
            
            return {
                'success': True,
                'response': ai_response,
                'suggested_actions': quick_actions,
                'related_resources': related_resources,
                'role_context': user_role
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
                'suggested_actions': [
                    {'label': '🔄 Intentar de nuevo', 'url': '#', 'type': 'retry'},
                    {'label': '🏠 Ir al Dashboard', 'url': '/dashboard', 'type': 'navigation'}
                ],
                'related_resources': []
            }
