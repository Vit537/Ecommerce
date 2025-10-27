import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  User,
  Settings,
  Palette,
  Moon,
  Sun,
  LogOut,
  Home,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import ThemeSettingsDialog from './ThemeSettingsDialog';

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleThemeSettings = () => {
    handleMenuClose();
    setThemeDialogOpen(true);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleGoHome = () => {
    handleMenuClose();
    if (user?.is_admin || user?.is_employee) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={2}>
        {/* Botón de Inicio */}
        <IconButton
          onClick={handleGoHome}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          title="Ir al Inicio"
        >
          <Home size={22} />
        </IconButton>

        {/* Toggle de Tema */}
        <IconButton
          onClick={toggleMode}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          title={mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        >
          {mode === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </IconButton>

        {/* Avatar y Menú */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{ p: 0 }}
          aria-controls="user-menu"
          aria-haspopup="true"
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontWeight: 600,
            }}
            src={user?.avatar}
          >
            {getInitials()}
          </Avatar>
        </IconButton>
      </Box>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 240,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header del menú */}
        <Box px={2} py={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Typography variant="caption" display="block" color="primary.main" mt={0.5}>
            {user?.is_admin ? '👑 Administrador' : user?.is_employee ? '👤 Empleado' : '🛍️ Cliente'}
          </Typography>
        </Box>

        <Divider />

        {/* Opciones del menú */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <User size={20} />
          </ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleThemeSettings}>
          <ListItemIcon>
            <Palette size={20} />
          </ListItemIcon>
          <ListItemText>Personalización</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleGoHome}>
          <ListItemIcon>
            <Home size={20} />
          </ListItemIcon>
          <ListItemText>Ir al Inicio</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogOut size={20} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de Configuración de Tema */}
      <ThemeSettingsDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
    </>
  );
};

export default UserMenu;
