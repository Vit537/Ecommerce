import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../../services/productService';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails,
  onQuickAdd 
}) => {
  // Obtener colores únicos de las variantes
  const availableColors = product.variants
    ? Array.from(new Set(product.variants.map(v => v.color.name)))
    : [];

  // Obtener rango de precios
  const prices = product.variants?.map(v => v.final_price) || [];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay = minPrice === maxPrice 
    ? `$${minPrice.toFixed(2)}`
    : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

  // Verificar si hay stock disponible
  const hasStock = product.variants?.some(v => v.available_stock > 0);

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ShoppingBag size={48} />
          </div>
        )}
        
        {/* Badge de descuento si aplica */}
        {product.discount_percentage && product.discount_percentage > 0 && (
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider rounded-full">
            -{product.discount_percentage}%
          </div>
        )}

        {/* Badge de sin stock */}
        {!hasStock && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs tracking-wider rounded-full">
            SIN STOCK
          </div>
        )}

        {/* Botón de wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart size={18} />
        </button>
      </div>

      {/* Información del producto */}
      <div className="p-6">
        {/* Categoría */}
        {product.category && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {product.category.name}
          </p>
        )}

        {/* Nombre */}
        <h3 className="text-base font-semibold text-black mb-3 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Colores disponibles */}
        {availableColors.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {availableColors.slice(0, 5).map((colorName, idx) => {
              const variant = product.variants?.find(v => v.color.name === colorName);
              return (
                <div
                  key={idx}
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: variant?.color.hex_code }}
                  title={colorName}
                />
              );
            })}
            {availableColors.length > 5 && (
              <span className="text-xs text-gray-500 ml-1">
                +{availableColors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-black">
              {priceDisplay}
            </p>
            {product.discount_percentage && product.discount_percentage > 0 && product.compare_at_price && (
              <p className="text-sm text-gray-400 line-through">
                ${parseFloat(product.compare_at_price).toFixed(2)}
              </p>
            )}
          </div>
          
          {hasStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.variants?.length === 1 && onQuickAdd) {
                  onQuickAdd(product);
                }
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Agregar
            </button>
          )}
        </div>

        {/* Stock bajo warning */}
        {hasStock && product.variants?.some(v => v.needs_restock) && (
          <p className="text-xs text-orange-600 mt-3 font-medium">
            ⚠️ Últimas unidades
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
