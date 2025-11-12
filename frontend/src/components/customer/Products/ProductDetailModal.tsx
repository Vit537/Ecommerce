import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener colores y tallas únicas
  const availableColors = Array.from(
    new Set(product.variants?.map(v => JSON.stringify({ 
      id: v.color.id, 
      name: v.color.name, 
      hex: v.color.hex_code 
    })) || [])
  ).map((str: string) => JSON.parse(str));

  const availableSizes = selectedColor
    ? product.variants
        ?.filter(v => v.color.id === selectedColor)
        .map(v => ({ id: v.size.id, name: v.size.name }))
    : [];

  // Actualizar variante seleccionada
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = product.variants?.find(
        v => v.color.id === selectedColor && v.size.id === selectedSize
      );
      setSelectedVariant(variant || null);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product.variants]);

  // Pre-seleccionar primer color
  useEffect(() => {
    if (isOpen && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].id);
    }
  }, [isOpen, availableColors, selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
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

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto bg-white rounded-xl shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md transition-all"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${product.name} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/500?text=Sin+Imagen';
                    }}
                  />
                  
                  {/* Controles de navegación */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex 
                                ? 'bg-black w-6' 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingBag size={96} />
                </div>
              )}
            </div>
            
            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square border-2 rounded-lg overflow-hidden transition-all ${
                      index === currentImageIndex 
                        ? 'border-black' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Img';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            {product.category && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {product.category.name}
              </p>
            )}

            {/* Nombre */}
            <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-bold text-black">
                ${selectedVariant?.final_price.toFixed(2) || 
                   product.variants?.[0]?.final_price.toFixed(2) || '0.00'}
              </p>
              {product.discount_percentage && product.discount_percentage > 0 && product.compare_at_price && (
                <>
                  <p className="text-xl text-gray-400 line-through">
                    ${parseFloat(product.compare_at_price).toFixed(2)}
                  </p>
                  <span className="bg-black text-white px-3 py-1 text-xs font-semibold rounded-full tracking-wider">
                    -{product.discount_percentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Selector de color */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setSelectedColor(color.id);
                      setSelectedSize(''); // Reset size
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                      selectedColor === color.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {color.hex && (
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span className="font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de talla */}
            {selectedColor && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                  Talla
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes?.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`px-6 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            {selectedVariant && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-black uppercase tracking-wider mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="px-6 py-2 font-semibold min-w-[3rem] text-center border-x-2 border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.available_stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedVariant.available_stock > 0 
                      ? `${selectedVariant.available_stock} disponibles`
                      : 'Sin stock'}
                  </span>
                </div>
              </div>
            )}

            {/* Botón agregar al carrito */}
            <div className="pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAdding}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                {isAdding ? 'Agregando...' : 'Agregar al Carrito'}
              </button>

              {!selectedVariant && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Selecciona una talla para continuar
                </p>
              )}
            </div>

            {/* Advertencia de stock bajo */}
            {selectedVariant && selectedVariant.needs_restock && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ Pocas unidades disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
