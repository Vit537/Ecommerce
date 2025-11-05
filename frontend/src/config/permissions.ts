// ============================================
// SISTEMA DE PERMISOS Y ROLES
// ============================================

export type UserRole = 'admin' | 'gerente' | 'cajero' | 'cliente' | 'guest';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'list')[];
}

export interface RolePermissions {
  role: UserRole;
  displayName: string;
  permissions: Permission[];
  routes: string[];
  description: string;
}

// ============================================
// CONFIGURACIÓN DE PERMISOS POR ROL
// ============================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // ==========================================
  // ADMINISTRADOR - Acceso completo
  // ==========================================
  admin: {
    role: 'admin',
    displayName: 'Administrador',
    description: 'Acceso completo al sistema',
    routes: [
      '/admin',
      '/admin/dashboard',
      '/admin/products',
      '/admin/products/create',
      '/admin/products/:id/edit',
      '/admin/categories',
      '/admin/employees',
      '/admin/employees/create',
      '/admin/employees/:id/edit',
      '/admin/customers',
      '/admin/orders',
      '/admin/reports',
      '/admin/reports/sales',
      '/admin/reports/inventory',
      '/admin/reports/employees',
      '/admin/settings',
      '/admin/security',
      '/admin/ml-predictions',
      '/pos', // Puede acceder al POS también
      '/shop',
      '/checkout',
    ],
    permissions: [
      // Productos
      { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'categories', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'brands', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Empleados
      { resource: 'employees', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'departments', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Clientes
      { resource: 'customers', actions: ['read', 'update', 'delete', 'list'] },
      
      // Órdenes
      { resource: 'orders', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Reportes
      { resource: 'reports', actions: ['read', 'list'] },
      { resource: 'analytics', actions: ['read', 'list'] },
      
      // Configuración
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'security', actions: ['read', 'update'] },
      
      // ML y Predicciones
      { resource: 'ml-models', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'predictions', actions: ['read', 'list'] },
    ],
  },

  // ==========================================
  // GERENTE - Similar a admin pero sin algunas funciones críticas
  // ==========================================
  gerente: {
    role: 'gerente',
    displayName: 'Gerente',
    description: 'Gestión de operaciones y reportes',
    routes: [
      '/admin',
      '/admin/dashboard',
      '/admin/products',
      '/admin/products/create',
      '/admin/products/:id/edit',
      '/admin/categories',
      '/admin/employees', // Puede ver pero no crear/eliminar
      '/admin/customers',
      '/admin/orders',
      '/admin/reports',
      '/admin/reports/sales',
      '/admin/reports/inventory',
      '/pos', // Puede usar el POS
      '/shop',
      '/checkout',
    ],
    permissions: [
      // Productos - Acceso completo
      { resource: 'products', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'categories', actions: ['create', 'read', 'update', 'delete', 'list'] },
      { resource: 'brands', actions: ['read', 'list'] },
      
      // Empleados - Solo lectura
      { resource: 'employees', actions: ['read', 'list'] },
      
      // Clientes - Lectura y actualización
      { resource: 'customers', actions: ['read', 'update', 'list'] },
      
      // Órdenes - Acceso completo
      { resource: 'orders', actions: ['create', 'read', 'update', 'list'] },
      
      // Reportes - Solo lectura
      { resource: 'reports', actions: ['read', 'list'] },
      { resource: 'analytics', actions: ['read', 'list'] },
      
      // Sin acceso a seguridad ni ML
    ],
  },

  // ==========================================
  // CAJERO - Solo POS y ventas
  // ==========================================
  cajero: {
    role: 'cajero',
    displayName: 'Cajero',
    description: 'Ventas en tienda (POS)',
    routes: [
      '/pos',
      '/pos/sales',
      '/pos/history',
      '/pos/returns',
      '/shop', // Puede ver la tienda
    ],
    permissions: [
      // Productos - Solo lectura
      { resource: 'products', actions: ['read', 'list'] },
      
      // Órdenes - Crear y leer (sus propias ventas)
      { resource: 'orders', actions: ['create', 'read', 'list'] },
      
      // Clientes - Buscar y ver
      { resource: 'customers', actions: ['read', 'list'] },
      
      // Carrito - Gestionar
      { resource: 'cart', actions: ['create', 'read', 'update', 'delete'] },
      
      // Facturas - Generar
      { resource: 'invoices', actions: ['create', 'read'] },
      
      // Pagos - Procesar
      { resource: 'payments', actions: ['create', 'read'] },
      
      // Devoluciones - Gestionar
      { resource: 'returns', actions: ['create', 'read', 'update'] },
    ],
  },

  // ==========================================
  // CLIENTE - Compras online
  // ==========================================
  cliente: {
    role: 'cliente',
    displayName: 'Cliente',
    description: 'Compras en línea',
    routes: [
      '/shop',
      '/shop/products',
      '/shop/products/:id',
      '/shop/categories/:id',
      '/cart',
      '/checkout',
      '/orders',
      '/orders/:id',
      '/profile',
      '/profile/settings',
      '/profile/addresses',
      '/profile/payment-methods',
    ],
    permissions: [
      // Productos - Solo lectura
      { resource: 'products', actions: ['read', 'list'] },
      { resource: 'categories', actions: ['read', 'list'] },
      
      // Carrito - Gestionar su propio carrito
      { resource: 'cart', actions: ['create', 'read', 'update', 'delete'] },
      
      // Órdenes - Ver sus propias órdenes
      { resource: 'orders', actions: ['create', 'read', 'list'] },
      
      // Perfil - Gestionar su propio perfil
      { resource: 'profile', actions: ['read', 'update'] },
      
      // Direcciones - Gestionar sus direcciones
      { resource: 'addresses', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Métodos de pago - Gestionar sus métodos de pago
      { resource: 'payment-methods', actions: ['create', 'read', 'update', 'delete', 'list'] },
      
      // Reviews - Dejar reseñas
      { resource: 'reviews', actions: ['create', 'read', 'update', 'delete'] },
      
      // Favoritos - Gestionar favoritos
      { resource: 'favorites', actions: ['create', 'read', 'delete', 'list'] },
    ],
  },

  // ==========================================
  // INVITADO - Sin autenticación
  // ==========================================
  guest: {
    role: 'guest',
    displayName: 'Invitado',
    description: 'Usuario no autenticado',
    routes: [
      '/',
      '/shop',
      '/shop/products',
      '/shop/products/:id',
      '/shop/categories/:id',
      '/login',
      '/register',
    ],
    permissions: [
      // Solo puede ver productos
      { resource: 'products', actions: ['read', 'list'] },
      { resource: 'categories', actions: ['read', 'list'] },
    ],
  },
};

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Verifica si un rol tiene permiso para una acción específica en un recurso
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'list'
): boolean {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;

  const resourcePermission = roleConfig.permissions.find(p => p.resource === resource);
  if (!resourcePermission) return false;

  return resourcePermission.actions.includes(action);
}

/**
 * Verifica si un rol puede acceder a una ruta
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;

  // Verificar rutas exactas
  if (roleConfig.routes.includes(route)) return true;

  // Verificar rutas con parámetros (ejemplo: /admin/products/:id)
  return roleConfig.routes.some(allowedRoute => {
    if (!allowedRoute.includes(':')) return false;

    const pattern = allowedRoute.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(route);
  });
}

/**
 * Obtiene todas las rutas permitidas para un rol
 */
export function getAllowedRoutes(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role]?.routes || [];
}

