import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Category, Brand, Size, Color } from '../../../services/productService';

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  sizes: Size[];
  colors: Color[];
  selectedFilters: {
    category?: string;
    brand?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  sizes,
  colors,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    category: boolean;
    brand: boolean;
    price: boolean;
    size: boolean;
    color: boolean;
  }>({
    category: true,
    brand: false,
    price: false,
    size: false,
    color: false
  });

  const [priceRange, setPriceRange] = useState({
    min: selectedFilters.minPrice || 0,
    max: selectedFilters.maxPrice || 1000
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterSelect = (filterType: string, value: string) => {
    onFilterChange({
      ...selectedFilters,
      [filterType]: selectedFilters[filterType as keyof typeof selectedFilters] === value ? undefined : value
    });
  };

  const handlePriceChange = () => {
    onFilterChange({
      ...selectedFilters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const activeFilterCount = Object.values(selectedFilters).filter(v => v !== undefined).length;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar deslizante */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wider">FILTROS</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                onClearFilters();
                onClose();
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-black py-3 rounded-lg font-medium transition-colors"
            >
              Limpiar filtros ({activeFilterCount})
            </button>
          )}

      {/* Categorías */}
      <div className="border-b border-gray-300 pb-4">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3"
        >
          CATEGORÍA
          {expandedSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={selectedFilters.category === category.id}
                  onChange={() => handleFilterSelect('category', category.id)}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Marcas */}
      <div className="border-b border-gray-300 pb-4">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3"
        >
          MARCA
          {expandedSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.brand && (
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedFilters.brand === brand.id}
                  onChange={() => handleFilterSelect('brand', brand.id)}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rango de precio */}
      <div className="border-b border-gray-300 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3"
        >
          PRECIO
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                placeholder="Mín"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                placeholder="Máx"
              />
            </div>
            <button
              onClick={handlePriceChange}
              className="w-full bg-black text-white py-2 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Tallas */}
      <div className="border-b border-gray-300 pb-4">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3"
        >
          TALLA
          {expandedSections.size ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.size && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleFilterSelect('size', size.id)}
                className={`px-4 py-2 border text-sm uppercase tracking-wider transition-all ${
                  selectedFilters.size === size.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Colores */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider mb-3"
        >
          COLOR
          {expandedSections.color ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.color && (
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleFilterSelect('color', color.id)}
                className={`w-10 h-10 border-2 transition-all ${
                  selectedFilters.color === color.id
                    ? 'border-black scale-110'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.hex_code }}
                title={color.name}
              >
                {selectedFilters.color === color.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
