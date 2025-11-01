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

export const userService = {
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
      const response = await apiService.put<UserData>(`/auth/users/${userId}/`, userData);
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
