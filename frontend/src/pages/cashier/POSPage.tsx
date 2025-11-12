import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  Scan,
  X,
  Check,
  Printer,
  AlertCircle
} from 'lucide-react';
import { cashierService, SaleItem, CreateSaleDTO } from '../../services/cashierService';
import { useAuth } from '../../contexts/AuthContext';

interface CartItem extends SaleItem {
  tempId: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (paymentData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, onClose, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'qr' | 'mixed'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [qrReference, setQrReference] = useState<string>('');

  const calculateChange = () => {
    if (selectedMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0;
      return Math.max(0, received - total);
    }
    return 0;
  };

  const handleConfirm = () => {
    let paymentData: any = {
      payment_method: selectedMethod,
    };

    if (selectedMethod === 'cash') {
      paymentData.cash_received = parseFloat(cashReceived) || 0;
    } else if (selectedMethod === 'mixed') {
      paymentData.payment_details = [
        { method: 'cash', amount: parseFloat(cashAmount) || 0 },
        { method: 'card', amount: parseFloat(cardAmount) || 0 }
      ];
    } else if (selectedMethod === 'qr') {
      paymentData.payment_details = [
        { method: 'qr', amount: total, reference: qrReference }
      ];
    }

    onConfirm(paymentData);
  };

  const isValid = () => {
    if (selectedMethod === 'cash') {
      return (parseFloat(cashReceived) || 0) >= total;
    }
    if (selectedMethod === 'mixed') {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      return (cash + card) === total;
    }
    if (selectedMethod === 'qr') {
      return qrReference.length > 0;
    }
    return true; // card
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-wider">
            PROCESAR PAGO
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
            <p className="text-3xl font-bold">${total.toFixed(2)}</p>
          </div>

          {/* Métodos de Pago */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedMethod('cash')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedMethod === 'cash' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <DollarSign size={24} />
              <span className="text-sm font-semibold uppercase">Efectivo</span>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedMethod === 'card' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CreditCard size={24} />
              <span className="text-sm font-semibold uppercase">Tarjeta</span>
            </button>

            <button
              onClick={() => setSelectedMethod('qr')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedMethod === 'qr' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <QrCode size={24} />
              <span className="text-sm font-semibold uppercase">QR</span>
            </button>

            <button
              onClick={() => setSelectedMethod('mixed')}
              className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedMethod === 'mixed' 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex gap-1">
                <DollarSign size={18} />
                <CreditCard size={18} />
              </div>
              <span className="text-sm font-semibold uppercase">Mixto</span>
            </button>
          </div>

          {/* Inputs según método */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Efectivo recibido
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {cashReceived && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Cambio</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${calculateChange().toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-center">
              <CreditCard size={48} className="mx-auto mb-3 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">
                Procesando tarjeta...
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Espere confirmación del terminal POS
              </p>
            </div>
          )}

          {selectedMethod === 'qr' && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
                <QrCode size={64} className="mx-auto mb-3" />
                <p className="text-xs text-gray-600">
                  Cliente debe escanear QR y confirmar pago
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de referencia
                </label>
                <input
                  type="text"
                  value={qrReference}
                  onChange={(e) => setQrReference(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Ej: TRX123456"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'mixed' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Efectivo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tarjeta
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="0.00"
                />
              </div>
              {cashAmount && cardAmount && (
                <div className={`border rounded-lg p-3 text-sm ${
                  (parseFloat(cashAmount) + parseFloat(cardAmount)) === total
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  Total: ${((parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0)).toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold uppercase border border-gray-300 hover:border-black rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid()}
            className="flex-1 px-4 py-3 text-sm font-semibold uppercase bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

const POSPage: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadActiveShift();
  }, []);

  const loadActiveShift = async () => {
    try {
      const shift = await cashierService.getActiveShift();
      setActiveShift(shift);
      if (!shift) {
        alert('No hay un turno activo. Debes iniciar un turno primero.');
      }
    } catch (error) {
      console.error('Error loading active shift:', error);
    }
  };

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode.trim()) return;

    setLoading(true);
    try {
      const product = await cashierService.searchByBarcode(barcode);
      addToCart(product);
      setBarcodeInput('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const products = await cashierService.searchProducts(searchQuery);
      if (products.length === 1) {
        addToCart(products[0]);
      } else if (products.length > 1) {
        // Mostrar modal de selección
        // Por ahora solo agregamos el primero
        addToCart(products[0]);
      } else {
        alert('No se encontraron productos');
      }
      setSearchQuery('');
    } catch (error) {
      alert('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const newItem: CartItem = {
      tempId: `temp-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      size: product.default_size || 'M',
      color: product.default_color || 'Negro',
      quantity: 1,
      unit_price: product.price,
      subtotal: product.price,
      image: product.image
    };

    setCart(prev => [...prev, newItem]);
  };

  const updateQuantity = (tempId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.tempId === tempId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.unit_price * newQuantity
        };
      }
      return item;
    }));
  };

  const removeItem = (tempId: string) => {
    setCart(prev => prev.filter(item => item.tempId !== tempId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleProcessPayment = async (paymentData: any) => {
    if (!activeShift) {
      alert('No hay un turno activo');
      return;
    }

    setLoading(true);
    try {
      const saleData: CreateSaleDTO = {
        shift_id: activeShift.id,
        items: cart.map(({ tempId, ...item }) => item),
        ...paymentData
      };

      const sale = await cashierService.createSale(saleData);
      
      setSuccessMessage(`Venta completada. Factura: ${sale.invoice_number}`);
      
      // Limpiar carrito
      setCart([]);
      setShowPaymentModal(false);

      // Opcional: Imprimir factura
      setTimeout(() => {
        printInvoice(sale.id);
      }, 1000);

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = async (saleId: string) => {
    try {
      const blob = await cashierService.printInvoice(saleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${saleId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={20} />
          {successMessage}
        </div>
      )}

      {/* Left Panel - Products Search */}
      <div className="flex-1 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-2xl font-semibold uppercase tracking-wider mb-4">
            PUNTO DE VENTA
          </h1>

          {/* Barcode Scanner */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Escanear código de barras
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSearch(barcodeInput);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Escanear o ingresar código..."
                />
              </div>
              <button
                onClick={() => handleBarcodeSearch(barcodeInput)}
                className="px-4 py-2.5 bg-black text-white text-sm font-semibold uppercase rounded-lg hover:bg-gray-900"
              >
                <Scan size={18} />
              </button>
            </div>
          </div>

          {/* Manual Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Búsqueda manual
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSearch();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Buscar por nombre o código..."
                />
              </div>
              <button
                onClick={handleManualSearch}
                className="px-4 py-2.5 bg-white border border-gray-300 text-sm font-semibold uppercase rounded-lg hover:border-black"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Info/Help */}
        <div className="p-6 bg-gray-50 border-b border-gray-300">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Cómo agregar productos:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Escanea el código de barras directamente</li>
                <li>Busca por nombre o código de producto</li>
                <li>Los productos se agregan automáticamente al carrito</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-[480px] bg-white flex flex-col shadow-xl">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold uppercase tracking-wider">
              CARRITO
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart size={18} />
              <span className="font-semibold">{cart.length} items</span>
            </div>
          </div>
          {activeShift && (
            <p className="text-xs text-gray-600">
              Turno: {new Date(activeShift.start_time).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={64} className="mb-4" />
              <p className="text-sm">Carrito vacío</p>
              <p className="text-xs">Escanea o busca productos para agregar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.tempId}
                  className="bg-gray-50 border border-gray-300 rounded-lg p-4"
                >
                  <div className="flex gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {item.size} • {item.color}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.tempId, -1)}
                        className="p-1 border border-gray-300 rounded hover:border-black"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.tempId, 1)}
                        className="p-1 border border-gray-300 rounded hover:border-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        ${item.subtotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.tempId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-gray-300 p-6">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (13%)</span>
              <span className="font-semibold">${(calculateTotal() * 0.13).toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-300 flex justify-between">
              <span className="text-lg font-bold uppercase">TOTAL</span>
              <span className="text-2xl font-bold">
                ${(calculateTotal() * 1.13).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="flex-1 px-4 py-3 text-sm font-semibold uppercase border border-gray-300 hover:border-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0 || !activeShift}
              className="flex-1 px-4 py-3 text-sm font-semibold uppercase bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Cobrar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        total={calculateTotal() * 1.13}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleProcessPayment}
      />
    </div>
  );
};

export default POSPage;
