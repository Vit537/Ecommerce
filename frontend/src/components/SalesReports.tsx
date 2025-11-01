import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/env';

interface SalesMetrics {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  average_order_value: number;
  sales_today: number;
  orders_today: number;
  sales_this_week: number;
  sales_this_month: number;
}

interface TopProduct {
  id: number;
  name: string;
  total_quantity: number;
  total_revenue: number;
  category: string;
  brand: string;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

interface CategorySales {
  category: string;
  total_sales: number;
  total_orders: number;
  percentage: number;
}

interface RecentOrder {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

const SalesReports: React.FC = () => {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
    to: new Date().toISOString().split('T')[0] // hoy
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSalesMetrics = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/reports/sales-metrics/?from=${dateRange.from}&to=${dateRange.to}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        showNotification('Error al cargar métricas de ventas', 'error');
      }
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/reports/top-products/?from=${dateRange.from}&to=${dateRange.to}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopProducts(data);
      } else {
        showNotification('Error al cargar productos más vendidos', 'error');
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/reports/daily-sales/?from=${dateRange.from}&to=${dateRange.to}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      } else {
        showNotification('Error al cargar datos de ventas diarias', 'error');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const fetchCategorySales = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/reports/category-sales/?from=${dateRange.from}&to=${dateRange.to}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategorySales(data);
      } else {
        showNotification('Error al cargar ventas por categoría', 'error');
      }
    } catch (error) {
      console.error('Error fetching category sales:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/orders/?limit=10&ordering=-created_at`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.results || data);
      } else {
        showNotification('Error al cargar pedidos recientes', 'error');
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesMetrics(),
        fetchTopProducts(),
        fetchSalesData(),
        fetchCategorySales(),
        fetchRecentOrders()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      'processing': { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
      'shipped': { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const exportReport = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/reports/export/?from=${dateRange.from}&to=${dateRange.to}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${dateRange.from}_${dateRange.to}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showNotification('Reporte exportado correctamente', 'success');
      } else {
        showNotification('Error al exportar reporte', 'error');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAllData();
    }
  }, [user, token, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportes de Ventas</h2>
            <p className="text-gray-600">Análisis y métricas de rendimiento de ventas</p>
          </div>
          <button
            onClick={exportReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setDateRange({
                from: new Date().toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              })}
              className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Hoy
            </button>
            <button
              onClick={() => setDateRange({
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              })}
              className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              7 días
            </button>
            <button
              onClick={() => setDateRange({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              })}
              className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              30 días
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">$</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_sales)}</div>
                <div className="text-sm text-gray-600">Ventas Totales</div>
                <div className="text-xs text-gray-500">Hoy: {formatCurrency(metrics.sales_today)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">#</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{metrics.total_orders}</div>
                <div className="text-sm text-gray-600">Pedidos Totales</div>
                <div className="text-xs text-gray-500">Hoy: {metrics.orders_today}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{metrics.total_customers}</div>
                <div className="text-sm text-gray-600">Clientes Únicos</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.average_order_value)}</div>
                <div className="text-sm text-gray-600">Promedio por Pedido</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productos más vendidos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category} • {product.brand}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{product.total_quantity} unidades</div>
                  <div className="text-xs text-gray-500">{formatCurrency(product.total_revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas por categoría */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Categoría</h3>
          <div className="space-y-3">
            {categorySales.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{category.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(category.total_sales)}</div>
                  <div className="text-xs text-gray-500">{category.total_orders} pedidos ({category.percentage.toFixed(1)}%)</div>
                </div>
                <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de ventas diarias (simplificado) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas Diarias</h3>
        <div className="h-64 flex items-end space-x-2 overflow-x-auto">
          {salesData.map((day, index) => {
            const maxSales = Math.max(...salesData.map(d => d.sales));
            const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center min-w-[60px]">
                <div className="text-xs text-gray-600 mb-1">{formatCurrency(day.sales)}</div>
                <div 
                  className="bg-blue-500 rounded-t-sm w-8 transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${formatDate(day.date)}: ${formatCurrency(day.sales)} (${day.orders} pedidos)`}
                ></div>
                <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                  {formatDate(day.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {recentOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay pedidos recientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;