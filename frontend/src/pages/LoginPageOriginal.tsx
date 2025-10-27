import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid2 as Grid,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  StorefrontOutlined,
  LockOutlined,
  PersonOutline,
  BusinessOutlined,
  WorkOutline,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';

const LoginPageOriginal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, user } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Redirigir según el tipo de usuario después del login
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'employee') {
      return <Navigate to="/employee" replace />;
    } else {
      return <Navigate to="/shop" replace />;
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {/* Panel de información */}
        <Grid xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <StorefrontOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  Mi E-commerce
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sistema Integrado de Gestión
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Chip label="Tipos de Usuario" size="small" />
              </Divider>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <BusinessOutlined color="error" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Administrador
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gestión completa del sistema, usuarios y reportes
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <WorkOutline color="warning" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Empleado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Punto de venta, inventario y procesamiento de órdenes
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <ShoppingCartOutlined color="success" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Cliente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Compras, carrito y seguimiento de órdenes
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de login */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                Iniciar Sesión
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Accede a tu cuenta para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <PersonOutline sx={{ color: 'action.active', mr: 1 }} />,
                }}
                required
              />
              
              <TextField
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <LockOutlined sx={{ color: 'action.active', mr: 1 }} />,
                }}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Para pruebas, usa cualquier email y contraseña
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPageOriginal;