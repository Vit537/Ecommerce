import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productService, Product } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import Checkout from '../components/Checkout';
import OrderHistory from '../components/OrderHistory';
import UserProfile from '../components/UserProfile';
import Notification from '../components/Notification';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';

const CustomerShop: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, addToCart, removeCartItem, updateCartItem, totalPrice, totalItems, loading: cartLoading } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, brandsData] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
      await loadProducts();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('error', 'Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const filters: any = {};
      
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedBrand) filters.brand = selectedBrand;
      if (minPrice) filters.min_price = minPrice;
      if (maxPrice) filters.max_price = maxPrice;
      if (searchTerm) filters.search = searchTerm;

      const response = await productService.getProducts(filters);
      setProducts(response.results || []);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Error al cargar productos');
      setProducts([]);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      showNotification('warning', 'Por favor selecciona una variante');
      return;
    }

    try {
      const success = await addToCart(selectedVariant.id, quantity);
      if (success) {
        showNotification('success', `${quantity} ${selectedProduct?.name} agregado(s) al carrito`);
        setSelectedProduct(null);
        setSelectedVariant(null);
        setQuantity(1);
      } else {
        showNotification('error', 'No se pudo agregar al carrito');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showNotification('error', error.message || 'Error al agregar al carrito');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    showNotification('success', `¡Pedido #${orderId.slice(0, 8)} creado exitosamente!`);
    setShowCart(false);
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      showNotification('warning', 'El carrito está vacío');
      return;
    }
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <LoadingSpinner fullScreen text="Cargando tienda..." />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Mi Tienda de Ropa</Typography>
            <Typography variant="caption" color="text.secondary">Bienvenido, <Button onClick={() => setShowUserProfile(true)} variant="text">{user?.first_name} {user?.last_name}</Button></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button onClick={() => setShowOrderHistory(true)}>📋 Mis Pedidos</Button>
            <IconButton color="primary" onClick={() => setShowCart(!showCart)}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <Button color="error" variant="contained" onClick={logout}>Cerrar Sesión</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filtros */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterListIcon color="action" />
            <TextField
              label="Buscar productos"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Categoría"
              variant="outlined"
              size="small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Marca"
              variant="outlined"
              size="small"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Precio Min"
              variant="outlined"
              size="small"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: 100 }}
            />
            <TextField
              label="Precio Max"
              variant="outlined"
              size="small"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: 100 }}
            />
            <Button variant="contained" onClick={handleSearch}>Buscar</Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedBrand('');
                setMinPrice('');
                setMaxPrice('');
                loadProducts();
              }}
            >
              Limpiar
            </Button>
          </Box>
        </Card>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: showCart ? 2 : 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Productos Disponibles</Typography>
              <Chip label={`${products.length} productos`} color="primary" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {products.map((product) => (
                <Card key={product.id}>
                  {product.image ? (
                    <CardMedia component="img" height="180" image={product.image} alt={product.name} />
                  ) : (
                    <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>👕</Box>
                  )}
                  <CardContent>
                    <Typography variant="h6">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.brand.name}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{product.description}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h6" color="primary">{formatCurrency(product.price)}</Typography>
                      <Button variant="contained" onClick={() => setSelectedProduct(product)}>Ver Detalles</Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{product.variants.length} variante(s) disponible(s)</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {showCart && (
            <Box sx={{ width: '33%', position: 'sticky', top: 24 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Carrito de Compras</Typography>
                  {cartLoading && <LoadingSpinner text="Actualizando carrito..." />}

                  {items.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Tu carrito está vacío</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {items.map((item) => (
                        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">{item.product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.product_variant.size?.name} - {item.product_variant.color?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>
                              {formatCurrency(parseFloat(item.unit_price))}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button size="small" onClick={() => updateCartItem(item.id, item.quantity - 1)}>-</Button>
                            <Typography>{item.quantity}</Typography>
                            <Button size="small" onClick={() => updateCartItem(item.id, item.quantity + 1)}>+</Button>
                          </Box>
                          <Button color="error" size="small" onClick={() => removeCartItem(item.id)}>✕</Button>
                        </Box>
                      ))}

                      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <Typography>Total:</Typography>
                          <Typography color="primary">{formatCurrency(totalPrice)}</Typography>
                        </Box>
                        <Button fullWidth variant="contained" color="success" sx={{ mt: 2 }} onClick={handleProceedToCheckout}>Proceder al Pago</Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Container>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onClose={() => { setSelectedProduct(null); setSelectedVariant(null); setQuantity(1); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct?.name}
          <IconButton aria-label="close" onClick={() => { setSelectedProduct(null); setSelectedVariant(null); setQuantity(1); }} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">{selectedProduct?.description}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>{selectedProduct ? formatCurrency(selectedProduct.price) : ''}</Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Seleccionar Variante:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {selectedProduct?.variants.map((variant) => (
                <Button key={variant.id} variant={selectedVariant?.id === variant.id ? 'contained' : 'outlined'} onClick={() => setSelectedVariant(variant)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{variant.size.name} - <span style={{ color: variant.color.hex_code }}>{variant.color.name}</span></span>
                    <span>Stock: {variant.stock}</span>
                  </Box>
                </Button>
              ))}
            </Box>
          </Box>

          {selectedVariant && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Cantidad:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <Typography>{quantity}</Typography>
                <Button onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}>+</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedProduct(null); setSelectedVariant(null); setQuantity(1); }}>Cerrar</Button>
          <Button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0} variant="contained">{selectedVariant?.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}</Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Modal */}
      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Order History Modal */}
      <OrderHistory
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </Box>
  );
};

export default CustomerShop;