import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import {
  Box,
  Grid,
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
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

interface ProductVariant {
  id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  category: string;
  brand: string;
  low_stock_threshold: number;
}

interface StockAdjustment {
  variant_id: string;
  adjustment_type: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
}

interface InventoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    brand: 'all',
    stockStatus: 'all'
  });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    variant_id: '',
    adjustment_type: 'add',
    quantity: 0,
    reason: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // Mock data por ahora - en producción sería una llamada a la API
      const mockVariants: ProductVariant[] = [
        {
          id: '1',
          product_name: 'Camiseta Nike',
          variant_name: 'M - Azul',
          sku: 'NIKE-SHIRT-M-BLUE',
          size: 'M',
          color: 'Azul',
          stock: 15,
          price: 29.99,
          category: 'Camisetas',
          brand: 'Nike',
          low_stock_threshold: 10
        },
        {
          id: '2',
          product_name: 'Camiseta Nike',
          variant_name: 'L - Rojo',
          sku: 'NIKE-SHIRT-L-RED',
          size: 'L',
          color: 'Rojo',
          stock: 3,
          price: 39.99,
          category: 'Camisetas',
          brand: 'Nike',
          low_stock_threshold: 5
        },
        {
          id: '3',
          product_name: 'Pantalón Adidas',
          variant_name: 'M - Negro',
          sku: 'ADIDAS-PANTS-M-BLACK',
          size: 'M',
          color: 'Negro',
          stock: 0,
          price: 59.99,
          category: 'Pantalones',
          brand: 'Adidas',
          low_stock_threshold: 3
        },
        {
          id: '4',
          product_name: 'Zapatillas Puma',
          variant_name: '42 - Blanco',
          sku: 'PUMA-SHOES-42-WHITE',
          size: '42',
          color: 'Blanco',
          stock: 25,
          price: 89.99,
          category: 'Calzado',
          brand: 'Puma',
          low_stock_threshold: 8
        }
      ];

      setVariants(mockVariants);
      setFilteredVariants(mockVariants);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...variants];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(variant => 
        variant.product_name.toLowerCase().includes(searchLower) ||
        variant.variant_name.toLowerCase().includes(searchLower) ||
        variant.sku.toLowerCase().includes(searchLower) ||
        variant.brand.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría
    if (filters.category !== 'all') {
      filtered = filtered.filter(variant => variant.category === filters.category);
    }

    // Filtro por marca
    if (filters.brand !== 'all') {
      filtered = filtered.filter(variant => variant.brand === filters.brand);
    }

    // Filtro por estado de stock
    if (filters.stockStatus === 'low') {
      filtered = filtered.filter(variant => variant.stock <= variant.low_stock_threshold && variant.stock > 0);
    } else if (filters.stockStatus === 'out') {
      filtered = filtered.filter(variant => variant.stock === 0);
    } else if (filters.stockStatus === 'good') {
      filtered = filtered.filter(variant => variant.stock > variant.low_stock_threshold);
    }

    setFilteredVariants(filtered);
  };

  const handleStockAdjustment = async () => {
    if (!selectedVariant || adjustment.quantity <= 0) return;

    try {
      let newStock = selectedVariant.stock;
      
      switch (adjustment.adjustment_type) {
        case 'add':
          newStock += adjustment.quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, newStock - adjustment.quantity);
          break;
        case 'set':
          newStock = adjustment.quantity;
          break;
      }

      // Actualizar el stock localmente (en producción sería una llamada a la API)
      const updatedVariants = variants.map(variant => 
        variant.id === selectedVariant.id 
          ? { ...variant, stock: newStock }
          : variant
      );

      setVariants(updatedVariants);
      applyFilters();

      // Cerrar modal y resetear
      setShowAdjustModal(false);
      setSelectedVariant(null);
      setAdjustment({
        variant_id: '',
        adjustment_type: 'add',
        quantity: 0,
        reason: ''
      });

      alert('Stock actualizado correctamente');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error al actualizar stock');
    }
  };

  const getStockStatus = (variant: ProductVariant) => {
    if (variant.stock === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-800' };
    } else if (variant.stock <= variant.low_stock_threshold) {
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Stock Normal', color: 'bg-green-100 text-green-800' };
    }
  };

  const categories = [...new Set(variants.map(v => v.category))];
  const brands = [...new Set(variants.map(v => v.brand))];

  const stats = {
    totalVariants: variants.length,
    lowStockCount: variants.filter(v => v.stock <= v.low_stock_threshold && v.stock > 0).length,
    outOfStockCount: variants.filter(v => v.stock === 0).length,
    totalValue: variants.reduce((sum, v) => sum + (v.stock * v.price), 0)
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [filters, variants]);

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Inventario" size="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Estadísticas */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">{stats.totalVariants}</Typography>
                  <Typography variant="body2">Total Variantes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="warning.main">{stats.lowStockCount}</Typography>
                  <Typography variant="body2">Stock Bajo</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="error.main">{stats.outOfStockCount}</Typography>
                  <Typography variant="body2">Sin Stock</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">{stats.totalValue.toFixed(2)}</Typography>
                  <Typography variant="body2">Valor Total</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filtros */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth placeholder="Buscar productos..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select value={filters.category} label="Categoría" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <MenuItem value="all">Todas las categorías</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Marca</InputLabel>
                <Select value={filters.brand} label="Marca" onChange={(e) => setFilters({ ...filters, brand: e.target.value })}>
                  <MenuItem value="all">Todas las marcas</MenuItem>
                  {brands.map(brand => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select value={filters.stockStatus} label="Estado" onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}>
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="good">Stock Normal</MenuItem>
                  <MenuItem value="low">Stock Bajo</MenuItem>
                  <MenuItem value="out">Sin Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Tabla de inventario */}
          <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredVariants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No se encontraron productos</TableCell>
                  </TableRow>
                ) : (
                  filteredVariants.map((variant) => {
                    const status = getStockStatus(variant);
                    return (
                      <TableRow key={variant.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{variant.product_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{variant.variant_name} • {variant.brand}</Typography>
                        </TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{variant.stock} unidades</Typography>
                          <Typography variant="caption" color="text.secondary">Mín: {variant.low_stock_threshold}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={status.label} size="small" color={status.label === 'Sin Stock' ? 'error' : status.label === 'Stock Bajo' ? 'warning' : 'success'} />
                        </TableCell>
                        <TableCell>${variant.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => { setSelectedVariant(variant); setAdjustment({ ...adjustment, variant_id: variant.id }); setShowAdjustModal(true); }}>
                            Ajustar Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Modal de ajuste de stock */}
      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Ajustar Stock" size="md">
        {selectedVariant && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="h6">{selectedVariant.product_name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedVariant.variant_name}</Typography>
              <Typography variant="body2" color="text.secondary">SKU: {selectedVariant.sku}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Stock actual: {selectedVariant.stock} unidades</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tipo de ajuste</Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Button variant={adjustment.adjustment_type === 'add' ? 'contained' : 'outlined'} color="success" onClick={() => setAdjustment({ ...adjustment, adjustment_type: 'add' })}>➕ Agregar</Button>
                </Grid>
                <Grid item>
                  <Button variant={adjustment.adjustment_type === 'subtract' ? 'contained' : 'outlined'} color="error" onClick={() => setAdjustment({ ...adjustment, adjustment_type: 'subtract' })}>➖ Restar</Button>
                </Grid>
                <Grid item>
                  <Button variant={adjustment.adjustment_type === 'set' ? 'contained' : 'outlined'} color="primary" onClick={() => setAdjustment({ ...adjustment, adjustment_type: 'set' })}>📝 Establecer</Button>
                </Grid>
              </Grid>
            </Box>

            <TextField type="number" label="Cantidad" value={adjustment.quantity} onChange={(e) => setAdjustment({ ...adjustment, quantity: Number(e.target.value) })} inputProps={{ min: 1 }} fullWidth />

            <FormControl fullWidth>
              <InputLabel>Motivo del ajuste</InputLabel>
              <Select value={adjustment.reason} label="Motivo del ajuste" onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}>
                <MenuItem value="">Seleccione un motivo</MenuItem>
                <MenuItem value="restock">Reposición de stock</MenuItem>
                <MenuItem value="damaged">Producto dañado</MenuItem>
                <MenuItem value="lost">Producto perdido</MenuItem>
                <MenuItem value="returned">Producto devuelto</MenuItem>
                <MenuItem value="correction">Corrección de inventario</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => setShowAdjustModal(false)}>Cancelar</Button>
              <Button fullWidth variant="contained" onClick={handleStockAdjustment} disabled={!adjustment.quantity || !adjustment.reason}>Aplicar Ajuste</Button>
            </Box>
          </Box>
        )}
      </Modal>
    </>
  );
};

export default InventoryManagement;