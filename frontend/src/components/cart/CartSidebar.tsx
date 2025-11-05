import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
    updateCartItem,
    removeCartItem,
    loading
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleUpdateQuantity = async (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemove = async (itemId: string) => {
    await removeCartItem(itemId);
  };

  const subtotal = totalPrice;
  const tax = subtotal * 0.13; // IVA 13%
  const shipping = subtotal > 100 ? 0 : 5.00;
  const total = subtotal + tax + shipping;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-bold text-primary">
                Carrito
              </h2>
              <p className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Agrega productos para comenzar tu compra
              </p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 animate-fade-in"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product_variant.images && item.product_variant.images.length > 0 ? (
                      <img
                        src={typeof item.product_variant.images[0] === 'string' ? item.product_variant.images[0] : ''}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <ShoppingBag size={24} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-primary mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {item.product_variant.size && `Talla: ${item.product_variant.size.name}`}
                      {item.product_variant.color && ` • Color: ${item.product_variant.color.name}`}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          disabled={loading}
                          className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-primary min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          disabled={loading}
                          className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-primary">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={loading}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Totals & Checkout */}
        {items.length > 0 && (
          <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-primary">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (13%)</span>
                <span className="font-semibold text-primary">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pb-3 border-b border-gray-300">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold text-primary">
                  {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            {subtotal < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  💡 Agrega <strong>${(100 - subtotal).toFixed(2)}</strong> más para obtener envío gratis
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-primary-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Proceder al Checkout
              <ArrowRight size={18} />
            </button>

            <button
              onClick={closeCart}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
