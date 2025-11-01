import axios from 'axios';
import { config } from '../config/env';

const API_URL = `${config.apiUrl}/api`;

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager?: string;
  is_active: boolean;
  created_at: string;
}

export interface Position {
  id: string;
  title: string;
  department: Department;
  description?: string;
  min_salary?: number;
  max_salary?: number;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  employee_id: string;
  department?: Department;
  position?: Position;
  supervisor?: number;
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  employment_type: 'full_time' | 'part_time' | 'temporary' | 'contractor';
  hire_date: string;
  termination_date?: string;
  base_salary: number;
  hourly_rate?: number;
  commission_rate: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  bank_account_number?: string;
  bank_name?: string;
  work_schedule: Record<string, { start: string; end: string }>;
  skills: string[];
  certifications: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeData {
  user_data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  };
  employee_id: string;
  department_id?: string;
  position_id?: string;
  supervisor_id?: number;
  employment_status: string;
  employment_type: string;
  hire_date: string;
  base_salary: number;
  hourly_rate?: number;
  commission_rate?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  bank_account_number?: string;
  bank_name?: string;
  work_schedule?: Record<string, { start: string; end: string }>;
  skills?: string[];
  certifications?: string[];
  notes?: string;
}

export interface UpdateEmployeeData {
  department_id?: string;
  position_id?: string;
  supervisor_id?: number;
  employment_status?: string;
  employment_type?: string;
  termination_date?: string;
  base_salary?: number;
  hourly_rate?: number;
  commission_rate?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  bank_account_number?: string;
  bank_name?: string;
  work_schedule?: Record<string, { start: string; end: string }>;
  skills?: string[];
  certifications?: string[];
  notes?: string;
}

class EmployeeService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // Employee CRUD operations
  async getEmployees(): Promise<Employee[]> {
    const response = await axios.get(`${API_URL}/employees/employees/`, this.getAuthHeaders());
    return response.data;
  }

  async getEmployee(id: string): Promise<Employee> {
    const response = await axios.get(`${API_URL}/employees/employees/${id}/`, this.getAuthHeaders());
    return response.data;
  }

  async createEmployee(data: CreateEmployeeData): Promise<Employee> {
    const response = await axios.post(`${API_URL}/employees/employees/`, data, this.getAuthHeaders());
    return response.data;
  }

  async updateEmployee(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const response = await axios.patch(`${API_URL}/employees/employees/${id}/`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    await axios.delete(`${API_URL}/employees/employees/${id}/`, this.getAuthHeaders());
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    const response = await axios.get(`${API_URL}/employees/departments/`, this.getAuthHeaders());
    return response.data;
  }

  async getDepartment(id: string): Promise<Department> {
    const response = await axios.get(`${API_URL}/employees/departments/${id}/`, this.getAuthHeaders());
    return response.data;
  }

  async createDepartment(data: { name: string; description?: string; is_active?: boolean }): Promise<Department> {
    const response = await axios.post(`${API_URL}/employees/departments/`, data, this.getAuthHeaders());
    return response.data;
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const response = await axios.patch(`${API_URL}/employees/departments/${id}/`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteDepartment(id: string): Promise<void> {
    await axios.delete(`${API_URL}/employees/departments/${id}/`, this.getAuthHeaders());
  }
}

export default new EmployeeService();
