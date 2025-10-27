import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, FileSpreadsheet, Send, Sparkles, Mic, StopCircle } from 'lucide-react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment,
  Collapse,
  Divider,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';

// Declaración de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ReportSuggestion {
  sales: string[];
  inventory: string[];
  financial: string[];
  customers: string[];
}

const API_BASE_URL = 'http://localhost:8000/api';

export default function ReportGenerator() {
  const theme = useTheme();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [suggestions, setSuggestions] = useState<ReportSuggestion | null>(null);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estados para reconocimiento de voz
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Obtener token del localStorage (clave 'token'). Mantener fallback a 'auth' por compatibilidad.
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (token) return token;
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed.token || parsed.access || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  // Cargar sugerencias al montar el componente
  React.useEffect(() => {
    fetchSuggestions();
  }, []);

  // Configurar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as typeof window & { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition || (window as typeof window & { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (finalTranscript) {
          setPrompt(finalTranscript);
          setTranscript('');
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        let message = 'Error en el reconocimiento de voz';

        switch (event?.error) {
          case 'not-allowed':
            message = 'Permite el acceso al micrófono en tu navegador.';
            break;
          case 'audio-capture':
            message = 'No se encontró un micrófono disponible.';
            break;
          case 'no-speech':
            message = 'No se detectó audio. Habla más cerca del micrófono.';
            break;
          case 'network':
            message = 'Error de conexión. Verifica tu internet.';
            break;
        }

        setVoiceError(message);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTranscript('');
      };
    }
  }, []);

  const fetchSuggestions = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/reports/suggestions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const handlePreview = async () => {
    if (!prompt.trim()) {
      setError('Por favor escribe una consulta');
      return;
    }

    setLoading(true);
    setError('');
    setPreviewData(null);

    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/reports/preview/`,
        { prompt, limit: 50 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPreviewData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar vista previa');
      console.error('Preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!prompt.trim()) {
      setError('Por favor escribe una consulta');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/reports/generate/`,
        {
          prompt,
          export_format: exportFormat,
          include_chart: false  // Sin gráficos como solicitaste
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      // Verificar que la respuesta es un blob válido
      if (!response.data || response.data.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }

      // Determinar el tipo de contenido y extensión
      const contentType = response.headers['content-type'] || '';
      let extension = 'pdf';
      let mimeType = 'application/pdf';
      
      if (exportFormat === 'excel' || contentType.includes('spreadsheet')) {
        extension = 'xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      // Crear blob con el tipo correcto
      const blob = new Blob([response.data], { type: mimeType });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      // Nombre del archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.setAttribute('download', `reporte_${timestamp}.${extension}`);
      
      // Agregar al DOM, hacer click y limpiar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setError('');
      
      // Mensaje de éxito opcional
      console.log(`✅ Reporte ${extension.toUpperCase()} descargado exitosamente`);
      
    } catch (err: any) {
      console.error('Download error:', err);
      
      let errorMessage = 'Error al generar reporte';
      
      // Intentar leer el error del blob si es un error del servidor
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch {
          errorMessage = 'Error al generar el reporte. Por favor intenta nuevamente.';
        }
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setPreviewData(null);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setVoiceError('El reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setVoiceError(null);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setVoiceError('No se pudo iniciar el reconocimiento de voz.');
      }
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sales: '📊 Ventas',
      inventory: '📦 Inventario',
      financial: '💰 Financiero',
      customers: '👥 Clientes'
    };
    return labels[category] || category;
  };

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Sparkles size={32} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Generador de Reportes con IA
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Pregunta en lenguaje natural y obtén reportes instantáneos
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Input */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {/* Voice Error */}
        {voiceError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setVoiceError(null)}>
            {voiceError}
          </Alert>
        )}

        {/* Transcript */}
        {transcript && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Escuchando: {transcript}...
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            ¿Qué reporte necesitas?
          </Typography>
          <TextField
            multiline
            rows={3}
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? 'Escuchando...' : 'Ejemplo: "Dame todos los productos" o "Top 5 productos más vendidos"'}
            variant="outlined"
            disabled={isListening}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={isListening ? "Detener grabación" : "Grabar audio"}>
                    <IconButton
                      onClick={toggleListening}
                      disabled={loading}
                      color={isListening ? "error" : "primary"}
                      sx={{
                        animation: isListening ? 'pulse 1.5s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 },
                        },
                      }}
                    >
                      {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Export Format */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Formato de exportación:
          </Typography>
          <RadioGroup
            row
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
          >
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={18} />
                  <span>PDF</span>
                </Box>
              }
            />
            <FormControlLabel
              value="excel"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileSpreadsheet size={18} />
                  <span>Excel</span>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePreview}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
          >
            {loading ? 'Generando...' : 'Vista Previa'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            onClick={handleDownload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download size={20} />}
          >
            {loading ? 'Generando...' : `Descargar ${exportFormat.toUpperCase()}`}
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Suggestions */}
      {suggestions && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              💡 Sugerencias Rápidas
            </Typography>
            <Button
              size="small"
              onClick={() => setShowSuggestions(!showSuggestions)}
              sx={{ textTransform: 'none' }}
            >
              {showSuggestions ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Box>
          <Collapse in={showSuggestions}>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3
              }}
            >
            {Object.entries(suggestions).map(([category, items]) => (
              <Box key={category}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  {getCategoryLabel(category)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {items.map((item: string, idx: number) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      fullWidth
                      onClick={() => useSuggestion(item)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        textTransform: 'none',
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'primary.50',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          </Collapse>
        </Paper>
      )}

      {/* Preview Results */}
      {previewData && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Vista Previa del Reporte
            </Typography>
            <Chip
              label={`${previewData.results_count} resultados`}
              color="primary"
              size="medium"
            />
          </Box>

          {previewData.explanation && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Análisis:</strong> {previewData.explanation}
            </Alert>
          )}

          {/* Results Table */}
          {previewData.results && previewData.results.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="medium" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow 
                      sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                      }}
                    >
                      {Object.keys(previewData.results[0]).map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            color: 'primary.main',
                            letterSpacing: '0.5px',
                            py: 2,
                            whiteSpace: 'nowrap',
                            borderBottom: '2px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.results.slice(0, 10).map((row: any, idx: number) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' },
                          '&:nth-of-type(odd)': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          },
                        }}
                      >
                        {Object.entries(row).map(([key, value]: [string, any], cellIdx) => (
                          <TableCell 
                            key={cellIdx}
                            sx={{
                              py: 2,
                              whiteSpace: 'nowrap',
                              fontSize: '0.9rem',
                              ...(typeof value === 'number' && {
                                fontWeight: 600,
                                color: value > 0 ? 'success.main' : 'text.primary',
                              }),
                            }}
                          >
                            {typeof value === 'number' 
                              ? (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('total')
                                  ? `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : value.toLocaleString())
                              : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {previewData.results.length > 10 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  Mostrando 10 de {previewData.results_count} resultados. Descarga el reporte completo.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
