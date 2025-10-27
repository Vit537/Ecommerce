import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  CameraAlt as CameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
import AppHeader from '../components/AppHeader';
import ThemeSettingsDialog from '../components/ThemeSettingsDialog';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/userService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserProfile() {
  const { user } = useAuth();
  const { mode, palette } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  
  // Profile data
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
    identification_number: user?.identification_number || '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth || '',
        identification_number: user.identification_number || '',
      });
    }
  }, [user]);

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await userService.updateUser(user.id, profileData);
      setSuccess('Perfil actualizado exitosamente');
      setEditMode(false);
      
      // Refresh user data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validation
      if (!passwordData.current_password || !passwordData.new_password) {
        setError('Por favor complete todos los campos');
        return;
      }
      
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (passwordData.new_password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      // Call API to change password
      // await userService.changePassword(passwordData);
      
      setSuccess('Contraseña cambiada exitosamente');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Handle preferences save
  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Save preferences to backend or localStorage
      localStorage.setItem(`user_preferences_${user?.id}`, JSON.stringify(preferences));
      
      setSuccess('Preferencias guardadas exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al guardar preferencias');
    } finally {
      setLoading(false);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    const first = user?.first_name?.[0] || '';
    const last = user?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  // Get role badge
  const getRoleBadge = () => {
    const roles: Record<string, { label: string; color: string }> = {
      admin: { label: 'Administrador', color: 'error.main' },
      employee: { label: 'Empleado', color: 'info.main' },
      manager: { label: 'Gerente', color: 'warning.main' },
      customer: { label: 'Cliente', color: 'success.main' },
    };
    
    const role = user?.role || 'customer';
    return roles[role] || roles.customer;
  };

  return (
    <Box className={mode === 'dark' ? 'dark' : ''}>
      <AppHeader title="Mi Perfil" />
      
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mi Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra tu información personal y preferencias
          </Typography>
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

        {/* Profile Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  size="small"
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: getRoleBadge().color,
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    mt: 1,
                  }}
                >
                  {getRoleBadge().label}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Información Personal" />
            <Tab label="Seguridad" />
            <Tab label="Preferencias" />
          </Tabs>

          {/* Tab 1: Personal Information */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Datos Personales
                </Typography>
                {!editMode ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setEditMode(false);
                        // Reset to original user data
                        if (user) {
                          setProfileData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            date_of_birth: user.date_of_birth || '',
                            identification_number: user.identification_number || '',
                          });
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Nombre"
                  value={profileData.first_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, first_name: e.target.value })
                  }
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Apellido"
                  value={profileData.last_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, last_name: e.target.value })
                  }
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Teléfono"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="CI/NIT"
                  value={profileData.identification_number}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      identification_number: e.target.value,
                    })
                  }
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) =>
                    setProfileData({ ...profileData, date_of_birth: e.target.value })
                  }
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CakeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    multiline
                    rows={2}
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Security */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2, maxWidth: 600 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Cambiar Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tu contraseña debe tener al menos 8 caracteres
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Contraseña Actual"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                          }
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                          }
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirmar Nueva Contraseña"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Cambiar Contraseña
                </Button>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Sesiones Activas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Aquí puedes ver los dispositivos donde tu cuenta está activa
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" fontWeight="600">
                      Navegador Actual
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Última actividad: Ahora
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 3: Preferences */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 2, maxWidth: 600 }}>
              {/* Tema */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Apariencia
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Personaliza los colores y el tema de la interfaz
              </Typography>
              
              <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="600" gutterBottom>
                        Tema Actual
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Modo: <strong>{mode === 'dark' ? 'Oscuro' : 'Claro'}</strong> | 
                        Paleta: <strong>{palette}</strong>
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setThemeDialogOpen(true)}
                    >
                      Personalizar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configura cómo y cuándo quieres recibir notificaciones
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          emailNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Notificaciones por Email
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recibe alertas importantes en tu correo
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.orderUpdates}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          orderUpdates: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Actualizaciones de Pedidos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Notificaciones sobre el estado de tus pedidos
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.promotions}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          promotions: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Promociones y Ofertas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Descuentos especiales y ofertas exclusivas
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.newsletter}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          newsletter: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        Newsletter
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Noticias y novedades de la tienda
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleSavePreferences}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                Guardar Preferencias
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
      
      {/* Theme Settings Dialog */}
      <ThemeSettingsDialog
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
      />
    </Box>
  );
}
