import React from 'react';
import { Package } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../../../services/productService';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewDetails: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading = false,
  onViewDetails,
  onQuickAdd
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, idx) => (
          <div key={idx} className="border border-gray-300 bg-white animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-gray-200 w-1/3" />
              <div className="h-4 bg-gray-200 w-full" />
              <div className="h-4 bg-gray-200 w-2/3" />
              <div className="h-5 bg-gray-200 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package size={64} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-black uppercase tracking-wider mb-2">
          NO SE ENCONTRARON PRODUCTOS
        </h3>
        <p className="text-gray-500">
          Intenta ajustar los filtros o busca algo diferente
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
