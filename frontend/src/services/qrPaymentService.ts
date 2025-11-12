import { apiService } from './apiService';

export interface QRPaymentRequest {
  order_id: string;
}

export interface QRPaymentResponse {
  payment_id: string;
  order_id: string;
  order_number: string;
  qr_image_url: string;
  amount: number;
}

export interface ConfirmQRPaymentRequest {
  payment_id: string;
  order_id: string;
}

export interface ConfirmQRPaymentResponse {
  success: boolean;
  message: string;
  order_number: string;
}

export const qrPaymentService = {
  /**
   * Crear un pago con código QR
   */
  createQRPayment: async (orderId: string): Promise<QRPaymentResponse> => {
    return apiService.post<QRPaymentResponse>(
      '/orders/create-qr-payment/',
      { order_id: orderId }
    );
  },

  /**
   * Confirmar que el cliente realizó el pago con QR
   */
  confirmQRPayment: async (paymentId: string, orderId: string): Promise<ConfirmQRPaymentResponse> => {
    return apiService.post<ConfirmQRPaymentResponse>(
      '/orders/confirm-qr-payment/',
      {
        payment_id: paymentId,
        order_id: orderId
      }
    );
  }
};

export default qrPaymentService;
