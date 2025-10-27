import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import Notification from './Notification';
import LoadingSpinner from './LoadingSpinner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: {
    name: string;
  };
  category: {
    name: string;
  };
  image?: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  size: {
    name: string;
  };
  color: {
    name: string;
    hex_code?: string;
  };
  stock: number;
  sku: string;
  price?: number;
}

interface SaleItem {
  id: string;
  variant: ProductVariant;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  discount?: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface POSSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const POSSystem: React.FC<POSSystemProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCustomers();
    }
  }, [isOpen]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data por ahora
      setProducts([
        {
          id: '1',
          name: 'Camiseta Nike',
          description: 'Camiseta deportiva de alta calidad',
          price: 29.99,
          brand: { name: 'Nike' },
          category: { name: 'Camisetas' },
          variants: [
            {
              id: 'v1',
              size: { name: 'M' },
              color: { name: 'Azul', hex_code: '#0066cc' },
              stock: 15,
              sku: 'NIKE-SHIRT-M-BLUE',
              price: 29.99
            },
            {
              id: 'v2',
              size: { name: 'L' },
              color: { name: 'Rojo', hex_code: '#cc0000' },
              stock: 8,
              sku: 'NIKE-SHIRT-L-RED',
              price: 39.99
            }
          ]
        },
        {
          id: '2',
          name: 'Pantalón Adidas',
          description: 'Pantalón deportivo cómodo',
          price: 59.99,
          brand: { name: 'Adidas' },
          category: { name: 'Pantalones' },
          variants: [
            {
              id: 'v3',
              size: { name: 'M' },
              color: { name: 'Negro', hex_code: '#000000' },
              stock: 12,
              sku: 'ADIDAS-PANTS-M-BLACK',
              price: 59.99
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      // Mock data por ahora
      setCustomers([
        {
          id: '1',
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@email.com',
          phone: '555-0123'
        },
        {
          id: '2',
          first_name: 'María',
          last_name: 'García',
          email: 'maria.garcia@email.com',
          phone: '555-0456'
        }
      ]);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const addToSale = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (variant.stock < quantity) {
      showNotification('warning', 'Stock insuficiente');
      return;
    }

    const existingItem = saleItems.find(item => item.variant.id === variant.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > variant.stock) {
        showNotification('warning', 'Stock insuficiente para la cantidad solicitada');
        return;
      }
      
      const newItems = saleItems.map(item => {
        if (item.variant.id === variant.id) {
          const newQuantity = item.quantity + quantity;
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * item.price
          };
        }
        return item;
      });
      setSaleItems(newItems);
    } else {
      const newItem: SaleItem = {
        id: `${variant.id}-${Date.now()}`,
        variant,
        product,
        quantity,
        price: variant.price || product.price,
        subtotal: quantity * (variant.price || product.price)
      };
      setSaleItems([...saleItems, newItem]);
    }

    showNotification('success', `${product.name} agregado a la venta`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeSaleItem(itemId);
      return;
    }

    const item = saleItems.find(item => item.id === itemId);
    if (!item || item.variant.stock < newQuantity) {
      showNotification('warning', 'Stock insuficiente');
      return;
    }

    const newItems = saleItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.price
        };
      }
      return item;
    });
    setSaleItems(newItems);
  };

  const removeSaleItem = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const clearSale = () => {
    setSaleItems([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setAmountPaid(0);
  };

  const processSale = async () => {
    if (saleItems.length === 0) {
      showNotification('warning', 'No hay productos en la venta');
      return;
    }

    if (amountPaid < totalWithDiscount) {
      showNotification('error', 'El monto pagado es insuficiente');
      return;
    }

    setIsProcessingSale(true);
    try {
      // Simular procesamiento de venta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('success', 'Venta procesada exitosamente');
      clearSale();
      setShowPaymentModal(false);
    } catch (error) {
      showNotification('error', 'Error al procesar la venta');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWithDiscount = total - (total * discount / 100);
  const change = amountPaid - totalWithDiscount;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Sistema de Ventas - POS" size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Product Search and List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, marca o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowCustomerModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                👤 Cliente
              </button>
            </div>

            {selectedCustomer && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  Cliente: {selectedCustomer.first_name} {selectedCustomer.last_name}
                  {selectedCustomer.email && ` - ${selectedCustomer.email}`}
                </p>
              </div>
            )}

            {/* Product Grid */}
            <div className="bg-white border rounded-lg p-4 h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600">{product.brand.name} - {product.category.name}</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(product.price)}</p>
                      
                      {product.variants.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {product.variants.map((variant) => (
                            <button
                              key={variant.id}
                              onClick={() => addToSale(product, variant)}
                              className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                              disabled={variant.stock === 0}
                            >
                              <div className="flex justify-between items-center">
                                <span>
                                  {variant.size.name} - {variant.color.name}
                                </span>
                                <span className={`px-1 py-0.5 rounded text-xs ${
                                  variant.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  Stock: {variant.stock}
                                </span>
                              </div>
                              {variant.price && variant.price !== product.price && (
                                <div className="text-green-600 font-semibold">
                                  {formatCurrency(variant.price)}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sale Cart */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Carrito de Venta</h3>
              {saleItems.length > 0 && (
                <button
                  onClick={clearSale}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Limpiar
                </button>
              )}
            </div>

            {saleItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay productos en la venta
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                  {saleItems.map((item) => (
                    <div key={item.id} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{item.product.name}</h5>
                          <p className="text-xs text-gray-600">
                            {item.variant.size.name} - {item.variant.color.name}
                          </p>
                          <p className="text-xs text-gray-500">SKU: {item.variant.sku}</p>
                        </div>
                        <button
                          onClick={() => removeSaleItem(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                            disabled={item.quantity >= item.variant.stock}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatCurrency(item.price)}</p>
                          <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                <div className="border-t pt-3 mb-3">
                  <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm">{formatCurrency(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="text-sm">Descuento ({discount}%):</span>
                      <span className="text-sm">-{formatCurrency(total * discount / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totalWithDiscount)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isProcessingSale}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-md font-medium"
                >
                  {isProcessingSale ? 'Procesando...' : 'Procesar Pago'}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal 
        isOpen={showCustomerModal} 
        onClose={() => setShowCustomerModal(false)} 
        title="Seleccionar Cliente"
        size="md"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o teléfono..."
            value={customerSearchTerm}
            onChange={(e) => setCustomerSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setShowCustomerModal(false);
              }}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
            >
              <p className="font-medium">Venta sin cliente registrado</p>
              <p className="text-sm text-gray-600">Cliente anónimo</p>
            </button>
            
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerModal(false);
                }}
                className="w-full p-3 text-left border rounded hover:bg-gray-50"
              >
                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                <p className="text-sm text-gray-600">
                  {customer.email} {customer.phone && `• ${customer.phone}`}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Procesar Pago"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Total a pagar:</span>
              <span className="font-bold text-lg">{formatCurrency(totalWithDiscount)}</span>
            </div>
            {selectedCustomer && (
              <p className="text-sm text-gray-600">
                Cliente: {selectedCustomer.first_name} {selectedCustomer.last_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 border rounded-md text-sm ${
                  paymentMethod === 'cash' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-md text-sm ${
                  paymentMethod === 'card' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                💳 Tarjeta
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 border rounded-md text-sm ${
                  paymentMethod === 'transfer' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
              >
                🏦 Transferencia
              </button>
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium mb-2">Monto recibido</label>
              <input
                type="number"
                min={totalWithDiscount}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
              {amountPaid > totalWithDiscount && (
                <p className="text-sm text-green-600 mt-1">
                  Cambio: {formatCurrency(change)}
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={processSale}
              disabled={isProcessingSale || (paymentMethod === 'cash' && amountPaid < totalWithDiscount)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
            >
              {isProcessingSale ? 'Procesando...' : 'Completar Venta'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default POSSystem;