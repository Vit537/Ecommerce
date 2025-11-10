import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  loading?: boolean;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  itemCount,
  onCheckout,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 border border-gray-300 ${className}`}>
      <h3 className="text-lg font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
        <ShoppingBag size={20} />
        Resumen
      </h3>

      <div className="space-y-3 mb-6">
        {/* Item count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Productos ({itemCount})</span>
          <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-300">
          El costo de envío se calculará en el checkout
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-300">
        <span className="text-lg font-bold text-black uppercase tracking-wider">
          Subtotal
        </span>
        <span className="text-2xl font-bold text-black">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      {/* Checkout button */}
      <button
        onClick={onCheckout}
        disabled={loading || itemCount === 0}
        className="
          w-full px-6 py-3 bg-black text-white text-sm font-semibold
          uppercase tracking-wider rounded-lg
          hover:bg-gray-900 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? 'Procesando...' : 'Proceder al Pago'}
      </button>

      {/* Continue shopping link */}
      <button
        onClick={() => window.history.back()}
        className="
          w-full mt-3 px-6 py-2 text-sm text-gray-600
          hover:text-black transition-colors
        "
      >
        Continuar Comprando
      </button>
    </div>
  );
};

export default CartSummary;
