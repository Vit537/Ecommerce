import React, { createContext, useContext, useState } from 'react';

// Versión simplificada del AuthContext para pruebas
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
}

interface SimpleAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de login por ahora
    console.log('Intento de login:', { email, password });
    
    // Mock user
    const mockUser: User = {
      id: '1',
      email,
      name: 'Usuario Test',
      role: 'admin'
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: SimpleAuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};