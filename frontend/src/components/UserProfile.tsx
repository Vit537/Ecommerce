import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import Notification from './Notification';
import axios from 'axios';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  avatar?: string;
}

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: ''
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || ''
      });
    }
  }, [isOpen, user]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/auth/update_profile/', formData);
      
      if (response.data) {
        showNotification('success', 'Perfil actualizado exitosamente');
        setEditMode(false);
        await checkAuth(); // Refresh user data
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al actualizar el perfil';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || ''
      });
    }
    setEditMode(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Mi Perfil" size="md">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-600">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              )}
            </div>
            {editMode && (
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Cambiar foto
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  disabled={!editMode}
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    editMode 
                      ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  disabled={!editMode}
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    editMode 
                      ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                disabled={true} // Email shouldn't be editable
                value={formData.email}
                className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                El email no se puede modificar. Contacta soporte si necesitas cambiarlo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                disabled={!editMode}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  editMode 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="+34 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                disabled={!editMode}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`w-full p-2 border rounded-md ${
                  editMode 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder="Calle, número, ciudad, código postal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                disabled={!editMode}
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  editMode 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            {/* Account Info */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Información de Cuenta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipo de usuario:</span>
                  <span className="ml-2 capitalize font-medium">
                    {user?.role === 'customer' ? 'Cliente' : 
                     user?.role === 'employee' ? 'Empleado' : 
                     user?.role === 'admin' ? 'Administrador' : user?.role}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Miembro desde:</span>
                  <span className="ml-2 font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              {!editMode ? (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition duration-200"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </Modal>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default UserProfile;