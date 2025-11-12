import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// ==================== INTERFACES ====================

export interface ExpenseCategory {
  id: string;
  name: string;
  category_type: 'fixed' | 'variable';
  description?: string;
  is_active: boolean;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  category: string;
  category_name: string;
  category_type: string;
  description: string;
  amount: string;
  status: 'pending' | 'paid' | 'cancelled' | 'scheduled';
  payment_method: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'check' | 'mobile_payment';
  beneficiary: string;
  invoice_number?: string;
  expense_date: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  receipt_url?: string;
  created_by?: string;
  created_by_name?: string;
  paid_by?: string;
  paid_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_type: 'income' | 'expense';
  channel: 'online' | 'in_store' | 'administrative';
  amount: string;
  description: string;
  expense_category?: string;
  expense_category_name?: string;
  order?: string;
  order_number?: string;
  expense?: string;
  expense_number?: string;
  payment_method_name: string;
  transaction_date: string;
  balance_after?: string;
  created_by?: string;
  created_at: string;
}

export interface AccountBalance {
  id: string;
  balance: string;
  last_updated: string;
  daily_income: string;
  daily_expense: string;
  daily_net: string;
  monthly_income: string;
  monthly_expense: string;
  monthly_net: string;
}

export interface FinancialSummary {
  period: 'day' | 'week' | 'month' | 'year';
  total_income: number;
  total_expense: number;
  net_profit: number;
  income_by_channel: {
    [key: string]: number;
  };
  income_by_payment_method: {
    [key: string]: number;
  };
  expense_by_category: {
    [key: string]: number;
  };
  current_balance: number;
}

export interface CashFlowItem {
  date: string;
  income: number;
  expense: number;
  net: number;
  balance: number;
}

// DTOs para crear/actualizar
export interface CreateExpenseCategoryDTO {
  name: string;
  category_type: 'fixed' | 'variable';
  description?: string;
  is_active?: boolean;
  color?: string;
  icon?: string;
}

export interface CreateExpenseDTO {
  category: string;
  description: string;
  amount: string;
  status?: 'pending' | 'paid' | 'cancelled' | 'scheduled';
  payment_method: 'cash' | 'bank_transfer' | 'debit_card' | 'credit_card' | 'check' | 'mobile_payment';
  beneficiary: string;
  invoice_number?: string;
  expense_date: string;
  due_date?: string;
  notes?: string;
  receipt_url?: string;
}

// ==================== SERVICE CLASS ====================

class FinanceService {
  // ==================== EXPENSE CATEGORIES ====================
  
  /**
   * Obtener todas las categorías de gastos
   */
  async getExpenseCategories(params?: {
    is_active?: boolean;
    category_type?: 'fixed' | 'variable';
  }): Promise<import('./apiService').PaginatedResponse<ExpenseCategory>> {
    return apiService.get<import('./apiService').PaginatedResponse<ExpenseCategory>>(API_ENDPOINTS.FINANCE.CATEGORIES, { params });
  }

  /**
   * Obtener una categoría de gasto por ID
   */
  async getExpenseCategory(id: string): Promise<ExpenseCategory> {
    return apiService.get<ExpenseCategory>(API_ENDPOINTS.FINANCE.CATEGORY_DETAIL(id));
  }

  /**
   * Crear una nueva categoría de gasto
   */
  async createExpenseCategory(data: CreateExpenseCategoryDTO): Promise<ExpenseCategory> {
    return apiService.post<ExpenseCategory>(API_ENDPOINTS.FINANCE.CATEGORIES, data);
  }

  /**
   * Actualizar una categoría de gasto
   */
  async updateExpenseCategory(id: string, data: Partial<CreateExpenseCategoryDTO>): Promise<ExpenseCategory> {
    return apiService.put<ExpenseCategory>(API_ENDPOINTS.FINANCE.CATEGORY_DETAIL(id), data);
  }

  /**
   * Eliminar una categoría de gasto
   */
  async deleteExpenseCategory(id: string): Promise<void> {
    return apiService.delete(API_ENDPOINTS.FINANCE.CATEGORY_DETAIL(id));
  }

  // ==================== EXPENSES ====================
  
  /**
   * Obtener todos los gastos
   */
  async getExpenses(params?: {
    status?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<import('./apiService').PaginatedResponse<Expense>> {
    return apiService.get<import('./apiService').PaginatedResponse<Expense>>(API_ENDPOINTS.FINANCE.EXPENSES, { params });
  }

  /**
   * Obtener un gasto por ID
   */
  async getExpense(id: string): Promise<Expense> {
    return apiService.get<Expense>(API_ENDPOINTS.FINANCE.EXPENSE_DETAIL(id));
  }

  /**
   * Crear un nuevo gasto
   */
  async createExpense(data: CreateExpenseDTO): Promise<Expense> {
    return apiService.post<Expense>(API_ENDPOINTS.FINANCE.EXPENSES, data);
  }

  /**
   * Actualizar un gasto
   */
  async updateExpense(id: string, data: Partial<CreateExpenseDTO>): Promise<Expense> {
    return apiService.put<Expense>(API_ENDPOINTS.FINANCE.EXPENSE_DETAIL(id), data);
  }

  /**
   * Eliminar un gasto
   */
  async deleteExpense(id: string): Promise<void> {
    return apiService.delete(API_ENDPOINTS.FINANCE.EXPENSE_DETAIL(id));
  }

  /**
   * Marcar un gasto como pagado
   */
  async markExpenseAsPaid(id: string): Promise<{ status: string }> {
    return apiService.post<{ status: string }>(API_ENDPOINTS.FINANCE.MARK_EXPENSE_PAID(id), {});
  }

  // ==================== TRANSACTIONS ====================
  
  /**
   * Obtener todas las transacciones
   */
  async getTransactions(params?: {
    type?: 'income' | 'expense';
    channel?: 'online' | 'in_store' | 'administrative';
    start_date?: string;
    end_date?: string;
  }): Promise<import('./apiService').PaginatedResponse<Transaction>> {
    return apiService.get<import('./apiService').PaginatedResponse<Transaction>>(API_ENDPOINTS.FINANCE.TRANSACTIONS, { params });
  }

  /**
   * Obtener una transacción por ID
   */
  async getTransaction(id: string): Promise<Transaction> {
    return apiService.get<Transaction>(API_ENDPOINTS.FINANCE.TRANSACTION_DETAIL(id));
  }

  // ==================== FINANCIAL DASHBOARD ====================
  
  /**
   * Obtener resumen financiero
   */
  async getFinancialSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<FinancialSummary> {
    return apiService.get<FinancialSummary>(API_ENDPOINTS.FINANCE.DASHBOARD_SUMMARY, {
      params: { period }
    });
  }

  /**
   * Obtener flujo de caja
   */
  async getCashFlow(days: number = 30): Promise<CashFlowItem[]> {
    return apiService.get<CashFlowItem[]>(API_ENDPOINTS.FINANCE.CASH_FLOW, {
      params: { days }
    });
  }

  /**
   * Obtener balance de la cuenta
   */
  async getAccountBalance(): Promise<AccountBalance> {
    return apiService.get<AccountBalance>(API_ENDPOINTS.FINANCE.BALANCE);
  }
}

export const financeService = new FinanceService();
