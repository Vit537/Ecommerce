/**
 * Panel de Administración de Modelos ML
 * Permite entrenar modelos, ver métricas y gestionar el sistema ML
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { ArrowLeft, Brain, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mlService from '../services/mlService';
import AppHeader from '../components/AppHeader';

interface ModelInfo {
  name: string;
  type: string;
  status: 'trained' | 'not_trained' | 'training';
  last_trained: string | null;
  accuracy: number | null;
  description: string;
  icon: string;
}

interface TrainingLog {
  id: string;
  model_type: string;
  timestamp: string;
  status: string;
  metrics: any;
  duration: number;
}

const MLModelAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trainingModel, setTrainingModel] = useState<string | null>(null);

  // Estado de modelos
  const [models] = useState<ModelInfo[]>([
    {
      name: 'Predicción de Ventas',
      type: 'sales_forecast',
      status: 'trained',
      last_trained: '2025-01-20 10:30:00',
      accuracy: 96.78,
      description: 'Random Forest Regressor para predicción de ventas futuras',
      icon: '📈',
    },
    {
      name: 'Recomendación de Productos',
      type: 'product_recommendation',
      status: 'trained',
      last_trained: '2025-01-20 10:25:00',
      accuracy: null,
      description: 'Sistema híbrido de filtrado colaborativo y por contenido',
      icon: '🎯',
    },
    {
      name: 'Segmentación de Clientes',
      type: 'customer_segmentation',
      status: 'trained',
      last_trained: '2025-01-20 10:20:00',
      accuracy: 36.9,
      description: 'K-Means Clustering para análisis RFM de clientes',
      icon: '👥',
    },
    {
      name: 'Optimización de Inventario',
      type: 'inventory_optimization',
      status: 'trained',
      last_trained: '2025-01-20 10:15:00',
      accuracy: 75.0,
      description: 'Análisis de rotación y recomendaciones de reorden',
      icon: '📦',
    },
  ]);

  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);

  useEffect(() => {
    loadTrainingLogs();
  }, []);

  const loadTrainingLogs = async () => {
    try {
      const logs = await mlService.getTrainingLogs();
      setTrainingLogs(logs.slice(0, 10)); // Últimos 10
    } catch (err: any) {
      console.error('Error al cargar logs:', err);
    }
  };

  const handleTrainModel = async (modelType: string, modelName: string) => {
    try {
      setTrainingModel(modelType);
      setError(null);
      setSuccess(null);

      switch (modelType) {
        case 'sales_forecast':
          await mlService.trainSalesForecastModel('random_forest');
          break;
        case 'product_recommendation':
          await mlService.trainProductRecommendationModel();
          break;
        case 'customer_segmentation':
          await mlService.trainCustomerSegmentationModel();
          break;
        default:
          throw new Error('Modelo no soportado');
      }

      setSuccess(`✅ Modelo "${modelName}" entrenado exitosamente`);
      await loadTrainingLogs();
    } catch (err: any) {
      console.error('Error al entrenar modelo:', err);
      setError(err.response?.data?.message || `Error al entrenar el modelo ${modelName}`);
    } finally {
      setTrainingModel(null);
    }
  };

  const handleTrainAllModels = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Entrenar todos los modelos en secuencia
      await mlService.trainSalesForecastModel('random_forest');
      await mlService.trainProductRecommendationModel();
      await mlService.trainCustomerSegmentationModel();

      setSuccess('✅ Todos los modelos entrenados exitosamente');
      await loadTrainingLogs();
    } catch (err: any) {
      console.error('Error al entrenar modelos:', err);
      setError('Error al entrenar uno o más modelos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained':
        return 'success';
      case 'training':
        return 'warning';
      case 'not_trained':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'trained':
        return 'Entrenado';
      case 'training':
        return 'Entrenando...';
      case 'not_trained':
        return 'No entrenado';
      default:
        return status;
    }
  };

  return (
    <>
      <AppHeader title="Administración de Modelos ML" />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 2 }}>
        <Container maxWidth="xl">
          {/* Header with actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                onClick={() => navigate('/ml-dashboard')}
              >
                Volver
              </Button>
              <Box>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Gestión de Modelos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona, entrena y monitorea los modelos de Machine Learning
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrainAllModels}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Brain size={20} />}
            >
              {loading ? 'Entrenando...' : '🚀 Entrenar Todos'}
            </Button>
          </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="🤖 Modelos" />
        <Tab label="📊 Historial de Entrenamiento" />
        <Tab label="⚙️ Configuración" />
      </Tabs>

      {/* Tab: Modelos */}
      {activeTab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {models.map((model) => (
            <Card key={model.type}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h3">{model.icon}</Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {model.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={getStatusLabel(model.status)}
                    color={getStatusColor(model.status)}
                    size="small"
                    icon={
                      model.status === 'trained' ? (
                        <CheckCircle size={16} />
                      ) : model.status === 'training' ? (
                        <Clock size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )
                    }
                  />
                </Box>

                {/* Métricas */}
                <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Última actualización:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {model.last_trained
                        ? new Date(model.last_trained).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nunca'}
                    </Typography>
                  </Box>

                  {model.accuracy !== null && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Precisión/Score:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {model.accuracy.toFixed(2)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy}
                        color="success"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Botones */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleTrainModel(model.type, model.name)}
                    disabled={trainingModel === model.type}
                    startIcon={
                      trainingModel === model.type ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Brain size={16} />
                      )
                    }
                  >
                    {trainingModel === model.type ? 'Entrenando...' : 'Entrenar'}
                  </Button>
                  <Button variant="outlined" disabled>
                    Ver Métricas
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Tab: Historial */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Historial de Entrenamiento (Últimos 10)
            </Typography>
            {trainingLogs.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Fecha/Hora</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Duración</TableCell>
                      <TableCell>Métricas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Chip label={log.model_type} size="small" />
                        </TableCell>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            color={log.status === 'success' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.duration}s</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {JSON.stringify(log.metrics).substring(0, 50)}...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No hay registros de entrenamiento disponibles
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Configuración */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Configuración del Sistema ML
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Las configuraciones de modelos se gestionan desde el backend Django.
            </Alert>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  📈 Predicción de Ventas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Algoritmo: Random Forest Regressor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Datos de entrenamiento: 496 registros históricos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Intervalo de predicción: 1-90 días
                </Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  🎯 Recomendaciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Método: Híbrido (Colaborativo + Contenido)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Top N recomendaciones: 5-10
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Pesos: 60% colaborativo, 40% contenido
                </Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  👥 Segmentación
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Algoritmo: K-Means Clustering
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Número de clusters: 6 (automático)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Features: RFM (Recency, Frequency, Monetary)
                </Typography>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  📦 Inventario
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Análisis de rotación automático
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Cálculo de EOQ (Economic Order Quantity)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Alertas basadas en umbrales dinámicos
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <Alert severity="info" icon={<TrendingUp size={20} />} sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>💡 Recomendación:</strong> Entrena los modelos periódicamente (cada semana)
          para mantener las predicciones precisas con los datos más recientes.
        </Typography>
      </Alert>
        </Container>
      </Box>
    </>
  );
};

export default MLModelAdmin;
