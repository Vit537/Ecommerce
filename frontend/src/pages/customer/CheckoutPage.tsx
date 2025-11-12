import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentMethodSelector from '../../components/customer/Checkout/PaymentMethodSelector';
import ShippingMethodSelector from '../../components/customer/Checkout/ShippingMethodSelector';
import AddressForm from '../../components/customer/Checkout/AddressForm';
import OrderSummary from '../../components/customer/Checkout/OrderSummary';
import OrderReview from '../../components/customer/Checkout/OrderReview';
import StripeCheckoutForm from '../../components/customer/Checkout/StripeCheckoutForm';
import { ShippingAddress, ShippingMethod, PaymentMethod } from '../../services/paymentService';
import { checkoutService, CheckoutData } from '../../services/checkoutService';
import { cartService } from '../../services/cartService';
import { stripePaymentService, getStripe } from '../../services/stripePaymentService';
import { qrPaymentService } from '../../services/qrPaymentService';
import QRPaymentDisplay from '../../components/customer/Checkout/QRPaymentDisplay';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Cart data
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Checkout data
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({});
  const [needsAddress, setNeedsAddress] = useState(false);

  // Stripe states
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  // QR Payment states
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [qrPaymentData, setQRPaymentData] = useState<{
    paymentId: string;
    orderId: string;
    orderNumber: string;
    qrImageUrl: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    try {
      const total = await cartService.getCartTotal();
    
      const count = await cartService.getCartItemCount();
      setCartSubtotal(total);
      setCartItemCount(count);
    
      if (count === 0) {
        console.log('Cart is empty, redirecting to shop');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleShippingMethodSelect = (methodId: string, method: ShippingMethod) => {
    setShippingMethodId(methodId);
    setSelectedShippingMethod(method);
    setNeedsAddress(method.shipping_type === 'home_delivery');
  };

  const handleAddressChange = (address: Partial<ShippingAddress>) => {
    setShippingAddress(address);
  };

  const canProceedToPayment = () => {
    if (!shippingMethodId) return false;
    if (needsAddress) {
      return !!(
        shippingAddress.full_name &&
        shippingAddress.phone &&
        shippingAddress.address_line1 &&
        shippingAddress.city &&
        shippingAddress.state &&
        shippingAddress.postal_code
      );
    }
    return true;
  };

  const canProceedToReview = () => {
    return !!paymentMethodId;
  };

  const handlePlaceOrder = async () => {
    if (!shippingMethodId || !paymentMethodId || !selectedPaymentMethod) return;

    setLoading(true);
    try {
      const checkoutData: CheckoutData = {
        shipping_method_id: shippingMethodId,
        payment_method_id: paymentMethodId,
      };

      if (needsAddress && shippingAddress) {
        checkoutData.shipping_address = shippingAddress as ShippingAddress;
        checkoutData.billing_address = shippingAddress as ShippingAddress;
      }

      const validation = checkoutService.validateCheckoutData(checkoutData);
      if (!validation.valid) {
        alert(validation.errors.join('\n'));
        setLoading(false);
        return;
      }

      // Obtener items del carrito y userId
      const cart = await cartService.getCart();
      const userId = cart.user || '';
      const mappedOrder = checkoutService.mapCheckoutData(checkoutData, cart.items, userId);

      // Crear la orden
      const order = await checkoutService.createOrder(mappedOrder);
      
      setCreatedOrderId(order.id);

      // Determinar flujo según método de pago
      const paymentType = selectedPaymentMethod.payment_type;

      if (paymentType === 'stripe') {
        // FLUJO STRIPE: Crear Payment Intent y redirigir a formulario
        const paymentIntent = await stripePaymentService.createPaymentIntent({
          amount: total,
          order_id: order.id,
          currency: 'usd',
        });

        console.log('Stripe Payment Intent created:', paymentIntent);
        setStripeClientSecret(paymentIntent.client_secret);
        setShowStripeForm(true);
        setLoading(false);
      } else if (paymentType === 'qr_code') {
        // FLUJO QR: Crear pago QR y mostrar código
        const qrPayment = await qrPaymentService.createQRPayment(order.id);
        setQRPaymentData({
          paymentId: qrPayment.payment_id,
          orderId: qrPayment.order_id,
          orderNumber: qrPayment.order_number,
          qrImageUrl: qrPayment.qr_image_url,
          amount: qrPayment.amount,
        });
        setShowQRPayment(true);
        setLoading(false);
      } else if (paymentType === 'cash') {
        // FLUJO EFECTIVO: Marcar como pendiente y confirmar
        setOrderSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/shop');
        }, 3000);
      } else {
        // Otros métodos de pago
        setOrderSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/shop');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Error al procesar la orden');
      setLoading(false);
    }
  };

  const handleStripePaymentSuccess = () => {
    setShowStripeForm(false);
    setOrderSuccess(true);
    setTimeout(() => {
      navigate('/shop');
    }, 3000);
  };

  const handleStripePaymentError = (error: string) => {
    alert(`Error en el pago: ${error}`);
    setShowStripeForm(false);
  };

  const handleQRPaymentConfirm = async () => {
    if (!qrPaymentData) return;

    setLoading(true);
    try {
      await qrPaymentService.confirmQRPayment(
        qrPaymentData.paymentId,
        qrPaymentData.orderId
      );
      setShowQRPayment(false);
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/shop');
      }, 3000);
    } catch (error: any) {
      console.error('Error confirming QR payment:', error);
      alert(error.response?.data?.error || 'Error al confirmar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleQRPaymentCancel = () => {
    setShowQRPayment(false);
    setQRPaymentData(null);
    setStep(2); // Volver a selección de pago
  };

  const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.cost) : 0;
  const total = cartSubtotal + shippingCost;

  // Success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-300 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">
            ¡Orden Creada!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu pedido ha sido procesado correctamente.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a tus pedidos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Volver</span>
            </button>
            <h1 className="text-xl font-bold text-black uppercase tracking-wider">
              SPORTSWEAR
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${step >= s 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {s}
                  </div>
                  <span
                    className={`
                      text-sm font-medium hidden md:inline
                      ${step >= s ? 'text-black' : 'text-gray-500'}
                    `}
                  >
                    {s === 1 && 'Envío'}
                    {s === 2 && 'Pago'}
                    {s === 3 && 'Confirmar'}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`
                      w-12 h-0.5
                      ${step > s ? 'bg-black' : 'bg-gray-300'}
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping */}
            {step >= 1 && (
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <ShippingMethodSelector
                  selectedMethodId={shippingMethodId}
                  onSelectMethod={handleShippingMethodSelect}
                />

                {needsAddress && shippingMethodId && (
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <AddressForm
                      address={shippingAddress}
                      onChange={handleAddressChange}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="mt-6">
                    <button
                      onClick={async () => {
                        // Si el usuario está autenticado, continuar al paso de pago
                        
                        if (isAuthenticated) {
                          setStep(2);
                          return;
                        }

                        // Si no está autenticado, avisar y redirigir al login de cliente
                        setAuthMessage('Debes iniciar sesión para continuar con la compra. Redirigiendo al login...');

                        // Esperar un pequeño tiempo para que el usuario vea el mensaje
                        setTimeout(() => {
                          navigate('/customer/login', { state: { from: location } });
                        }, 900);
                      }}
                      disabled={!canProceedToPayment()}
                      className="
                        w-full px-6 py-3 bg-black text-white text-sm font-semibold
                        uppercase tracking-wider rounded-lg
                        hover:bg-gray-900 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      Continuar al Pago
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment */}
            {step >= 2 && (
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <PaymentMethodSelector
                  selectedMethodId={paymentMethodId}
                  onSelectMethod={(methodId, method) => {
                    setPaymentMethodId(methodId);
                    setSelectedPaymentMethod(method);
                  }}
                />

                {step === 2 && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="
                        flex-1 px-6 py-3 bg-white text-black text-sm font-semibold
                        uppercase tracking-wider border-2 border-gray-300 rounded-lg
                        hover:border-black transition-colors
                      "
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!canProceedToReview()}
                      className="
                        flex-1 px-6 py-3 bg-black text-white text-sm font-semibold
                        uppercase tracking-wider rounded-lg
                        hover:bg-gray-900 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      Revisar Orden
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Place Order */}
            {step === 3 && !showStripeForm && (
              <div className="bg-white rounded-lg border border-gray-300 p-6">
                <OrderReview
                  shippingMethod={selectedShippingMethod}
                  paymentMethodId={paymentMethodId}
                  shippingAddress={needsAddress ? shippingAddress : undefined}
                />

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="
                      flex-1 px-6 py-3 bg-white text-black text-sm font-semibold
                      uppercase tracking-wider border-2 border-gray-300 rounded-lg
                      hover:border-black transition-colors
                    "
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="
                      flex-1 px-6 py-3 bg-black text-white text-sm font-semibold
                      uppercase tracking-wider rounded-lg
                      hover:bg-gray-900 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? 'Procesando...' : 'Confirmar Compra'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Stripe Payment Form */}
            {step === 3 && showStripeForm && stripeClientSecret && (
              <Elements stripe={getStripe()} options={{ clientSecret: stripeClientSecret }}>
                <StripeCheckoutForm
                  amount={total}
                  onSuccess={handleStripePaymentSuccess}
                  onError={handleStripePaymentError}
                />
              </Elements>
            )}

            {/* Step 3: QR Payment Display */}
            {step === 3 && showQRPayment && qrPaymentData && (
              <QRPaymentDisplay
                qrImageUrl={qrPaymentData.qrImageUrl}
                amount={qrPaymentData.amount}
                orderId={qrPaymentData.orderNumber}
                onConfirmPayment={handleQRPaymentConfirm}
                onCancel={handleQRPaymentCancel}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                subtotal={cartSubtotal}
                shippingCost={shippingCost}
                total={total}
                itemCount={cartItemCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
