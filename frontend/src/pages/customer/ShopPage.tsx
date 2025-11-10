import React, { useState, useEffect, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import ProductGrid from '../../components/customer/Products/ProductGrid';
import ProductDetailModal from '../../components/customer/Products/ProductDetailModal';
import FilterSidebar from '../../components/customer/Products/FilterSidebar';
import SearchBar from '../../components/customer/Products/SearchBar';
import { 
  Product, 
  Category, 
  Brand, 
  Size, 
  Color,
  productService,
  categoryService,
  brandService
} from '../../services/productService';
import { useCart } from '../../contexts/CartContext';

const ShopPage: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<{
    category?: string;
    brand?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }>({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands()
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);
        
        // Cargar sizes y colors únicos desde productos
        const productsResponse = await productService.getProducts({ page_size: 1000 });
        const allSizes: Size[] = [];
        const allColors: Color[] = [];
        const sizeMap = new Map<string, Size>();
        const colorMap = new Map<string, Color>();
        
        productsResponse.results.forEach(product => {
          product.sizes?.forEach(size => {
            if (!sizeMap.has(size.id)) {
              sizeMap.set(size.id, size);
              allSizes.push(size);
            }
          });
          product.colors?.forEach(color => {
            if (!colorMap.has(color.id)) {
              colorMap.set(color.id, color);
              allColors.push(color);
            }
          });
        });
        
        setSizes(allSizes);
        setColors(allColors);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    loadInitialData();
  }, []);

  // Cargar productos con filtros
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.results);
        setTotalProducts(response.count);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query || undefined }));
  }, []);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleViewDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleQuickAdd = useCallback(async (product: Product) => {
    if (product.variants && product.variants.length === 1) {
      try {
        // Pasar la información de la variante para que funcione con carrito de invitado
        await addToCart(product.variants[0].id, 1, product.variants[0]);
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    }
  }, [addToCart]);

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header con búsqueda */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black uppercase tracking-wider mb-6">
            TIENDA
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 bg-white px-6 py-4 rounded-full hover:border-black hover:shadow-md transition-all lg:w-auto w-full"
            >
              <Filter size={20} />
              <span className="font-semibold uppercase tracking-wider">
                Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </button>

            {/* Búsqueda */}
            <div className="flex-1 w-full">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Filtros activos (chips) */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.category && (
                <span className="flex items-center gap-1 bg-black text-white px-3 py-1 text-sm">
                  {categories.find(c => c.id === filters.category)?.name}
                  <button onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="flex items-center gap-1 bg-black text-white px-3 py-1 text-sm">
                  {brands.find(b => b.id === filters.brand)?.name}
                  <button onClick={() => setFilters(prev => ({ ...prev, brand: undefined }))}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.size && (
                <span className="flex items-center gap-1 bg-black text-white px-3 py-1 text-sm">
                  Talla: {sizes.find(s => s.id === filters.size)?.name}
                  <button onClick={() => setFilters(prev => ({ ...prev, size: undefined }))}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.color && (
                <span className="flex items-center gap-1 bg-black text-white px-3 py-1 text-sm">
                  {colors.find(c => c.id === filters.color)?.name}
                  <button onClick={() => setFilters(prev => ({ ...prev, color: undefined }))}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="flex items-center gap-1 bg-black text-white px-3 py-1 text-sm">
                  ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
                  <button onClick={() => setFilters(prev => ({ ...prev, minPrice: undefined, maxPrice: undefined }))}>
                    <X size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-black underline"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* Layout con filtros y productos */}
        <div>
          {/* Contador de resultados */}
          {!loading && (
            <div className="mb-6 text-sm text-gray-600">
              {totalProducts} {totalProducts === 1 ? 'producto encontrado' : 'productos encontrados'}
            </div>
          )}

          {/* Grid de productos */}
          <ProductGrid
            products={products}
            loading={loading}
            onViewDetails={handleViewDetails}
            onQuickAdd={handleQuickAdd}
          />
        </div>
      </div>

      {/* Sidebar de filtros deslizante */}
      <FilterSidebar
        categories={categories}
        brands={brands}
        sizes={sizes}
        colors={colors}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Modal de detalle del producto */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ShopPage;
