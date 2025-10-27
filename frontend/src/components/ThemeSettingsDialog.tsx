import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import { X, Sun, Moon, Palette } from 'lucide-react';
import { useTheme as useCustomTheme, colorPalettes, ColorPalette } from '../contexts/ThemeContext';

interface ThemeSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ThemeSettingsDialog: React.FC<ThemeSettingsDialogProps> = ({ open, onClose }) => {
  const { mode, colorPalette, toggleMode, setColorPalette } = useCustomTheme();

  const handlePaletteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorPalette(event.target.value as ColorPalette);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Palette size={24} />
            <Typography variant="h6">Configuración de Tema</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box py={2}>
          {/* Modo Claro/Oscuro */}
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Modo de Visualización
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleMode}
                  icon={<Sun size={20} />}
                  checkedIcon={<Moon size={20} />}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <Typography>{mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Paleta de Colores */}
          <Box>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Paleta de Colores
                </Typography>
              </FormLabel>
              <RadioGroup value={colorPalette} onChange={handlePaletteChange}>
                {Object.entries(colorPalettes).map(([key, palette]) => (
                  <Paper
                    key={key}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: colorPalette === key ? 2 : 1,
                      borderColor: colorPalette === key ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => setColorPalette(key as ColorPalette)}
                  >
                    <FormControlLabel
                      value={key}
                      control={<Radio />}
                      label={
                        <Box width="100%">
                          <Typography variant="subtitle2" fontWeight={600}>
                            {palette.name}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: palette.primary,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                              title="Primario"
                            />
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: palette.secondary,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                              title="Secundario"
                            />
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: palette.background,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                              title="Fondo"
                            />
                            {palette.accent && (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 1,
                                  backgroundColor: palette.accent,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                                title="Acento"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettingsDialog;
