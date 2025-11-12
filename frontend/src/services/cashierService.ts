import { apiService } from './apiService';
import { API_CONFIG } from '../config/api';

// ========================================
// INTERFACES
// ========================================

export interface Shift {
  id: string;
  cashier_id: string;
  cashier_name: string;
  start_time: string;
  end_time?: string;
  initial_cash: number;
  final_cash?: number;
  expected_cash?: number;
  difference?: number;
  sales_count: number;
  status: 'open' | 'closed';
  sales_summary?: {
    cash: number;
    card: number;
    qr: number;
    total: number;
  };
}

export interface Sale {
  id: string;
  invoice_number: string;
  shift_id: string;
  cashier_id: string;
  cashier_name: string;
  customer_name?: string;
  customer_id?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'qr' | 'mixed';
  payment_details?: PaymentDetail[];
  cash_received?: number;
  change?: number;
  channel: 'physical_store' | 'online';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  notes?: string;
}

export interface SaleItem {
  id?: string;
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  sku?: string;
  image?: string;
}

export interface PaymentDetail {
  method: 'cash' | 'card' | 'qr';
  amount: number;
  reference?: string;
}

export interface OnlineOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  items: SaleItem[];
  total: number;
  payment_status: 'paid' | 'pending';
  payment_method?: string;
  status: 'ready_for_pickup' | 'picked_up' | 'cancelled';
  created_at: string;
  pickup_code?: string;
}

export interface StartShiftDTO {
  cashier_id: string;
  initial_cash: number;
}

export interface EndShiftDTO {
  shift_id: string;
  final_cash: number;
  notes?: string;
}

export interface CreateSaleDTO {
  shift_id: string;
  customer_id?: string;
  items: Omit<SaleItem, 'id'>[];
  payment_method: 'cash' | 'card' | 'qr' | 'mixed';
  payment_details?: PaymentDetail[];
  cash_received?: number;
  notes?: string;
}

export interface ProcessPickupDTO {
  order_id: string;
  pickup_code: string;
  customer_id_verification: string;
  payment_method?: 'cash' | 'card' | 'qr';
  payment_details?: PaymentDetail[];
}

// ========================================
// CASHIER SERVICE
// ========================================

class CashierService {
  // ========================================
  // TURNOS (SHIFTS)
  // ========================================

  /**
   * Iniciar un nuevo turno de cajero
   */
  async startShift(data: StartShiftDTO): Promise<Shift> {
    return apiService.post<Shift>('/cashier/shifts/start/', data);
  }

  /**
   * Obtener el turno activo del cajero actual
   */
  async getActiveShift(): Promise<Shift | null> {
    return apiService.get<Shift>('/cashier/shifts/active/');
  }

  /**
   * Cerrar el turno actual
   */
  async endShift(data: EndShiftDTO): Promise<Shift> {
    return apiService.post<Shift>('/cashier/shifts/end/', data);
  }

  /**
   * Obtener historial de turnos
   */
  async getShiftHistory(params?: {
    start_date?: string;
    end_date?: string;
    cashier_id?: string;
  }): Promise<Shift[]> {
    return apiService.get<Shift[]>('/cashier/shifts/', { params });
  }

  /**
   * Obtener detalles de un turno específico
   */
  async getShiftDetails(shiftId: string): Promise<Shift> {
    return apiService.get<Shift>(`/cashier/shifts/${shiftId}/`);
  }

  // ========================================
  // VENTAS (SALES)
  // ========================================

  /**
   * Crear una nueva venta (generar factura)
   */
  async createSale(data: CreateSaleDTO): Promise<Sale> {
    return apiService.post<Sale>('/cashier/sales/', data);
  }

  /**
   * Obtener ventas del turno actual
   */
  async getCurrentShiftSales(): Promise<Sale[]> {
    return apiService.get<Sale[]>('/cashier/sales/current-shift/');
  }

  /**
   * Obtener detalles de una venta específica
   */
  async getSaleDetails(saleId: string): Promise<Sale> {
    return apiService.get<Sale>(`/cashier/sales/${saleId}/`);
  }

  /**
   * Cancelar una venta (si es posible)
   */
  async cancelSale(saleId: string, reason: string): Promise<Sale> {
    return apiService.post<Sale>(`/cashier/sales/${saleId}/cancel/`, { reason });
  }

  /**
   * Imprimir factura de venta
   */
  async printInvoice(saleId: string): Promise<Blob> {
    return apiService.get(`/cashier/sales/${saleId}/print/`, {
      responseType: 'blob'
    });
  }

  // ========================================
  // PRODUCTOS (para búsqueda en POS)
  // ========================================

  /**
   * Buscar producto por código de barras
   */
  async searchByBarcode(barcode: string): Promise<any> {
    return apiService.get(`/cashier/products/search/barcode/`, {
      params: { code: barcode }
    });
  }

  /**
   * Buscar productos por nombre o código
   */
  async searchProducts(query: string): Promise<any[]> {
    return apiService.get(`/cashier/products/search/`, {
      params: { q: query }
    });
  }

  /**
   * Verificar disponibilidad de stock
   */
  async checkStock(productId: string, quantity: number): Promise<{
    available: boolean;
    current_stock: number;
  }> {
    return apiService.get(`/cashier/products/${productId}/stock/`, {
      params: { quantity }
    });
  }

  // ========================================
  // RETIRO DE PEDIDOS ONLINE
  // ========================================

  /**
   * Buscar pedido online por número de pedido o código de retiro
   */
  async searchOnlineOrder(searchTerm: string): Promise<OnlineOrder> {
    return apiService.get(`/cashier/orders/search/`, {
      params: { q: searchTerm }
    });
  }

  /**
   * Obtener pedidos listos para retiro
   */
  async getReadyForPickup(): Promise<OnlineOrder[]> {
    return apiService.get<OnlineOrder[]>('/cashier/orders/ready-for-pickup/');
  }

  /**
   * Procesar retiro de pedido (entregar al cliente)
   */
  async processPickup(data: ProcessPickupDTO): Promise<{
    success: boolean;
    order: OnlineOrder;
    receipt?: Sale;
  }> {
    return apiService.post('/cashier/orders/process-pickup/', data);
  }

  /**
   * Verificar código de retiro
   */
  async verifyPickupCode(orderId: string, code: string): Promise<{
    valid: boolean;
    order?: OnlineOrder;
  }> {
    return apiService.post(`/cashier/orders/${orderId}/verify-code/`, { code });
  }

  // ========================================
  // REPORTES Y ESTADÍSTICAS
  // ========================================

  /**
   * Obtener resumen de ventas del día
   */
  async getDailySummary(date?: string): Promise<{
    total_sales: number;
    total_transactions: number;
    payment_methods: {
      cash: number;
      card: number;
      qr: number;
    };
    top_products: Array<{
      product_name: string;
      quantity_sold: number;
      revenue: number;
    }>;
  }> {
    return apiService.get('/cashier/reports/daily-summary/', {
      params: { date }
    });
  }

  /**
   * Obtener métricas del cajero actual
   */
  async getCashierMetrics(period: 'today' | 'week' | 'month' = 'today'): Promise<{
    sales_count: number;
    total_revenue: number;
    average_ticket: number;
    customer_count: number;
  }> {
    return apiService.get('/cashier/reports/metrics/', {
      params: { period }
    });
  }
}

export const cashierService = new CashierService();
