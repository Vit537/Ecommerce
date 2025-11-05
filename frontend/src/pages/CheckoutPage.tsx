import React, { useState } from 'react';
import { 
  MapPin, 
  CreditCard, 
  Check, 
  ChevronRight, 
  Lock, 
  Truck, 
  DollarSign, 
  QrCode,
  Package
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface FormData {
  // Shipping
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  zipCode: string;
  notes: string;
  // Payment
  paymentMethod: 'tarjeta' | 'efectivo' | 'transferencia';
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'tarjeta',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const subtotal = totalPrice;
  const shipping = 5.00;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    console.log('Orden completada:', formData);
    const orderNumber = Math.floor(Math.random() * 10000);
    alert(`¡Orden realizada con éxito! Número de orden: #${orderNumber}`);
    await clearCart();
    navigate('/order-success');
  };

  const steps = [
    { number: 1, name: 'Envío', icon: MapPin },
    { number: 2, name: 'Pago', icon: CreditCard },
    { number: 3, name: 'Confirmación', icon: Check }
  ];

  const paymentMethods = [
    { id: 'tarjeta' as const, label: 'Tarjeta', icon: CreditCard },
    { id: 'efectivo' as const, label: 'Efectivo', icon: DollarSign },
    { id: 'transferencia' as const, label: 'Transferencia', icon: QrCode }
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos para proceder con el checkout
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary tracking-wider">
            CHECKOUT
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock size={16} />
            Compra segura
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isActive || isCompleted 
                      ? 'bg-primary border-2 border-primary' 
                      : 'bg-white border-2 border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <Icon size={20} className={isActive || isCompleted ? 'text-white' : 'text-gray-400'} />
                    )}
                  </div>
                  <span className={`text-sm ${
                    isActive || isCompleted ? 'font-semibold text-primary' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Left Column - Forms */}
          <div>
            {/* Step 1: Envío */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Truck size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      Dirección de Envío
                    </h2>
                    <p className="text-sm text-gray-600">
                      ¿Dónde quieres recibir tu pedido?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nombre completo *"
                    className="input-primary"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email *"
                      className="input-primary"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Teléfono *"
                      className="input-primary"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa *"
                    className="input-primary"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ciudad *"
                      className="input-primary"
                      required
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Departamento *"
                      className="input-primary"
                      required
                    />
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="Código Postal"
                      className="input-primary"
                    />
                  </div>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Notas adicionales (opcional)"
                    className="input-primary min-h-[100px] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Pago */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CreditCard size={24} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      Método de Pago
                    </h2>
                    <p className="text-sm text-gray-600">
                      Elige cómo quieres pagar
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-primary bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon 
                          size={24} 
                          className={`mx-auto mb-2 ${
                            formData.paymentMethod === method.id ? 'text-primary' : 'text-gray-600'
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          formData.paymentMethod === method.id ? 'text-primary' : 'text-gray-600'
                        }`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Card Details */}
                {formData.paymentMethod === 'tarjeta' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="Número de tarjeta"
                      className="input-primary"
                      maxLength={19}
                    />
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="Nombre en la tarjeta"
                      className="input-primary"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        className="input-primary"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="CVV"
                        className="input-primary"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'efectivo' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💵 Pagarás en efectivo al momento de recibir tu pedido.
                    </p>
                  </div>
                )}

                {formData.paymentMethod === 'transferencia' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      🏦 Datos para transferencia bancaria:
                    </p>
                    <p className="text-xs text-blue-700 font-mono">
                      Banco: BAC<br/>
                      Cuenta: 123456789<br/>
                      Titular: Sportswear Store
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirmación */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      Confirmar Pedido
                    </h2>
                    <p className="text-sm text-gray-600">
                      Revisa tu información antes de confirmar
                    </p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Dirección de Envío
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>{formData.fullName}</strong></p>
                    <p>{formData.email} • {formData.phone}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.department} {formData.zipCode}</p>
                    {formData.notes && <p className="text-gray-600 italic">Nota: {formData.notes}</p>}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <CreditCard size={18} />
                    Método de Pago
                  </h3>
                  <div className="text-sm text-gray-700">
                    <p>
                      {formData.paymentMethod === 'tarjeta' && '💳 Tarjeta de crédito/débito'}
                      {formData.paymentMethod === 'efectivo' && '💵 Efectivo contra entrega'}
                      {formData.paymentMethod === 'transferencia' && '🏦 Transferencia bancaria'}
                    </p>
                    {formData.paymentMethod === 'tarjeta' && formData.cardNumber && (
                      <p className="text-gray-600">**** **** **** {formData.cardNumber.slice(-4)}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Package size={18} />
                    Productos ({items.length})
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-semibold text-primary">
                          ${parseFloat(item.total_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {currentStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Atrás
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-light transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  Confirmar Pedido
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-primary mb-4">
                Resumen del Pedido
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        ${parseFloat(item.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-gray-600 text-center">
                    +{items.length - 3} productos más
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                  <span className="text-gray-600">IVA (13%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Lock size={16} className="text-green-600" />
                <p className="text-xs text-gray-700">
                  Pago 100% seguro y encriptado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
