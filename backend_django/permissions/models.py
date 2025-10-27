from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Permission(models.Model):
    """
    Permisos individuales específicos para tienda de ropa
    """
    CATEGORY_CHOICES = [
        ('inventory', 'Inventario'),
        ('sales', 'Ventas'),
        ('purchases', 'Compras'),
        ('customers', 'Clientes'),
        ('employees', 'Empleados'),
        ('reports', 'Reportes'),
        ('settings', 'Configuración'),
        ('products', 'Productos'),
        ('orders', 'Pedidos'),
        ('billing', 'Facturación'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='settings')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['codename']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.codename})"


class Role(models.Model):
    """
    Roles de usuario para tienda de ropa con permisos asociados
    """
    ROLE_TYPE_CHOICES = [
        ('system', 'Sistema'),
        ('business', 'Negocio'),
        ('custom', 'Personalizado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    role_type = models.CharField(max_length=20, choices=ROLE_TYPE_CHOICES, default='business')
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)  # System roles can't be deleted
    can_be_assigned_by_admin = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def has_permission(self, permission_codename):
        """Check if role has a specific permission"""
        return self.permissions.filter(codename=permission_codename, is_active=True).exists()
    
    def get_permissions_by_category(self):
        """Get permissions grouped by category"""
        permissions_by_category = {}
        for permission in self.permissions.filter(is_active=True):
            category = permission.get_category_display()
            if category not in permissions_by_category:
                permissions_by_category[category] = []
            permissions_by_category[category].append(permission)
        return permissions_by_category


class UserRole(models.Model):
    """
    Relación muchos a muchos entre usuarios y roles (como en el diagrama)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_roles')
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'role')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.role.name}"


class PermissionUserRole(models.Model):
    """
    Tabla intermedia para permisos específicos de usuario (permiso_usuario del diagrama)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direct_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='direct_user_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='granted_permissions')
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'permission')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['permission']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.permission.name}"
