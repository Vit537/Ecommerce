from functools import wraps
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import BasePermission


class IsSuperuserOrAdmin(BasePermission):
    """
    Permiso para que solo superusuarios o admins puedan acceder
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == 'admin'
        )


def require_permission(permission_codename):
    """
    Decorador para requerir un permiso específico
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse(
                    {'error': 'Autenticación requerida'}, 
                    status=401
                )
            
            # Verificar si es superusuario
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            
            # Obtener permisos del usuario
            user_permissions = request.user.get_user_permissions()
            permission_codenames = [perm.codename for perm in user_permissions]
            
            if permission_codename not in permission_codenames:
                return JsonResponse(
                    {'error': f'No tienes permisos para realizar esta acción. Permiso requerido: {permission_codename}'}, 
                    status=403
                )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def require_role(role_name):
    """
    Decorador para requerir un rol específico
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse(
                    {'error': 'Autenticación requerida'}, 
                    status=401
                )
            
            # Verificar si es superusuario
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            
            # Verificar rol del usuario
            if request.user.role != role_name:
                return JsonResponse(
                    {'error': f'Acceso denegado. Rol requerido: {role_name}'}, 
                    status=403
                )
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def admin_required(view_func):
    """
    Decorador para requerir permisos de administrador
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'error': 'Autenticación requerida'}, 
                status=401
            )
        
        if not request.user.is_admin():
            return JsonResponse(
                {'error': 'Acceso denegado. Se requieren permisos de administrador'}, 
                status=403
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def employee_required(view_func):
    """
    Decorador para requerir que el usuario sea empleado o administrador
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'error': 'Autenticación requerida'}, 
                status=401
            )
        
        if not (request.user.is_employee() or request.user.is_admin()):
            return JsonResponse(
                {'error': 'Acceso denegado. Se requieren permisos de empleado'}, 
                status=403
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def customer_or_staff_required(view_func):
    """
    Decorador para permitir acceso a clientes, empleados y administradores
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'error': 'Autenticación requerida'}, 
                status=401
            )
        
        # Todos los usuarios autenticados pueden acceder
        return view_func(request, *args, **kwargs)
    
    return wrapper


class PermissionMixin:
    """
    Mixin para ViewSets que requieren permisos específicos
    """
    required_permission = None
    required_role = None
    
    def check_permissions(self, request):
        super().check_permissions(request)
        
        if not request.user.is_authenticated:
            self.permission_denied(request, message='Autenticación requerida')
        
        # Verificar si es superusuario
        if request.user.is_superuser:
            return
        
        # Verificar rol requerido
        if self.required_role and request.user.role != self.required_role:
            self.permission_denied(
                request, 
                message=f'Acceso denegado. Rol requerido: {self.required_role}'
            )
        
        # Verificar permiso requerido
        if self.required_permission:
            user_permissions = request.user.get_user_permissions()
            permission_codenames = [perm.codename for perm in user_permissions]
            
            if self.required_permission not in permission_codenames:
                self.permission_denied(
                    request, 
                    message=f'No tienes permisos para realizar esta acción. Permiso requerido: {self.required_permission}'
                )


def check_object_permission(user, obj, permission_type='view'):
    """
    Verificar permisos a nivel de objeto
    """
    # Administradores tienen acceso completo
    if user.is_admin():
        return True
    
    # Para órdenes, los clientes solo pueden ver sus propias órdenes
    if hasattr(obj, 'customer') and obj.customer == user:
        return True
    
    # Para empleados, verificar permisos específicos según el tipo de objeto
    if user.is_employee():
        if hasattr(obj, '__class__'):
            model_name = obj.__class__.__name__.lower()
            
            # Mapeo de modelos a permisos
            permission_map = {
                'order': f'sales_{permission_type}',
                'product': f'inventory_{permission_type}',
                'customer': f'customers_{permission_type}',
                'employee': f'employees_{permission_type}',
            }
            
            if model_name in permission_map:
                required_permission = permission_map[model_name]
                user_permissions = user.get_user_permissions()
                permission_codenames = [perm.codename for perm in user_permissions]
                return required_permission in permission_codenames
    
    return False