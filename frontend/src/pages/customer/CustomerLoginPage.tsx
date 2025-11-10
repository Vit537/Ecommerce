import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Obtener la ruta de retorno (si venía del checkout, volver ahí)
  const from = (location.state as any)?.from?.pathname || '/shop';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      
      // Redirigir a la página de origen o a la tienda
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Error en login:', error);
      setErrors({ 
        general: error.message || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/shop" className="text-3xl font-bold text-black uppercase tracking-wider">
            SPORTSWEAR
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-black">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.email ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.password ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 px-4 bg-black text-white font-semibold
                rounded-lg uppercase tracking-wider
                hover:bg-gray-900 transition-colors
                disabled:bg-gray-400 disabled:cursor-not-allowed
              "
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/customer/register" 
                className="font-medium text-black hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Back to Shop */}
          <div className="mt-4 text-center">
            <Link 
              to="/shop" 
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-600 text-center">
            🔒 Tus datos están protegidos. Usamos encriptación de nivel bancario.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
