import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  X,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Grid3x3,
  List,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  productService,
  categoryService,
  brandService,
  Product,
  Category,
  Brand,
  ProductFilters,
} from "../../services/productService";
import { getProductImage, handleImageError } from "../../utils/imageUtils";
import AdminNavbar from "../../components/admin/Navbar/AdminNavbar";

const ProductsManagementGrid: React.FC = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtros
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    brand: "",
    is_active: undefined,
    is_featured: undefined,
    ordering: "-created_at",
    page: 1,
    page_size: 12,
  });

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    compare_at_price: "",
    is_featured: false,
    is_active: true,
  });

  // Paginación
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    loadCategoriesAndBrands();
  }, []);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================
  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🔄 [ProductsGrid] Cargando productos con filtros:", filters);

      const response = await productService.getProducts(filters);
      console.log("✅ [ProductsGrid] Respuesta de productos:", response);

      // Verificar si es una respuesta paginada
      if (response && typeof response === 'object' && 'results' in response) {
        const paginatedResponse = response as any;
        setProducts(paginatedResponse.results || []);
        setTotalCount(paginatedResponse.count || 0);
        setTotalPages(
          Math.ceil((paginatedResponse.count || 0) / (filters.page_size || 12))
        );
        console.log(
          "📊 [ProductsGrid] Productos cargados (paginado):",
          paginatedResponse.results?.length || 0
        );
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotalCount(response.length);
        setTotalPages(1);
        console.log(
          "📊 [ProductsGrid] Productos cargados (array):",
          response.length
        );
      } else {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        console.log("⚠️ [ProductsGrid] Respuesta inesperada:", response);
      }

      setError("");
    } catch (err: any) {
      console.error("❌ [ProductsGrid] Error al cargar productos:", err);
      setError(
        "Error al cargar productos: " + (err.message || "Error desconocido")
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    try {
      console.log("🔄 [ProductsGrid] Cargando categorías y marcas...");
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands(),
      ]);
      console.log(
        "✅ [ProductsGrid] Categorías cargadas:",
        categoriesData?.length || 0
      );
      console.log(
        "✅ [ProductsGrid] Marcas cargadas:",
        brandsData?.length || 0
      );
      setCategories(categoriesData || []);
      setBrands(brandsData || []);
    } catch (err: any) {
      console.error(
        "❌ [ProductsGrid] Error al cargar categorías y marcas:",
        err
      );
      // No mostramos error al usuario para categorías/marcas, solo continuamos
      setCategories([]);
      setBrands([]);
    }
  };

  // ============================================
  // MANEJO DE FILTROS
  // ============================================
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    // Solo resetear a página 1 si no estamos cambiando la página
    if (key === 'page') {
      setFilters((prev) => ({ ...prev, [key]: value }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      brand: "",
      is_active: undefined,
      is_featured: undefined,
      ordering: "-created_at",
      page: 1,
      page_size: 12,
    });
  };

  // ============================================
  // ACCIONES CRUD
  // ============================================
  const toggleFeatured = async (product: Product) => {
    try {
      await productService.toggleFeatured(
        product.id,
        !product.is_featured
      );
      setSuccess(
        `Producto ${product.is_featured ? "desmarcado" : "marcado"} como destacado`
      );
      loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError("Error al actualizar producto");
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await productService.toggleProductStatus(
        product.id,
        !product.is_active
      );
      setSuccess(`Producto ${product.is_active ? "desactivado" : "activado"}`);
      loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError("Error al actualizar producto");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    setError("");

    try {
      await productService.deleteProduct(selectedProduct.id);
      setSuccess("Producto eliminado exitosamente");
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(
        "Error al eliminar producto: " + (err.message || "Error desconocido")
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // FUNCIONES CRUD
  // ============================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      brand: "",
      price: "",
      compare_at_price: "",
      is_featured: false,
      is_active: true,
    });
    setSelectedProduct(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    try {
      console.log('🔄 [ProductsGrid] Creating product:', formData);
      await productService.createProduct(formData);
      setSuccess('Producto creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ [ProductsGrid] Error creating product:', err);
      setError('Error al crear producto: ' + (err.message || 'Error desconocido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setActionLoading(true);
    setError('');

    try {
      console.log('🔄 [ProductsGrid] Updating product:', selectedProduct.id, formData);
      await productService.updateProduct(selectedProduct.id, formData);
      setSuccess('Producto actualizado exitosamente');
      setShowEditModal(false);
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ [ProductsGrid] Error updating product:', err);
      setError('Error al actualizar producto: ' + (err.message || 'Error desconocido'));
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category?.id || "",
      brand: product.brand?.id || "",
      price: product.price || "",
      compare_at_price: product.compare_at_price || "",
      is_featured: product.is_featured || false,
      is_active: product.is_active !== undefined ? product.is_active : true,
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <AdminNavbar>
      <div className="min-h-screen bg-secondary p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Gestión de Productos
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Administra el inventario y catálogo de productos
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    Total Productos
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalCount}
                  </div>
                </div>
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    Activos
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {products.filter((p) => p.is_active).length}
                  </div>
                </div>
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    Destacados
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {products.filter((p) => p.is_featured).length}
                  </div>
                </div>
                <Star className="w-8 h-8 text-accent fill-accent" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    Categorías
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {categories.length}
                  </div>
                </div>
                <Grid3x3 className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Vista de cuadrícula"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Vista de lista"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={loadData}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos por nombre..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input-primary pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="input-primary"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              className="input-primary"
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={
                filters.is_active === undefined ? "" : String(filters.is_active)
              }
              onChange={(e) =>
                handleFilterChange(
                  "is_active",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="input-primary"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>

            <div className="text-sm text-gray-600 font-medium">
              Mostrando {products.length} de {totalCount} productos
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-4">No hay productos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Crear primer producto
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getProductImage(product.images)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-white text-xs font-bold rounded-full">
                        <Star className="w-3 h-3 fill-white" />
                        Destacado
                      </span>
                    )}
                    {!product.is_active && (
                      <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Inactivo
                      </span>
                    )}
                    {product.total_stock === 0 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Quick Actions - Visible on hover */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-accent hover:text-white transition-colors"
                      title={
                        product.is_featured
                          ? "Quitar destacado"
                          : "Marcar como destacado"
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${product.is_featured ? "fill-accent text-accent" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(product)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    {product.category?.name || "Sin categoría"} •{" "}
                    {product.brand?.name || "Sin marca"}
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </div>
                      {product.compare_at_price && (
                        <div className="text-sm text-gray-400 line-through">
                          ${parseFloat(product.compare_at_price).toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 font-medium">
                        Stock
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          product.total_stock > 10
                            ? "text-green-600"
                            : product.total_stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {product.total_stock}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleActive(product)}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      product.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {product.is_active ? "✓ Activo" : "✗ Inactivo"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product.images)}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            onError={handleImageError}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {product.name}
                              {product.is_featured && (
                                <Star className="w-4 h-4 fill-accent text-accent" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 font-medium">
                          {product.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-sm text-gray-400 line-through">
                            ${parseFloat(product.compare_at_price).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.total_stock > 10
                              ? "bg-green-100 text-green-800"
                              : product.total_stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.total_stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            product.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {product.is_active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleFeatured(product)}
                            className="p-2 text-gray-600 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                          >
                            <Star
                              className={`w-5 h-5 ${product.is_featured ? "fill-accent text-accent" : ""}`}
                            />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  handleFilterChange(
                    "page",
                    Math.max(1, (filters.page || 1) - 1)
                  )
                }
                disabled={filters.page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <div className="text-sm text-gray-600 font-medium">
                Página {filters.page} de {totalPages}
              </div>

              <button
                onClick={() =>
                  handleFilterChange(
                    "page",
                    Math.min(totalPages, (filters.page || 1) + 1)
                  )
                }
                disabled={filters.page === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Eliminar Producto
                  </h3>
                  <p className="text-sm text-gray-600">
                    ¿Estás seguro de que deseas eliminar "{selectedProduct.name}
                    "? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  {actionLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Crear Nuevo Producto
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="input-primary"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Comparación
                  </label>
                  <input
                    type="number"
                    name="compare_at_price"
                    value={formData.compare_at_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input-primary"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Destacado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-6 h-6" />
                Editar Producto
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="input-primary"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Comparación
                  </label>
                  <input
                    type="number"
                    name="compare_at_price"
                    value={formData.compare_at_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input-primary"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Destacado</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  Actualizar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminNavbar>
  );
};

export default ProductsManagementGrid;
