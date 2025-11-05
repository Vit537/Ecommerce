import { createTheme } from '@mui/material/styles';

// Sistema de diseño personalizado para Sportswear E-commerce
export const sportswearTheme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',      // Negro principal
      dark: '#000000',      // Negro puro
      light: '#2d2d2d',     // Gris oscuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f5f5f5',      // Gris muy claro
      dark: '#e8e8e8',      // Gris claro
      light: '#fafafa',     // Casi blanco
      contrastText: '#1a1a1a',
    },
    accent: {
      main: '#d4af37',      // Dorado elegante
      dark: '#c09e2f',      // Dorado hover
      contrastText: '#ffffff',
    } as any,
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    divider: '#e8e8e8',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1,
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.07)',
    '0 4px 6px rgba(0, 0, 0, 0.07)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 20px 25px rgba(0, 0, 0, 0.15)',
    '0 20px 25px rgba(0, 0, 0, 0.15)',
    '0 20px 25px rgba(0, 0, 0, 0.15)',
    '0 20px 25px rgba(0, 0, 0, 0.15)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
    '0 25px 50px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#000000',
          },
        },
        outlinedPrimary: {
          borderColor: '#e8e8e8',
          color: '#1a1a1a',
          '&:hover': {
            borderColor: '#1a1a1a',
            backgroundColor: '#fafafa',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          border: '1px solid #e8e8e8',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
        elevation1: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            '& fieldset': {
              borderColor: '#e8e8e8',
            },
            '&:hover fieldset': {
              borderColor: '#d0d0d0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a1a1a',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e8e8e8',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e8e8e8',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e8e8e8',
        },
      },
    },
  },
});

// Declarar tipos personalizados para el tema
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}
