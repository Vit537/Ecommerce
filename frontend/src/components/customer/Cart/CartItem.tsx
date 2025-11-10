import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../../services/cartService';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  loading?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false
}) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    // Verificar stock disponible
    if (item.product_variant.available_stock > item.quantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const getImageUrl = () => {
    // Priorizar imagen de la variante, si no, usar la del producto
    if (item.product_variant.images && item.product_variant.images.length > 0) {
      return item.product_variant.images[0];
    }
    if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0];
    }
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-lg border border-gray-300 ${loading ? 'opacity-50' : ''}`}>
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={getImageUrl()}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Product name */}
        <h4 className="font-semibold text-black text-sm mb-1 truncate">
          {item.product.name}
        </h4>

        {/* Variant details */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
          {item.product_variant.size && (
            <span className="px-2 py-0.5 bg-gray-100 rounded">
              Talla: {item.product_variant.size.name}
            </span>
          )}
          {item.product_variant.color && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
              Color: {item.product_variant.color.name}
              {item.product_variant.color.hex_code && (
                <span
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.product_variant.color.hex_code }}
                />
              )}
            </span>
          )}
        </div>

        {/* Price and quantity controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={loading || item.quantity <= 1}
              className="
                w-7 h-7 flex items-center justify-center
                border border-gray-300 rounded
                hover:border-black transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-medium text-sm">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={loading || item.product_variant.available_stock <= item.quantity}
              className="
                w-7 h-7 flex items-center justify-center
                border border-gray-300 rounded
                hover:border-black transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-bold text-black">
              ${item.total_price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              ${parseFloat(item.unit_price).toFixed(2)} c/u
            </div>
          </div>
        </div>

        {/* Stock warning */}
        {item.product_variant.available_stock < 5 && (
          <div className="mt-2 text-xs text-orange-600">
            ⚠ Solo quedan {item.product_variant.available_stock} unidades
          </div>
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={loading}
        className="
          p-2 h-fit text-gray-400 hover:text-red-600
          transition-colors disabled:opacity-30
        "
        title="Eliminar"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default CartItem;
