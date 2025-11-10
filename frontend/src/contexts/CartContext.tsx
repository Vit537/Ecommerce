import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService, Cart, CartItem } from '../services/cartService';
import { ProductVariant, Product } from '../services/productService';

// Tipo para items en localStorage (más simple)
interface LocalCartItem {
  product_variant: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Estado del carrito
interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;
  isGuest: boolean;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'UPDATE_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean };

const initialState: CartState = {
  cart: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  isCartOpen: false,
  isGuest: true,
};

// Funciones para localStorage
const GUEST_CART_KEY = 'guest_cart';

const saveGuestCart = (items: LocalCartItem[]) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error guardando carrito en localStorage:', error);
  }
};

const loadGuestCart = (): LocalCartItem[] => {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error cargando carrito de localStorage:', error);
    return [];
  }
};

const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error limpiando carrito de localStorage:', error);
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        items: action.payload.items || [],
        totalItems: action.payload.total_items || 0,
        totalPrice: action.payload.subtotal || 0,
        loading: false,
        error: null,
        isGuest: !action.payload.user,
      };
    
    case 'ADD_ITEM_SUCCESS':
      const updatedItemsAdd = [...state.items];
      const existingItemIndex = updatedItemsAdd.findIndex(
        item => item.product_variant.id === action.payload.product_variant.id
      );

      if (existingItemIndex >= 0) {
        updatedItemsAdd[existingItemIndex] = action.payload;
      } else {
        updatedItemsAdd.push(action.payload);
      }

      return {
        ...state,
        items: updatedItemsAdd,
        totalItems: updatedItemsAdd.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItemsAdd.reduce((sum, item) => sum + item.total_price, 0),
        loading: false,
        error: null,
      };
    
    case 'UPDATE_ITEM_SUCCESS':
      const updatedItemsUpdate = state.items.map(item =>
        item.id === action.payload.id ? action.payload : item
      );

      return {
        ...state,
        items: updatedItemsUpdate,
        totalItems: updatedItemsUpdate.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItemsUpdate.reduce((sum, item) => sum + item.total_price, 0),
        loading: false,
        error: null,
      };
    
    case 'REMOVE_ITEM_SUCCESS':
      const updatedItemsRemove = state.items.filter(item => item.id !== action.payload);

      return {
        ...state,
        items: updatedItemsRemove,
        totalItems: updatedItemsRemove.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItemsRemove.reduce((sum, item) => sum + item.total_price, 0),
        loading: false,
        error: null,
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false,
        error: null,
      };
    
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };
    
    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productVariantId: string, quantity: number, variantData?: ProductVariant) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeCartItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cart = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error: any) {
      console.error('Error al obtener el carrito:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar el carrito' });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      const guestItems = loadGuestCart();
      if (guestItems.length > 0) {
        const items: CartItem[] = guestItems.map((item, index) => ({
          id: `guest-${index}`,
          product_variant: item.product_variant,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          total_price: item.total_price,
          product: item.product_variant.product as unknown as Product,
          cart: 'guest-cart',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);

        dispatch({
          type: 'SET_CART',
          payload: {
            id: 'guest-cart',
            user: null,
            items,
            total_items: totalItems,
            subtotal: totalPrice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      }
    }
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    const syncGuestCartToServer = async () => {
      if (isAuthenticated && state.isGuest && state.items.length > 0) {
        const failed: Array<{ item: any; error: any }> = [];
        try {
          for (const item of state.items) {
            try {
              const variantId = (item?.product_variant && (item.product_variant.id || item.product_variant)) || null;
              if (!variantId) {
                console.warn('⚠️ [CartContext] Omitting guest item without variant id:', item);
                failed.push({ item, error: 'missing_variant_id' });
                continue;
              }

              // Asegurar que enviamos string
              const idToSend = typeof variantId === 'string' ? variantId : String(variantId);
              await cartService.addToCart(idToSend, item.quantity);
            } catch (err) {
              console.error('❌ [CartContext] Error adding guest item to server:', err, 'item:', item);
              failed.push({ item, error: err });
              // continuar con los siguientes items
            }
          }

          // Limpiar guest cart si al menos uno fue sincronizado
          if (failed.length < state.items.length) {
            clearGuestCart();
            await fetchCart();
            console.log('✅ Carrito de invitado sincronizado al servidor (parcial).', 'failedCount:', failed.length);
          } else {
            console.warn('⚠️ [CartContext] Ningún item de invitado fue sincronizado. Revisa errores.');
          }
        } catch (error) {
          console.error('Error sincronizando carrito de invitado:', error);
        }
      }
    };

    syncGuestCartToServer();
  }, [isAuthenticated, user, state.isGuest, state.items, fetchCart]);

  const addToCart = async (productVariantId: string, quantity: number, variantData?: ProductVariant): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (!isAuthenticated) {
        if (!variantData) {
          throw new Error('Se requiere información de la variante para carrito de invitado');
        }

        const guestItems = loadGuestCart();
        const existingIndex = guestItems.findIndex(
          item => item.product_variant.id === productVariantId
        );

        if (existingIndex >= 0) {
          guestItems[existingIndex].quantity += quantity;
          guestItems[existingIndex].total_price = 
            guestItems[existingIndex].quantity * guestItems[existingIndex].unit_price;
        } else {
          guestItems.push({
            product_variant: variantData,
            quantity,
            unit_price: variantData.final_price,
            total_price: variantData.final_price * quantity
          });
        }

        saveGuestCart(guestItems);

        const items: CartItem[] = guestItems.map((item, index) => ({
          id: `guest-${index}`,
          product_variant: item.product_variant,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          total_price: item.total_price,
          product: item.product_variant.product as unknown as Product,
          cart: 'guest-cart',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.total_price, 0);

        dispatch({
          type: 'SET_CART',
          payload: {
            id: 'guest-cart',
            user: null,
            items,
            total_items: totalItems,
            subtotal: totalPrice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });

        return true;
      }

      const cartItem = await cartService.addToCart(productVariantId, quantity);
      dispatch({ type: 'ADD_ITEM_SUCCESS', payload: cartItem });
      await fetchCart();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al agregar al carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (quantity <= 0) {
        return await removeCartItem(itemId);
      }

      if (!isAuthenticated && itemId.startsWith('guest-')) {
        const guestItems = loadGuestCart();
        const index = parseInt(itemId.replace('guest-', ''));
        
        if (index >= 0 && index < guestItems.length) {
          guestItems[index].quantity = quantity;
          guestItems[index].total_price = guestItems[index].unit_price * quantity;
          saveGuestCart(guestItems);

          const items: CartItem[] = guestItems.map((item, idx) => ({
            id: `guest-${idx}`,
            product_variant: item.product_variant,
            quantity: item.quantity,
            unit_price: item.unit_price.toString(),
            total_price: item.total_price,
            product: item.product_variant.product as unknown as Product,
            cart: 'guest-cart',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          dispatch({
            type: 'SET_CART',
            payload: {
              id: 'guest-cart',
              user: null,
              items,
              total_items: items.reduce((sum, item) => sum + item.quantity, 0),
              subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          });

          return true;
        }
        return false;
      }

      const updatedItem = await cartService.updateCartItem(itemId, quantity);
      dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: updatedItem });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar el carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const removeCartItem = async (itemId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (!isAuthenticated && itemId.startsWith('guest-')) {
        const guestItems = loadGuestCart();
        const index = parseInt(itemId.replace('guest-', ''));
        
        if (index >= 0 && index < guestItems.length) {
          guestItems.splice(index, 1);
          saveGuestCart(guestItems);

          const items: CartItem[] = guestItems.map((item, idx) => ({
            id: `guest-${idx}`,
            product_variant: item.product_variant,
            quantity: item.quantity,
            unit_price: item.unit_price.toString(),
            total_price: item.total_price,
            product: item.product_variant.product as unknown as Product,
            cart: 'guest-cart',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          dispatch({
            type: 'SET_CART',
            payload: {
              id: 'guest-cart',
              user: null,
              items,
              total_items: items.reduce((sum, item) => sum + item.quantity, 0),
              subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          });

          return true;
        }
        return false;
      }

      await cartService.removeCartItem(itemId);
      dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: itemId });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar el item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (!isAuthenticated) {
        clearGuestCart();
        dispatch({ type: 'CLEAR_CART' });
        return true;
      }

      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al vaciar el carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const toggleCart = (): void => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = (): void => {
    dispatch({ type: 'SET_CART_OPEN', payload: true });
  };

  const closeCart = (): void => {
    dispatch({ type: 'SET_CART_OPEN', payload: false });
  };

  const value: CartContextType = {
    cart: state.cart,
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    loading: state.loading,
    error: state.error,
    isCartOpen: state.isCartOpen,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    clearError,
    toggleCart,
    openCart,
    closeCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
