import React, { useEffect, useState } from 'react';
import { Truck, Store, CheckCircle, Clock, MapPin } from 'lucide-react';
import { ShippingMethod, shippingService } from '../../../services/paymentService';

interface ShippingMethodSelectorProps {
  selectedMethodId: string | null;
  onSelectMethod: (methodId: string, method: ShippingMethod) => void;
  className?: string;
}

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
  className = ''
}) => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {

  const data: any = await shippingService.getShippingMethods();
      console.log('Fetched shipping methods:', data);

      // El servicio puede devolver un array directo o un objeto paginado { results: [...] }
      const payload = Array.isArray(data) ? data : (data?.results ?? []);
      setMethods(payload);
    } catch (error) {
      console.error('Error loading shipping methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShippingIcon = (type: string) => {
    return type === 'home_delivery' ? <Truck size={24} /> : <Store size={24} />;
  };

  const formatCost = (cost: string) => {
    const costNum = parseFloat(cost);
    return costNum === 0 ? 'GRATIS' : `$${costNum.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-black mb-4 uppercase tracking-wider">
        Método de Envío
      </h3>
      
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const isFree = parseFloat(method.cost) === 0;
          const isStorePickup = method.shipping_type === 'store_pickup';
          
          return (
            <button
              key={method.id}
              onClick={() => onSelectMethod(method.id, method)}
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
                  {getShippingIcon(method.shipping_type)}
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

                  <div className="flex items-center gap-4 text-sm">
                    {/* Cost */}
                    <div className={`font-semibold ${isFree ? 'text-green-600' : 'text-black'}`}>
                      {formatCost(method.cost)}
                    </div>

                    {/* Estimated time */}
                    {method.estimated_days > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock size={14} />
                        <span>{method.estimated_days} {method.estimated_days === 1 ? 'día' : 'días'}</span>
                      </div>
                    )}

                    {/* Store pickup indicator */}
                    {isStorePickup && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        <span>Retiro inmediato</span>
                      </div>
                    )}
                  </div>

                  {/* Store address info */}
                  {isStorePickup && method.store_address && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      <div className="font-medium text-black mb-1">
                        {method.store_address.store_name}
                      </div>
                      <div>{method.store_address.address}</div>
                      {method.store_address.phone && (
                        <div>Tel: {method.store_address.phone}</div>
                      )}
                      {method.store_address.hours && (
                        <div className="mt-1 text-gray-500">
                          Horario: {method.store_address.hours}
                        </div>
                      )}
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

export default ShippingMethodSelector;
