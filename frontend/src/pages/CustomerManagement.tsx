import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../contexts/ThemeContext';
import {
  Customer,
  CustomerStats,
  CreateCustomerData,
  UpdateCustomerData,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats,
  toggleCustomerStatus,
  verifyCustomerEmail,
} from '../services/customerService';

export default function CustomerManagement() {
  const { mode } = useTheme();
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CreateCustomerData | UpdateCustomerData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    date_of_birth: '',
    identification_number: '',
  });

  // Load data on mount
  useEffect(() => {
    loadCustomers();
    loadStats();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.first_name.toLowerCase().includes(query) ||
          c.last_name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.identification_number?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) =>
        statusFilter === 'active' ? c.is_active : !c.is_active
      );
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter((c) =>
        verificationFilter === 'verified' ? c.is_email_verified : !c.is_email_verified
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, statusFilter, verificationFilter]);

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCustomers();
      // Validar que data sea un array
      const customersArray = Array.isArray(data) ? data : [];
      setCustomers(customersArray);
      setFilteredCustomers(customersArray);
    } catch (err: any) {
      setError(err.message);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const data = await getCustomerStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Handle create customer
  const handleCreate = () => {
    setDialogMode('create');
    setSelectedCustomer(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      date_of_birth: '',
      identification_number: '',
    });
    setOpenDialog(true);
  };

  // Handle edit customer
  const handleEdit = async (customer: Customer) => {
    setDialogMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone || '',
      address: customer.address || '',
      date_of_birth: customer.date_of_birth || '',
      identification_number: customer.identification_number || '',
    });
    setOpenDialog(true);
  };

  // Handle save (create or update)
  const handleSave = async () => {
    try {
      setError(null);
      
      if (dialogMode === 'create') {
        const createData = formData as CreateCustomerData;
        
        // Validation
        if (!createData.email || !createData.password || !createData.first_name || !createData.last_name) {
          setError('Por favor complete los campos requeridos');
          return;
        }
        
        await createCustomer(createData);
        setSuccess('Cliente creado exitosamente');
      } else {
        if (!selectedCustomer) return;
        
        const updateData = formData as UpdateCustomerData;
        await updateCustomer(selectedCustomer.id, updateData);
        setSuccess('Cliente actualizado exitosamente');
      }
      
      setOpenDialog(false);
      loadCustomers();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      setError(null);
      await deleteCustomer(customerToDelete.id);
      setSuccess('Cliente eliminado exitosamente');
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      loadCustomers();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (customer: Customer) => {
    try {
      setError(null);
      await toggleCustomerStatus(customer.id, !customer.is_active);
      setSuccess(`Cliente ${customer.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadCustomers();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle verify email
  const handleVerifyEmail = async (customer: Customer) => {
    try {
      setError(null);
      await verifyCustomerEmail(customer.id);
      setSuccess('Email verificado exitosamente');
      loadCustomers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle view orders
  const handleViewOrders = async (customer: Customer) => {
    try {
      setError(null);
      setSelectedCustomer(customer);
      const orders = await getCustomerOrders(customer.id);
      setSelectedCustomerOrders(orders);
      setOrdersDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(value);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box className={mode === 'dark' ? 'dark' : ''}>
      <AppHeader title="Gestión de Clientes" />
      
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Administra y supervisa tu base de clientes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadCustomers();
                loadStats();
              }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Nuevo Cliente
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 3
            }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total_customers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clientes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.active_customers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clientes Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <PersonAddIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.customers_this_month}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nuevos Este Mes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(stats.average_lifetime_value)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Valor Promedio
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' },
              gap: 2,
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, email, teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                label="Estado"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Verificación</InputLabel>
              <Select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as any)}
                label="Verificación"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="verified">Verificados</MenuItem>
                <MenuItem value="unverified">Sin Verificar</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {filteredCustomers.length} de {customers.length} clientes
            </Typography>
          </Box>
        </Paper>

        {/* Customers Table */}
        <Paper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Contacto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell>Pedidos</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {customer.first_name[0]}{customer.last_name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {customer.first_name} {customer.last_name}
                            </Typography>
                            {customer.identification_number && (
                              <Typography variant="caption" color="text.secondary">
                                CI: {customer.identification_number}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          {customer.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{customer.phone}</Typography>
                            </Box>
                          )}
                          {customer.address && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <HomeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                {customer.address}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            size="small"
                            label={customer.is_active ? 'Activo' : 'Inactivo'}
                            color={customer.is_active ? 'success' : 'default'}
                          />
                          {customer.is_email_verified ? (
                            <Chip
                              size="small"
                              label="Verificado"
                              color="info"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="Sin Verificar"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{customer.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(customer.created_at)}
                        </Typography>
                        {customer.last_login && (
                          <Typography variant="caption" color="text.secondary">
                            Último: {formatDate(customer.last_login)}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleViewOrders(customer)}
                        >
                          {customer.total_orders || 0}
                        </Button>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(customer)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {!customer.is_email_verified && (
                            <Tooltip title="Verificar Email">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleVerifyEmail(customer)}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title={customer.is_active ? 'Desactivar' : 'Activar'}>
                            <IconButton
                              size="small"
                              color={customer.is_active ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(customer)}
                            >
                              {customer.is_active ? (
                                <CancelIcon fontSize="small" />
                              ) : (
                                <CheckCircleIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(customer)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron clientes
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  label="Nombre *"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Apellido *"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />

                {dialogMode === 'create' && (
                  <>
                    <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={(formData as CreateCustomerData).email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value } as CreateCustomerData)
                      }
                    />
                    <TextField
                      fullWidth
                      label="Contraseña *"
                      type="password"
                      value={(formData as CreateCustomerData).password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value } as CreateCustomerData)
                      }
                    />
                  </>
                )}

                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="CI/NIT"
                  value={formData.identification_number}
                  onChange={(e) =>
                    setFormData({ ...formData, identification_number: e.target.value })
                  }
                />

                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                label="Dirección"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave}>
              {dialogMode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar al cliente{' '}
              <strong>
                {customerToDelete?.first_name} {customerToDelete?.last_name}
              </strong>
              ?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Orders Dialog */}
        <Dialog
          open={ordersDialogOpen}
          onClose={() => setOrdersDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Pedidos de {selectedCustomer?.first_name} {selectedCustomer?.last_name}
          </DialogTitle>
          <DialogContent>
            {selectedCustomerOrders.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                Este cliente no tiene pedidos registrados
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCustomerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.order_number}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={order.status}
                            color={
                              order.status === 'completed'
                                ? 'success'
                                : order.status === 'cancelled'
                                ? 'error'
                                : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(parseFloat(order.total_amount))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrdersDialogOpen(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
