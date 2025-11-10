import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import CartItem from './CartItem';
import { useCart } from '../../../contexts/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalItems, totalPrice, loading, updateCartItem, removeCartItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const success = await updateCartItem(itemId, quantity);
    if (!success) {
      alert('Error al actualizar la cantidad');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const success = await removeCartItem(itemId);
    if (!success) {
      alert('Error al eliminar el producto');
    }
  };

  const handleCheckout = () => {
    // Si el usuario está autenticado, cerramos el drawer y vamos a checkout
    if (isAuthenticated) {
      onClose();
      navigate('/checkout');
      return;
    }

    // Si no está autenticado, mostrar mensaje y redirigir al login de cliente
    setAuthMessage('Debes iniciar sesión para continuar con la compra. Redirigiendo al login...');

    // Dar un pequeño lapso para que el usuario vea el mensaje, luego redirigir
    setTimeout(() => {
      onClose();
      navigate('/customer/login', { state: { from: location } });
    }, 900);
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h2 className="text-xl font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag size={24} />
            Carrito ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Tu carrito está vacío
              </p>
              <button
                onClick={onClose}
                className="text-sm text-black hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalItems > 0 && (
          <div className="border-t border-gray-300 p-6 space-y-4 bg-gray-50">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-black uppercase">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-black">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="
                  w-full px-6 py-3 bg-black text-white text-sm font-semibold
                  uppercase tracking-wider rounded-lg
                  hover:bg-gray-900 transition-colors
                "
              >
                Proceder al Pago
              </button>
              
              <button
                onClick={handleViewCart}
                className="
                  w-full px-6 py-2 text-sm text-gray-600
                  hover:text-black transition-colors
                "
              >
                Ver Carrito Completo
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              El envío se calcula en el checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
