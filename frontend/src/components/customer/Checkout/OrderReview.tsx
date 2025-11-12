import React, { useState, useEffect } from 'react';
import { Package, MapPin, CreditCard, Store } from 'lucide-react';
import { cartService, CartItem } from '../../../services/cartService';
import { paymentService } from '../../../services/paymentService';
import { ShippingMethod } from '../../../services/paymentService';

interface OrderReviewProps {
  shippingMethod: ShippingMethod | null;
  paymentMethodId: string | null;
  shippingAddress?: any;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  shippingMethod,
  paymentMethodId,
  shippingAddress,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cart = await cartService.getCart();
      const methods = await paymentService.getPaymentMethods();
      console.log('✅ Review data loaded:', { cart, methods });
      setCartItems(cart.items || []);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethodId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-black uppercase tracking-wider">
        Revisar Orden
      </h3>

      {/* Productos */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h4 className="text-sm font-semibold text-black uppercase flex items-center gap-2">
            <Package size={16} />
            Productos ({cartItems.length})
          </h4>
        </div>
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex-1">
                <h5 className="font-medium text-black">
                  {item.product?.name}
                </h5>
                {item.product_variant && (
                  <p className="text-sm text-gray-600">
                    {item.product_variant.size && `Talla: ${item.product_variant.size?.name || item.product_variant.size}`}
                    {item.product_variant.color && ` • Color: ${item.product_variant.color?.name || item.product_variant.color}`}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                  </span>
                  <span className="font-semibold text-black">
                    ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${parseFloat(item.unit_price).toFixed(2)} por unidad
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Método de Envío */}
      {shippingMethod && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-black uppercase flex items-center gap-2">
              {shippingMethod.shipping_type === 'home_delivery' ? (
                <MapPin size={16} />
              ) : (
                <Store size={16} />
              )}
              Método de Envío
            </h4>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-black">{shippingMethod.name}</p>
                <p className="text-sm text-gray-600">{shippingMethod.description}</p>
              </div>
              <span className="font-semibold text-black">
                {parseFloat(shippingMethod.cost) === 0 ? 'GRATIS' : `$${parseFloat(shippingMethod.cost).toFixed(2)}`}
              </span>
            </div>

            {/* Dirección de envío si aplica */}
            {shippingMethod.shipping_type === 'home_delivery' && shippingAddress && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                  Dirección de Entrega
                </p>
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{shippingAddress.full_name}</p>
                  <p>{shippingAddress.address_line1}</p>
                  {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                  </p>
                  <p className="mt-1">{shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Dirección de tienda si es retiro */}
            {shippingMethod.shipping_type === 'store_pickup' && shippingMethod.store_address && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                  Dirección de Tienda
                </p>
                <div className="text-sm text-gray-900">
                  <p>{shippingMethod.store_address.store_name || 'SPORTSWEAR Store'}</p>
                  <p>{shippingMethod.store_address.address || ''}</p>
                  <p>{shippingMethod.store_address.city || 'Ciudad'}</p>
                  {shippingMethod.store_address.phone && (
                    <p className="mt-1">Tel: {shippingMethod.store_address.phone}</p>
                  )}
                  {shippingMethod.store_address.hours && (
                    <p className="mt-1 text-xs text-gray-600">Horario: {shippingMethod.store_address.hours}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Método de Pago */}
      {selectedPaymentMethod && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <h4 className="text-sm font-semibold text-black uppercase flex items-center gap-2">
              <CreditCard size={16} />
              Método de Pago
            </h4>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-black">{selectedPaymentMethod.name}</p>
                {selectedPaymentMethod.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPaymentMethod.description}
                  </p>
                )}
              </div>
              <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                {selectedPaymentMethod.payment_type}
              </div>
            </div>

            {/* Información adicional según tipo de pago */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  {selectedPaymentMethod.payment_type === 'stripe' && (
                    <>
                      <strong>Pago con Tarjeta:</strong> Serás redirigido a la pasarela segura de Stripe para completar el pago.
                    </>
                  )}
                  {selectedPaymentMethod.payment_type === 'qr_code' && (
                    <>
                      <strong>Pago con QR:</strong> Se te mostrará un código QR para que realices el pago desde tu app bancaria.
                    </>
                  )}
                  {selectedPaymentMethod.payment_type === 'cash' && (
                    <>
                      <strong>Pago en Efectivo:</strong> Tu orden será marcada como pendiente. 
                      Podrás pagar en efectivo al recoger tu producto en tienda.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Importante:</strong> Al confirmar la compra, aceptas nuestros términos y condiciones. 
          Recibirás un correo electrónico con los detalles de tu orden.
        </p>
      </div>
    </div>
  );
};

export default OrderReview;
