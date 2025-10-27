import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Button, Chip, Grid, Divider } from '@mui/material';

interface OrderItem {
  id: string;
  product_variant: {
    id: string;
    product: {
      name: string;
      brand?: { name: string };
    };
    size?: { name: string };
    color?: { name: string };
    sku: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  notes?: string;
}

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders/my-orders/');
      setOrders(response.data.results || response.data);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      // Mock data for development
      setOrders([
        {
          id: '1',
          order_number: 'ORD-2024-001',
          status: 'delivered',
          total: 89.99,
          created_at: '2024-10-10T10:00:00Z',
          updated_at: '2024-10-12T15:30:00Z',
          items: [
            {
              id: '1',
              product_variant: {
                id: 'v1',
                product: { name: 'Camiseta Nike', brand: { name: 'Nike' } },
                size: { name: 'M' },
                color: { name: 'Azul' },
                sku: 'NIKE-SHIRT-M-BLUE'
              },
              quantity: 2,
              price: 29.99,
              subtotal: 59.98
            }
          ],
          shipping_address: {
            street: 'Calle Mayor 123',
            city: 'Madrid',
            state: 'Madrid',
            postal_code: '28001',
            country: 'España'
          },
          payment_method: 'credit_card',
          notes: 'Entrega en horario de oficina'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await axios.get(`/orders/${orderId}/invoice/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error al descargar la factura');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Historial de Pedidos" size="xl">
        {loading ? (
          <LoadingSpinner text="Cargando pedidos..." />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6">No tienes pedidos aún</Typography>
                <Typography variant="body2">¡Explora nuestros productos y haz tu primera compra!</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {orders.map((order) => (
                  <Card key={order.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>Pedido #{order.order_number || order.id.slice(0, 8)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(order.created_at)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={getStatusText(order.status)} size="small" />
                          <Typography variant="h6" color="primary">{formatCurrency(order.total)}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">{order.items.length} producto(s):</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={item.id}>
                              {item.product_variant.product.name}{item.quantity > 1 && ` (x${item.quantity})`}{index < Math.min(order.items.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {order.items.length > 2 && <span style={{ color: '#6b7280' }}>... y {order.items.length - 2} más</span>}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button size="small" onClick={() => handleViewDetails(order)}>Ver Detalles</Button>
                        <Box>
                          <Button size="small" onClick={() => handleDownloadInvoice(order.id)}>📄 Factura</Button>
                          {order.status === 'delivered' && <Button size="small">⭐ Valorar</Button>}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Modal>

      {/* Modal de Detalles del Pedido */}
      <Modal 
        isOpen={showOrderDetails} 
        onClose={() => setShowOrderDetails(false)} 
        title={`Detalles del Pedido #${selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Estado y Fecha */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Estado del Pedido</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Productos</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex-1">
                      <h5 className="font-medium">{item.product_variant.product.name}</h5>
                      <p className="text-sm text-gray-600">
                        {item.product_variant.product.brand?.name && `${item.product_variant.product.brand.name} - `}
                        {item.product_variant.size?.name} - {item.product_variant.color?.name}
                      </p>
                      <p className="text-xs text-gray-500">SKU: {item.product_variant.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)} x {item.quantity}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Dirección de Envío */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dirección de Envío</h4>
              <div className="p-3 bg-gray-50 rounded">
                <p>{selectedOrder.shipping_address.street}</p>
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                <p>{selectedOrder.shipping_address.postal_code}, {selectedOrder.shipping_address.country}</p>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Método de Pago</h4>
              <p className="text-gray-700 capitalize">{selectedOrder.payment_method.replace('_', ' ')}</p>
            </div>

            {/* Notas */}
            {selectedOrder.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notas</h4>
                <p className="text-gray-700 p-3 bg-gray-50 rounded">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrderHistory;