import { apiService, PaginatedResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Interfaces para facturas
export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  order_number: string;
  order_type: string;
  order_type_display: string;
  order_status: string;
  order_status_display: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  order_items: InvoiceOrderItem[];
  payments: InvoicePayment[];
  shipping_method_name?: string;
  shipping_method_type?: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  issue_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface InvoiceOrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  variant_details: Record<string, any>;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface InvoicePayment {
  id: string;
  payment_method: string;
  payment_type: string;
  amount: string;
  status: string;
  transaction_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface InvoiceFilters {
  order_type?: string;       // online, in_store, phone
  payment_method?: string;    // ID del método de pago
  payment_type?: string;      // cash, stripe, qr_code, etc.
  date_from?: string;         // YYYY-MM-DD
  date_to?: string;           // YYYY-MM-DD
  status?: string;            // draft, sent, paid, overdue, cancelled
  customer?: string;          // ID del cliente
  page?: number;
  page_size?: number;
}

class InvoiceService {
  /**
   * Obtener todas las facturas para admin/manager con filtros
   */
  async getInvoicesAdmin(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.INVOICES.ADMIN_LIST}?${params.toString()}`;
    return apiService.get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Obtener detalle de una factura específica
   */
  async getInvoiceDetail(id: string): Promise<Invoice> {
    return apiService.get<Invoice>(`${API_ENDPOINTS.INVOICES.LIST}${id}/`);
  }

  /**
   * Obtener facturas del usuario autenticado
   */
  async getMyInvoices(): Promise<Invoice[]> {
    return apiService.get<Invoice[]>(API_ENDPOINTS.INVOICES.LIST);
  }

  /**
   * Exportar facturas a PDF (si se implementa en el backend)
   */
  async exportInvoicePDF(id: string): Promise<Blob> {
    return apiService.get<Blob>(`${API_ENDPOINTS.INVOICES.LIST}${id}/export/pdf/`, {
      responseType: 'blob'
    });
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
