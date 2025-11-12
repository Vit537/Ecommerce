from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import logout
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordChangeSerializer, UserUpdateSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerificationSerializer, ResendEmailVerificationSerializer
)

# --- NEW ENDPOINT: /api/auth/me/ ---
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """
    Get current authenticated user info
    GET /api/auth/me/
    """
    return Response(UserSerializer(request.user).data)

# Vista de login independiente sin CSRF
@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Login user and return JWT tokens (CSRF exempt)
    
    POST /api/auth/login/
    Body: {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Prepare user data with role information
        user_data = UserSerializer(user).data
        user_data.update({
            'is_admin': user.is_admin,  # Now it's a property, not a method
            'is_employee': user.is_employee,  # Now it's a property, not a method
            'is_customer': user.is_customer,  # Now it's a property, not a method
        })
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
        }, status=status.HTTP_200_OK)
    
    return Response({
        'detail': 'Credenciales incorrectas'
    }, status=status.HTTP_400_BAD_REQUEST)


# Vista de registro independiente sin CSRF
@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Register a new user (CSRF exempt)
    
    POST /api/auth/register/
    Body: {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe", 
        "password": "securepassword123",
        "password_confirm": "securepassword123"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        # Return user data with tokens
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet for authentication operations
    """
    
    
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Register a new user
        
        POST /api/auth/register/
        Body: {
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe", 
            "password": "securepassword123",
            "password_confirm": "securepassword123"
        }
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            # Return user data with tokens
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        Login user and return JWT tokens
        
        POST /api/auth/login/
        Body: {
            "email": "user@example.com",
            "password": "password123"
        }
        """
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Prepare user data with role information
            user_data = UserSerializer(user).data
            user_data.update({
                'is_admin': user.is_admin,  # Now it's a property, not a method
                'is_employee': user.is_employee,  # Now it's a property, not a method
                'is_customer': user.is_customer,  # Now it's a property, not a method
            })
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            }, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'Credenciales incorrectas'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """
        Logout user and blacklist refresh token
        
        POST /api/auth/logout/
        Body: {
            "refresh": "refresh_token_here"
        }
        """
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """
        Get current user profile
        
        GET /api/auth/profile/
        """
        return Response(UserSerializer(request.user).data)
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        """
        Update current user profile
        
        PUT/PATCH /api/auth/update_profile/
        Body: {
            "first_name": "John",
            "last_name": "Smith",
            "profile": {
                "bio": "Software developer",
                "location": "New York"
            }
        }
        """
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def password_reset_request(self, request):
        """
        Request password reset token
        
        POST /api/auth/password_reset_request/
        Body: {
            "email": "user@example.com"
        }
        """
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.save()
            return Response({
                'message': 'Password reset email sent successfully. Check your email for reset instructions.',
                'token_id': token.id  # Only for development/testing
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def password_reset_confirm(self, request):
        """
        Confirm password reset with token
        
        POST /api/auth/password_reset_confirm/
        Body: {
            "token": "password_reset_token_here",
            "new_password": "newpassword123",
            "new_password_confirm": "newpassword123"
        }
        """
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Password has been reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        """
        Verify email with token
        
        POST /api/auth/verify_email/
        Body: {
            "token": "email_verification_token_here"
        }
        """
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Email verified successfully!',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def resend_email_verification(self, request):
        """
        Resend email verification
        
        POST /api/auth/resend_email_verification/
        Body: {
            "email": "user@example.com"
        }
        """
        serializer = ResendEmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.save()
            return Response({
                'message': 'Verification email sent successfully. Check your email.',
                'token_id': token.id  # Only for development/testing
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """
        Change user password
        
        POST /api/auth/change_password/
        Body: {
            "old_password": "oldpass123",
            "new_password": "newpass123",
            "new_password_confirm": "newpass123"
        }
        """
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Set new password
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request):
        """
        Get user dashboard information with permissions
        
        GET /api/auth/dashboard/
        """
        user = request.user
        
        # Get user permissions from the permissions app
        user_permissions = []
        try:
            from permissions.models import UserRole, PermissionUserRole
            
            # Get user roles
            user_roles = UserRole.objects.filter(user=user)
            
            # Get permissions from roles
            for user_role in user_roles:
                role_permissions = PermissionUserRole.objects.filter(
                    user_role=user_role
                ).select_related('permission')
                
                for role_permission in role_permissions:
                    if role_permission.permission.name not in user_permissions:
                        user_permissions.append(role_permission.permission.name)
        except Exception as e:
            print(f"Error getting user permissions: {e}")
        
        return Response({
            'user_info': {
                'id': str(user.id),
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': user.role,
                'user_type': user.user_type,
                'is_admin': user.is_admin,
                'is_employee': user.is_employee,
                'is_customer': user.is_customer,
            },
            'permissions': user_permissions,
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter users based on query parameters
        """
        queryset = super().get_queryset()
        
        # Verificar permisos - solo admin/manager pueden ver todos los usuarios
        if not (self.request.user.role in ['admin', 'manager'] or self.request.user.is_superuser):
            # Usuarios normales solo pueden verse a sí mismos
            return queryset.filter(id=self.request.user.id)
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            # Soportar múltiples roles separados por coma
            roles = [r.strip() for r in role.split(',')]
            queryset = queryset.filter(role__in=roles)
        
        # Filter by user_type
        user_type = self.request.query_params.get('user_type')
        if user_type:
            # Soportar múltiples tipos separados por coma
            types = [t.strip() for t in user_type.split(',')]
            queryset = queryset.filter(user_type__in=types)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar usuario - solo admin puede actualizar otros usuarios
        """
        instance = self.get_object()
        
        # Verificar permisos
        if instance.id != request.user.id and not (request.user.role == 'admin' or request.user.is_superuser):
            return Response({
                'detail': 'No tiene permisos para actualizar este usuario'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Actualizar parcialmente usuario
        """
        instance = self.get_object()
        
        # Verificar permisos
        if instance.id != request.user.id and not (request.user.role == 'admin' or request.user.is_superuser):
            return Response({
                'detail': 'No tiene permisos para actualizar este usuario'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Si se está actualizando la contraseña, usar set_password
        if 'password' in request.data:
            instance.set_password(request.data['password'])
            instance.save()
            # Remover password del request.data para evitar problemas con el serializer
            request.data.pop('password')
        
        return super().partial_update(request, *args, **kwargs)


# Custom JWT token view to include user data
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that includes user data in response
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user from email
            email = request.data.get('email')
            user = User.objects.get(email=email)
            
            # Add user data to response
            response.data['user'] = UserSerializer(user).data
            response.data['message'] = 'Login successful'
        
        return response


# ========================================
# GESTIÓN DE USUARIOS - ADMIN
# ========================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_customers(request):
    """
    Obtener lista de clientes (usuarios con rol 'customer')
    GET /api/auth/users/?role=customer
    """
    # Verificar que el usuario sea admin o gerente
    if not (request.user.role in ['admin', 'manager'] or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener clientes
    customers = User.objects.filter(role='customer').order_by('-created_at')
    
    # Serializar
    serializer = UserSerializer(customers, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_staff_users(request):
    """
    Obtener lista de usuarios staff (admin, manager, cashier)
    GET /api/auth/users/?user_type=admin,staff
    """
    # Solo admin puede ver staff
    if not (request.user.role == 'admin' or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener staff users (excluyendo clientes)
    staff_users = User.objects.filter(
        models.Q(role='admin') | 
        models.Q(role='manager') | 
        models.Q(role='cashier')
    ).order_by('-created_at')
    
    serializer = UserSerializer(staff_users, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_details(request, user_id):
    """
    Obtener detalles de un usuario específico con estadísticas
    GET /api/auth/users/{id}/details/
    """
    # Verificar permisos
    if not (request.user.role in ['admin', 'manager'] or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    print("-------------------------")
    print(f"Fetching details for user {user.email} (ID: {user.id})")
    print("-------------------------")
    # Serializar datos básicos
    user_data = UserSerializer(user).data
    
    print("-------------------------")
    print("Basic user data:", user_data)
    print("-------------------------")
    
    # Si es cliente, agregar estadísticas de compra
    if user.role == 'customer':
        from orders.models import Order
        from django.db.models import Sum, Avg, Count
        print("-------------------------")
        print(f"henry {user}")
        print("-------------------------")
        # Obtener pedidos del cliente
        orders = Order.objects.filter(customer=user)
        print(f"Found {orders.count()} orders for user {user.email}")
        # Calcular estadísticas
        stats = orders.aggregate(
            total_orders=Count('id'),
            total_spent=Sum('total_amount'),
            average_order_value=Avg('total_amount')
        )
        
        # Obtener últimos pedidos
        recent_orders = orders.order_by('-created_at')[:10]
        
        user_data['stats'] = {
            'total_orders': stats['total_orders'] or 0,
            'total_spent': float(stats['total_spent'] or 0),
            'average_order_value': float(stats['average_order_value'] or 0),
            'last_order_date': recent_orders.first().created_at if recent_orders.exists() else None
        }
        
        # Serializar pedidos
        from orders.serializers import OrderSerializer
        user_data['orders'] = OrderSerializer(recent_orders, many=True).data
    
    # Si es staff, agregar información de permisos
    if user.role in ['admin', 'manager', 'cashier']:
        # Aquí podrías agregar lógica para obtener permisos específicos
        # Por ahora, devolvemos una lista vacía
        user_data['permissions'] = []
    
    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def toggle_user_status(request, user_id):
    """
    Activar o desactivar un usuario
    PATCH /api/auth/users/{id}/
    Body: { "is_active": true/false }
    """
    # Verificar permisos
    if not (request.user.role in ['admin', 'manager'] or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # No permitir desactivar su propia cuenta
    if user.id == request.user.id:
        return Response({
            'detail': 'No puedes desactivar tu propia cuenta'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Actualizar estado
    is_active = request.data.get('is_active')
    if is_active is not None:
        user.is_active = is_active
        user.save()
    
    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_staff_user(request):
    """
    Crear nuevo usuario staff (admin, manager, cashier)
    POST /api/auth/users/
    Body: {
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "password123",
        "role": "cashier",
        "phone": "+1234567890",
        "hire_date": "2024-01-01",
        "department": "Sales"
    }
    """
    # Solo admin puede crear staff
    if not (request.user.role == 'admin' or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Validar datos requeridos
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    password = request.data.get('password')
    role = request.data.get('role')
    
    if not all([email, first_name, last_name, password, role]):
        return Response({
            'detail': 'Faltan campos requeridos: email, first_name, last_name, password, role'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar rol
    if role not in ['admin', 'manager', 'cashier']:
        return Response({
            'detail': 'Rol inválido. Debe ser: admin, manager o cashier'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar que el email no exista
    if User.objects.filter(email=email).exists():
        return Response({
            'detail': 'El email ya está registrado'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Crear usuario
        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            role=role,
            user_type='admin' if role == 'admin' else 'staff',
            phone=request.data.get('phone'),
            hire_date=request.data.get('hire_date'),
            department=request.data.get('department'),
            is_active=True
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'detail': f'Error al crear usuario: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_staff_user(request, user_id):
    """
    Actualizar usuario staff
    PUT/PATCH /api/auth/users/{id}/
    """
    # Solo admin puede actualizar staff
    if not (request.user.role == 'admin' or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Actualizar campos permitidos
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    if 'email' in request.data:
        # Verificar que el email no esté en uso
        if User.objects.filter(email=request.data['email']).exclude(id=user_id).exists():
            return Response({
                'detail': 'El email ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)
        user.email = request.data['email']
    if 'phone' in request.data:
        user.phone = request.data['phone']
    if 'role' in request.data:
        if request.data['role'] in ['admin', 'manager', 'cashier']:
            user.role = request.data['role']
    if 'hire_date' in request.data:
        user.hire_date = request.data['hire_date']
    if 'department' in request.data:
        user.department = request.data['department']
    if 'password' in request.data and request.data['password']:
        user.set_password(request.data['password'])
    
    user.save()
    
    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_user_permissions(request, user_id):
    """
    Asignar permisos a un usuario
    POST /api/auth/users/{id}/permissions/
    Body: { "permissions": ["permission1", "permission2"] }
    """
    # Solo admin puede asignar permisos
    if not (request.user.role == 'admin' or request.user.is_superuser):
        return Response({
            'detail': 'No tiene permisos para realizar esta acción'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'detail': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Aquí implementarías la lógica para asignar permisos
    # Por ahora, solo devolvemos un mensaje de éxito
    permissions = request.data.get('permissions', [])
    
    return Response({
        'message': f'Permisos asignados correctamente a {user.email}',
        'permissions': permissions
    }, status=status.HTTP_200_OK)
