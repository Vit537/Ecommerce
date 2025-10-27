import { apiService, PaginatedResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: string;
  cost_price?: string;
  compare_at_price?: string;
  category?: string; // Cambiar de Category a string
  brand?: string; // Cambiar de Brand a string
  target_gender: string;
  material?: string;
  care_instructions?: string;
  sizes: Size[];
  colors: Color[];
  weight?: string;
  dimensions?: Record<string, any>;
  images: string[];
  status: string;
  is_featured: boolean;
  is_on_sale: boolean;
  season?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  total_stock?: number;
  is_in_stock?: boolean;
  discount_percentage?: number;
  variants?: ProductVariant[]; // Agregar esta propiedad
  base_price?: string; // Agregar esta propiedad para compatibilidad
}

export interface ProductVariant {
  id: string;
  product: string;
  size?: Size;
  color?: Color;
  sku_variant: string;
  stock_quantity: number;
  min_stock_level: number;
  reserved_quantity: number;
  price_adjustment: string;
  images: string[];
  barcode?: string;
  is_active: boolean;
  created_at: string;
  // Propiedades adicionales para compatibilidad
  stock: number; // alias para stock_quantity
  price?: string; // precio específico de la variante
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_type: string;
  parent?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  season?: string;
  target_gender?: string;
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
  hex_code?: string;
  is_active: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  gender?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_on_sale?: boolean;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class ProductService {
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
    return apiService.get<PaginatedResponse<Product>>(url);
  }

  async getProduct(id: string): Promise<Product> {
    return apiService.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return apiService.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return apiService.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  }

  async deleteProduct(id: string): Promise<void> {
    return apiService.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return apiService.get<ProductVariant[]>(API_ENDPOINTS.PRODUCTS.VARIANTS(productId));
  }

  async createVariant(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    return apiService.post<ProductVariant>(`/api/products/${productId}/variants/`, data);
  }

  async updateVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    return apiService.patch<ProductVariant>(`/api/products/${productId}/variants/${variantId}/`, data);
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    return apiService.delete(`/api/products/${productId}/variants/${variantId}/`);
  }

  async getCategories(): Promise<Category[]> {
    return apiService.get<Category[]>(API_ENDPOINTS.PRODUCTS.CATEGORIES);
  }

  async getBrands(): Promise<Brand[]> {
    return apiService.get<Brand[]>(API_ENDPOINTS.PRODUCTS.BRANDS);
  }

  async getSizes(): Promise<Size[]> {
    return apiService.get<Size[]>(API_ENDPOINTS.PRODUCTS.SIZES);
  }

  async getColors(): Promise<Color[]> {
    return apiService.get<Color[]>(API_ENDPOINTS.PRODUCTS.COLORS);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_ENDPOINTS.PRODUCTS.LIST}?search=${query}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_ENDPOINTS.PRODUCTS.LIST}?is_featured=true`);
  }

  async getProductsOnSale(): Promise<Product[]> {
    return apiService.get<Product[]>(`${API_ENDPOINTS.PRODUCTS.LIST}?is_on_sale=true`);
  }
}

export const productService = new ProductService();
export default productService;
