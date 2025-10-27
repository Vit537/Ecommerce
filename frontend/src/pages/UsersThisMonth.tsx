import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  People,
  ArrowBack,
  ExitToApp,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_type: string;
  is_admin: boolean;
  is_employee: boolean;
  is_customer: boolean;
  created_at: string;
  last_login?: string;
}

interface UsersThisMonthData {
  users_this_month: number;
  users: UserData[];
  month_name: string;
  year: number;
}

const UsersThisMonth: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<UsersThisMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsersThisMonth();
      setData(response);
    } catch (error: any) {
      console.error('Error loading users this month:', error);
      setError('Error al cargar los datos de usuarios del mes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserTypeColor = (user: UserData) => {
    if (user.is_admin) return 'error';
    if (user.is_employee) return 'warning';
    return 'primary';
  };

  const getUserTypeLabel = (user: UserData) => {
    if (user.is_admin) return 'Admin';
    if (user.is_employee) return 'Empleado';
    return 'Cliente';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Cargando usuarios del mes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <People sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h6" component="div">
                Usuarios del Mes
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {data ? `${data.month_name} ${data.year}` : 'Cargando...'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              variant="contained" 
              color="inherit"
              startIcon={<Refresh />}
              onClick={loadUsersData}
            >
              Actualizar
            </Button>
            <Button 
              variant="outlined" 
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Card */}
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <People sx={{ fontSize: 60, mr: 3 }} />
              <Box>
                <Typography variant="h3" component="div">
                  {data?.users_this_month || 0}
                </Typography>
                <Typography variant="h6">
                  Nuevos usuarios este mes
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {data ? `${data.month_name} ${data.year}` : ''}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lista de Nuevos Usuarios
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                  <TableCell>Último Acceso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.users && data.users.length > 0 ? (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {user.first_name?.charAt(0) || user.email?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.email
                              }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getUserTypeLabel(user)} 
                          color={getUserTypeColor(user)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No hay nuevos usuarios este mes
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default UsersThisMonth;