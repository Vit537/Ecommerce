import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { ShippingAddress } from './paymentService';

// ============================================
// INTERFACES
// ============================================

export interface CheckoutData {
  shipping_method_id: string;
  payment_method_id: string;
  shipping_address?: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
}

export interface OrderResponse {
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
  shipping_method: any;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SERVICE
// ============================================

class CheckoutService {
  /**
   * Crear una orden desde el carrito actual
   */
  async createOrder(checkoutData: CheckoutData): Promise<OrderResponse> {
    return apiService.post<OrderResponse>(API_ENDPOINTS.ORDERS.CREATE, checkoutData);
  }

  /**
   * Validar datos de checkout antes de enviar
   */
  validateCheckoutData(data: CheckoutData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.shipping_method_id) {
      errors.push('Debe seleccionar un método de envío');
    }

    if (!data.payment_method_id) {
      errors.push('Debe seleccionar un método de pago');
    }

    // Validar dirección de envío si es envío a domicilio
    if (data.shipping_address) {
      if (!data.shipping_address.full_name) {
        errors.push('El nombre completo es requerido');
      }
      if (!data.shipping_address.phone) {
        errors.push('El teléfono es requerido');
      }
      if (!data.shipping_address.address_line1) {
        errors.push('La dirección es requerida');
      }
      if (!data.shipping_address.city) {
        errors.push('La ciudad es requerida');
      }
      if (!data.shipping_address.postal_code) {
        errors.push('El código postal es requerido');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcular resumen de la orden
   */
  calculateOrderSummary(
    subtotal: number,
    shippingCost: number,
    taxRate: number = 0,
    discount: number = 0
  ) {
    const taxAmount = (subtotal - discount) * taxRate;
    const total = subtotal - discount + shippingCost + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shippingCost.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;
