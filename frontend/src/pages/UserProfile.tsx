import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, authService } from '../services/authService';
import AdminNavbar from '../components/admin/Navbar/AdminNavbar';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });

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
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 [UserProfile] Loading user profile...');
      
      // Intentar obtener el perfil actualizado del servidor
      try {
        const updatedUser = await authService.getUserProfile();
        setProfileData(updatedUser);
        setEditData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
        });
      } catch (err) {
        // Si falla, usar los datos del contexto como fallback
        console.warn('🔄 [UserProfile] Could not load updated profile, using context data');
        if (user) {
          setProfileData(user);
          setEditData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            address: user.address || '',
          });
        }
      }
      console.log('✅ [UserProfile] Profile loaded successfully');
    } catch (err: any) {
      console.error('❌ [UserProfile] Error loading profile:', err);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 [UserProfile] Updating profile...');
      
      // Llamada real al servicio para actualizar el perfil
      const updatedUser = await authService.updateProfile(editData);
      setProfileData(updatedUser);

      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      console.log('✅ [UserProfile] Profile updated successfully');
    } catch (err: any) {
      console.error('❌ [UserProfile] Error updating profile:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 [UserProfile] Changing password...');
      
      // Llamada real al servicio para cambiar la contraseña
      await authService.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSuccess('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(''), 3000);
      console.log('✅ [UserProfile] Password changed successfully');
    } catch (err: any) {
      console.error('❌ [UserProfile] Error changing password:', err);
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 [UserProfile] Logging out...');
      await logout();
      console.log('✅ [UserProfile] Logged out successfully');
    } catch (err: any) {
      console.error('❌ [UserProfile] Error during logout:', err);
      setError('Error al cerrar sesión');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData({
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
    });
  };

  if (loading && !profileData) {
    return (
      <AdminNavbar>
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminNavbar>
    );
  }

  return (
    <AdminNavbar>
      <div className="min-h-screen bg-secondary p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserIcon className="w-8 h-8" />
            Mi Perfil
          </h1>
          <p className="text-gray-600 mt-1 font-medium">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="btn-outline flex items-center gap-2"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nombre completo</p>
                        <p className="font-medium text-gray-900">
                          {profileData?.first_name} {profileData?.last_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Correo electrónico</p>
                        <p className="font-medium text-gray-900">{profileData?.email}</p>
                      </div>
                    </div>

                    {profileData?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium text-gray-900">{profileData.phone}</p>
                        </div>
                      </div>
                    )}

                    {profileData?.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Dirección</p>
                          <p className="font-medium text-gray-900">{profileData.address}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Miembro desde</p>
                        <p className="font-medium text-gray-900">
                          {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={editData.first_name}
                          onChange={handleInputChange}
                          className="input-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={editData.last_name}
                          onChange={handleInputChange}
                          className="input-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                        className="input-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <textarea
                        name="address"
                        value={editData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-primary"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary flex items-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones de Cuenta</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full btn-secondary flex items-center gap-2 justify-center"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 justify-center transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium text-gray-900 capitalize">{profileData?.role || user?.role || 'Usuario'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">ID de Usuario</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {profileData?.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Cambiar Contraseña
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={changePassword} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="input-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="input-primary pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="input-primary pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    Cambiar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminNavbar>
  );
};

export default UserProfile;