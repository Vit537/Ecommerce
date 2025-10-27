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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  PointOfSale,
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Receipt,
  Clear,
  ArrowBack,
  Print,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';
import orderService from '../services/orderService';
import { Product, ProductVariant } from '../services/productService';
import AppHeader from '../components/AppHeader';

interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  subtotal: number;
}

const POSSystem: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({});
      setProducts(response.results || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    setSearchResults(results);
  };

  const addToCart = (product: Product, variant: ProductVariant) => {
    const existingItem = cart.find(
      item => item.product.id === product.id && item.variant.id === variant.id
    );

    if (existingItem) {
      if (existingItem.quantity >= variant.stock) {
        setError(`Stock máximo disponible: ${variant.stock}`);
        return;
      }
      updateQuantity(existingItem, existingItem.quantity + 1);
    } else {
      const price = parseFloat(variant.price || product.base_price);
      const newItem: CartItem = {
        product,
        variant,
        quantity: 1,
        subtotal: price,
      };
      setCart([...cart, newItem]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const updateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item);
      return;
    }

    if (newQuantity > item.variant.stock) {
      setError(`Stock máximo disponible: ${item.variant.stock}`);
      return;
    }

    const price = parseFloat(item.variant.price || item.product.base_price);
    const updatedCart = cart.map(cartItem =>
      cartItem === item
        ? { ...cartItem, quantity: newQuantity, subtotal: price * newQuantity }
        : cartItem
    );
    setCart(updatedCart);
  };

  const removeFromCart = (item: CartItem) => {
    setCart(cart.filter(cartItem => cartItem !== item));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    setShowCheckoutDialog(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutDialog(false);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // Por ahora simulamos la creación de la orden
      // Cuando tengamos el método createOrder, lo usaremos aquí
      const mockOrderId = Math.floor(Math.random() * 10000);
      setLastOrderId(mockOrderId);
      
      setSuccess('Venta completada exitosamente');
      setShowCheckoutDialog(false);
      setShowReceiptDialog(true);
      
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      setError('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewSale = () => {
    clearCart();
    setShowReceiptDialog(false);
    setLastOrderId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppHeader title="Punto de Venta (POS)" />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Container maxWidth="xl">
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/employee')}
            >
              Volver
            </Button>
            <Typography variant="body1" color="text.secondary">
              Cajero: {user?.first_name} {user?.last_name}
            </Typography>
          </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Búsqueda de Productos */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, minHeight: '600px' }}>
              <Typography variant="h6" gutterBottom>
                Buscar Productos
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Buscar por nombre, marca o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                autoFocus
              />

              {searchResults.length > 0 && (
                <Paper variant="outlined" sx={{ maxHeight: '500px', overflow: 'auto' }}>
                  <List>
                    {searchResults.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem>
                          <ListItemText
                            primary={product.name}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {product.brand} - {product.category}
                                </Typography>
                                <br />
                                Precio: {formatCurrency(parseFloat(product.base_price))}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        
                        {/* Variantes */}
                        <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Variantes disponibles:
                          </Typography>
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            {product.variants?.map((variant) => (
                              <Grid item key={variant.id}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => addToCart(product, variant)}
                                  disabled={variant.stock === 0}
                                  startIcon={<Add />}
                                >
                                  {variant.color} - {variant.size}
                                  <Typography variant="caption" sx={{ ml: 1 }}>
                                    ({variant.stock} disponibles)
                                  </Typography>
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}

              {searchTerm && searchResults.length === 0 && (
                <Alert severity="info">
                  No se encontraron productos con "{searchTerm}"
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Carrito */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Carrito ({getTotalItems()} items)
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {cart.length > 0 && (
                  <IconButton color="error" onClick={clearCart} size="small">
                    <Delete />
                  </IconButton>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {cart.length === 0 ? (
                <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'text.secondary'
                }}>
                  <ShoppingCart sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                  <Typography>Carrito vacío</Typography>
                  <Typography variant="caption">
                    Busca y agrega productos para comenzar
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    {cart.map((item, index) => (
                      <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2">
                                {item.product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.variant.color} - {item.variant.size}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => removeFromCart(item)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => updateQuantity(item, item.quantity - 1)}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => updateQuantity(item, item.quantity + 1)}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="subtitle2">
                              {formatCurrency(item.subtotal)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatCurrency(getTotalAmount())}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>IVA (21%):</Typography>
                      <Typography>{formatCurrency(getTotalAmount() * 0.21)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(getTotalAmount() * 1.21)}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<Receipt />}
                    onClick={handleOpenCheckout}
                  >
                    Procesar Venta
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onClose={handleCloseCheckout} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirmar Venta
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Total a cobrar: <strong>{formatCurrency(getTotalAmount() * 1.21)}</strong>
            </Alert>
            
            <TextField
              fullWidth
              label="Nombre del Cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Email del Cliente (opcional)"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />

            <Typography variant="body2" color="text.secondary">
              {getTotalItems()} productos - {formatCurrency(getTotalAmount())} + IVA
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckout}>Cancelar</Button>
          <Button 
            onClick={handleCheckout} 
            variant="contained" 
            color="success"
            disabled={loading}
          >
            Confirmar Venta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onClose={handleNewSale} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 1 }} />
            Venta Completada
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Venta procesada exitosamente!
          </Alert>

          <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              RECIBO DE VENTA
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" gutterBottom>
              Orden #: {lastOrderId}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Fecha: {new Date().toLocaleDateString('es-ES')}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Cajero: {user?.first_name} {user?.last_name}
            </Typography>
            
            {customerName && (
              <Typography variant="body2" gutterBottom>
                Cliente: {customerName}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Productos:
            </Typography>
            {cart.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {item.quantity}x {item.product.name} ({item.variant.color} - {item.variant.size})
                </Typography>
                <Typography variant="body2" color="text.secondary" align="right">
                  {formatCurrency(item.subtotal)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(getTotalAmount())}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>IVA (21%):</Typography>
              <Typography>{formatCurrency(getTotalAmount() * 0.21)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatCurrency(getTotalAmount() * 1.21)}</Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Print />} onClick={handlePrintReceipt}>
            Imprimir
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleNewSale}
            startIcon={<ShoppingCart />}
          >
            Nueva Venta
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </>
  );
};

export default POSSystem;
