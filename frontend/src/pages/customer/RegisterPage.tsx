import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { authService } from '../../services/authService';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.phone && !/^\d{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    try {
      // Registrar usuario
      await authService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        user_type: 'customer' // Tipo de usuario cliente
      });

      // Mostrar mensaje de éxito
      alert('¡Registro exitoso! Ahora puedes iniciar sesión');

      // Redirigir al login
      navigate('/customer/login');
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // Manejar errores del servidor
      if (error.response?.data) {
        const serverErrors: { [key: string]: string } = {};
        Object.keys(error.response.data).forEach(key => {
          const messages = error.response.data[key];
          serverErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: error.message || 'Error al registrar usuario' });
      }
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
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a nuestra comunidad deportiva
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.first_name ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="Tu nombre"
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.last_name ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="Tu apellido"
                />
              </div>
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
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
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="123456789"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección (opcional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.address ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all resize-none
                  `}
                  placeholder="Tu dirección"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
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
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg border
                    ${errors.confirm_password ? 'border-red-300' : 'border-gray-300'}
                    focus:ring-2 focus:ring-black focus:border-transparent
                    transition-all
                  `}
                  placeholder="Repite tu contraseña"
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
              )}
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
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/customer/login" 
                className="font-medium text-black hover:underline"
              >
                Inicia sesión aquí
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
      </div>
    </div>
  );
};

export default RegisterPage;
