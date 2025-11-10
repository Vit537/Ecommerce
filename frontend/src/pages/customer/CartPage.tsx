import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import CartItem from '../../components/customer/Cart/CartItem';
import CartSummary from '../../components/customer/Cart/CartSummary';
import EmptyCart from '../../components/customer/Cart/EmptyCart';
import { cartService, Cart as CartType } from '../../services/cartService';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setActionLoading(true);
    try {
      await cartService.updateCartItem(itemId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error al actualizar la cantidad');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) return;
    
    setActionLoading(true);
    try {
      await cartService.removeCartItem(itemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error al eliminar el producto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) return;
    
    setActionLoading(true);
    try {
      await cartService.clearCart();
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error al vaciar el carrito');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const itemCount = cart?.total_items || 0;
  const subtotal = cart?.subtotal || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
              Carrito de Compras
            </h1>
            
            {itemCount > 0 && (
              <button
                onClick={handleClearCart}
                disabled={actionLoading}
                className="
                  flex items-center gap-2 px-4 py-2
                  text-sm text-red-600 hover:text-red-700
                  border border-red-300 hover:border-red-400
                  rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Trash2 size={16} />
                Vaciar Carrito
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {itemCount === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg border border-gray-300 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-black uppercase tracking-wider">
                    Productos ({itemCount})
                  </h2>
                </div>

                <div className="space-y-4">
                  {cart?.items.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate('/shop')}
                className="
                  w-full px-6 py-3 bg-white text-black text-sm font-semibold
                  uppercase tracking-wider border-2 border-gray-300 rounded-lg
                  hover:border-black transition-colors
                "
              >
                Continuar Comprando
              </button>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary
                  subtotal={subtotal}
                  itemCount={itemCount}
                  onCheckout={handleCheckout}
                  loading={actionLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
