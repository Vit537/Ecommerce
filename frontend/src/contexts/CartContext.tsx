import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService, Cart, CartItem, AddToCartRequest } from '../services/cartService';

// Estado del carrito
interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'UPDATE_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: CartState = {
  cart: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
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
        totalPrice: parseFloat(action.payload.total_price) || 0,
        loading: false,
        error: null,
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
        totalPrice: updatedItemsAdd.reduce((sum, item) => sum + parseFloat(item.total_price), 0),
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
        totalPrice: updatedItemsUpdate.reduce((sum, item) => sum + parseFloat(item.total_price), 0),
        loading: false,
        error: null,
      };
    
    case 'REMOVE_ITEM_SUCCESS':
      const updatedItemsRemove = state.items.filter(item => item.id !== action.payload);

      return {
        ...state,
        items: updatedItemsRemove,
        totalItems: updatedItemsRemove.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItemsRemove.reduce((sum, item) => sum + parseFloat(item.total_price), 0),
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
  fetchCart: () => Promise<void>;
  addToCart: (productVariantId: string, quantity: number) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeCartItem: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Obtener el carrito del usuario
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
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

  // Agregar producto al carrito
  const addToCart = async (productVariantId: string, quantity: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const data: AddToCartRequest = {
        product_variant: productVariantId,
        quantity,
      };

      const cartItem = await cartService.addToCart(data);
      dispatch({ type: 'ADD_ITEM_SUCCESS', payload: cartItem });

      // Refrescar el carrito completo para asegurar sincronización
      await fetchCart();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al agregar al carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  // Actualizar cantidad de un item
  const updateCartItem = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      if (quantity <= 0) {
        return await removeCartItem(itemId);
      }

      const cartItem = await cartService.updateCartItem(itemId, { quantity });
      dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: cartItem });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al actualizar el item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  // Eliminar un item del carrito
  const removeCartItem = async (itemId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await cartService.removeCartItem(itemId);
      dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: itemId });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar el item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  // Vaciar el carrito
  const clearCart = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Error al vaciar el carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  // Limpiar error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Cargar el carrito al montar y cuando cambie la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, fetchCart]);

  const value: CartContextType = {
    cart: state.cart,
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    loading: state.loading,
    error: state.error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    clearError,
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