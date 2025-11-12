import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  User,
  UserCheck,
  UserX
} from 'lucide-react';
import AdminNavbar from '../../../components/admin/Navbar/AdminNavbar';
import { userService, CustomerDetails } from '../../../services/userService';

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCustomerDetails(id);
    }
  }, [id]);

  const loadCustomerDetails = async (customerId: string) => {
    setLoading(true);
    try {
      const data = await userService.getCustomerDetails(customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Error loading customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer || !id) return;
    
    try {
      await userService.toggleCustomerStatus(id, !customer.is_active);
      await loadCustomerDetails(id);
    } catch (error) {
      console.error('Error toggling customer status:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (!customer) {
    return (
      <AdminNavbar>
      <>
        
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600">Cliente no encontrado</p>
              <button
                onClick={() => navigate('/admin/customers')}
                className="mt-4 px-6 py-2 bg-black text-white text-sm font-semibold uppercase hover:bg-gray-900"
              >
                Volver a la lista
              </button>
            </div>
          </div>
        </div>
      </>
      </AdminNavbar>
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
                onClick={() => navigate('/admin/customers')}
                className="p-2 hover:bg-white border border-gray-300 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-black uppercase tracking-wider">
                  DETALLES DEL CLIENTE
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Información completa y estadísticas de compra
                </p>
              </div>
            </div>

            {/* Botón toggle status */}
            <button
              onClick={handleToggleStatus}
              className={`
                px-6 py-2.5 text-sm font-semibold uppercase tracking-wider
                border transition-colors
                ${customer.is_active
                  ? 'border-red-300 text-red-600 hover:border-red-600'
                  : 'border-green-300 text-green-600 hover:border-green-600'
                }
              `}
            >
              {customer.is_active ? (
                <>
                  <UserX className="w-4 h-4 inline mr-2" />
                  Desactivar cuenta
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Activar cuenta
                </>
              )}
            </button>
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
                    {customer.first_name} {customer.last_name}
                  </h2>
                  <span className={`
                    inline-block mt-2 px-3 py-1 text-xs font-semibold uppercase rounded
                    ${customer.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {customer.is_active ? 'Cuenta Activa' : 'Cuenta Inactiva'}
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
                          <p className="text-sm text-black">{customer.email}</p>
                        </div>
                      </div>

                      {customer.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="text-sm text-black">{customer.phone}</p>
                          </div>
                        </div>
                      )}

                      {customer.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Dirección</p>
                            <p className="text-sm text-black">{customer.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Información adicional
                    </h3>
                    
                    <div className="space-y-3">
                      {customer.date_of_birth && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                            <p className="text-sm text-black">{formatDate(customer.date_of_birth)}</p>
                          </div>
                        </div>
                      )}

                      {customer.identification_number && (
                        <div className="flex items-start gap-3">
                          <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Identificación</p>
                            <p className="text-sm text-black">{customer.identification_number}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Cliente desde</p>
                          <p className="text-sm text-black">{formatDate(customer.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Estadísticas y órdenes */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Total de pedidos */}
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {customer.stats?.total_orders || 0}
                  </p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">
                    Total de pedidos
                  </p>
                </div>

                {/* Total gastado */}
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {formatCurrency(customer.stats?.total_spent || 0)}
                  </p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">
                    Total gastado
                  </p>
                </div>

                {/* Promedio por pedido */}
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {formatCurrency(customer.stats?.average_order_value || 0)}
                  </p>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">
                    Promedio por pedido
                  </p>
                </div>

              </div>

              {/* Historial de pedidos */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black uppercase tracking-wider mb-4">
                  HISTORIAL DE PEDIDOS
                </h3>

                {customer.orders && customer.orders.length > 0 ? (
                  <div className="space-y-3">
                    {customer.orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">
                              Pedido #{order.order_number || order.id}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-black">
                              {formatCurrency(order.total)}
                            </p>
                            <span className={`
                              inline-block mt-1 px-2 py-1 text-xs font-semibold uppercase rounded
                              ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Este cliente aún no ha realizado pedidos</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
    </AdminNavbar>

  );
};

export default CustomerDetailsPage;
