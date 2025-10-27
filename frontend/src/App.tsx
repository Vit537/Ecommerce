import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerShop from './pages/CustomerShop';
import ReportsPage from './pages/ReportsPage';
import InventoryManagement from './pages/InventoryManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeCreate from './pages/EmployeeCreate';
import CustomerManagement from './pages/CustomerManagement';
import POSSystem from './pages/POSSystem';
import UsersThisMonth from './pages/UsersThisMonth';
import MLDashboard from './pages/MLDashboard';
import ProductRecommendations from './pages/ProductRecommendations';
import CustomerSegmentation from './pages/CustomerSegmentation';
import MLModelAdmin from './pages/MLModelAdmin';
import UserProfile from './pages/UserProfile';
import AuthDebug from './pages/AuthDebug';
import LoadingSpinner from './components/LoadingSpinner';
import ChatbotWidget from './components/ChatbotWidget';
import { useAuth } from './contexts/AuthContext';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: string;
  allowedRoles?: string[];
}> = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol específico
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Componente de rutas dentro del contexto de Auth
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            (user?.role === 'admin' || user?.is_admin) ? <Navigate to="/admin" replace /> :
            (user?.role === 'employee' || user?.is_employee) ? <Navigate to="/employee" replace /> :
            <Navigate to="/shop" replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <AdminDashboard /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/employee" 
        element={
          <ProtectedRoute>
            {user?.role === 'employee' || user?.role === 'admin' || user?.is_employee || user?.is_admin ? <EmployeeDashboard /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/shop" 
        element={
          <ProtectedRoute>
            <CustomerShop />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.role === 'employee' || user?.is_admin || user?.is_employee ? <ReportsPage /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.role === 'employee' || user?.is_admin || user?.is_employee ? <InventoryManagement /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/employees" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <EmployeeManagement /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/employees" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <EmployeeManagement /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/employees/new" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <EmployeeCreate /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/employees/:id" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <EmployeeDetail /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/customers" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <CustomerManagement /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/pos" 
        element={
          <ProtectedRoute>
            {user?.role === 'employee' || user?.role === 'admin' || user?.is_employee || user?.is_admin ? <POSSystem /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/auth/users-this-month" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <UsersThisMonth /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ml-dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <MLDashboard /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ml/product-recommendations" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <ProductRecommendations /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ml/customer-segmentation" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <CustomerSegmentation /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ml/model-admin" 
        element={
          <ProtectedRoute>
            {user?.role === 'admin' || user?.is_admin ? <MLModelAdmin /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/debug" 
        element={<AuthDebug />}
      />

      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
              <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Volver al Login
              </button>
            </div>
          </div>
        } 
      />

      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            (user?.role === 'admin' || user?.is_admin) ? <Navigate to="/admin" replace /> :
            (user?.role === 'employee' || user?.is_employee) ? <Navigate to="/employee" replace /> :
            <Navigate to="/shop" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Página No Encontrada</h1>
              <p className="text-gray-600 mb-4">La página que buscas no existe.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </Router>
  );
};

// Componente separado que se renderiza después de que AuthContext esté disponible
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeContextProvider>
      <CartProvider>
        <div className="App">
          <AppRoutes />
          {/* Chatbot Widget - Solo visible para usuarios autenticados */}
          {isAuthenticated && <ChatbotWidget position="bottom-right" />}
        </div>
      </CartProvider>
    </ThemeContextProvider>
  );
};

export default App;