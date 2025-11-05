import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

// ========================================
// IMPORTS DE PÁGINAS Y COMPONENTES
// ========================================
import LoginPage from './pages/LoginPage';


// COMPONENTES DE LAS MEJORAS
// ========================================
import AdminNavbar from './components/admin/Navbar/AdminNavbar';
import CashierLayout from './components/cashier/POS/CashierLayout';
import CustomerLayout from './components/customer/Shop/CustomerLayout';
import CartSidebar from './components/cart/CartSidebar';
import CheckoutPage from './pages/CheckoutPage';

// Páginas de Administración
import ProductsManagement from './pages/admin/ProductsManagementGrid';
import CategoriesManagement from './pages/admin/CategoriesManagementTable';
import ReportsPage from './pages/admin/ReportsPage';

// Página de Perfil de Usuario
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';

// ========================================
// COMPONENTE PROTECTEDROUTE
// ========================================
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: string;
  allowedRoles?: string[];
}> = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 [ProtectedRoute] Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Obtener el rol del usuario (maneja múltiples formatos)
  const userRole = user?.role?.toLowerCase() || 
                   user?.user_type?.toLowerCase() || 
                   (user?.is_admin ? 'admin' : null) ||
                   (user?.is_employee ? 'cajero' : null) ||
                   (user?.is_customer ? 'cliente' : null) ||
                   'cliente';

  console.log('🔒 [ProtectedRoute] Usuario:', user?.email, 'Rol:', userRole);
  console.log('🔒 [ProtectedRoute] Roles permitidos:', allowedRoles);

  // Verificar rol específico
  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    console.log('🔒 [ProtectedRoute] Rol requerido no coincide, redirigiendo a unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    const allowedRolesLower = allowedRoles.map(r => r.toLowerCase());
    const hasPermission = allowedRolesLower.includes(userRole);
    
    if (!hasPermission) {
      console.log('🔒 [ProtectedRoute] Usuario no tiene permisos, redirigiendo a unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ [ProtectedRoute] Acceso permitido');
  return <>{children}</>;
};


// ========================================
// COMPONENTE APP PRINCIPAL
// ========================================

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeContextProvider>
          <CartProvider>
            <Routes>
              {/* ========================================
                  RUTA DE LOGIN
                  ======================================== */}
              <Route path="/login" element={<LoginPage />} />

              {/* ========================================
                  RUTAS DE DEMOSTRACIÓN (MEJORAS)
                  ======================================== */}
              
              {/* Panel de Administración - Diseño minimalista
              <Route path="/demo/admin" element={<AdminNavbar />} />
              
              {/* Sistema POS para Cajeros */}
              {/* <Route path="/demo/cashier" element={<CashierLayout />} /> */}
              
              {/* Tienda para Clientes - Sportswear Design */}
              {/* <Route path="/demo/customer" element={<CustomerLayout />} /> */}
              
              {/* Proceso de Checkout en 3 pasos */}
              {/* <Route path="/demo/checkout" element={
                <>
                  <CheckoutPage />
                  <CartSidebar />
                </>
              } /> */} 

              {/* ========================================
                  RUTAS AUTENTICADAS CON ROLES
                  ======================================== */}
              
              {/* Ruta para Admin y Gerente - Dashboard */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                  <AdminNavbar />
                </ProtectedRoute>
              } />

              {/* Ruta específica para Dashboard */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                  <AdminNavbar />
                </ProtectedRoute>
              } />

              {/* Rutas de Gestión Admin */}
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                  <ProductsManagement />
                </ProtectedRoute>
              } />

              {/* Reports - Admin area (wrapped by AdminNavbar inside the page or explicitly here) */}
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'gerente']}>
              
                  <ReportsPage />
              
                </ProtectedRoute>
              } />

              <Route path="/admin/categories" element={
                <ProtectedRoute allowedRoles={['admin', 'gerente']}>
                  <CategoriesManagement />
                </ProtectedRoute>
              } />

              {/* Ruta para Cajero */}
              <Route path="/pos" element={
                <ProtectedRoute allowedRoles={['cajero', 'admin', 'gerente']}>
                  <CashierLayout />
                </ProtectedRoute>
              } />

              {/* Ruta para Cliente (Shop) - PÚBLICA */}
              <Route path="/shop" element={<CustomerLayout />} />

              {/* Ruta para Perfil de Usuario */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />

            

              {/* Ruta para Checkout (requiere autenticación) */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                  <CartSidebar />
                </ProtectedRoute>
              } />

              {/* Página de acceso denegado */}
              <Route path="/unauthorized" element={
                <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <h1 className="text-4xl font-bold text-error mb-4">Acceso Denegado</h1>
                    <p className="text-gray-700 mb-6">No tienes permisos para acceder a esta página.</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="btn-primary"
                    >
                      Volver al Login
                    </button>
                  </div>
                </div>
              } />

              {/* Ruta para recuperación de contraseña - PÚBLICA */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Ruta raíz - Redirige a login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* 404 - Página no encontrada */}
              <Route path="*" element={
                <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-primary mb-2">Página No Encontrada</h2>
                    <p className="text-gray-600 mb-6">La página que buscas no existe o ha sido movida.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="btn-primary"
                      >
                        Ir al Login
                      </button>
                      <button
                        onClick={() => window.location.href = '/shop'}
                        className="btn-outline"
                      >
                        Ver Tienda
                      </button>
                    </div>
                  </div>
                </div>
              } />

              {/* ========================================
                  RUTAS DE DEMOSTRACIÓN (Sin autenticación)
                  ======================================== */}
            </Routes>
          </CartProvider>
        </ThemeContextProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;