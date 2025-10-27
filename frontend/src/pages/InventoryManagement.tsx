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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Inventory,
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  Warning,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import productService from '../services/productService';
import { Product, ProductVariant } from '../services/productService';
import AppHeader from '../components/AppHeader';

interface InventoryStats {
  total_products: number;
  total_variants: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_stock_value: number;
}

const InventoryManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total_products: 0,
    total_variants: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_stock_value: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    base_price: '',
  });

  const [variantForm, setVariantForm] = useState({
    color: '',
    size: '',
    stock: '',
    price: '',
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, stockFilter, products]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProducts({});
      const allProducts = response.results || [];

      // Procesar productos para que funcionen con la interfaz actual
      const processedProducts = allProducts.map(product => ({
        ...product,
        base_price: product.price, // Usar price como base_price
        variants: product.variants || [], // Asegurar que variants existe
        category: typeof product.category === 'object' ? product.category?.name : product.category,
        brand: typeof product.brand === 'object' ? product.brand?.name : product.brand,
      }));

      // Cargar categorías y marcas únicas
      const uniqueCategories = [...new Set(processedProducts.map(p => p.category).filter(Boolean))];
      const uniqueBrands = [...new Set(processedProducts.map(p => p.brand).filter(Boolean))];
      
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
      setProducts(processedProducts);

      // Calcular estadísticas
      const totalVariants = processedProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
      
      const lowStockVariants = processedProducts.reduce((count, p) => {
        const lowStock = p.variants?.filter(v => (v.stock || v.stock_quantity || 0) > 0 && (v.stock || v.stock_quantity || 0) < 10).length || 0;
        return count + lowStock;
      }, 0);

      const outOfStockVariants = processedProducts.reduce((count, p) => {
        const outOfStock = p.variants?.filter(v => (v.stock || v.stock_quantity || 0) === 0).length || 0;
        return count + outOfStock;
      }, 0);

      const totalValue = processedProducts.reduce((sum, p) => {
        const productValue = p.variants?.reduce((vSum, v) => {
          const price = parseFloat(v.price || p.base_price || p.price || '0');
          const stock = v.stock || v.stock_quantity || 0;
          return vSum + (price * stock);
        }, 0) || 0;
        return sum + productValue;
      }, 0);

      setStats({
        total_products: processedProducts.length,
        total_variants: totalVariants,
        low_stock_count: lowStockVariants,
        out_of_stock_count: outOfStockVariants,
        total_stock_value: totalValue,
      });

    } catch (error: any) {
      console.error('Error loading inventory:', error);
      setError('Error al cargar el inventario. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Filtro de stock
    if (stockFilter === 'low') {
      filtered = filtered.filter(p => 
        p.variants?.some(v => {
          const stock = v.stock || v.stock_quantity || 0;
          return stock > 0 && stock < 10;
        })
      );
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => 
        p.variants?.every(v => (v.stock || v.stock_quantity || 0) === 0)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        brand: product.brand || '',
        base_price: product.base_price,
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: '',
        brand: '',
        base_price: '',
      });
    }
    setShowProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setShowProductDialog(false);
    setSelectedProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: '',
      brand: '',
      base_price: '',
    });
  };

  const handleOpenVariantDialog = (product: Product) => {
    setSelectedProduct(product);
    setVariantForm({
      color: '',
      size: '',
      stock: '',
      price: product.base_price,
    });
    setShowVariantDialog(true);
  };

  const handleCloseVariantDialog = () => {
    setShowVariantDialog(false);
    setSelectedProduct(null);
    setVariantForm({
      color: '',
      size: '',
      stock: '',
      price: '',
    });
  };

  const handleSaveProduct = async () => {
    try {
      // Validar campos requeridos
      if (!productForm.name.trim()) {
        setError('El nombre del producto es requerido');
        return;
      }
      if (!productForm.base_price || parseFloat(productForm.base_price) <= 0) {
        setError('El precio debe ser mayor a 0');
        return;
      }

      const productData: Partial<Product> = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category || undefined,
        brand: productForm.brand || undefined,
        price: productForm.base_price,
        status: 'active',
        is_featured: false,
        target_gender: 'unisex',
      };

      if (selectedProduct) {
        // Actualizar producto existente
        await productService.updateProduct(selectedProduct.id, productData);
        setSuccess('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await productService.createProduct(productData);
        setSuccess('Producto creado correctamente');
      }
      
      handleCloseProductDialog();
      await loadInventoryData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message || 'Error al guardar el producto');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await productService.deleteProduct(product.id);
      setSuccess('Producto eliminado correctamente');
      await loadInventoryData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Error al eliminar el producto');
    }
  };

  const handleSaveVariant = async () => {
    if (!selectedProduct) {
      setError('No hay producto seleccionado');
      return;
    }

    try {
      // Validar campos requeridos
      if (!variantForm.color.trim() && !variantForm.size.trim()) {
        setError('Debe especificar al menos color o talla');
        return;
      }
      if (!variantForm.stock || parseInt(variantForm.stock) < 0) {
        setError('El stock debe ser mayor o igual a 0');
        return;
      }
      if (!variantForm.price || parseFloat(variantForm.price) <= 0) {
        setError('El precio debe ser mayor a 0');
        return;
      }

      const variantData: Partial<ProductVariant> = {
        product: selectedProduct.id,
        sku_variant: `${selectedProduct.sku || selectedProduct.id}-${variantForm.color}-${variantForm.size}`,
        stock_quantity: parseInt(variantForm.stock),
        price_adjustment: (parseFloat(variantForm.price) - parseFloat(selectedProduct.base_price || selectedProduct.price)).toString(),
        is_active: true,
        min_stock_level: 5,
        reserved_quantity: 0,
        images: [],
      };

      // Si hay color o size, necesitamos obtener sus IDs o crearlos
      // Por ahora usamos los valores directamente
      await productService.createVariant(selectedProduct.id, variantData);
      
      setSuccess('Variante agregada correctamente');
      handleCloseVariantDialog();
      await loadInventoryData();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      setError(error.message || 'Error al guardar la variante');
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(numAmount);
  };

  const getStockStatus = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.stock_quantity || 0), 0) || 0;
    if (totalStock === 0) return { label: 'Sin Stock', color: 'error' as const };
    if (totalStock < 10) return { label: 'Stock Bajo', color: 'warning' as const };
    return { label: 'En Stock', color: 'success' as const };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Gestión de Inventario" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Cargando inventario...</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Gestión de Inventario" />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Container maxWidth="xl">
          {/* Action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/admin')}
            >
              Volver
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenProductDialog()}
              >
                Nuevo Producto
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<Refresh />}
                onClick={loadInventoryData}
              >
                Actualizar
              </Button>
            </Box>
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.total_products}</Typography>
                    <Typography variant="body2">Productos</Typography>
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
                    <Typography variant="h4">{stats.total_variants}</Typography>
                    <Typography variant="body2">Variantes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Warning sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.low_stock_count}</Typography>
                    <Typography variant="body2">Stock Bajo</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={{ mr: 1 }}>€</Typography>
                  <Box>
                    <Typography variant="h4">{formatCurrency(stats.total_stock_value)}</Typography>
                    <Typography variant="body2">Valor Total</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, marca o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Categoría"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado de Stock</InputLabel>
                <Select
                  value={stockFilter}
                  label="Estado de Stock"
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="low">Stock Bajo</MenuItem>
                  <MenuItem value="out">Sin Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} productos encontrados
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lista de Productos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Precio Base</TableCell>
                  <TableCell>Variantes</TableCell>
                  <TableCell>Stock Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary">
                        No se encontraron productos. {products.length === 0 ? 'Agregue algunos productos para comenzar.' : 'Intente ajustar los filtros.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.stock_quantity || 0), 0) || 0;
                    const status = getStockStatus(product);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell>{product.brand || '-'}</TableCell>
                        <TableCell>{formatCurrency(product.base_price || product.price)}</TableCell>
                        <TableCell>{product.variants?.length || 0}</TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell>
                          <Chip 
                            label={status.label} 
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Editar producto">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenProductDialog(product)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Agregar variante">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOpenVariantDialog(product)}
                              >
                                <Add />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar producto">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onClose={handleCloseProductDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Producto"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Categoría"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Marca"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Precio Base"
              type="number"
              value={productForm.base_price}
              onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveProduct} 
            variant="contained" 
            color="primary"
            disabled={!productForm.name || !productForm.base_price}
          >
            {selectedProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={showVariantDialog} onClose={handleCloseVariantDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Variante a "{selectedProduct?.name}"
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Color"
              value={variantForm.color}
              onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
            />
            <TextField
              fullWidth
              label="Talla"
              value={variantForm.size}
              onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
            />
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={variantForm.stock}
              onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
            />
            <TextField
              fullWidth
              label="Precio (dejar vacío para usar precio base)"
              type="number"
              value={variantForm.price}
              onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVariantDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveVariant} 
            variant="contained" 
            color="primary"
            disabled={!variantForm.color || !variantForm.size || !variantForm.stock}
          >
            Agregar Variante
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </>
  );
};

export default InventoryManagement;
