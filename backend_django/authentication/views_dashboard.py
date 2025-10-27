# Imports para funciones y modelos
from django.utils import timezone
from django.db import models
from datetime import timedelta
# Endpoint para usuarios registrados este mes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_this_month_view(request):
    user = request.user
    if not user.is_admin:
        return Response({'error': 'No autorizado'}, status=403)
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    from authentication.models import User
    count = User.objects.filter(created_at__gte=month_start).count()
    return Response({'users_this_month': count})
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from authentication.models import User
from products.models import Product, Category
from orders.models import Order, PaymentMethod
from employees.models import Employee, Department
from permissions.models import UserRole, Permission


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    Vista del dashboard principal que cambia según el tipo de usuario
    """
    user = request.user
    user_roles = UserRole.objects.filter(user=user, is_active=True)
    
    # Determinar tipo de usuario y permisos
    is_admin = user.is_admin()
    is_employee = user.is_employee()
    is_customer = user.is_customer()
    
    dashboard_data = {
        'user_info': {
            'name': user.get_full_name(),
            'email': user.email,
            'role': user.role,
            'user_type': user.user_type,
            'is_admin': is_admin,
            'is_employee': is_employee,
            'is_customer': is_customer,
        },
        'permissions': [],
        'navigation': [],
        'widgets': []
    }
    
    # Obtener permisos del usuario
    user_permissions = user.get_user_permissions()
    dashboard_data['permissions'] = [perm.codename for perm in user_permissions]
    
    # Configurar navegación según rol
    if is_admin:
        dashboard_data['navigation'] = [
            {'name': 'Dashboard', 'url': '/admin/dashboard', 'icon': 'dashboard'},
            {'name': 'Productos', 'url': '/admin/products', 'icon': 'inventory'},
            {'name': 'Órdenes', 'url': '/admin/orders', 'icon': 'shopping_cart'},
            {'name': 'Clientes', 'url': '/admin/customers', 'icon': 'people'},
            {'name': 'Empleados', 'url': '/admin/employees', 'icon': 'badge'},
            {'name': 'Reportes', 'url': '/admin/reports', 'icon': 'analytics'},
            {'name': 'Configuración', 'url': '/admin/settings', 'icon': 'settings'},
        ]
        
        # Widgets para admin
        dashboard_data['widgets'] = get_admin_widgets()
        
    elif is_employee:
        dashboard_data['navigation'] = [
            {'name': 'Dashboard', 'url': '/employee/dashboard', 'icon': 'dashboard'},
            {'name': 'Ventas', 'url': '/employee/sales', 'icon': 'point_of_sale'},
            {'name': 'Productos', 'url': '/employee/products', 'icon': 'inventory'},
            {'name': 'Clientes', 'url': '/employee/customers', 'icon': 'people'},
            {'name': 'Mi Perfil', 'url': '/employee/profile', 'icon': 'account_circle'},
        ]
        
        # Widgets para empleados
        dashboard_data['widgets'] = get_employee_widgets(user)
        
    elif is_customer:
        dashboard_data['navigation'] = [
            {'name': 'Inicio', 'url': '/shop', 'icon': 'home'},
            {'name': 'Productos', 'url': '/shop/products', 'icon': 'shopping_bag'},
            {'name': 'Mi Carrito', 'url': '/shop/cart', 'icon': 'shopping_cart'},
            {'name': 'Mis Órdenes', 'url': '/shop/orders', 'icon': 'receipt'},
            {'name': 'Mi Perfil', 'url': '/shop/profile', 'icon': 'account_circle'},
        ]
        
        # Widgets para clientes
        dashboard_data['widgets'] = get_customer_widgets(user)
    
    return Response(dashboard_data)


def get_admin_widgets():
    """Obtener widgets específicos para administradores"""
    try:
        widgets = []
        
        # Widget de ventas del día
        today_orders = Order.objects.filter(
            created_at__date=timezone.now().date(),
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        )
        
        widgets.append({
            'type': 'metric',
            'title': 'Ventas del Día',
            'value': len(today_orders),
            'subtitle': f'Total: ${sum(order.total_amount for order in today_orders):.2f}',
            'icon': 'trending_up',
            'color': 'primary'
        })
        
        # Widget de productos con stock bajo
        low_stock_products = Product.objects.filter(
            variants__stock_quantity__lte=models.F('variants__min_stock_level')
        ).distinct()
        
        widgets.append({
            'type': 'metric',
            'title': 'Stock Bajo',
            'value': len(low_stock_products),
            'subtitle': 'Productos necesitan reabastecimiento',
            'icon': 'warning',
            'color': 'warning'
        })
        
        # Widget de empleados activos
        active_employees = Employee.objects.filter(employment_status='active').count()
        
        widgets.append({
            'type': 'metric',
            'title': 'Empleados Activos',
            'value': active_employees,
            'subtitle': 'Personal en nómina',
            'icon': 'people',
            'color': 'info'
        })
        
        # Widget de nuevos clientes
        new_customers = User.objects.filter(
            role='customer',
            created_at__date=timezone.now().date()
        ).count()
        
        widgets.append({
            'type': 'metric',
            'title': 'Nuevos Clientes',
            'value': new_customers,
            'subtitle': 'Registrados hoy',
            'icon': 'person_add',
            'color': 'success'
        })
        
        return widgets
    except Exception as e:
        return []


def get_employee_widgets(user):
    """Obtener widgets específicos para empleados"""
    try:
        widgets = []
        
        # Widget de ventas personales del día
        today_orders = Order.objects.filter(
            processed_by=user,
            created_at__date=timezone.now().date()
        )
        
        widgets.append({
            'type': 'metric',
            'title': 'Mis Ventas del Día',
            'value': len(today_orders),
            'subtitle': f'Total: ${sum(order.total_amount for order in today_orders):.2f}',
            'icon': 'sales',
            'color': 'primary'
        })
        
        # Widget de órdenes pendientes
        pending_orders = Order.objects.filter(
            status__in=['pending', 'confirmed']
        ).count()
        
        widgets.append({
            'type': 'metric',
            'title': 'Órdenes Pendientes',
            'value': pending_orders,
            'subtitle': 'Requieren atención',
            'icon': 'pending',
            'color': 'warning'
        })
        
        return widgets
    except Exception as e:
        return []


def get_customer_widgets(user):
    """Obtener widgets específicos para clientes"""
    try:
        widgets = []
        
        # Widget de órdenes del cliente
        user_orders = Order.objects.filter(customer=user).count()
        
        widgets.append({
            'type': 'metric',
            'title': 'Mis Órdenes',
            'value': user_orders,
            'subtitle': 'Total de compras',
            'icon': 'receipt',
            'color': 'primary'
        })
        
        # Widget de productos favoritos (simulado)
        widgets.append({
            'type': 'metric',
            'title': 'Productos Nuevos',
            'value': Product.objects.filter(
                status='active',
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count(),
            'subtitle': 'Esta semana',
            'icon': 'new_releases',
            'color': 'info'
        })
        
        return widgets
    except Exception as e:
        return []


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    """
    Vista para obtener los permisos específicos del usuario
    """
    user = request.user
    
    # Obtener roles del usuario
    user_roles = UserRole.objects.filter(user=user, is_active=True)
    roles_data = []
    
    for user_role in user_roles:
        role = user_role.role
        permissions = role.get_permissions_by_category()
        
        roles_data.append({
            'role_name': role.name,
            'role_description': role.description,
            'permissions_by_category': permissions
        })
    
    # Obtener permisos directos del usuario
    direct_permissions = Permission.objects.filter(
        direct_user_permissions__user=user,
        direct_user_permissions__is_active=True
    )
    
    return Response({
        'user_roles': roles_data,
        'direct_permissions': [
            {
                'name': perm.name,
                'codename': perm.codename,
                'category': perm.get_category_display()
            }
            for perm in direct_permissions
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats_view(request):
    """
    Vista de estadísticas solo para administradores
    """
    if not request.user.is_admin():
        return Response(
            {'error': 'No tienes permisos para acceder a esta información'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Sum, Count, Q
    
    # Estadísticas de ventas
    today = timezone.now().date()
    this_month = today.replace(day=1)
    
    stats = {
        'sales': {
            'today': Order.objects.filter(
                created_at__date=today,
                status__in=['confirmed', 'processing', 'shipped', 'delivered']
            ).aggregate(
                total=Sum('total_amount'),
                count=Count('id')
            ),
            'this_month': Order.objects.filter(
                created_at__date__gte=this_month,
                status__in=['confirmed', 'processing', 'shipped', 'delivered']
            ).aggregate(
                total=Sum('total_amount'),
                count=Count('id')
            )
        },
        'products': {
            'total_active': Product.objects.filter(status='active').count(),
            'low_stock': Product.objects.filter(
                variants__stock_quantity__lte=models.F('variants__min_stock_level')
            ).distinct().count(),
            'out_of_stock': Product.objects.filter(
                variants__stock_quantity=0
            ).distinct().count()
        },
        'customers': {
            'total': User.objects.filter(role='customer').count(),
            'new_this_month': User.objects.filter(
                role='customer',
                created_at__date__gte=this_month
            ).count()
        },
        'employees': {
            'total_active': Employee.objects.filter(employment_status='active').count(),
            'departments': Department.objects.filter(is_active=True).count()
        }
    }
    
    return Response(stats)


# Middleware para verificar permisos
class PermissionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Verificar permisos específicos basados en la vista
        if hasattr(view_func, 'required_permission'):
            if request.user.is_authenticated:
                user_permissions = request.user.get_user_permissions()
                permission_codenames = [perm.codename for perm in user_permissions]
                
                if view_func.required_permission not in permission_codenames:
                    return JsonResponse(
                        {'error': 'No tienes permisos para realizar esta acción'}, 
                        status=403
                    )
        
        return None