/**
 * Obtiene la ruta por defecto para un rol después del login
 */
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'gerente':
      return '/admin/dashboard';
    case 'cajero':
      return '/pos';
    case 'cliente':
      return '/shop';
    default:
      return '/';
  }
}

/**
 * Verifica si un rol puede realizar operaciones CRUD completas
 */
export function canManageResource(role: UserRole, resource: string): boolean {
  return (
    hasPermission(role, resource, 'create') &&
    hasPermission(role, resource, 'read') &&
    hasPermission(role, resource, 'update') &&
    hasPermission(role, resource, 'delete')
  );
}

/**
 * Obtiene el nombre de visualización de un rol
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_PERMISSIONS[role]?.displayName || role;
}

/**
 * Obtiene la descripción de un rol
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_PERMISSIONS[role]?.description || '';
}

/**
 * Lista todos los recursos que un rol puede gestionar
 */
export function getManagedResources(role: UserRole): string[] {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return [];

  return roleConfig.permissions
    .filter(p => p.actions.includes('create') && p.actions.includes('delete'))
    .map(p => p.resource);
}

// ============================================
// CONSTANTES DE RUTAS
// ============================================

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  PRODUCTS: '/admin/products',
  PRODUCTS_CREATE: '/admin/products/create',
  PRODUCTS_EDIT: '/admin/products/:id/edit',
  CATEGORIES: '/admin/categories',
  EMPLOYEES: '/admin/employees',
  EMPLOYEES_CREATE: '/admin/employees/create',
  EMPLOYEES_EDIT: '/admin/employees/:id/edit',
  CUSTOMERS: '/admin/customers',
  ORDERS: '/admin/orders',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings',
} as const;

export const CASHIER_ROUTES = {
  POS: '/pos',
  SALES: '/pos/sales',
  HISTORY: '/pos/history',
  RETURNS: '/pos/returns',
} as const;

export const CUSTOMER_ROUTES = {
  SHOP: '/shop',
  PRODUCT_DETAIL: '/shop/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
} as const;
