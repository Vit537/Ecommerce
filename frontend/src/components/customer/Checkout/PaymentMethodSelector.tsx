import React, { useEffect, useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle } from 'lucide-react';
import { PaymentMethod, paymentService } from '../../../services/paymentService';

interface PaymentMethodSelectorProps {
  selectedMethodId: string | null;
  onSelectMethod: (methodId: string) => void;
  className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
  className = ''
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentService.getPaymentMethods();
      console.log('✅ Payment methods loaded:', data);
      setMethods(data);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard size={24} />;
      case 'mobile_payment':
        return <Smartphone size={24} />;
      case 'bank_transfer':
        return <Building2 size={24} />;
      case 'cash':
        return <Wallet size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-black mb-4 uppercase tracking-wider">
        Método de Pago
      </h3>
      
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const hasFee = parseFloat(method.processing_fee_percentage) > 0 || parseFloat(method.processing_fee_fixed) > 0;
          
          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  p-2 rounded-lg
                  ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  {getPaymentIcon(method.payment_type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-black">{method.name}</h4>
                    {isSelected && (
                      <CheckCircle size={20} className="text-black" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>

                  {/* Fee info */}
                  {hasFee && (
                    <div className="text-xs text-gray-500">
                      Fee: {parseFloat(method.processing_fee_percentage) > 0 && `${method.processing_fee_percentage}%`}
                      {parseFloat(method.processing_fee_fixed) > 0 && ` + $${method.processing_fee_fixed}`}
                    </div>
                  )}

                  {/* Requires approval */}
                  {method.requires_approval && (
                    <div className="mt-2 text-xs text-orange-600 font-medium">
                      ⚠ Requiere aprobación
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
