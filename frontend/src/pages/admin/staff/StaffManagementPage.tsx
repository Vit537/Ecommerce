import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  Filter,
  Plus,
  Shield,
  Edit
} from 'lucide-react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { userService, StaffUser } from '../../../services/userService';
import StaffFormModal from '../../../components/admin/users/StaffFormModal';

const StaffManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'cashier'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    loadStaffUsers();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, roleFilter, statusFilter, staffUsers]);

  const loadStaffUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getStaffUsers();
      setStaffUsers(data);
      setFilteredStaff(data);
    } catch (error) {
      console.error('Error loading staff users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staffUsers];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    setFilteredStaff(filtered);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.toggleStaffStatus(userId, !currentStatus);
      await loadStaffUsers();
    } catch (error) {
      console.error('Error toggling staff status:', error);
    }
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/admin/staff/${userId}`);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: StaffUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingUser(null);
    loadStaffUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  return (
    <AdminNavbar>
    <>
      
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
                CAJEROS Y ADMINISTRADORES
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona los usuarios del sistema con acceso al panel de administración
              </p>
            </div>

            <button
              onClick={handleCreateUser}
              className="px-6 py-2.5 bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear usuario
            </button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Filtro por rol */}
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white cursor-pointer transition-colors"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="manager">Gerentes</option>
                  <option value="cashier">Cajeros</option>
                </select>
              </div>

              {/* Filtro por estado */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white cursor-pointer transition-colors"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <span>Total: <strong className="text-black">{staffUsers.length}</strong></span>
              <span>Admins: <strong className="text-purple-600">{staffUsers.filter(u => u.role === 'admin').length}</strong></span>
              <span>Gerentes: <strong className="text-blue-600">{staffUsers.filter(u => u.role === 'manager').length}</strong></span>
              <span>Cajeros: <strong className="text-orange-600">{staffUsers.filter(u => u.role === 'cashier').length}</strong></span>
            </div>
          </div>

          {/* Lista de usuarios staff */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(user.id)}
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Info del usuario */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black">
                          {user.first_name} {user.last_name}
                        </h3>
                        
                        {/* Badge de rol */}
                        <span className={`
                          px-2 py-1 text-xs font-semibold uppercase rounded
                          ${getRoleBadgeColor(user.role)}
                        `}>
                          {getRoleLabel(user.role)}
                        </span>

                        {/* Badge de estado */}
                        <span className={`
                          px-2 py-1 text-xs font-semibold uppercase rounded
                          ${user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.hire_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Desde: {formatDate(user.hire_date)}</span>
                          </div>
                        )}
                      </div>

                      {user.department && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Departamento: <strong className="text-black">{user.department}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 ml-4">
                      
                      {/* Botón editar */}
                      <button
                        onClick={(e) => handleEditUser(user, e)}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-gray-300 hover:border-black transition-colors"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Editar
                      </button>

                      {/* Botón toggle status */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(user.id, user.is_active);
                        }}
                        className={`
                          px-4 py-2 text-xs font-semibold uppercase tracking-wider
                          border transition-colors
                          ${user.is_active
                            ? 'border-red-300 text-red-600 hover:border-red-600'
                            : 'border-green-300 text-green-600 hover:border-green-600'
                          }
                        `}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-4 h-4 inline mr-1" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 inline mr-1" />
                            Activar
                          </>
                        )}
                      </button>

                      {/* Flecha para ver detalles */}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <StaffFormModal
          user={editingUser}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
    </AdminNavbar>
  );
};

export default StaffManagementPage;
