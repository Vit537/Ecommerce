import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  ExpandMore,
  Person,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: string;
  total: string;
}

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

interface Order {
  id: number;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  created_at: string;
  updated_at: string;
  shipping_address?: string;
  notes?: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

const OrderProcessing: React.FC = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: 'warning', icon: <ShoppingCart /> },
    { value: 'processing', label: 'Procesando', color: 'info', icon: <Edit /> },
    { value: 'shipped', label: 'Enviado', color: 'secondary', icon: <LocalShipping /> },
    { value: 'delivered', label: 'Entregado', color: 'success', icon: <CheckCircle /> },
    { value: 'cancelled', label: 'Cancelado', color: 'error', icon: <Cancel /> }
  ];

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Usar datos mock mientras tanto
      const mockOrders: Order[] = [
        {
          id: 1,
          customer: {
            id: 1,
            username: 'cliente1',
            email: 'cliente1@email.com',
            first_name: 'Juan',
            last_name: 'Pérez',
            phone_number: '+34 600 123 456'
          },
          items: [
            {
              id: 1,
              product_name: 'Camiseta Basic',
              variant_name: 'Talla M, Azul',
              quantity: 2,
              price: '25.00',
              total: '50.00'
            },
            {
              id: 2,
              product_name: 'Jeans Slim',
              variant_name: 'Talla 32, Negro',
              quantity: 1,
              price: '65.00',
              total: '65.00'
            }
          ],
          status: 'pending',
          total: '115.00',
          created_at: '2025-10-16T10:00:00Z',
          updated_at: '2025-10-16T10:00:00Z',
          shipping_address: 'Calle Mayor 123, Madrid, España',
          notes: 'Entrega por la mañana preferiblemente'
        },
        {
          id: 2,
          customer: {
            id: 2,
            username: 'maria_garcia',
            email: 'maria.garcia@email.com',
            first_name: 'María',
            last_name: 'García',
            phone_number: '+34 650 987 654'
          },
          items: [
            {
              id: 3,
              product_name: 'Vestido Verano',
              variant_name: 'Talla S, Rosa',
              quantity: 1,
              price: '45.00',
              total: '45.00'
            }
          ],
          status: 'processing',
          total: '45.00',
          created_at: '2025-10-16T09:30:00Z',
          updated_at: '2025-10-16T11:15:00Z',
          shipping_address: 'Avenida de la Paz 456, Barcelona, España'
        },
        {
          id: 3,
          customer: {
            id: 3,
            username: 'carlos_lopez',
            email: 'carlos.lopez@email.com',
            first_name: 'Carlos',
            last_name: 'López',
            phone_number: '+34 620 555 123'
          },
          items: [
            {
              id: 4,
              product_name: 'Zapatillas Deportivas',
              variant_name: 'Talla 42, Blanco',
              quantity: 1,
              price: '89.00',
              total: '89.00'
            }
          ],
          status: 'shipped',
          total: '89.00',
          created_at: '2025-10-15T16:20:00Z',
          updated_at: '2025-10-16T09:00:00Z',
          shipping_address: 'Plaza Central 789, Valencia, España'
        }
      ];
      
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      showNotification('Pedidos cargados correctamente', 'success');
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setStatusUpdateLoading(true);
    try {
      // Simular actualización del estado
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'], updated_at: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      applyFilters(updatedOrders);
      showNotification('Estado del pedido actualizado correctamente', 'success');
      
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = updatedOrders.find(o => o.id === orderId);
        if (updatedOrder) setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Error de conexión', 'error');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const applyFilters = (orderList = orders) => {
    let filtered = [...orderList];

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchLower) ||
        order.customer.first_name.toLowerCase().includes(searchLower) ||
        order.customer.last_name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.customer.username.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    applyFilters();
  };

  const getStatusChip = (status: Order['status']) => {
    const statusInfo = statusOptions.find(s => s.value === status);
    if (!statusInfo) return null;

    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color as any}
        size="small"
        variant="outlined"
      />
    );
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const formatCurrency = (amount: string) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1">
              📦 Gestión de Pedidos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchOrders}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>

          {/* Filtros */}
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <TextField
              fullWidth
              label="Buscar"
              placeholder="Número, cliente, email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status}
                label="Estado"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {status.icon}
                      {status.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Desde"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Hasta"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Estadísticas rápidas */}
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            {statusOptions.map((status) => {
              const count = orders.filter(order => order.status === status.value).length;
              return (
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }} key={status.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {status.icon}
                    <Typography variant="h6">{count}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {status.label}
                  </Typography>
                </Card>
              );
            })}
          </Box>

          {/* Tabla de pedidos */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pedido #</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.customer.first_name} {order.customer.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(order.status)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small" 
                            onClick={() => openOrderDetail(order)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={statusUpdateLoading}
                          >
                            {statusOptions.map((status) => (
                              <MenuItem key={status.value} value={status.value}>
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Modal de detalles del pedido */}
      <Dialog
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              Detalles del Pedido #{selectedOrder?.id}
            </Typography>
            {selectedOrder && getStatusChip(selectedOrder.status)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Información del cliente y pedido */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        👤 Información del Cliente
                      </Typography>
                      <Stack spacing={1}>
                        <Typography>
                          <strong>Nombre:</strong> {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
                        </Typography>
                        <Typography>
                          <strong>Email:</strong> {selectedOrder.customer.email}
                        </Typography>
                        <Typography>
                          <strong>Teléfono:</strong> {selectedOrder.customer.phone_number || 'No proporcionado'}
                        </Typography>
                        <Typography>
                          <strong>Usuario:</strong> {selectedOrder.customer.username}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📦 Información del Pedido
                      </Typography>
                      <Stack spacing={1}>
                        <Typography>
                          <strong>Fecha de creación:</strong> {formatDate(selectedOrder.created_at)}
                        </Typography>
                        <Typography>
                          <strong>Última actualización:</strong> {formatDate(selectedOrder.updated_at)}
                        </Typography>
                        <Typography>
                          <strong>Total:</strong> {formatCurrency(selectedOrder.total)}
                        </Typography>
                        {selectedOrder.notes && (
                          <Typography>
                            <strong>Notas:</strong> {selectedOrder.notes}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Dirección de envío */}
                {selectedOrder.shipping_address && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🚚 Dirección de Envío
                      </Typography>
                      <Typography>{selectedOrder.shipping_address}</Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Productos */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🛍️ Productos ({selectedOrder.items.length})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Variante</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>{item.variant_name || '-'}</TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderModal(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación */}
      {notification && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.type}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default OrderProcessing;