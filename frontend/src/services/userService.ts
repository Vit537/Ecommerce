import { apiService } from './apiService';
import { config } from '../config/env';

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_type: string;
  is_admin: boolean;
  is_employee: boolean;
  is_customer: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  identification_number?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface UsersThisMonthResponse {
  users_this_month: number;
  users: UserData[];
  month_name: string;
  year: number;
}

export interface CustomerStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
}

export interface CustomerDetails extends UserData {
  stats: CustomerStats;
  orders?: any[];
}

export interface StaffUser extends UserData {
  permissions?: string[];
  hire_date?: string;
  department?: string;
}

export interface CreateStaffData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier';
  phone?: string;
  hire_date?: string;
  department?: string;
  permissions?: string[];
}

export const userService = {
  // ========== CLIENTES ==========
  
  /**
   * Obtener lista de clientes
   */
  async getCustomers(): Promise<UserData[]> {
    try {
      const response = await apiService.get<UserData[]>('/auth/customers/');
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un cliente con estadísticas
   */
  async getCustomerDetails(userId: string): Promise<CustomerDetails> {
    try {
      const response = await apiService.get<CustomerDetails>(`/auth/users/${userId}/details/`);
      return response;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      throw error;
    }
  },

  /**
   * Activar o desactivar cuenta de cliente
   */
  async toggleCustomerStatus(userId: string, isActive: boolean): Promise<UserData> {
    try {
      // Use router endpoint for compatibility with numeric IDs
      const response = await apiService.patch<UserData>(`/auth/users/${userId}/`, { is_active: isActive });
      return response;
    } catch (error) {
      console.error('Error toggling customer status:', error);
      throw error;
    }
  },

  // ========== STAFF (CAJEROS Y ADMINS) ==========
  
  /**
   * Obtener lista de usuarios staff (admin, manager, cashier)
   */
  async getStaffUsers(): Promise<StaffUser[]> {
    try {
      const response = await apiService.get<StaffUser[]>('/auth/staff/');
      return response;
    } catch (error) {
      console.error('Error fetching staff users:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un usuario staff
   */
  async getStaffDetails(userId: string): Promise<StaffUser> {
    try {
      const response = await apiService.get<StaffUser>(`/auth/users/${userId}/details/`);
      return response;
    } catch (error) {
      console.error('Error fetching staff details:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario staff
   */
  async createStaffUser(data: CreateStaffData): Promise<StaffUser> {
    try {
      const response = await apiService.post<StaffUser>('/auth/users/create/', data);
      return response;
    } catch (error) {
      console.error('Error creating staff user:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario staff
   */
  async updateStaffUser(userId: string, data: Partial<CreateStaffData>): Promise<StaffUser> {
    try {
      // Use router endpoint for compatibility with numeric IDs and PATCH for partial updates
      console.log("los datos son:", data);  
      const response = await apiService.patch<StaffUser>(`/auth/users/${userId}/update/`, data);
      return response;
    } catch (error) {
      console.error('Error updating staff user:', error);
      throw error;
    }
  },

  /**
   * Activar o desactivar cuenta de staff
   */
  async toggleStaffStatus(userId: string, isActive: boolean): Promise<StaffUser> {
    try {
      // Use router endpoint for compatibility with numeric IDs
      const response = await apiService.patch<StaffUser>(`/auth/users/${userId}/`, { is_active: isActive });
      return response;
    } catch (error) {
      console.error('Error toggling staff status:', error);
      throw error;
    }
  },

  /**
   * Asignar permisos a usuario staff
   */
  async assignPermissions(userId: string, permissions: string[]): Promise<StaffUser> {
    try {
      const response = await apiService.post<StaffUser>(`/auth/users/${userId}/permissions/`, { permissions });
      return response;
    } catch (error) {
      console.error('Error assigning permissions:', error);
      throw error;
    }
  },

  // ========== MÉTODOS GENERALES ==========

  async getUsersThisMonth(): Promise<UsersThisMonthResponse> {
    try {
      const response = await apiService.get<UsersThisMonthResponse>('/auth/users-this-month/');
      return response;
    } catch (error) {
      console.error('Error fetching users this month:', error);
      // Retornar datos por defecto en caso de error
      const currentDate = new Date();
      return {
        users_this_month: 0,
        users: [],
        month_name: currentDate.toLocaleDateString('es-ES', { month: 'long' }),
        year: currentDate.getFullYear()
      };
    }
  },

  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await apiService.get<UserData>('/auth/profile/');
      return response;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<UserData> {
    try {
      // Use PATCH for partial user updates to avoid sending the entire resource
      const response = await apiService.patch<UserData>(`/auth/users/${userId}/`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    try {
      await apiService.post('/auth/change-password/', passwordData);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  async uploadAvatar(userId: string, file: File): Promise<UserData> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${config.apiUrl}/api/auth/users/${userId}/avatar/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading avatar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
};
