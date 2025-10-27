import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_type: string;
  is_admin: boolean;
  is_employee: boolean;
  is_customer: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  date_of_birth?: string;
  identification_number?: string;
  created_at: string;
  permissions?: string[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  async register(data: RegisterRequest): Promise<User> {
    return apiService.post<User>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getMe(): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.AUTH.ME);
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return apiService.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh: refreshToken,
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  async verifyEmail(token: string): Promise<void> {
    return apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
export default authService;
