import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, 
  Shield, 
  Users, 
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TestAccount {
  role: string;
  email: string;
  password: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cuentas de prueba
  const testAccounts: TestAccount[] = [
    {
      role: 'Administrador',
      email: 'admin@boutique.com',
      password: 'admin123',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-primary',
      description: 'Acceso completo al sistema',
    },
    {
      role: 'Gerente',
      email: 'gerente@boutique.com',
      password: 'gerente123',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-accent',
      description: 'Gestión de operaciones',
    },
    {
      role: 'Cajero',
      email: 'cajero@boutique.com',
      password: 'cajero123',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-gray-700',
      description: 'Ventas en tienda',
    },
    {
      role: 'Cliente',
      email: 'ana.martinez@email.com',
      password: 'cliente123',
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-gray-500',
      description: 'Compras online',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        // Esperar un momento para que el estado se actualice
        setTimeout(() => {
          // Obtener el usuario del localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              const role = user.role?.toLowerCase() || user.user_type?.toLowerCase();
              
              console.log('🔄 Usuario:', user);
              console.log('🔄 Rol detectado:', role);
              
              // Redirigir según el rol
              if (role === 'admin' || user.is_admin) {
                console.log('✅ Redirigiendo a /admin');
                navigate('/admin', { replace: true });
              } else if (role === 'gerente' || role === 'manager') {
                console.log('✅ Redirigiendo a /admin (gerente)');
                navigate('/admin', { replace: true });
              } else if (role === 'cajero' || role === 'cashier' || user.is_employee) {
                console.log('✅ Redirigiendo a /pos');
                navigate('/pos', { replace: true });
              } else if (role === 'cliente' || role === 'customer' || user.is_customer) {
                console.log('✅ Redirigiendo a /shop');
                navigate('/shop', { replace: true });
              } else {
                console.log('⚠️ Rol no reconocido, redirigiendo a /shop');
                navigate('/shop', { replace: true });
              }
            } catch (parseError) {
              console.error('❌ Error al parsear usuario:', parseError);
              navigate('/shop', { replace: true });
            }
          } else {
            console.error('❌ No se encontró usuario en localStorage');
            navigate('/shop', { replace: true });
          }
        }, 300);
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccountClick = (account: TestAccount) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleGoToShop = () => {
    navigate('/shop');
    // navigate('/demo/customer');
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SPORTSWEAR
            </h1>
            <p className="text-gray-700 font-medium text-base">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-primary text-gray-900"
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-primary text-gray-900"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-gray-700 font-medium">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-800 hover:text-primary font-semibold underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-800 font-semibold">
                O navega como visitante
              </span>
            </div>
          </div>

          {/* Go to Shop Button */}
          <button
            onClick={handleGoToShop}
            className="btn-outline w-full"
          >
            <ShoppingBag className="w-5 h-5" />
            Ir a la Tienda
          </button>
        </div>

        {/* Columna Derecha: Test Accounts */}
        <div className="bg-primary rounded-2xl shadow-xl p-8 lg:p-12 text-primary">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-primary">
              Cuentas de Prueba
            </h2>
            <p className="text-gray-500 font-medium">
              Haz clic en una tarjeta para autocompletar las credenciales
            </p>
          </div>

          <div className="space-y-4">
            {testAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => handleTestAccountClick(account)}
                className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-xl p-4 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${account.color} p-3 rounded-lg group-hover:scale-110 transition-transform flex items-center justify-center`}>
                    {account.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-secondary">
                      {account.role}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 font-medium">
                      {account.description}
                    </p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-semibold">
                          {account.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-semibold">
                          {account.password}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-white/10 border-2 border-white/20 rounded-lg">
            <p className="text-sm text-gray-400 font-medium">
              <strong className="text-secondary font-bold">Nota:</strong> Estas son cuentas de demostración para pruebas. 
              Cada rol tiene acceso a diferentes funcionalidades del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
