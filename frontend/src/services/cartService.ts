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
  subtotal: number;
}

export interface CartItem {
  id: string;
  cart: string;
  product: Product;
  product_variant: ProductVariant;
  quantity: number;
  unit_price: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product_variant: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  item_id: string;
  quantity: number;
}

export interface RemoveCartItemRequest {
  item_id: string;
}

class CartService {
  /**
   * Obtener el carrito del usuario actual
   */
  async getCart(): Promise<Cart> {
    // El backend devuelve el carrito del usuario como un objeto
    const response = await apiService.get<Cart>(`${API_ENDPOINTS.CART.GET}`);
    return response || this.createEmptyCart();
  }

  /**
   * Crear un carrito vacío temporal
   */
  private createEmptyCart(): Cart {
    return {
      id: '',
      user: '',
      items: [],
      created_at: '',
      updated_at: '',
      total_items: 0,
      subtotal: 0
    };
  }

  /**
   * Agregar un item al carrito
   */
  async addToCart(variantId: string, quantity: number = 1): Promise<CartItem> {
    // Aceptar que variantId pueda llegar como objeto (defensivo)
    let variantIdToSend: any = variantId;
    try {
      if (!variantIdToSend) throw new Error('product_variant id vacío');
      if (typeof variantIdToSend !== 'string' && typeof variantIdToSend === 'object') {
        // intentar extraer campo id
        variantIdToSend = variantIdToSend.id || variantIdToSend.uuid || String(variantIdToSend);
      }

      console.log('🔄 [CartService] Adding variant to cart:', variantIdToSend, 'qty:', quantity);

      const response = await apiService.post<CartItem>(`${API_ENDPOINTS.CART.GET}add_item/`, {
        product_variant: variantIdToSend,
        quantity: quantity,
      });

      return response;
    } catch (error: any) {
      console.error('❌ [CartService] Error adding to cart:', error);
      // Re-throw para que quien llame pueda manejar/loggear
      throw error;
    }
  }

  /**
   * Actualizar cantidad de un item
   */
  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    const response = await apiService.patch<CartItem>(
      `${API_ENDPOINTS.CART.GET}update_item/`,
      {
        item_id: itemId,
        quantity: quantity,
      }
    );
    return response;
  }

  /**
   * Eliminar un item del carrito
   */
  async removeCartItem(itemId: string): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.CART.GET}remove_item/`, {
      data: { item_id: itemId },
    });
  }

  /**
   * Vaciar el carrito completamente
   */
  async clearCart(): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.CART.GET}clear/`, {});
  }

  /**
   * Obtener cantidad total de items en el carrito
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  /**
   * Obtener subtotal del carrito
   */
  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.subtotal || 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  }

  /**
   * Verificar si un producto ya está en el carrito
   */
  async isInCart(variantId: string): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.some(item => item.product_variant.id === variantId);
    } catch {
      return false;
    }
  }

  /**
   * Obtener cantidad de un producto específico en el carrito
   */
  async getVariantQuantityInCart(variantId: string): Promise<number> {
    try {
      const cart = await this.getCart();
      const item = cart.items.find(item => item.product_variant.id === variantId);
      return item?.quantity || 0;
    } catch {
      return 0;
    }
  }
}

export const cartService = new CartService();
export default cartService;
