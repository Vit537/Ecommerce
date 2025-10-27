import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { Product, ProductVariant } from './productService';

export interface Cart {
  id: string;
  user: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
  total_items: number;
  total_price: string;
}

export interface CartItem {
  id: string;
  cart: string;
  product: Product;
  product_variant: ProductVariant;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product_variant: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

class CartService {
  async getCart(): Promise<Cart> {
    return apiService.get<Cart>(API_ENDPOINTS.CART.GET);
  }

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    return apiService.post<CartItem>(API_ENDPOINTS.CART.ADD_ITEM, data);
  }

  async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    return apiService.patch<CartItem>(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), data);
  }

  async removeCartItem(itemId: string): Promise<void> {
    return apiService.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
  }

  async clearCart(): Promise<void> {
    return apiService.post(API_ENDPOINTS.CART.CLEAR);
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items || 0;
    } catch {
      return 0;
    }
  }

  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return parseFloat(cart.total_price) || 0;
    } catch {
      return 0;
    }
  }
}

export const cartService = new CartService();
export default cartService;
