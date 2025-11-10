import React from 'react';
import { ShoppingBag, Truck, CreditCard } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  shippingCost: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount: number;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shippingCost,
  tax = 0,
  discount = 0,
  total,
  itemCount,
  className = ''
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 border border-gray-300 ${className}`}>
      <h3 className="text-lg font-semibold text-black mb-4 uppercase tracking-wider flex items-center gap-2">
        <ShoppingBag size={20} />
        Resumen de Compra
      </h3>

      <div className="space-y-3 mb-4">
        {/* Item count */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Productos ({itemCount})</span>
          <span className="font-medium text-black">${subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento</span>
            <span className="font-medium">-${discount.toFixed(2)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Truck size={14} />
            Envío
          </span>
          <span className="font-medium text-black">
            {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>

        {/* Tax */}
        {tax > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Impuestos</span>
            <span className="font-medium text-black">${tax.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-black uppercase tracking-wider">
          Total
        </span>
        <span className="text-2xl font-bold text-black">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Info message */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500 text-center">
          Los precios incluyen todos los impuestos aplicables
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
