import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  Assessment,
  ExitToApp,
  Refresh,
  AttachMoney,
  CheckCircle,
  Pending,
  LocalShipping,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';
import orderService from '../services/orderService';
import { Order } from '../services/orderService';

interface EmployeeStats {
  total_orders_today: number;
  total_sales_today: number;
  pending_orders: number;
  completed_orders_today: number;
  processing_orders: number;
  total_orders: number;
}

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployeeStats>({
    total_orders_today: 0,
    total_sales_today: 0,
    pending_orders: 0,
    completed_orders_today: 0,
    processing_orders: 0,
    total_orders: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadEmployeeData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, orders]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await orderService.getOrders({ ordering: '-created_at' });
      const allOrders = ordersResponse.results || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ordersToday = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const salesToday = ordersToday.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || '0'), 0
      );

      const completedToday = ordersToday.filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      ).length;

      const pendingCount = allOrders.filter(order => 
        order.status === 'pending'
      ).length;

      const processingCount = allOrders.filter(order => 
        order.status === 'processing'
      ).length;

      setStats({
        total_orders_today: ordersToday.length,
        total_sales_today: salesToday,
        pending_orders: pendingCount,
        completed_orders_today: completedToday,
        processing_orders: processingCount,
        total_orders: allOrders.length,
      });

      setOrders(allOrders);
      setFilteredOrders(allOrders);

    } catch (error: any) {
      console.error('Error loading employee data:', error);
      setError('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const handleOpenOrderDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowOrderDialog(true);
  };

  const handleCloseOrderDialog = () => {
    setShowOrderDialog(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      handleCloseOrderDialog();
      await loadEmployeeData();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setError('Error al actualizar el estado del pedido');
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(numAmount);
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

  const getOrderStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Panel de Empleado" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Cargando panel de empleado...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Panel de Empleado" />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Container maxWidth="xl">
          {/* Botones de acción rápida */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<Refresh />}
              onClick={loadEmployeeData}
            >
              Actualizar
            </Button>
          </Box>

          {/* Tabs de navegación */}
          <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<Dashboard />} label="Dashboard" iconPosition="start" />
            <Tab icon={<ShoppingCart />} label="Gestión de Pedidos" iconPosition="start" />
            <Tab icon={<Assessment />} label="Resumen del Día" iconPosition="start" />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Panel de Control - Empleado
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ShoppingCart sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4">{stats.total_orders_today}</Typography>
                        <Typography variant="body2">Pedidos Hoy</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4">{formatCurrency(stats.total_sales_today)}</Typography>
                        <Typography variant="body2">Ventas Hoy</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Pending sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4">{stats.pending_orders}</Typography>
                        <Typography variant="body2">Pendientes</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4">{stats.completed_orders_today}</Typography>
                        <Typography variant="body2">Completados Hoy</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pedidos Recientes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {order.user?.first_name} {order.user?.last_name}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getOrderStatusLabel(order.status)} 
                            color={getOrderStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleOpenOrderDialog(order)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Gestión de Pedidos
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filtrar por Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                  <MenuItem value="processing">En Proceso</MenuItem>
                  <MenuItem value="completed">Completados</MenuItem>
                  <MenuItem value="delivered">Entregados</MenuItem>
                  <MenuItem value="cancelled">Cancelados</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Productos</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {order.user?.first_name} {order.user?.last_name}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getOrderStatusLabel(order.status)} 
                            color={getOrderStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleOpenOrderDialog(order)}
                          >
                            Actualizar Estado
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Resumen del Día
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Estadísticas de Hoy
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Total de Pedidos:</Typography>
                      <Typography variant="h6">{stats.total_orders_today}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Ventas Totales:</Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(stats.total_sales_today)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Completados:</Typography>
                      <Typography variant="h6" color="info.main">
                        {stats.completed_orders_today}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Promedio por Pedido:</Typography>
                      <Typography variant="h6">
                        {stats.total_orders_today > 0 
                          ? formatCurrency(stats.total_sales_today / stats.total_orders_today)
                          : formatCurrency(0)
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Estados de Pedidos
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Pending sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography>Pendientes:</Typography>
                      </Box>
                      <Chip label={stats.pending_orders} color="warning" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                        <Typography>En Proceso:</Typography>
                      </Box>
                      <Chip label={stats.processing_orders} color="info" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                        <Typography>Completados Hoy:</Typography>
                      </Box>
                      <Chip label={stats.completed_orders_today} color="success" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      <Dialog open={showOrderDialog} onClose={handleCloseOrderDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Actualizar Estado del Pedido #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={newStatus}
                label="Nuevo Estado"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="processing">En Proceso</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="delivered">Entregado</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>Cancelar</Button>
          <Button 
            onClick={handleUpdateOrderStatus} 
            variant="contained" 
            color="primary"
            disabled={!newStatus || newStatus === selectedOrder?.status}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </>
  );
};

export default EmployeeDashboard;