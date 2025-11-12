import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Package,
  Calendar,
  CreditCard,
  Loader2,
  ShoppingBag,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import { useAuth } from '../contexts/AuthContext';
import { User, authService } from '../../services/authService';
import CustomerLayout from '../../components/customer/Layout/CustomerLayout';
import orderService, { Order } from '../../services/orderService';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile');
  
  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadUserProfile();
    loadOrders();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await authService.getUserProfile();
      setProfileData(updatedUser);
      setEditData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      if (user) {
        setProfileData(user);
        setEditData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          address: user.address || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordersData = await orderService.getOrders();
      setOrders(ordersData.results || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      await authService.updateUserProfile(editData);
      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
      loadUserProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('Las contraseñas no coinciden');
        return;
      }

      if (passwordData.new_password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      setLoading(true);
      setError('');
      await authService.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      setSuccess('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getOrderStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
    };
    return statusText[status] || status;
  };

  return (
    // <CustomerLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black uppercase tracking-wider mb-2">
              MI PERFIL
            </h1>
            <p className="text-gray-600">
              Gestiona tu información personal y revisa tus pedidos
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'profile'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <UserIcon className="w-5 h-5 inline-block mr-2" />
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'orders'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5 inline-block mr-2" />
                Mis Pedidos
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'security'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 inline-block mr-2" />
                Seguridad
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-black uppercase tracking-wider">
                  Datos Personales
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          first_name: profileData?.first_name || '',
                          last_name: profileData?.last_name || '',
                          phone: profileData?.phone || '',
                          address: profileData?.address || '',
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {profileData?.first_name || 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {profileData?.last_name || 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    <Mail className="w-4 h-4 inline-block mr-2" />
                    Email
                  </label>
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    El email no puede ser modificado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    <Phone className="w-4 h-4 inline-block mr-2" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {profileData?.phone || 'No especificado'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4 inline-block mr-2" />
                    Dirección
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {profileData?.address || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-black uppercase tracking-wider mb-6">
                Historial de Pedidos
              </h2>

              {loadingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No tienes pedidos aún</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Explora nuestra tienda y realiza tu primer pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                            Pedido #{order.order_number}
                          </p>
                          <p className="text-lg font-bold text-black">
                            ${parseFloat(order.total_amount).toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {order.payments && order.payments.length > 0 
                            ? order.payments[0].payment_method.name 
                            : 'No especificado'}
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Productos ({order.items.length})
                          </p>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-700">
                                  {item.product_name} x{item.quantity}
                                </span>
                                <span className="font-semibold text-black">
                                  ${parseFloat(item.total_price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-black uppercase tracking-wider mb-6">
                Seguridad de la Cuenta
              </h2>

              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Cambiar Contraseña
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mantén tu cuenta segura actualizando tu contraseña regularmente
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>

                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Desactivar Cuenta
                      </h3>
                      <p className="text-sm text-red-700">
                        Esto deshabilitará temporalmente tu cuenta. Contacta a soporte para reactivarla.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que deseas desactivar tu cuenta?')) {
                          // Aquí se implementaría la lógica de desactivación
                          alert('Funcionalidad de desactivación pendiente de implementar');
                        }
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Cerrar Sesión
                      </h3>
                      <p className="text-sm text-gray-600">
                        Salir de tu cuenta en este dispositivo
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setShowPasswordModal(false)}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-black uppercase tracking-wider mb-6">
                Cambiar Contraseña
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    // </CustomerLayout>
  );
};

export default CustomerProfile;
