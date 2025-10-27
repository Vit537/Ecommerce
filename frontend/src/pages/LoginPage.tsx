import React, { useState, useEffect } from 'react';
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
  Grid,
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
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, loading, error, clearError, user } = useAuth();

  useEffect(() => {
    // Solo limpiar error al montar el componente
    clearError();
  }, []); // Dependencias vacías para evitar el bucle infinito

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Redirigir según el tipo de usuario después del login
  if (isAuthenticated && user) {
    if (user.is_admin) {
      return <Navigate to="/admin" replace />;
    } else if (user.is_employee) {
      return <Navigate to="/employee" replace />;
    } else {
      return <Navigate to="/shop" replace />;
    }
  }

  const testAccounts = [
    {
      role: 'Administrador',
      email: 'admin@boutique.com',
      password: 'admin123',
      icon: <BusinessOutlined />,
      color: 'primary' as const,
      description: 'Acceso completo al sistema',
    },
    {
      role: 'Gerente',
      email: 'gerente@boutique.com', 
      password: 'gerente123',
      icon: <PersonOutline />,
      color: 'success' as const,
      description: 'Gestión de operaciones',
    },
    {
      role: 'Cajero',
      email: 'cajero@boutique.com',
      password: 'cajero123',
      icon: <WorkOutline />,
      color: 'warning' as const,
      description: 'Ventas en tienda',
    },
    {
      role: 'Cliente',
      email: 'ana.martinez@email.com',
      password: 'cliente123',
      icon: <ShoppingCartOutlined />,
      color: 'secondary' as const,
      description: 'Compras online',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <StorefrontOutlined sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" component="div" fontWeight="bold">
              Mi Tienda de Ropa
            </Typography>
          </Paper>
          
          <Typography variant="h4" component="h1" sx={{ mt: 3, mb: 1, color: 'white', fontWeight: 'bold' }}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Accede a tu cuenta para continuar
          </Typography>
        </Box>

        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              sx={{ mb: 3 }}
              placeholder="tu@email.com"
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              sx={{ mb: 3 }}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)',
                },
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip 
              label="🧪 Cuentas de prueba" 
              variant="outlined"
              sx={{ px: 2 }}
            />
          </Divider>

          <Typography variant="h6" align="center" gutterBottom sx={{ mb: 2 }}>
            👤 Usuarios de Prueba:
          </Typography>

          <Grid container spacing={2}>
            {testAccounts.map((account, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    }
                  }}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, color: `${account.color}.main` }}>
                        {account.icon}
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="bold"
                        color={`${account.color}.main`}
                      >
                        {account.role}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {account.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {account.password}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;