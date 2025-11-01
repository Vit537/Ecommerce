import axios from 'axios';
import { config } from '../config/env';

const API_URL = `${config.apiUrl}/api`;

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
  avatar?: string;
  role: 'customer' | 'employee' | 'admin' | 'manager';
  user_type: 'customer' | 'staff' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  date_joined: string;
  last_login?: string;
  // Campos calculados
  total_orders?: number;
  total_spent?: number;
  lifetime_value?: number;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total_amount: string;
  created_at: string;
  updated_at: string;
  items_count: number;
  payment_method?: string;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  customers_this_month: number;
  average_lifetime_value: number;
  total_revenue: number;
  average_order_value: number;
}

export interface CreateCustomerData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
}

export interface UpdateCustomerData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
  is_active?: boolean;
  is_email_verified?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get authentication headers with JWT token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ============================================================================
// Customer API Service
// ============================================================================

/**
 * Get all customers with optional filters
 */
export const getAllCustomers = async (params?: {
  search?: string;
  is_active?: boolean;
  is_email_verified?: boolean;
  date_from?: string;
  date_to?: string;
}): Promise<Customer[]> => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/`, {
      params: {
        ...params,
        role: 'customer', // Filter only customers
      },
      headers: getAuthHeaders(),
    });
    
    // Validar que la respuesta sea un array
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.results)) {
      // Si es una respuesta paginada
      return data.results;
    } else {
      console.warn('Respuesta inesperada del servidor:', data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener clientes');
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (id: string): Promise<Customer> => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/${id}/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener cliente');
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/register/`,
      {
        ...data,
        role: 'customer',
        user_type: 'customer',
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating customer:', error);
    throw new Error(error.response?.data?.detail || 'Error al crear cliente');
  }
};

/**
 * Update customer information
 */
export const updateCustomer = async (id: string, data: UpdateCustomerData): Promise<Customer> => {
  try {
    const response = await axios.patch(
      `${API_URL}/auth/users/${id}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating customer:', error);
    throw new Error(error.response?.data?.detail || 'Error al actualizar cliente');
  }
};

/**
 * Delete customer
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/auth/users/${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    throw new Error(error.response?.data?.detail || 'Error al eliminar cliente');
  }
};

/**
 * Get customer orders
 */
export const getCustomerOrders = async (customerId: string): Promise<CustomerOrder[]> => {
  try {
    const response = await axios.get(`${API_URL}/orders/orders/`, {
      params: {
        customer: customerId,
      },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener pedidos del cliente');
  }
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (): Promise<CustomerStats> => {
  try {
    // Get all customers
    const customers = await getAllCustomers();
    
    // Get customers from this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const customersThisMonth = customers.filter(
      (c) => new Date(c.created_at) >= firstDayOfMonth
    );

    // Calculate active customers (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomers = customers.filter(
      (c) => c.last_login && new Date(c.last_login) >= thirtyDaysAgo
    );

    // Calculate average lifetime value
    const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
    const avgLifetimeValue = customers.length > 0 ? totalLifetimeValue / customers.length : 0;

    return {
      total_customers: customers.length,
      active_customers: activeCustomers.length,
      customers_this_month: customersThisMonth.length,
      average_lifetime_value: avgLifetimeValue,
      total_revenue: totalLifetimeValue,
      average_order_value: 0, // Would need to calculate from orders
    };
  } catch (error: any) {
    console.error('Error fetching customer stats:', error);
    throw new Error(error.response?.data?.detail || 'Error al obtener estadísticas');
  }
};

/**
 * Toggle customer active status
 */
export const toggleCustomerStatus = async (id: string, isActive: boolean): Promise<Customer> => {
  return updateCustomer(id, { is_active: isActive });
};

/**
 * Verify customer email
 */
export const verifyCustomerEmail = async (id: string): Promise<Customer> => {
  return updateCustomer(id, { is_email_verified: true });
};

/**
 * Search customers by query
 */
export const searchCustomers = async (query: string): Promise<Customer[]> => {
  return getAllCustomers({ search: query });
};
