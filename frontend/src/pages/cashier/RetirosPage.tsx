import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  QrCode
} from 'lucide-react';
import { cashierService, OnlineOrder, ProcessPickupDTO } from '../../services/cashierService';

const RetirosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [readyOrders, setReadyOrders] = useState<OnlineOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr' | undefined>();

  useEffect(() => {
    loadReadyOrders();
  }, []);

  const loadReadyOrders = async () => {
    setLoading(true);
    try {
      const orders = await cashierService.getReadyForPickup();
      setReadyOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const order = await cashierService.searchOnlineOrder(searchTerm);
      setSelectedOrder(order);
      setPickupCode('');
      setCustomerId('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Pedido no encontrado');
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setSearchTerm('');
    setPickupCode('');
    setCustomerId('');
  };

  const handleProcessPickup = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const data: ProcessPickupDTO = {
        order_id: selectedOrder.id,
        pickup_code: pickupCode,
        customer_id_verification: customerId,
      };

      // Si el pedido está pendiente de pago, agregar método de pago
      if (selectedOrder.payment_status === 'pending' && paymentMethod) {
        data.payment_method = paymentMethod;
      }

      await cashierService.processPickup(data);
      
      alert('Pedido entregado exitosamente');
      setSelectedOrder(null);
      setShowConfirmModal(false);
      loadReadyOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al procesar el retiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
            RETIRO DE PEDIDOS ONLINE
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona la entrega de pedidos realizados por internet
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            BUSCAR PEDIDO
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                placeholder="Número de pedido o código de retiro..."
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || loading}
              className="px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ready for Pickup List */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                LISTOS PARA RETIRO
              </h2>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                {readyOrders.length}
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package size={48} className="mx-auto mb-3" />
                <p className="text-sm">No hay pedidos pendientes</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {readyOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`w-full text-left bg-gray-50 border rounded-lg p-4 hover:border-black transition-colors ${
                      selectedOrder?.id === order.id ? 'border-black bg-gray-100' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">#{order.order_number}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pagado' : 'Pago pendiente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{order.customer_name}</p>
                    <p className="text-xs text-gray-600">{order.items.length} productos</p>
                    <p className="text-sm font-bold mt-2">${order.total.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              DETALLES DEL PEDIDO
            </h2>

            {!selectedOrder ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle size={48} className="mx-auto mb-3" />
                <p className="text-sm">Selecciona o busca un pedido</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Order Info */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Número de pedido</p>
                      <p className="font-semibold">#{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fecha</p>
                      <p className="font-semibold">
                        {new Date(selectedOrder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    INFORMACIÓN DEL CLIENTE
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-600" />
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-600" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-600" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    PRODUCTOS
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product_name} ({item.size}, {item.color})
                        </span>
                        <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-300 flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className={`border rounded-lg p-4 ${
                  selectedOrder.payment_status === 'paid'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-orange-50 border-orange-300'
                }`}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2">
                    ESTADO DE PAGO
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedOrder.payment_status === 'paid' ? '✓ Pagado online' : '⚠ Pagar al retirar'}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full px-4 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-gray-900"
                >
                  Procesar Retiro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Pickup Modal */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold uppercase tracking-wider mb-6">
              CONFIRMAR RETIRO
            </h2>

            {/* Order Summary */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold mb-2">Pedido #{selectedOrder.order_number}</p>
              <p className="text-xs text-gray-600">{selectedOrder.customer_name}</p>
              <p className="text-lg font-bold mt-2">${selectedOrder.total.toFixed(2)}</p>
            </div>

            {/* Verification Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de retiro *
                </label>
                <input
                  type="text"
                  value={pickupCode}
                  onChange={(e) => setPickupCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Documento de identidad *
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="DNI, CI o Pasaporte"
                />
              </div>

              {/* Payment Method (si no está pagado) */}
              {selectedOrder.payment_status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Método de pago *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'cash' 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <DollarSign size={20} />
                      <span className="text-xs font-semibold">Efectivo</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard size={20} />
                      <span className="text-xs font-semibold">Tarjeta</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'qr' 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <QrCode size={20} />
                      <span className="text-xs font-semibold">QR</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase border border-gray-300 hover:border-black rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessPickup}
                disabled={
                  !pickupCode || 
                  !customerId || 
                  (selectedOrder.payment_status === 'pending' && !paymentMethod) ||
                  loading
                }
                className="flex-1 px-4 py-3 text-sm font-semibold uppercase bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetirosPage;
