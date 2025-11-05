import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Clock, 
  User, 
  Package 
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

const CashierLayout: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([
    { 
      id: 1, 
      name: 'Hoodie Training', 
      size: 'M', 
      color: 'Negro', 
      price: 89.99, 
      quantity: 1, 
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100' 
    },
    { 
      id: 2, 
      name: 'Pantalón Wide Leg', 
      size: 'L', 
      color: 'Gris', 
      price: 69.99, 
      quantity: 2, 
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100' 
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('efectivo');

  const products: Product[] = [
    { id: 1, name: 'Hoodie Training', price: 89.99, stock: 15, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100', category: 'Deportivo' },
    { id: 2, name: 'Pantalón Wide', price: 69.99, stock: 23, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100', category: 'Casual' },
    { id: 3, name: 'Jersey Térmico', price: 79.99, stock: 18, image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=100', category: 'Deportivo' },
    { id: 4, name: 'Short Training', price: 49.99, stock: 30, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=100', category: 'Deportivo' }
  ];

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const paymentMethods = [
    { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
    { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
    { id: 'qr', label: 'QR', icon: QrCode }
  ];

  return (
    <div className="flex h-screen bg-secondary font-sans">
      {/* Sidebar - Productos */}
      <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-xl font-bold text-primary mb-4">
            Punto de Venta
          </div>
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {products.map(product => (
              <div 
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm font-semibold text-primary mb-1 truncate">
                  {product.name}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className={`text-xs font-semibold ${
                    product.stock > 10 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Carrito y Pago */}
      <div className="w-[420px] bg-white flex flex-col">
        {/* Header Cajero */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              Cajero
            </div>
            <div className="text-base font-semibold text-primary">
              María González
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Clock size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-primary">
              {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
            <ShoppingCart size={18} />
            Orden actual ({cart.length} items)
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map(item => (
                <div 
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-[60px] h-[60px] rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-primary mb-1">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {item.size} • {item.color}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-gray-600 hover:text-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold text-primary min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-gray-600 hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
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

        {/* Payment Section */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
          {/* Método de pago */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-primary mb-3">
              Método de pago
            </div>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-3 rounded-lg cursor-pointer flex flex-col items-center gap-1 transition-all ${
                      selectedPayment === method.id
                        ? 'border-2 border-primary bg-primary text-white'
                        : 'border-2 border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      className={selectedPayment === method.id ? 'text-white' : 'text-gray-700'}
                    />
                    <span className={`text-xs font-medium ${
                      selectedPayment === method.id ? 'text-white' : 'text-gray-700'
                    }`}>
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-semibold text-primary">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-600">IVA (13%)</span>
              <span className="text-sm font-semibold text-primary">
                ${(calculateTotal() * 0.13).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-primary">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${(calculateTotal() * 1.13).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button className="btn-secondary flex-1">
              Cancelar
            </button>
            <button className="btn-primary flex-[2]">
              Completar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierLayout;
