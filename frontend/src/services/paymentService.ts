import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// ============================================
// INTERFACES
// ============================================

export interface PaymentMethod {
  id: string;
  name: string;
  payment_type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_payment' | 'check' | 'store_credit' | 'stripe' | 'qr_code';
  description: string;
  is_active: boolean;
  requires_approval: boolean;
  processing_fee_percentage: string;
  processing_fee_fixed: string;
  created_at: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  shipping_type: 'home_delivery' | 'store_pickup';
  description: string;
  cost: string;
  estimated_days: number;
  is_active: boolean;
  store_address: {
    store_name?: string;
    address?: string;
    city?: string;
    phone?: string;
    hours?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  notes?: string;
}

// ============================================
// SERVICE
// ============================================

class PaymentService {
  /**
   * Obtener todos los métodos de pago activos
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const data: any = await apiService.get(API_ENDPOINTS.PAYMENTS.METHODS);
      // El endpoint puede devolver formato paginado { results: [...] } o un array directo
      const methods = data?.results ?? data;
      return Array.isArray(methods) ? methods : [];
    } catch (error: any) {
      console.error('❌ [PaymentService] Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Obtener un método de pago específico
   */
  async getPaymentMethod(id: string): Promise<PaymentMethod> {
    return apiService.get<PaymentMethod>(`${API_ENDPOINTS.PAYMENTS.METHODS}${id}/`);
  }

  /**
   * Calcular el fee de procesamiento de un método de pago
   */
  calculateProcessingFee(amount: number, method: PaymentMethod): number {
    const percentageFee = (amount * parseFloat(method.processing_fee_percentage)) / 100;
    const fixedFee = parseFloat(method.processing_fee_fixed);
    return percentageFee + fixedFee;
  }

  /**
   * Calcular el total con fee de procesamiento
   */
  calculateTotalWithFee(amount: number, method: PaymentMethod): number {
    return amount + this.calculateProcessingFee(amount, method);
  }
}

class ShippingService {
  /**
   * Obtener todos los métodos de envío activos
   */
  async getShippingMethods(): Promise<ShippingMethod[]> {
    return apiService.get<ShippingMethod[]>(`${API_ENDPOINTS.ORDERS.LIST}shipping-methods/`);
  }

  /**
   * Obtener un método de envío específico
   */
  async getShippingMethod(id: string): Promise<ShippingMethod> {
    return apiService.get<ShippingMethod>(`${API_ENDPOINTS.ORDERS.LIST}shipping-methods/${id}/`);
  }

  /**
   * Filtrar métodos de envío por tipo
   */
  filterByType(methods: ShippingMethod[], type: 'home_delivery' | 'store_pickup'): ShippingMethod[] {
    return methods.filter(method => method.shipping_type === type);
  }

  /**
   * Obtener métodos de envío a domicilio
   */
  async getHomeDeliveryMethods(): Promise<ShippingMethod[]> {
    const methods = await this.getShippingMethods();
    return this.filterByType(methods, 'home_delivery');
  }

  /**
   * Obtener métodos de retiro en tienda
   */
  async getStorePickupMethods(): Promise<ShippingMethod[]> {
    const methods = await this.getShippingMethods();
    return this.filterByType(methods, 'store_pickup');
  }
}

export const paymentService = new PaymentService();
export const shippingService = new ShippingService();
export default paymentService;
