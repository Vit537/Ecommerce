import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showLogo = true }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/admin');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo / Título */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              cursor: showLogo ? 'pointer' : 'default',
            }}
            onClick={showLogo ? handleLogoClick : undefined}
          >
            {showLogo && (
              <Box
                component="img"
                src="/images/logo-bs.png"
                alt="Boutique Logo"
                sx={{
                  height: 48,
                  width: 'auto',
                  mr: 2,
                  display: { xs: 'none', sm: 'block' },
                  objectFit: 'contain',
                }}
                onError={(e: any) => {
                  // Si no carga la imagen, ocultar
                  e.target.style.display = 'none';
                }}
              />
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '0.1em',
              }}
            >
              {title || 'Boutique Studio'}
            </Typography>
          </Box>

          {/* Menú de Usuario */}
          <UserMenu />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppHeader;
