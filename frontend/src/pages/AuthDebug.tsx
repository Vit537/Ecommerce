import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const checkLocalStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return {
      token: storedToken,
      user: storedUser ? JSON.parse(storedUser) : null
    };
  };

  const localData = checkLocalStorage();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 Diagnóstico de Autenticación</h1>
      
      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>Estado del AuthContext:</h3>
        <p><strong>Loading:</strong> {loading ? '✅ Sí' : '❌ No'}</p>
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Token en Context:</strong> {token ? '✅ Presente' : '❌ No presente'}</p>
        <p><strong>Usuario en Context:</strong> {user ? `✅ ${user.email} (${user.role})` : '❌ No presente'}</p>
      </div>

      <div style={{ background: '#e8f4fd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>localStorage:</h3>
        <p><strong>Token guardado:</strong> {localData.token ? '✅ Presente' : '❌ No presente'}</p>
        <p><strong>Usuario guardado:</strong> {localData.user ? `✅ ${localData.user.email}` : '❌ No presente'}</p>
      </div>

      <div style={{ background: '#f0f8e8', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>AuthService:</h3>
        <p><strong>isAuthenticated():</strong> {authService.isAuthenticated() ? '✅ Sí' : '❌ No'}</p>
        <p><strong>getToken():</strong> {authService.getToken() ? '✅ Presente' : '❌ No presente'}</p>
        <p><strong>getUser():</strong> {authService.getUser() ? '✅ Presente' : '❌ No presente'}</p>
      </div>

      <div style={{ background: '#fff3cd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>Acciones:</h3>
        <button 
          onClick={handleLogout}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '5px'
          }}
        >
          🚪 Logout
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '5px'
          }}
        >
          🔄 Recargar Página
        </button>

        <button 
          onClick={() => window.location.href = '/admin'}
          style={{ 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '5px'
          }}
        >
          🏠 Ir al Admin
        </button>
      </div>

      <div style={{ background: '#f8d7da', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🔍 Usuario Completo (IMPORTANTE):</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto', background: '#fff', padding: '10px', border: '1px solid #ddd' }}>
          {user ? JSON.stringify(user, null, 2) : 'No hay usuario'}
        </pre>
      </div>

      <div style={{ background: '#fff3cd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🎯 Verificación de Roles:</h3>
        <p><strong>user?.role:</strong> {user?.role || 'undefined'}</p>
        <p><strong>user?.is_admin:</strong> {user?.is_admin ? '✅ true' : '❌ false/undefined'}</p>
        <p><strong>user?.is_employee:</strong> {user?.is_employee ? '✅ true' : '❌ false/undefined'}</p>
        <p><strong>user?.is_customer:</strong> {user?.is_customer ? '✅ true' : '❌ false/undefined'}</p>
        <p><strong>user?.user_type:</strong> {user?.user_type || 'undefined'}</p>
      </div>

      <div style={{ background: '#f8d7da', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>Datos JSON (para debug):</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify({
            context: {
              loading,
              isAuthenticated,
              hasToken: !!token,
              hasUser: !!user,
              userRole: user?.role
            },
            localStorage: {
              hasToken: !!localData.token,
              hasUser: !!localData.user,
              userEmail: localData.user?.email
            },
            authService: {
              isAuthenticated: authService.isAuthenticated(),
              hasToken: !!authService.getToken(),
              hasUser: !!authService.getUser()
            }
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebug;