import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, Theme } from '@mui/material';
import { useAuth } from './AuthContext';

// Definir las paletas de colores disponibles (actualizadas con los colores de las imágenes)
export const colorPalettes = {
  default: {
    name: 'Boutique Elegante (BS)',
    primary: '#000000',      // Negro elegante del logo
    secondary: '#E5DCC8',    // Beige/crema del fondo
    background: '#F5F0E8',   // Fondo claro beige
    surface: '#FFFFFF',      // Superficie blanca
    text: '#0D0D0D',        // Texto negro
    textSecondary: '#666666', // Texto secundario gris
    accent: '#8B7355',      // Marrón suave para acentos
  },
  darkElegant: {
    name: 'Boutique Elegante Oscuro',
    primary: '#E5DCC8',      // Beige para contraste
    secondary: '#8B7355',    // Marrón
    background: '#0D0D0D',   // Negro profundo
    surface: '#1a1a1a',      // Superficie oscura
    text: '#F5F0E8',        // Texto claro
    textSecondary: '#B0A998', // Texto secundario beige
    accent: '#D4C4A8',      // Acento dorado suave
  },
  vibrant: {
    name: 'Vibrante y Juvenil',
    primary: '#488a99',      // Dark Aqua (Modern)
    secondary: '#DBAE58',    // Gold (Modern)
    background: '#FBE9E7',   // Charcoal light (Modern)
    surface: '#FFFFFF',
    text: '#0D0D0D',
    textSecondary: '#666666',
    accent: '#A4CABC',       // Robin's Egg (Mediterranean)
  },
  creative: {
    name: 'Creativa y Divertida',
    primary: '#EAB364',      // Nectar (Mediterranean)
    secondary: '#ACBD78',    // Olive (Mediterranean)
    accent: '#B2473E',       // Tuscan Red (Mediterranean)
    background: '#F7F7F7',
    surface: '#FFFFFF',
    text: '#0D0D0D',
    textSecondary: '#666666',
  },
  minimal: {
    name: 'Minimal y Moderna',
    primary: '#626D71',      // Slate (Coffee)
    secondary: '#B38867',    // Coffee
    background: '#CDCDC0',   // Ceramic (Coffee)
    surface: '#FFFFFF',
    accent: '#DDBCA5',       // Latte (Coffee)
    text: '#0D0D0D',
    textSecondary: '#666666',
  },
};

export type ColorPalette = keyof typeof colorPalettes;
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colorPalette: ColorPalette;
  toggleMode: () => void;
  setColorPalette: (palette: ColorPalette) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Cargar preferencias guardadas del usuario
  const getStoredPreferences = () => {
    const userId = user?.id || 'guest';
    const stored = localStorage.getItem(`theme_preferences_${userId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { mode: 'dark', palette: 'default' };
      }
    }
    return { mode: 'dark', palette: 'default' };
  };

  const [mode, setMode] = useState<ThemeMode>(() => getStoredPreferences().mode);
  const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => getStoredPreferences().palette);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    const userId = user?.id || 'guest';
    localStorage.setItem(`theme_preferences_${userId}`, JSON.stringify({ mode, palette: colorPalette }));
  }, [mode, colorPalette, user]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setColorPalette = (palette: ColorPalette) => {
    setColorPaletteState(palette);
  };

  const theme = useMemo(() => {
    const palette = colorPalettes[colorPalette];
    const isLight = mode === 'light';

    return createTheme({
      palette: {
        mode,
        primary: {
          main: palette.primary,
        },
        secondary: {
          main: palette.secondary,
        },
        background: {
          default: isLight ? (palette.background === '#252A34' ? '#F5F5F5' : palette.background) : palette.background,
          paper: isLight ? (palette.surface === '#1a1d24' ? '#FFFFFF' : palette.surface) : palette.surface,
        },
        text: {
          primary: isLight ? (palette.text === '#FFFFFF' ? '#0D0D0D' : palette.text) : palette.text,
          secondary: isLight ? '#666666' : palette.textSecondary,
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'dark' 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                : '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark'
                ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    });
  }, [mode, colorPalette]);

  return (
    <ThemeContext.Provider value={{ mode, colorPalette, toggleMode, setColorPalette, theme }}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
