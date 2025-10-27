import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import Notification from './Notification';
import axios from 'axios';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider
} from '@mui/material';

interface CheckoutData {
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  notes?: string;
  same_as_shipping: boolean;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, onSuccess }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const [formData, setFormData] = useState<CheckoutData>({
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'España'
    },
    payment_method: 'credit_card',
    notes: '',
    same_as_shipping: true
  });

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

  const handleInputChange = (field: string, value: string, section?: 'shipping_address' | 'billing_address') => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      showNotification('warning', 'El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product_variant_id: item.variant.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: formData.shipping_address,
        billing_address: formData.same_as_shipping ? formData.shipping_address : formData.billing_address,
        payment_method: formData.payment_method,
        notes: formData.notes,
        total: total
      };

      const response = await axios.post('/orders/', orderData);
      
      if (response.data.id) {
        showNotification('success', 'Pedido creado exitosamente');
        await clearCart();
        onSuccess(response.data.id);
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al procesar el pedido';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Compra" size="lg">
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Resumen del Pedido */}
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Box>
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{item.variant.product.name} ({item.variant.size} - {item.variant.color}) x{item.quantity}</Typography>
                    <Typography variant="body2">{formatCurrency(item.subtotal)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <Typography>Total:</Typography>
                  <Typography color="primary">{formatCurrency(total)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Dirección de Envío */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Dirección de Envío
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Dirección"
                    value={formData.shipping_address.street}
                    onChange={(e) => handleInputChange('street', e.target.value, 'shipping_address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Ciudad"
                    value={formData.shipping_address.city}
                    onChange={(e) => handleInputChange('city', e.target.value, 'shipping_address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Provincia"
                    value={formData.shipping_address.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'shipping_address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Código Postal"
                    value={formData.shipping_address.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value, 'shipping_address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="country-label">País</InputLabel>
                    <Select
                      labelId="country-label"
                      label="País"
                      value={formData.shipping_address.country}
                      onChange={(e) => handleInputChange('country', e.target.value as string, 'shipping_address')}
                    >
                      <MenuItem value="España">España</MenuItem>
                      <MenuItem value="Francia">Francia</MenuItem>
                      <MenuItem value="Portugal">Portugal</MenuItem>
                      <MenuItem value="Italia">Italia</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Método de Pago */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Método de Pago
              </Typography>
              <FormControl>
                <RadioGroup
                  row
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                >
                  <FormControlLabel value="credit_card" control={<Radio />} label="💳 Tarjeta de Crédito" />
                  <FormControlLabel value="debit_card" control={<Radio />} label="💳 Tarjeta de Débito" />
                  <FormControlLabel value="transfer" control={<Radio />} label="🏦 Transferencia" />
                  <FormControlLabel value="cash" control={<Radio />} label="💵 Efectivo (Tienda)" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Notas */}
            <Box>
              <TextField
                label="Notas adicionales (opcional)"
                multiline
                fullWidth
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="contained" color="success" disabled={loading}>
                {loading ? 'Procesando...' : `Confirmar Pedido ${formatCurrency(total)}`}
              </Button>
            </Box>
          </Box>
        </form>
      </Modal>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default Checkout;