import { config } from './env';

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: config.apiUrl,
  API_PREFIX: '/api',
  TIMEOUT: 30000,
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REGISTER: '/auth/register/',
    ME: '/auth/me/',
    REFRESH: '/auth/token/refresh/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESET_PASSWORD: '/auth/reset-password/',
    CHANGE_PASSWORD: '/auth/change-password/',
  },
  
  // Productos
  PRODUCTS: {
    LIST: '/products/',
    DETAIL: (id: string) => `/products/${id}/`,
    CREATE: '/products/',
    UPDATE: (id: string) => `/products/${id}/`,
    DELETE: (id: string) => `/products/${id}/`,
    VARIANTS: (id: string) => `/products/${id}/variants/`,
    CATEGORIES: '/products/categories/',
    BRANDS: '/products/brands/',
    SIZES: '/products/sizes/',
    COLORS: '/products/colors/',
  },
  
  // Carrito
  CART: {
    GET: '/cart/',
    ADD_ITEM: '/cart/items/',
    UPDATE_ITEM: (id: string) => `/cart/items/${id}/`,
    REMOVE_ITEM: (id: string) => `/cart/items/${id}/`,
    CLEAR: '/cart/clear/',
  },
  
  // Órdenes
  ORDERS: {
    LIST: '/orders/',
    DETAIL: (id: string) => `/orders/${id}/`,
    CREATE: '/orders/',
    UPDATE: (id: string) => `/orders/${id}/`,
    CANCEL: (id: string) => `/orders/${id}/cancel/`,
    PROCESS: (id: string) => `/orders/${id}/process/`,
  },
  
  // Pagos
  PAYMENTS: {
    LIST: '/orders/payments/',
    CREATE: '/orders/payments/',
    METHODS: '/orders/payment-methods/',
  },
  
  // Facturas
  INVOICES: {
    LIST: '/orders/invoices/',
    DETAIL: (id: string) => `/orders/invoices/${id}/`,
    GENERATE: '/orders/invoices/generate/',
    DOWNLOAD: (id: string) => `/orders/invoices/${id}/download/`,
  },
  
  // Usuarios
  USERS: {
    LIST: '/auth/users/',
    DETAIL: (id: string) => `/auth/users/${id}/`,
    CREATE: '/auth/users/',
    UPDATE: (id: string) => `/auth/users/${id}/`,
    DELETE: (id: string) => `/auth/users/${id}/`,
    ME: '/auth/me/',
  },
  
  // Empleados
  EMPLOYEES: {
    LIST: '/employees/',
    DETAIL: (id: string) => `/employees/${id}/`,
    CREATE: '/employees/',
    UPDATE: (id: string) => `/employees/${id}/`,
  },
  
  // Permisos y Roles
  PERMISSIONS: {
    LIST: '/permissions/',
    ROLES: '/permissions/roles/',
    ROLE_DETAIL: (id: string) => `/permissions/roles/${id}/`,
    USER_ROLES: (userId: string) => `/permissions/users/${userId}/roles/`,
    ASSIGN_ROLE: '/permissions/assign-role/',
  },
  
  // Reportes
  REPORTS: {
    SALES: '/reports/sales/',
    INVENTORY: '/reports/inventory/',
    CUSTOMERS: '/reports/customers/',
    GENERATE: '/reports/generate/',
    EXPORT: '/reports/export/',
    AI_INSIGHTS: '/reports/ai-insights/',
  },
  
  // Dashboard
  DASHBOARD: {
    ADMIN: '/dashboard/admin/',
    EMPLOYEE: '/dashboard/employee/',
    CUSTOMER: '/dashboard/customer/',
    STATS: '/dashboard/stats/',
  },
};

// Obtener la URL completa de un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// Obtener headers por defecto
export const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Roles del sistema
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  CUSTOMER: 'customer',
} as const;

// Tipos de usuario
export const USER_TYPES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

// Estados de órdenes
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Tipos de órdenes
export const ORDER_TYPES = {
  ONLINE: 'online',
  IN_STORE: 'in_store',
  PHONE: 'phone',
} as const;

// Estados de productos
export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

// Géneros objetivo
export const GENDER_TARGETS = {
  MEN: 'men',
  WOMEN: 'women',
  UNISEX: 'unisex',
  KIDS: 'kids',
} as const;

// Estados de pago
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Estados de factura
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export default API_CONFIG;
