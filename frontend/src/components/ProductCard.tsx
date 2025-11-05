import React, { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.id || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.id || '');
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Encontrar la variante que coincida con size y color seleccionados
  const findVariant = () => {
    return product.variants?.find(
      (v) => v.size?.id === selectedSize && v.color?.id === selectedColor
    );
  };

  const handleAddToCart = async () => {
    const variant = findVariant();
    
    if (!variant) {
      alert('Por favor selecciona una talla y color');
      return;
    }

    setIsLoading(true);
    const success = await addToCart(variant.id, 1);
    setIsLoading(false);

    if (success) {
      openCart(); // Abrir el sidebar del carrito automáticamente
    }
  };

  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'Negro': 'bg-gray-900',
      'Blanco': 'bg-white border border-gray-300',
      'Gris': 'bg-gray-500',
      'Rojo': 'bg-red-600',
      'Azul': 'bg-blue-600',
      'Verde': 'bg-green-600',
      'Amarillo': 'bg-yellow-400',
      'Rosa': 'bg-pink-400',
      'Morado': 'bg-purple-600',
      'Naranja': 'bg-orange-500',
      'Café': 'bg-amber-800',
      'Beige': 'bg-amber-200',
    };
    return colorMap[colorName] || 'bg-gray-300';
  };

  const price = parseFloat(product.price);
  const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
  const discount = product.discount_percentage || 
    (comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : null);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:-translate-y-2 hover:shadow-xl hover:border-gray-300 transition-all duration-300 group">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="badge bg-accent text-primary px-3 py-1 text-xs font-semibold">
              ⭐ Destacado
            </span>
          )}
          {discount && (
            <span className="badge-error px-3 py-1 text-xs font-semibold">
              -{discount}%
            </span>
          )}
          {!product.is_in_stock && (
            <span className="badge bg-gray-800 text-white px-3 py-1 text-xs font-semibold">
              Agotado
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={18}
            className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category */}
        {product.category && (
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            {typeof product.category === 'string' ? product.category : product.category}
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2">
          {product.name}
        </h3>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Talla:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedSize === size.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Color:
            </label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-8 h-8 rounded-full ${getColorClass(color.name)} ${
                    selectedColor === color.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'ring-1 ring-gray-200'
                  } transition-all`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${price.toFixed(2)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.total_stock !== undefined && (
              <div className="text-xs text-gray-700 mt-1 font-medium">
                Stock: {product.total_stock}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock || isLoading}
            className={`px-5 py-2.5 text-xs font-semibold rounded-md uppercase tracking-wider transition-all flex items-center gap-2 ${
              product.is_in_stock
                ? 'bg-primary text-white hover:bg-primary-light'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>Agregando...</>
            ) : (
              <>
                <ShoppingCart size={14} />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
