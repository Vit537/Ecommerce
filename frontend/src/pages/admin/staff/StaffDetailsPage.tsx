import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase,
  Shield,
  User,
  UserCheck,
  UserX,
  Edit,
  Key
} from 'lucide-react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { userService, StaffUser } from '../../../services/userService';
import StaffFormModal from '../../../components/admin/users/StaffFormModal';

const StaffDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadStaffDetails(id);
    }
  }, [id]);

  const loadStaffDetails = async (userId: string) => {
    setLoading(true);
    try {
      const data = await userService.getStaffDetails(userId);
      setStaffUser(data);
    } catch (error) {
      console.error('Error loading staff details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!staffUser || !id) return;
    
    try {
      await userService.toggleStaffStatus(id, !staffUser.is_active);
      await loadStaffDetails(id);
    } catch (error) {
      console.error('Error toggling staff status:', error);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
  };

  const handleModalSuccess = () => {
    setShowEditModal(false);
    if (id) {
      loadStaffDetails(id);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'cashier':
        return 'Cajero';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
        </div>
      </>
    );
  }

  if (!staffUser) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600">Usuario no encontrado</p>
              <button
                onClick={() => navigate('/admin/staff')}
                className="mt-4 px-6 py-2 bg-black text-white text-sm font-semibold uppercase hover:bg-gray-900"
              >
                Volver a la lista
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <AdminNavbar>
    <>
      
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/staff')}
                className="p-2 hover:bg-white border border-gray-300 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
                  DETALLES DEL USUARIO
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Información completa y permisos del usuario
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="px-6 py-2.5 text-sm font-semibold uppercase tracking-wider border border-gray-300 hover:border-black transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Editar
              </button>

              <button
                onClick={handleToggleStatus}
                className={`
                  px-6 py-2.5 text-sm font-semibold uppercase tracking-wider
                  border transition-colors
                  ${staffUser.is_active
                    ? 'border-red-300 text-red-600 hover:border-red-600'
                    : 'border-green-300 text-green-600 hover:border-green-600'
                  }
                `}
              >
                {staffUser.is_active ? (
                  <>
                    <UserX className="w-4 h-4 inline mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 inline mr-2" />
                    Activar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Información personal */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                
                {/* Avatar y nombre */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-black">
                    {staffUser.first_name} {staffUser.last_name}
                  </h2>
                  
                  {/* Badge de rol */}
                  <span className={`
                    inline-block mt-2 px-3 py-1 text-xs font-semibold uppercase rounded
                    ${getRoleBadgeColor(staffUser.role)}
                  `}>
                    {getRoleLabel(staffUser.role)}
                  </span>

                  {/* Badge de estado */}
                  <span className={`
                    inline-block mt-2 ml-2 px-3 py-1 text-xs font-semibold uppercase rounded
                    ${staffUser.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {staffUser.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Información de contacto */}
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Información de contacto
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-black">{staffUser.email}</p>
                        </div>
                      </div>

                      {staffUser.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="text-sm text-black">{staffUser.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información laboral */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Información laboral
                    </h3>
                    
                    <div className="space-y-3">
                      {staffUser.department && (
                        <div className="flex items-start gap-3">
                          <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Departamento</p>
                            <p className="text-sm text-black">{staffUser.department}</p>
                          </div>
                        </div>
                      )}

                      {staffUser.hire_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Fecha de contratación</p>
                            <p className="text-sm text-black">{formatDate(staffUser.hire_date)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Miembro desde</p>
                          <p className="text-sm text-black">{formatDate(staffUser.created_at)}</p>
                        </div>
                      </div>

                      {staffUser.last_login && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Último acceso</p>
                            <p className="text-sm text-black">{formatDate(staffUser.last_login)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Permisos y accesos */}
            <div className="lg:col-span-2">
              
              {/* Permisos del rol */}
              <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-gray-400" />
                  <h3 className="text-lg font-semibold text-black uppercase tracking-wider">
                    PERMISOS Y ACCESOS
                  </h3>
                </div>

                <div className="space-y-4">
                  
                  {/* Descripción del rol */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Rol: {getRoleLabel(staffUser.role)}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      {staffUser.role === 'admin' && 'Acceso completo al sistema. Puede gestionar todos los módulos, usuarios, productos, pedidos y configuraciones.'}
                      {staffUser.role === 'manager' && 'Acceso a gestión de productos, pedidos, reportes y configuraciones. No puede gestionar usuarios administradores.'}
                      {staffUser.role === 'cashier' && 'Acceso al sistema de punto de venta. Puede procesar pedidos y gestionar el carrito de compras.'}
                    </p>
                  </div>

                  {/* Permisos específicos */}
                  {staffUser.permissions && staffUser.permissions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        Permisos específicos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {staffUser.permissions.map((permission, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <Key className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-800">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Módulos accesibles */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Módulos accesibles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {staffUser.role === 'admin' && (
                        <>
                          <ModuleAccessBadge name="Dashboard" accessible={true} />
                          <ModuleAccessBadge name="Productos" accessible={true} />
                          <ModuleAccessBadge name="Órdenes" accessible={true} />
                          <ModuleAccessBadge name="Clientes" accessible={true} />
                          <ModuleAccessBadge name="Usuarios" accessible={true} />
                          <ModuleAccessBadge name="Reportes" accessible={true} />
                          <ModuleAccessBadge name="Configuración" accessible={true} />
                        </>
                      )}
                      {staffUser.role === 'manager' && (
                        <>
                          <ModuleAccessBadge name="Dashboard" accessible={true} />
                          <ModuleAccessBadge name="Productos" accessible={true} />
                          <ModuleAccessBadge name="Órdenes" accessible={true} />
                          <ModuleAccessBadge name="Clientes" accessible={true} />
                          <ModuleAccessBadge name="Reportes" accessible={true} />
                          <ModuleAccessBadge name="Usuarios" accessible={false} />
                          <ModuleAccessBadge name="Configuración" accessible={false} />
                        </>
                      )}
                      {staffUser.role === 'cashier' && (
                        <>
                          <ModuleAccessBadge name="Punto de Venta" accessible={true} />
                          <ModuleAccessBadge name="Órdenes" accessible={true} />
                          <ModuleAccessBadge name="Productos" accessible={false} />
                          <ModuleAccessBadge name="Clientes" accessible={false} />
                          <ModuleAccessBadge name="Usuarios" accessible={false} />
                          <ModuleAccessBadge name="Reportes" accessible={false} />
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Modal para editar */}
      {showEditModal && (
        <StaffFormModal
          user={staffUser}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
    </AdminNavbar>
  );
};

// Componente auxiliar para mostrar accesos a módulos
interface ModuleAccessBadgeProps {
  name: string;
  accessible: boolean;
}

const ModuleAccessBadge: React.FC<ModuleAccessBadgeProps> = ({ name, accessible }) => {
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg border
      ${accessible 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200 opacity-50'
      }
    `}>
      <div className={`w-2 h-2 rounded-full ${accessible ? 'bg-green-600' : 'bg-gray-400'}`} />
      <span className={`text-sm ${accessible ? 'text-green-800' : 'text-gray-600'}`}>
        {name}
      </span>
    </div>
  );
};

export default StaffDetailsPage;
