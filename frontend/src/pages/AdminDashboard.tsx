import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { orderService, Order } from '../services/orderService';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import AppHeader from '../components/AppHeader';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  low_stock_count: number;
  users_this_month: number;
  orders_this_month: number;
  revenue_this_month: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    low_stock_count: 0,
    users_this_month: 0,
    orders_this_month: 0,
    revenue_this_month: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');


  useEffect(() => {
    loadDashboardData();
    fetchUsersThisMonth();
  }, []);

  const fetchUsersThisMonth = async () => {
    try {
      const data = await userService.getUsersThisMonth();
      setStats((prev) => ({ ...prev, users_this_month: data.users_this_month }));
    } catch (error) {
      // Si falla, dejar el valor en 0
      setStats((prev) => ({ ...prev, users_this_month: 0 }));
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar órdenes
      const ordersResponse = await orderService.getOrders({ ordering: '-created_at', limit: 100 });
      const allOrders = ordersResponse.results || [];
      
      // Cargar productos
      const productsResponse = await productService.getProducts({ limit: 100 });
      const allProducts = productsResponse.results || [];

      // Calcular estadísticas
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalRevenue = allOrders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || '0'), 0
      );

      const ordersThisMonth = allOrders.filter(order => 
        new Date(order.created_at) >= thisMonthStart
      );

      const revenueThisMonth = ordersThisMonth.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || '0'), 0
      );

      const pendingOrders = allOrders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length;

      const completedOrders = allOrders.filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      ).length;

      // Productos con bajo stock (menos de 10 unidades en cualquier variante)
      const lowStock = allProducts.filter(product => 
        product.variants.some(v => v.stock < 10)
      );

      setStats({
        total_users: 9, // Del backend tenemos 9 usuarios de prueba
        total_products: allProducts.length,
        total_orders: allOrders.length,
        total_revenue: totalRevenue,
        pending_orders: pendingOrders,
        completed_orders: completedOrders,
        low_stock_count: lowStock.length,
        users_this_month: 0, // Requeriría endpoint específico
        orders_this_month: ordersThisMonth.length,
        revenue_this_month: revenueThisMonth,
      });

      setRecentOrders(allOrders.slice(0, 10));
      setLowStockProducts(lowStock.slice(0, 5));

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      delivered: 'primary',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Panel de Administración" />
        <Box sx={{ minHeight: '100vh' }}>
          <LoadingSpinner fullScreen text="Cargando panel de administración..." />
        </Box>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Panel de Administración" />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pt: 2 }}>
        {/* Botones de acceso rápido */}
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <IconButton onClick={loadDashboardData} color="primary">
              <RefreshIcon />
            </IconButton>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'info.main' }}
              onClick={() => navigate('/employees')}
            >
              👥 Empleados
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'warning.main' }}
              onClick={() => navigate('/customers')}
            >
              👤 Clientes
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'success.main' }}
              onClick={() => navigate('/ml-dashboard')}
            >
              🤖 Machine Learning
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: 'primary.main' }}
              onClick={() => navigate('/reports')}
            >
              📊 Reportes con IA
            </Button>
          </Box>
        </Container>      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="📊 Dashboard" value="dashboard" />
          <Tab label="📦 Productos" value="products" />
          <Tab label="🛒 Pedidos" value="orders" />
          <Tab label="⚠️ Alertas" value="alerts" />
        </Tabs>

        {activeTab === 'dashboard' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Tarjetas de estadísticas principales */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Usuarios</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {stats.total_users}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.users_this_month} nuevos este mes
                        </Typography>
                      </Box>
                      <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Productos</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {stats.total_products}
                        </Typography>
                      </Box>
                      <InventoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Pedidos</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {stats.total_orders}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {stats.pending_orders} pendientes
                        </Typography>
                      </Box>
                      <ShoppingCartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Ingresos Totales</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                          {formatCurrency(stats.total_revenue)}
                        </Typography>
                      </Box>
                      <AttachMoneyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Estadísticas del mes */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Pedidos Este Mes</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats.orders_this_month}
                      </Typography>
                      {stats.orders_this_month > 0 ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Ingresos Este Mes</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(stats.revenue_this_month)}
                      </Typography>
                      {stats.revenue_this_month > 0 ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Productos Bajo Stock</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: stats.low_stock_count > 0 ? 'error.main' : 'text.primary' }}>
                        {stats.low_stock_count}
                      </Typography>
                      {stats.low_stock_count > 0 && <Chip label="Alerta" color="error" size="small" />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pedidos recientes */}
            <Paper>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Pedidos Recientes</Typography>
                <Typography variant="body2" color="text.secondary">Últimos {recentOrders.length} pedidos realizados</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Método Pago</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" sx={{ py: 3 }}>
                            No hay pedidos para mostrar
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              #{order.id.slice(0, 8)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.user?.first_name} {order.user?.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.user?.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(order.created_at)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(parseFloat(order.total_amount))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getOrderStatusLabel(order.status)} 
                              color={getOrderStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {order.payment_method || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {activeTab === 'products' && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6">Gestión de Productos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de {stats.total_products} productos en inventario
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={() => navigate('/inventory')}
              >
                ➕ Ir a Inventario
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Para gestión completa de productos, ve a la sección de Inventario desde el menú principal
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Productos</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{stats.total_products}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Bajo Stock</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{stats.low_stock_count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Completados</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{stats.completed_orders}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {activeTab === 'orders' && (
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Todos los Pedidos</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gestión completa de {stats.total_orders} pedidos
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`${stats.pending_orders} Pendientes`} color="warning" />
                  <Chip label={`${stats.completed_orders} Completados`} color="success" />
                </Box>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID Pedido</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Items</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Pago</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          #{order.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.user?.first_name} {order.user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.user?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(order.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${order.items?.length || 0} items`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(parseFloat(order.total_amount))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getOrderStatusLabel(order.status)} 
                          color={getOrderStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{order.payment_method || 'N/A'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {activeTab === 'alerts' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>⚠️ Productos con Bajo Stock</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Productos que requieren reabastecimiento (menos de 10 unidades)
              </Typography>
              
              {lowStockProducts.length === 0 ? (
                <Alert severity="success">
                  ✅ Todos los productos tienen stock suficiente
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Producto</strong></TableCell>
                        <TableCell><strong>Categoría</strong></TableCell>
                        <TableCell><strong>Variantes Bajas</strong></TableCell>
                        <TableCell><strong>Stock Total</strong></TableCell>
                        <TableCell><strong>Acción</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockProducts.map((product) => {
                        const lowVariants = product.variants.filter(v => v.stock < 10);
                        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {product.brand.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={product.category.name} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {lowVariants.map((variant) => (
                                  <Typography key={variant.id} variant="caption" color="error">
                                    {variant.size?.name} - {variant.color?.name}: {variant.stock} unidades
                                  </Typography>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${totalStock} unidades`} 
                                color={totalStock < 20 ? 'error' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => navigate('/inventory')}
                              >
                                Reabastecer
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>📋 Pedidos Pendientes</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pedidos que requieren atención inmediata
              </Typography>
              
              {stats.pending_orders === 0 ? (
                <Alert severity="success">
                  ✅ No hay pedidos pendientes en este momento
                </Alert>
              ) : (
                <Alert severity="warning" icon="⚠️">
                  Hay {stats.pending_orders} pedido(s) pendiente(s) que requieren procesamiento
                </Alert>
              )}
            </Paper>
          </Box>
        )}
      </Container>
      </Box>
    </>
  );
};

export default AdminDashboard;