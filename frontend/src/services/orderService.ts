import { apiService, PaginatedResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { Product, ProductVariant } from './productService';

export interface Order {
  id: string;
  order_number: string;
  customer: string;
  order_type: string;
  status: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  shipping_cost: string;
  total_amount: string;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  processed_by?: string;
  items: OrderItem[];
  payments: Payment[];
}

export interface OrderItem {
  id: string;
  order: string;
  product: Product;
  product_variant?: ProductVariant;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_name: string;
  product_sku: string;
  variant_details: Record<string, any>;
  created_at: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code?: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code?: string;
}

export interface Payment {
  id: string;
  order: string;
  payment_method: PaymentMethod;
  amount: string;
  status: string;
  transaction_id?: string;
  reference_number?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  payment_type: string;
  description?: string;
  is_active: boolean;
  requires_approval: boolean;
  processing_fee_percentage: string;
  processing_fee_fixed: string;
}

export interface CreateOrderRequest {
  order_type: string;
  items: {
    product_variant: string;
    quantity: number;
  }[];
  shipping_address?: ShippingAddress;
  billing_address?: BillingAddress;
  notes?: string;
  payment_method: string;
}

export interface OrderFilters {
  status?: string;
  order_type?: string;
  customer?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class OrderService {
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.ORDERS.LIST}?${params.toString()}`;
    return apiService.get<PaginatedResponse<Order>>(url);
  }

  async getOrder(id: string): Promise<Order> {
    return apiService.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(id));
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return apiService.post<Order>(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    return apiService.patch<Order>(API_ENDPOINTS.ORDERS.UPDATE(id), data);
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return apiService.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(id), { reason });
  }

  async processOrder(id: string): Promise<Order> {
    return apiService.post<Order>(API_ENDPOINTS.ORDERS.PROCESS(id));
  }

  async getMyOrders(): Promise<Order[]> {
    return apiService.get<Order[]>(`${API_ENDPOINTS.ORDERS.LIST}?my_orders=true`);
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiService.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENTS.METHODS);
  }

  async createPayment(orderId: string, paymentMethodId: string, amount: string): Promise<Payment> {
    return apiService.post<Payment>(API_ENDPOINTS.PAYMENTS.CREATE, {
      order: orderId,
      payment_method: paymentMethodId,
      amount,
    });
  }
}

export const orderService = new OrderService();
export default orderService;
