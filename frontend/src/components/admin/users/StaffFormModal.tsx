import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { userService, StaffUser, CreateStaffData } from '../../../services/userService';

interface StaffFormModalProps {
  user: StaffUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ user, onClose, onSuccess }) => {
  const isEditMode = !!user;
  
  const [formData, setFormData] = useState<CreateStaffData>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'cashier',
    phone: '',
    hire_date: '',
    department: '',
    permissions: [],
  });

  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: '', // No mostrar contraseña en edición
        role: user.role as any,
        phone: user.phone || '',
        hire_date: user.hire_date || '',
        department: user.department || '',
        permissions: user.permissions || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isEditMode && !formData.password) {
      setError('La contraseña es requerida para crear un nuevo usuario');
      return;
    }

    if (!isEditMode && formData.password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isEditMode && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && user) {
        // Actualizar usuario existente
        const updateData: Partial<CreateStaffData> = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          phone: formData.phone,
          hire_date: formData.hire_date,
          department: formData.department,
        };

        // Solo incluir password si se cambió
        if (formData.password) {
          updateData.password = formData.password;
        }
        // Remove empty string values to avoid sending invalid values (e.g. empty date string)
        Object.keys(updateData).forEach((key) => {
          const k = key as keyof typeof updateData;
          if (updateData[k] === '') {
            delete updateData[k];
          }
        });

        console.log("Updating user with data:", updateData);

        await userService.updateStaffUser(user.id, updateData);
      } else {
        // Crear nuevo usuario
        await userService.createStaffUser(formData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving staff user:', error);
      setError(error.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg border border-gray-300 max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black uppercase tracking-wider">
            {isEditMode ? 'EDITAR USUARIO' : 'CREAR NUEVO USUARIO'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Información básica */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Juan"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="+1 234 567 8900"
                />
              </div>

            </div>
          </div>

          {/* Información del rol */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Rol y Permisos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-red-600">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white cursor-pointer transition-colors"
                >
                  <option value="cashier">Cajero</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Ventas, Administración, etc."
                />
              </div>

              {/* Fecha de contratación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de contratación
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>

            </div>
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {isEditMode ? 'Cambiar Contraseña (opcional)' : 'Contraseña'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditMode ? 'Nueva contraseña' : 'Contraseña'} 
                  {!isEditMode && <span className="text-red-600"> *</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                  {!isEditMode && <span className="text-red-600"> *</span>}
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required={!isEditMode}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Repetir contraseña"
                />
              </div>

            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold uppercase tracking-wider border border-gray-300 hover:border-black transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold uppercase tracking-wider bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Guardar cambios' : 'Crear usuario'}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default StaffFormModal;
