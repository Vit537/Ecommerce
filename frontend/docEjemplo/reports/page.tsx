'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

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
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  ShowChart as ShowChartIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  DonutLarge as DonutLargeIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  TableView as TableViewIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';
import PageLayout from '@/components/layout/PageLayout';
import SalesChart from '@/components/charts/SalesChart';
import { reportsService } from '@/lib/api';
import type { SalesChartData, SalesReportSummary } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import ReportsLoadingState from '@/components/layout/skeletons/ReportsLoadingState';
import StatCard from '@/components/StatCard';
import api from '@/lib/api';

interface AIReportResult {
  query: string;
  interpretation: {
    type: string;
    entity: string;
    period: string;
    metric: string;
  };
  data: Record<string, unknown>[];
  column_keys: string[];
  columns: string[];
  summary: string;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);

const defaultDateRange = () => {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - 30);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return {
    start: format(past),
    end: format(now),
  };
};

const buildChartData = (entries: SalesReportSummary['daily_sales']): SalesChartData[] =>
  entries.map((item) => ({
    date: item.date,
    amount: item.amount,
    orders: item.orders,
  }));

const ReportsPage = () => {
  const { user } = useAuth();
  const canViewReports = user?.role === 'admin' || user?.role === 'manager';
  
  // Estado para reportes de ventas
  const [summary, setSummary] = useState<SalesReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [{ start, end }, setRange] = useState(defaultDateRange);

  // Estado para IA
  const [aiQuery, setAiQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIReportResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const micPermissionRef = useRef(false);

  const loadReports = useCallback(async () => {
    if (!canViewReports) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getSalesSummary({ start_date: start, end_date: end });
      setSummary(data);
    } catch (err) {
      console.error('Error fetching reports', err);
      setError('No se pudo cargar el reporte de ventas.');
    } finally {
      setLoading(false);
    }
  }, [canViewReports, start, end]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

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
        setAiError(null);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setAiQuery(finalTranscript);
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
            message = 'Permite el acceso al micrófono en tu navegador para usar esta función.';
            break;
          case 'audio-capture':
            message = 'No encontramos un micrófono disponible. Verifica la conexión del dispositivo.';
            break;
          case 'no-speech':
            message = 'No se detectó audio. Habla más cerca del micrófono e inténtalo nuevamente.';
            break;
          case 'aborted':
            message = 'El reconocimiento de voz se detuvo. Intenta otra vez.';
            break;
          case 'network':
            message = 'No se pudo conectar al servicio de voz. Verifica tu conexión y, si usas Brave u otro navegador con bloqueadores, habilita el acceso al servicio de voz para este sitio.';
            break;
          default:
            if (event?.message) {
              message = event.message;
            }
            break;
        }

        setAiError(message);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const openExportMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const closeExportMenu = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!summary) {
      closeExportMenu();
      return;
    }

    try {
      setExporting(true);
      closeExportMenu();

      const blob = await reportsService.exportSalesReport(format, {
        start_date: start,
        end_date: end,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const { start_date: startDateLabel, end_date: endDateLabel } = summary.period;
      const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv';
      link.download = `reporte-ventas-${startDateLabel}-a-${endDateLabel}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report', err);
      setError('No se pudo exportar el reporte.');
    } finally {
      setExporting(false);
    }
  };

  // Funciones de IA
  const ensureMicPermission = async () => {
    if (micPermissionRef.current) {
      return true;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      micPermissionRef.current = true;
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      micPermissionRef.current = true;
      return true;
    } catch (error) {
      console.error('Microphone permission denied', error);
      setAiError('No pudimos acceder al micrófono. Revisa los permisos del navegador y vuelve a intentarlo.');
      return false;
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      setAiError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }
    setAiError(null);
    setTranscript('');

    const hasPermission = await ensureMicPermission();
    if (!hasPermission) {
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Speech recognition start failed', error);
      setIsListening(false);
      const message =
        (error as Error & { name?: string })?.name === 'NotAllowedError'
          ? 'Permite el acceso al micrófono en tu navegador para usar esta función.'
          : 'No se pudo iniciar el reconocimiento de voz. Intenta nuevamente.';
      setAiError(message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const generateAIReport = async (queryText: string = aiQuery) => {
    if (!queryText.trim()) {
      setAiError('Por favor, escribe o dicta tu consulta');
      return;
    }

    try {
      setIsProcessingAI(true);
      setAiError(null);
      setAiResult(null);

      const response = await api.post('/reports/ai/generate/', {
        query: queryText,
      });

      setAiResult(response.data);
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string; error?: string } }; message?: string })?.response?.data?.detail ||
        (err as { response?: { data?: { detail?: string; error?: string } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { detail?: string; error?: string } }; message?: string })?.message ||
        'Error al generar el reporte';
      setAiError(message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAIReport();
  };

  const quickQuery = (query: string) => {
    setAiQuery(query);
    generateAIReport(query);
  };

  const totals = summary?.totals;
  const currency = totals?.currency || 'USD';

  const statusChips = useMemo(() => {
    if (!summary) {
      return [] as Array<{ label: string; value: number }>;
    }
    return summary.status_breakdown.map((status) => ({
      label: `${status.status_display} (${status.orders})`,
      value: status.orders,
    }));
  }, [summary]);

  const summaryCards = summary
    ? [
        {
          title: 'Ventas Totales',
          value: formatCurrency(totals?.total_revenue ?? 0, currency),
          icon: ShowChartIcon,
          color: 'success' as const,
          helperText: `Promedio: ${formatCurrency(totals?.average_order_value ?? 0, currency)}`,
          extraContent: null,
        },
        {
          title: 'Órdenes Completadas',
          value: totals?.total_orders ?? 0,
          icon: AssignmentTurnedInIcon,
          color: 'primary' as const,
          helperText: `Rango: ${summary.period.start_date} – ${summary.period.end_date}`,
          extraContent: null,
        },
        {
          title: 'Distribución por Estado',
          value: statusChips.length,
          icon: DonutLargeIcon,
          color: 'info' as const,
          helperText: statusChips.length ? `${statusChips.length} estados diferentes` : 'Sin datos en el rango seleccionado.',
          
            
        },
      ]
    : [];

  if (!canViewReports) {
    return (
      <DashboardLayout>
        <PageLayout title="Reportes de Ventas" maxWidth="lg">
          <Alert severity="warning">
            No tienes permisos para acceder a los reportes.
          </Alert>
        </PageLayout>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <ReportsLoadingState
          title="Reportes de Ventas"
          description="Analiza el desempeño comercial por rango de fechas."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageLayout
        title="Reportes Inteligentes"
        description="Analiza el desempeño comercial y obtén insights con IA"
        maxWidth="xl"
      >
        <Stack spacing={3}>
          {/* Barra de IA Superior */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AIIcon sx={{ fontSize: 28 }} color="primary" />
                  <Typography variant="h6">
                    Asistente Inteligente
                  </Typography>
                  <Chip 
                    label="IA" 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  /> 
                </Box>                <form onSubmit={handleAISubmit}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      placeholder="Pregunta lo que necesites: ej. '¿Cuáles son mis 5 mejores clientes este mes?'"
                      value={aiQuery || transcript}
                      onChange={(e) => setAiQuery(e.target.value)}
                      disabled={isListening || isProcessingAI}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: (theme) => isListening 
                            ? theme.palette.action.hover 
                            : theme.palette.mode === 'dark' 
                              ? theme.palette.background.paper 
                              : 'white',
                        },
                        '& .MuiInputBase-input': {
                          color: (theme) => theme.palette.text.primary,
                        },
                      }}
                      helperText={isListening ? '🎤 Escuchando...' : transcript ? `"${transcript}"` : ''}
                    />
                    
                    <IconButton
                      color="primary"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessingAI}
                      sx={{
                        bgcolor: isListening ? 'error.main' : 'primary.light',
                        color: isListening ? 'white' : 'primary.contrastText',
                        '&:hover': {
                          bgcolor: isListening ? 'error.dark' : 'primary.main',
                        },
                      }}
                    >
                      {isListening ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!aiQuery.trim() || isProcessingAI}
                      startIcon={isProcessingAI ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      {isProcessingAI ? 'Generando...' : 'Consultar'}
                    </Button>
                  </Stack>
                </form>

                {/* Consultas rápidas */}
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    Consultas rápidas:
                  </Typography>
                  <Chip
                    icon={<PersonIcon />}
                    label="Top 10 clientes"
                    size="small"
                    onClick={() => quickQuery('Muéstrame los 10 clientes que más compraron este mes')}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    icon={<TrendingIcon />}
                    label="Productos top"
                    size="small"
                    onClick={() => quickQuery('¿Cuáles son los productos más vendidos esta semana?')}
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip
                    icon={<MoneyIcon />}
                    label="Ventas mensuales"
                    size="small"
                    onClick={() => quickQuery('Total de ventas de este mes')}
                    variant="outlined"
                    color="success"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Resultado de IA */}
          {aiError && (
            <Alert severity="error" onClose={() => setAiError(null)}>
              {aiError}
            </Alert>
          )}

          {aiResult && (
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Resultado de Consulta IA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      &quot;{aiResult.query}&quot;
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setAiResult(null)}
                    startIcon={<ExpandLessIcon />}
                  >
                    Cerrar
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
                  <Chip label={`Tipo: ${aiResult.interpretation.type}`} size="small" color="primary" variant="outlined" />
                  <Chip label={`Entidad: ${aiResult.interpretation.entity}`} size="small" color="secondary" variant="outlined" />
                  <Chip label={`Período: ${aiResult.interpretation.period}`} size="small" color="info" variant="outlined" />
                </Stack>

                {aiResult.summary && (
                  <Alert severity="info" icon={<AIIcon />} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Resumen:</strong> {aiResult.summary}
                    </Typography>
                  </Alert>
                )}

                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {aiResult.columns.map((col) => (
                          <TableCell key={col} sx={{ fontWeight: 'bold' }}>
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {aiResult.data.map((row, idx) => (
                        <TableRow key={idx} hover>
                          {aiResult.columns.map((col, colIdx) => {
                            const key = aiResult.column_keys?.[colIdx] ?? col;
                            const value = row[key];
                            return (
                              <TableCell key={col}>
                                {value != null && value !== '' ? String(value) : '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Reportes Predefinidos */}
          <Box>
            <Typography variant="h5" gutterBottom>
              Reportes Principales
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Análisis predefinidos de tu negocio
            </Typography>
          </Box>

          {/* Controles de fecha y exportación para ventas */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={start}
              onChange={(event) => setRange((prev) => ({ ...prev, start: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={end}
              onChange={(event) => setRange((prev) => ({ ...prev, end: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => void loadReports()}>
              Actualizar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={openExportMenu}
              disabled={!summary || exporting}
            >
              {exporting ? 'Generando...' : 'Descargar'}
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={closeExportMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleExport('csv')} disabled={exporting}>
                <ListItemIcon>
                  <DescriptionIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="CSV (.csv)" />
              </MenuItem>
              <MenuItem onClick={() => handleExport('excel')} disabled={exporting}>
                <ListItemIcon>
                  <TableViewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Excel (.xlsx)" />
              </MenuItem>
              <MenuItem onClick={() => handleExport('pdf')} disabled={exporting}>
                <ListItemIcon>
                  <PictureAsPdfIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="PDF (.pdf)" />
              </MenuItem>
            </Menu>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {summary && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                {summaryCards.map((card) => (
                  <Grid
                    key={card.title}
                    size={{ xs: 12, md: 4 }}
                  >
                    <StatCard
                      title={card.title}
                      value={card.value}
                      icon={card.icon}
                      color={card.color}
                      helperText={card.helperText}
                      extraContent={card.extraContent}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Monto total y número de órdenes por día (solo pedidos completados o entregados).
                </Typography>
              </Box>
              <SalesChart
                data={buildChartData(summary.daily_sales)}
                height={320}
                title="Tendencia de ventas"
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Top productos por ingresos
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell align="right">Cantidad</TableCell>
                              <TableCell align="right">Ingresos</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {summary.top_products.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  <Typography variant="caption" color="text.disabled">
                                    No hay datos en el rango seleccionado.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                            {summary.top_products.map((product) => (
                              <TableRow key={product.name}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell align="right">{product.quantity ?? 0}</TableCell>
                                <TableCell align="right">{formatCurrency(product.revenue, currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Mejores clientes
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Cliente</TableCell>
                              <TableCell align="right">Órdenes</TableCell>
                              <TableCell align="right">Ingresos</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {summary.top_customers.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  <Typography variant="caption" color="text.disabled">
                                    No hay datos en el rango seleccionado.
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                            {summary.top_customers.map((customer) => (
                              <TableRow key={customer.name}>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell align="right">{customer.orders ?? 0}</TableCell>
                                <TableCell align="right">{formatCurrency(customer.revenue, currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Stack>
      </PageLayout>
    </DashboardLayout>
  );
};

export default ReportsPage;