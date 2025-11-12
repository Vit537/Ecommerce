import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  onSuccess,
  onError,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Ocurrió un error al procesar el pago');
        onError(error.message || 'Error al procesar el pago');
      } else {
        // Pago exitoso
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage('Error inesperado al procesar el pago');
      onError('Error inesperado al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black uppercase tracking-wider mb-4">
          Información de Pago
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Total a pagar: <span className="font-bold text-black text-lg">${amount.toFixed(2)}</span>
          </p>
        </div>

        {/* Stripe Payment Element */}
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="
          w-full px-6 py-3 bg-black text-white text-sm font-semibold
          uppercase tracking-wider rounded-lg
          hover:bg-gray-900 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Procesando...
          </>
        ) : (
          `Pagar $${amount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        🔒 Pago seguro procesado por Stripe
      </p>
    </form>
  );
};

export default StripeCheckoutForm;
