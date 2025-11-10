import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Info } from 'lucide-react';
import { Product, ProductVariant } from '../../../services/productService';
import { useCart } from '../../../contexts/CartContext';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  isOpen, 
  onClose 
}) => {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Obtener colores y tallas únicas
  const availableColors = Array.from(
    new Set(product.variants?.map(v => JSON.stringify({ id: v.color.id, name: v.color.name, hex: v.color.hex_code })) || [])
  ).map((str: string) => JSON.parse(str));

  const availableSizes = selectedColor
    ? product.variants
        ?.filter(v => v.color.id === selectedColor)
        .map(v => ({ id: v.size.id, name: v.size.name }))
    : [];

  // Actualizar variante seleccionada cuando cambian color/talla
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = product.variants?.find(
        v => v.color.id === selectedColor && v.size.id === selectedSize
      );
      setSelectedVariant(variant || null);
      setQuantity(1); // Reset quantity
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product.variants]);

  // Pre-seleccionar primer color al abrir
  useEffect(() => {
    if (isOpen && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].id);
    }
  }, [isOpen, availableColors, selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      // Pasar la información de la variante para que funcione con carrito de invitado
      await addToCart(selectedVariant.id, quantity, selectedVariant);
      onClose();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const canAddToCart = selectedVariant && 
    selectedVariant.available_stock > 0 && 
    quantity <= selectedVariant.available_stock;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto bg-white">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white p-2 hover:bg-gray-100 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 border border-gray-300">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingBag size={96} />
                </div>
              )}
            </div>
            
            {/* Imágenes adicionales (si las hay en el futuro) */}
            <div className="grid grid-cols-4 gap-2">
              {/* Placeholder para imágenes adicionales */}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            {product.category && (
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {product.category.name}
              </p>
            )}

            {/* Nombre */}
            <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-4">
              <p className="text-3xl font-bold text-black">
                ${selectedVariant?.final_price.toFixed(2) || 
                   product.variants?.[0]?.final_price.toFixed(2) || '0.00'}
              </p>
              {product.discount_percentage && product.discount_percentage > 0 && product.compare_at_price && (
                <>
                  <p className="text-xl text-gray-400 line-through">
                    ${parseFloat(product.compare_at_price).toFixed(2)}
                  </p>
                  <span className="bg-black text-white px-3 py-1 text-sm tracking-wider">
                    -{product.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="border-t border-gray-300 pt-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Selector de color */}
            <div className="border-t border-gray-300 pt-6">
              <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color.id);
                      setSelectedSize(''); // Reset size selection
                    }}
                    className={`relative w-12 h-12 border-2 transition-all ${
                      selectedColor === color.id
                        ? 'border-black scale-110'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de talla */}
            {selectedColor && availableSizes && availableSizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                  Talla
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => {
                    const variant = product.variants?.find(
                      v => v.color.id === selectedColor && v.size.id === size.id
                    );
                    const isOutOfStock = variant ? variant.available_stock === 0 : true;
                    
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        disabled={isOutOfStock}
                        className={`px-6 py-3 border-2 text-sm font-medium uppercase tracking-wider transition-all ${
                          selectedSize === size.id
                            ? 'border-black bg-black text-white'
                            : isOutOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size.name}
                        {isOutOfStock && (
                          <span className="block text-xs mt-1">Sin stock</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock disponible */}
            {selectedVariant && (
              <div className="bg-gray-50 border border-gray-300 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Info size={16} />
                  <span>
                    {selectedVariant.available_stock > 0 ? (
                      <>
                        <span className="font-semibold">{selectedVariant.available_stock}</span> unidades disponibles
                        {selectedVariant.needs_restock && (
                          <span className="text-orange-600 ml-2">(Stock bajo)</span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold">Sin stock</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Selector de cantidad */}
            {selectedVariant && selectedVariant.available_stock > 0 && (
              <div>
                <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-xl font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.available_stock, quantity + 1))}
                    disabled={quantity >= selectedVariant.available_stock}
                    className="p-3 border border-gray-300 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAdding}
              className="w-full bg-black text-white py-4 font-semibold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAdding ? (
                'Agregando...'
              ) : (
                <>
                  <ShoppingBag size={20} />
                  {!selectedColor || !selectedSize
                    ? 'Selecciona color y talla'
                    : !selectedVariant || selectedVariant.available_stock === 0
                    ? 'Sin stock'
                    : 'Agregar al carrito'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
