import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// ============================================
// INTERFACES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_type: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  season?: string;
  target_gender?: string;
  parent?: string | null;
  parent_name?: string;
  subcategories?: Category[];
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  country_origin?: string;
  is_active: boolean;
  created_at: string;
}

export interface Size {
  id: string;
  name: string;
  size_type: string;
  sort_order: number;
  is_active: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  size: Size;
  color: Color;
  sku_variant: string;
  stock_quantity: number;
  min_stock_level: number;
  reserved_quantity: number;
  available_stock: number;
  price_adjustment: string;
  final_price: number;
  images: string[];
  barcode?: string;
  is_active: boolean;
  needs_restock: boolean;
  created_at: string;
  updated_at: string;
  product: string;
}

export interface Product {
  id: string;
  name?: string;
  description?: string;
  category?: Category;
  brand?: Brand;
  price?: string;
  compare_at_price?: string;
  discount_percentage?: number;
  is_featured?: boolean;
  is_active?: boolean;
  is_in_stock?: boolean;
  total_stock?: number;
  images?: string[];
  variants: ProductVariant[];
  sizes: Size[];
  colors: Color[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  is_active?: boolean;
  is_featured?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ProductCreateData {
  name: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  compare_at_price?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  parent?: string;
  category_type?: string;
  target_gender?: string;
  season?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================
// PRODUCT SERVICE
// ============================================

class ProductService {
  
  /**
   * Obtener productos con filtros y paginación
   */
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
      if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.page_size) params.append('page_size', String(filters.page_size));

      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}` : API_ENDPOINTS.PRODUCTS.LIST;
      
      console.log('🔄 [ProductService] Fetching products from:', url);
      const response = await apiService.get<PaginatedResponse<Product>>(url);
      
      console.log('✅ [ProductService] Products fetched successfully:', response.results?.length || 0);
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async createProduct(data: ProductCreateData): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Creating product:', data.name);
      const response = await apiService.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
      console.log('✅ [ProductService] Product created successfully');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error creating product:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto con imágenes
   */
  async createProductWithImages(formData: FormData): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Creating product with images');
      const response = await apiService.postFormData<Product>(API_ENDPOINTS.PRODUCTS.CREATE, formData);
      console.log('✅ [ProductService] Product created successfully with images');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error creating product with images:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id: string, data: Partial<ProductCreateData>): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Updating product:', id);
      const response = await apiService.put<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
      console.log('✅ [ProductService] Product updated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error updating product:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto con imágenes
   */
  async updateProductWithImages(id: string, formData: FormData): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Updating product with images:', id);
      const response = await apiService.putFormData<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), formData);
      console.log('✅ [ProductService] Product updated successfully with images');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error updating product with images:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('🔄 [ProductService] Deleting product:', id);
      await apiService.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
      console.log('✅ [ProductService] Product deleted successfully');
    } catch (error: any) {
      console.error('❌ [ProductService] Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar como destacado
   */
  async toggleFeatured(id: string, is_featured: boolean): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Toggling featured status:', id, is_featured);
      const response = await apiService.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), { is_featured });
      console.log('✅ [ProductService] Featured status updated');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error toggling featured:', error);
      throw error;
    }
  }

  /**
   * Activar/desactivar producto
   */
  async toggleProductStatus(id: string, is_active: boolean): Promise<Product> {
    try {
      console.log('🔄 [ProductService] Toggling product status:', id, is_active);
      const response = await apiService.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), { is_active });
      console.log('✅ [ProductService] Product status updated');
      return response;
    } catch (error: any) {
      console.error('❌ [ProductService] Error toggling status:', error);
      throw error;
    }
  }
}

// ============================================
// CATEGORY SERVICE
// ============================================

class CategoryService {
  
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<Category[]> {
    try {
      console.log('🔄 [CategoryService] Fetching categories');
      const response = await apiService.get<PaginatedResponse<Category>>(API_ENDPOINTS.PRODUCTS.CATEGORIES);
      
      // El backend puede devolver formato paginado o array directo
      const categories = response.results || response;
      const categoriesArray = Array.isArray(categories) ? categories : [];
      console.log('✅ [CategoryService] Categories fetched:', categoriesArray.length);
      return categoriesArray;
    } catch (error: any) {
      console.error('❌ [CategoryService] Error fetching categories:', error);
      return []; // Devolver array vacío para que no se rompa la app
    }
  }

  /**
   * Crear nueva categoría
   */
  async createCategory(data: CategoryCreateData): Promise<Category> {
    try {
      console.log('🔄 [CategoryService] Creating category:', data.name);
      const response = await apiService.post<Category>(API_ENDPOINTS.PRODUCTS.CATEGORIES, data);
      console.log('✅ [CategoryService] Category created successfully');
      return response;
    } catch (error: any) {
      console.error('❌ [CategoryService] Error creating category:', error);
      throw error;
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(id: string, data: Partial<CategoryCreateData>): Promise<Category> {
    try {
      console.log('🔄 [CategoryService] Updating category:', id);
      const response = await apiService.put<Category>(`${API_ENDPOINTS.PRODUCTS.CATEGORIES}${id}/`, data);
      console.log('✅ [CategoryService] Category updated successfully');
      return response;
    } catch (error: any) {
      console.error('❌ [CategoryService] Error updating category:', error);
      throw error;
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      console.log('🔄 [CategoryService] Deleting category:', id);
      await apiService.delete(`${API_ENDPOINTS.PRODUCTS.CATEGORIES}${id}/`);
      console.log('✅ [CategoryService] Category deleted successfully');
    } catch (error: any) {
      console.error('❌ [CategoryService] Error deleting category:', error);
      throw error;
    }
  }
}

// ============================================
// BRAND SERVICE
// ============================================

class BrandService {
  
  /**
   * Obtener todas las marcas
   */
  async getBrands(): Promise<Brand[]> {
    try {
      console.log('🔄 [BrandService] Fetching brands');
      const response = await apiService.get<PaginatedResponse<Brand>>(API_ENDPOINTS.PRODUCTS.BRANDS);
      
      // El backend puede devolver formato paginado o array directo
      const brands = response.results || response;
      const brandsArray = Array.isArray(brands) ? brands : [];
      console.log('✅ [BrandService] Brands fetched:', brandsArray.length);
      return brandsArray;
    } catch (error: any) {
      console.error('❌ [BrandService] Error fetching brands:', error);
      // Si hay error 404 (endpoint no existe), devolver array vacío
      if (error.response?.status === 404) {
        console.warn('⚠️ [BrandService] Brands endpoint not found, returning empty array');
        return [];
      }
      return []; // Devolver array vacío para que no se rompa la app
    }
  }
}

// ============================================
// EXPORTS
// ============================================

export const productService = new ProductService();
export const categoryService = new CategoryService();
export const brandService = new BrandService();