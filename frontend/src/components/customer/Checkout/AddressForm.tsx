import React, { useState, useEffect } from 'react';
import { ShippingAddress } from '../../../services/paymentService';

interface AddressFormProps {
  address: Partial<ShippingAddress>;
  onChange: (address: Partial<ShippingAddress>) => void;
  className?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onChange,
  className = ''
}) => {
  const [formData, setFormData] = useState<Partial<ShippingAddress>>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bolivia',
    notes: '',
    ...address
  });

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-black mb-4 uppercase tracking-wider">
        Dirección de Envío
      </h3>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
            "
            placeholder="Juan Pérez"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
            "
            placeholder="+591 12345678"
          />
        </div>

        {/* Address Line 1 */}
        <div>
          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
            "
            placeholder="Av. Principal 123"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección Adicional (opcional)
          </label>
          <input
            type="text"
            id="address_line2"
            name="address_line2"
            value={formData.address_line2}
            onChange={handleChange}
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
            "
            placeholder="Departamento 4B, Edificio Central"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="
                w-full px-4 py-2.5 text-sm
                border border-gray-300 rounded-lg
                focus:outline-none focus:border-black
                transition-colors
              "
              placeholder="La Paz"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              Departamento *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="
                w-full px-4 py-2.5 text-sm
                border border-gray-300 rounded-lg
                focus:outline-none focus:border-black
                transition-colors
              "
              placeholder="La Paz"
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal *
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            required
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
            "
            placeholder="0000"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas de Entrega (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="
              w-full px-4 py-2.5 text-sm
              border border-gray-300 rounded-lg
              focus:outline-none focus:border-black
              transition-colors
              resize-none
            "
            placeholder="Ej: Tocar timbre, no dejar en portería..."
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
