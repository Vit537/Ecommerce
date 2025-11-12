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
  Filter
} from 'lucide-react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { userService, UserData } from '../../../services/userService';

const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, statusFilter, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await userService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter(customer => customer.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(customer => !customer.is_active);
    }

    setFilteredCustomers(filtered);
  };

  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      await userService.toggleCustomerStatus(customerId, !currentStatus);
      await loadCustomers();
    } catch (error) {
      console.error('Error toggling customer status:', error);
    }
  };

  const handleViewDetails = (customerId: string) => {
    navigate(`/admin/customers/${customerId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminNavbar>
    <>
      
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
              GESTIÓN DE CLIENTES
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Administra los clientes registrados en la plataforma
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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
              <span>Total: <strong className="text-black">{customers.length}</strong></span>
              <span>Activos: <strong className="text-green-600">{customers.filter(c => c.is_active).length}</strong></span>
              <span>Inactivos: <strong className="text-red-600">{customers.filter(c => !c.is_active).length}</strong></span>
            </div>
          </div>

          {/* Lista de clientes */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron clientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(customer.id)}
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Info del cliente */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <span className={`
                          px-2 py-1 text-xs font-semibold uppercase rounded
                          ${customer.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {customer.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Registrado: {formatDate(customer.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 ml-4">
                      
                      {/* Botón toggle status */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(customer.id, customer.is_active);
                        }}
                        className={`
                          px-4 py-2 text-xs font-semibold uppercase tracking-wider
                          border transition-colors
                          ${customer.is_active
                            ? 'border-red-300 text-red-600 hover:border-red-600'
                            : 'border-green-300 text-green-600 hover:border-green-600'
                          }
                        `}
                      >
                        {customer.is_active ? (
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
    </>
    </AdminNavbar>
  );
};

export default CustomersListPage;
