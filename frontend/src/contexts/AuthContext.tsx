import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService, User } from '../services/authService';

// User type viene del servicio de autenticación

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: authService.getUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: true, // Iniciar con loading=true para verificar autenticación
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<boolean>;
  updateUser: (user: User) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 [login] Intentando login para:', email);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login({ email, password });
      console.log('🔍 [login] Respuesta recibida, guardando token y usuario');
      
      authService.setToken(response.access);
      authService.setUser(response.user);
      
      console.log('🔍 [login] Token guardado en localStorage:', !!localStorage.getItem('token'));
      console.log('🔍 [login] Usuario guardado en localStorage:', !!localStorage.getItem('user'));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access,
        },
      });

      console.log('🔍 [login] Login exitoso');
      return true;
    } catch (error: any) {
      console.error('🔍 [login] Error en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      authService.removeToken();
      authService.removeUser();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await authService.register(data);
      return await login(data.email, data.password);
    } catch (error: any) {
      const errorMessage = error.message || 'Error al registrarse';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();
    console.log('🔍 [checkAuth] Token disponible:', !!token);
    
    if (!token) {
      console.log('🔍 [checkAuth] No hay token, haciendo logout');
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      console.log('🔍 [checkAuth] Verificando con servidor...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const user = await authService.getMe();
      console.log('🔍 [checkAuth] Usuario verificado:', user.email);
      
      authService.setUser(user);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      console.log('🔍 [checkAuth] Autenticación exitosa');
    } catch (error) {
      console.error('🔍 [checkAuth] Error al verificar autenticación:', error);
      authService.removeToken();
      authService.removeUser();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = (user: User): void => {
    authService.setUser(user);
    dispatch({ type: 'SET_USER', payload: user });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.is_admin) return true;
    return state.user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!state.user) return false;
    if (state.user.is_admin) return true;
    return permissions.some(permission => state.user?.permissions?.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!state.user) return false;
    if (state.user.is_admin) return true;
    return permissions.every(permission => state.user?.permissions?.includes(permission));
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 [AuthContext] Inicializando autenticación...');
      
      const token = authService.getToken();
      const user = authService.getUser();
      
      console.log('🔍 [AuthContext] Token en localStorage:', !!token);
      console.log('🔍 [AuthContext] Usuario en localStorage:', !!user);
      
      if (token && user) {
        console.log('🔍 [AuthContext] Token y usuario encontrados, verificando con servidor...');
        // Si tenemos token y usuario en localStorage, verificar con el servidor
        await checkAuth();
      } else {
        console.log('🔍 [AuthContext] No hay token o usuario, marcando como no autenticado');
        // Si no hay token o usuario, marcar como no autenticado
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    register,
    updateUser,
    clearError,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};