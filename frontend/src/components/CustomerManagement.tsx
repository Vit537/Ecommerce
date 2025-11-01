import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/env';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  department?: string;
  city?: string;
  date_of_birth?: string;
  gender?: string;
  date_joined: string;
  last_login?: string;
  is_active: boolean;
}

interface CustomerOrder {
  id: number;
  status: string;
  total: string;
  created_at: string;
  items_count: number;
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  average_order_value: number;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

const CustomerManagement: React.FC = () => {
  const { user, token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name'
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/authentication/customers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } else {
        showNotification('Error al cargar clientes', 'error');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showNotification('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: number) => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/orders/customer/${customerId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerOrders(data);
        
        // Calcular estadísticas
        const stats: CustomerStats = {
          total_orders: data.length,
          total_spent: data.reduce((sum: number, order: CustomerOrder) => sum + parseFloat(order.total), 0),
          last_order_date: data.length > 0 ? data[0].created_at : undefined,
          average_order_value: data.length > 0 ? 
            data.reduce((sum: number, order: CustomerOrder) => sum + parseFloat(order.total), 0) / data.length : 0
        };
        setCustomerStats(stats);
      } else {
        showNotification('Error al cargar pedidos del cliente', 'error');
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      showNotification('Error de conexión', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId: number, newStatus: boolean) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/authentication/customers/${customerId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomers(customers.map(customer => 
          customer.id === customerId ? updatedCustomer : customer
        ));
        applyFilters(customers.map(customer => 
          customer.id === customerId ? updatedCustomer : customer
        ));
        showNotification(
          `Cliente ${newStatus ? 'activado' : 'desactivado'} correctamente`, 
          'success'
        );
        
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer(updatedCustomer);
        }
      } else {
        showNotification('Error al actualizar el estado del cliente', 'error');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const applyFilters = (customerList = customers) => {
    let filtered = [...customerList];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.first_name.toLowerCase().includes(searchLower) ||
        customer.last_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.username.toLowerCase().includes(searchLower) ||
        (customer.phone_number && customer.phone_number.includes(filters.search))
      );
    }

    // Filtro por estado
    if (filters.status === 'active') {
      filtered = filtered.filter(customer => customer.is_active);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(customer => !customer.is_active);
    }

    // Filtro por fecha de registro
    if (filters.dateFrom) {
      filtered = filtered.filter(customer => 
        new Date(customer.date_joined) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(customer => 
        new Date(customer.date_joined) <= new Date(filters.dateTo)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'date_joined':
          return new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime();
        case 'last_login':
          if (!a.last_login && !b.last_login) return 0;
          if (!a.last_login) return 1;
          if (!b.last_login) return -1;
          return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
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

  useEffect(() => {
    if (user && token) {
      fetchCustomers();
    }
  }, [user, token]);

  useEffect(() => {
    applyFilters();
  }, [filters, customers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Notification */}
      {notification && (
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1400 }}>
          <Card sx={{ bgcolor: notification.type === 'success' ? 'success.main' : notification.type === 'error' ? 'error.main' : 'info.main', color: 'white', p: 1 }}>
            <CardContent sx={{ p: 1 }}>{notification.message}</CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Gestión de Clientes</Typography>
        <Typography variant="body2" color="text.secondary">Administra la información de clientes y su historial de compras</Typography>
      </Box>

      {/* Estadísticas generales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">{customers.length}</Typography>
              <Typography variant="body2">Total Clientes</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">{customers.filter(c => c.is_active).length}</Typography>
              <Typography variant="body2">Activos</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">{customers.filter(c => !c.is_active).length}</Typography>
              <Typography variant="body2">Inactivos</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="secondary">{customers.filter(c => c.last_login && new Date(c.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</Typography>
              <Typography variant="body2">Activos (7 días)</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flexBasis: { xs: '100%', md: '33.3333%' } }}>
            <TextField fullWidth label="Buscar" placeholder="Nombre, email, teléfono..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </Box>
          <Box sx={{ flexBasis: { xs: '50%', md: '16.6667%' } }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={filters.status} label="Estado" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexBasis: { xs: '50%', md: '16.6667%' } }}>
            <FormControl fullWidth>
              <InputLabel>Ordenar</InputLabel>
              <Select value={filters.sortBy} label="Ordenar" onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="date_joined">Fecha registro</MenuItem>
                <MenuItem value="last_login">Último acceso</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexBasis: { xs: '50%', md: '16.6667%' } }}>
            <TextField fullWidth type="date" label="Desde" InputLabelProps={{ shrink: true }} value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          </Box>
          <Box sx={{ flexBasis: { xs: '50%', md: '16.6667%' } }}>
            <TextField fullWidth type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
          </Box>
        </Box>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell>Último acceso</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{customer.first_name} {customer.last_name}</Typography>
                    <Typography variant="caption">@{customer.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{customer.email}</Typography>
                    {customer.phone_number && <Typography variant="caption" color="text.secondary">{customer.phone_number}</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip label={customer.is_active ? 'Activo' : 'Inactivo'} color={customer.is_active ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(customer.date_joined)}</TableCell>
                  <TableCell>{customer.last_login ? formatDate(customer.last_login) : 'Nunca'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => { setSelectedCustomer(customer); fetchCustomerOrders(customer.id); setShowCustomerModal(true); }}>Ver detalles</Button>
                    <Button size="small" color={customer.is_active ? 'error' : 'success'} onClick={() => toggleCustomerStatus(customer.id, !customer.is_active)}>
                      {customer.is_active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredCustomers.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No se encontraron clientes</Typography>
          </Box>
        )}
      </Card>
      
      {/* Customer details modal (MUI) */}
      {selectedCustomer && (
        <Dialog open={showCustomerModal} onClose={() => setShowCustomerModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Detalles de {selectedCustomer.first_name} {selectedCustomer.last_name}
            <IconButton aria-label="close" onClick={() => setShowCustomerModal(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flexBasis: { xs: '100%', md: '50%' } }}>
                <Typography variant="h6" gutterBottom>Información Personal</Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Nombre</Typography>
                  <Typography>{selectedCustomer.first_name}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Apellido</Typography>
                  <Typography>{selectedCustomer.last_name}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Usuario</Typography>
                  <Typography>@{selectedCustomer.username}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{selectedCustomer.email}</Typography>
                </Box>
                {selectedCustomer.phone_number && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Teléfono</Typography>
                    <Typography>{selectedCustomer.phone_number}</Typography>
                  </Box>
                )}
                {selectedCustomer.address && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Dirección</Typography>
                    <Typography>{selectedCustomer.address}</Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Registro</Typography>
                  <Typography>{formatDate(selectedCustomer.date_joined)}</Typography>
                </Box>
              </Box>

              <Box sx={{ flexBasis: { xs: '100%', md: '50%' } }}>
                <Typography variant="h6" gutterBottom>Estadísticas de Compras</Typography>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
                    <CircularProgress />
                  </Box>
                ) : customerStats ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ flexBasis: '50%' }}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="h5">{customerStats.total_orders}</Typography>
                        <Typography variant="caption">Total Pedidos</Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flexBasis: '50%' }}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="h5">${customerStats.total_spent.toFixed(2)}</Typography>
                        <Typography variant="caption">Total Gastado</Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flexBasis: '50%' }}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="h5">${customerStats.average_order_value.toFixed(2)}</Typography>
                        <Typography variant="caption">Promedio por Pedido</Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flexBasis: '50%' }}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="body2">Último Pedido</Typography>
                        <Typography variant="caption">{customerStats.last_order_date ? formatDate(customerStats.last_order_date) : 'Nunca'}</Typography>
                      </Card>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No hay datos de compras</Typography>
                )}
              </Box>

              <Box sx={{ flexBasis: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Historial de Pedidos</Typography>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
                    <CircularProgress />
                  </Box>
                ) : customerOrders.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Items</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Fecha</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>
                              <Chip label={getStatusInfo(order.status).label} size="small" />
                            </TableCell>
                            <TableCell>{order.items_count}</TableCell>
                            <TableCell>${parseFloat(order.total).toFixed(2)}</TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">Este cliente no ha realizado pedidos</Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button color={selectedCustomer.is_active ? 'error' : 'success'} onClick={() => toggleCustomerStatus(selectedCustomer.id, !selectedCustomer.is_active)}>
              {selectedCustomer.is_active ? 'Desactivar Cliente' : 'Activar Cliente'}
            </Button>
            <Button onClick={() => setShowCustomerModal(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CustomerManagement;