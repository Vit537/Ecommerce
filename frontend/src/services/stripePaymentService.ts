import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { config } from '../config/env';

// Clave pública de Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RZahPEQ41XFB6UjTQmjDMZDSzgEGdqw2BiYZHSI4xBXWdZvWwzjSYvcLYY3LPRjJzLJx7VINm3F31Sb5YFaCqg000lU41TnUe';

// Instancia de Stripe (se carga una sola vez)
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface CreatePaymentIntentRequest {
  amount: number;
  order_id: string;
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  payment_id: string;
  status: string;
}

class StripePaymentService {
  /**
   * Crear un Payment Intent en Stripe
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      const response = await apiService.post<CreatePaymentIntentResponse>(
        API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
        {
          amount: data.amount,
          order_id: data.order_id,
          currency: data.currency || 'usd',
        }
      );
      return response;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(error.response?.data?.error || 'Error al crear el pago');
    }
  }

  /**
   * Obtener instancia de Stripe
   */
  async getStripeInstance(): Promise<Stripe | null> {
    return await getStripe();
  }
}

export const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
