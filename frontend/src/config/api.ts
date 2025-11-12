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
    CREATE: '/orders/orders/', // <-- Corregido para DRF router
    UPDATE: (id: string) => `/orders/${id}/`,
    CANCEL: (id: string) => `/orders/${id}/cancel/`,
    PROCESS: (id: string) => `/orders/${id}/process/`,
  },
  
  // Pagos
  PAYMENTS: {
    LIST: '/orders/payments/',
    CREATE: '/orders/payments/',
    METHODS: '/orders/payment-methods/',
    CREATE_INTENT: '/orders/create-payment-intent/',  // Stripe
    WEBHOOK: '/orders/stripe-webhook/',  // Stripe webhook
  },
  
  // Facturas
  INVOICES: {
    LIST: '/orders/invoices/',
    DETAIL: (id: string) => `/orders/invoices/${id}/`,
    GENERATE: '/orders/invoices/generate/',
    DOWNLOAD: (id: string) => `/orders/invoices/${id}/download/`,
    ADMIN_LIST: '/orders/invoices/admin_list/',  // Endpoint para admin con filtros
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
    // Reportes dinámicos con IA
    GENERATE: '/reports/generate/',
    PREVIEW: '/reports/preview/',
    HISTORY: '/reports/history/',
    SUGGESTIONS: '/reports/suggestions/',
    
    // Reportes manuales
    MANUAL_PREVIEW: '/reports/manual/preview/',
    MANUAL_GENERATE: '/reports/manual/generate/',
    
    // Endpoints legacy
    SALES: '/reports/sales/',
    INVENTORY: '/reports/inventory/',
    CUSTOMERS: '/reports/customers/',
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

  // Asistente IA
  ASSISTANT: {
    CHAT: '/assistant/chat/',
    CONVERSATIONS: '/assistant/conversations/',
    CONVERSATION_DETAIL: (id: string) => `/assistant/conversations/${id}/`,
    DELETE_CONVERSATION: (id: string) => `/assistant/conversations/${id}/delete/`,
    FEEDBACK: '/assistant/feedback/',
    QUICK_ACTIONS: '/assistant/quick-actions/',
    SUGGESTIONS: '/assistant/suggestions/',
  },

  // Finanzas
  FINANCE: {
    // Categorías de gastos
    CATEGORIES: '/finance/categories/',
    CATEGORY_DETAIL: (id: string) => `/finance/categories/${id}/`,
    
    // Gastos/Egresos
    EXPENSES: '/finance/expenses/',
    EXPENSE_DETAIL: (id: string) => `/finance/expenses/${id}/`,
    MARK_EXPENSE_PAID: (id: string) => `/finance/expenses/${id}/mark_as_paid/`,
    
    // Transacciones
    TRANSACTIONS: '/finance/transactions/',
    TRANSACTION_DETAIL: (id: string) => `/finance/transactions/${id}/`,
    
    // Dashboard Financiero
    DASHBOARD_SUMMARY: '/finance/dashboard/summary/',
    CASH_FLOW: '/finance/dashboard/cash_flow/',
    BALANCE: '/finance/dashboard/balance/',
  },

  // Machine Learning
  ML: {
    // Models
    MODELS: '/ml/models/',
    MODEL_DETAIL: (id: string) => `/ml/models/${id}/`,
    
    // Predictions
    PREDICTIONS: '/ml/predictions/',
    TRAINING_LOGS: '/ml/training-logs/',
    
    // Sales Forecast
    TRAIN_SALES_FORECAST: '/ml/train-sales-forecast/',
    PREDICT_SALES: '/ml/predict-sales/',
    
    // Product Recommendations
    TRAIN_PRODUCT_RECOMMENDATION: '/ml/train-product-recommendation/',
    PRODUCT_RECOMMENDATIONS: (productId: string) => `/ml/product-recommendations/${productId}/`,
    
    // Customer Segmentation
    TRAIN_CUSTOMER_SEGMENTATION: '/ml/train-customer-segmentation/',
    CUSTOMER_SEGMENT: (customerId: string) => `/ml/customer-segment/${customerId}/`,
    
    // Inventory Optimization
    INVENTORY_ANALYSIS: '/ml/inventory-analysis/',
    REORDER_RECOMMENDATIONS: '/ml/reorder-recommendations/',
    INVENTORY_HEALTH: '/ml/inventory-health/',
    INVENTORY_ALERTS: '/ml/inventory-alerts/',
    RESOLVE_ALERT: (alertId: string) => `/ml/inventory-alerts/${alertId}/resolve/`,
    
    // Dashboard
    DASHBOARD_SUMMARY: '/ml/dashboard-summary/',
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
