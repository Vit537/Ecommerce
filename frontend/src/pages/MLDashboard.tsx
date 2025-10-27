/**
 * Dashboard de Machine Learning
 * Panel principal con predicciones de ventas, recomendaciones, segmentación e inventario
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import mlService, {
  SalesForecastResponse,
  InventoryAnalysisResponse,
  DashboardSummary,
} from '../services/mlService';
import AppHeader from '../components/AppHeader';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MLDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesForecast, setSalesForecast] = useState<SalesForecastResponse | null>(null);
  const [inventoryAnalysis, setInventoryAnalysis] = useState<InventoryAnalysisResponse | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [forecastData, inventoryData, summaryData] = await Promise.all([
        mlService.predictSales(30),
        mlService.analyzeInventory(),
        mlService.getDashboardSummary(),
      ]);

      setSalesForecast(forecastData);
      setInventoryAnalysis(inventoryData);
      setDashboardSummary(summaryData);
    } catch (err: any) {
      console.error('Error al cargar datos del dashboard:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del dashboard ML');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Datos para el gráfico de predicción de ventas
  const salesChartData = salesForecast
    ? {
        labels: salesForecast.predictions.map((p) => {
          const date = new Date(p.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
          {
            label: 'Ventas Predichas (Bs.)',
            data: salesForecast.predictions.map((p) => p.predicted_sales),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Límite Superior',
            data: salesForecast.predictions.map((p) => p.confidence_upper),
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderDash: [5, 5],
            fill: false,
          },
          {
            label: 'Límite Inferior',
            data: salesForecast.predictions.map((p) => p.confidence_lower),
            borderColor: 'rgba(54, 162, 235, 0.5)',
            borderDash: [5, 5],
            fill: false,
          },
        ],
      }
    : null;

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Predicción de Ventas - Próximos 30 Días',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `Bs. ${value.toLocaleString()}`,
        },
      },
    },
  };

  // Datos para el gráfico de alertas de inventario
  const inventoryChartData = inventoryAnalysis && inventoryAnalysis.alerts_by_type
    ? {
        labels: Object.keys(inventoryAnalysis.alerts_by_type),
        datasets: [
          {
            label: 'Cantidad de Alertas',
            data: Object.values(inventoryAnalysis.alerts_by_type),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
            ],
          },
        ],
      }
    : null;

  const inventoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Alertas de Inventario por Tipo',
      },
    },
  };

  // Función para obtener color según urgencia
  const getUrgencyColor = (level: number) => {
    if (level >= 8) return 'error';
    if (level >= 5) return 'warning';
    return 'info';
  };

  // Función para obtener color de salud del inventario
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Reintentar
        </Button>
      </Container>
    );
  }

  return (
    <>
      <AppHeader title="Dashboard de Machine Learning" />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Quick Access Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshCw size={20} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Actualizar Datos
          </Button>
        </Box>

        {/* Quick Access Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/ml/product-recommendations')}
          sx={{ py: 2 }}
        >
          🎯 Recomendaciones de Productos
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/ml/customer-segmentation')}
          sx={{ py: 2 }}
        >
          👥 Segmentación de Clientes
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/ml/model-admin')}
          sx={{ py: 2 }}
        >
          ⚙️ Administrar Modelos
        </Button>
      </Box>

      {/* Tarjetas de Resumen */}
      {dashboardSummary && dashboardSummary.sales_forecast && dashboardSummary.inventory && dashboardSummary.customers && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Ventas Predichas */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp size={24} color="#10b981" />
                <Typography variant="h6" ml={1}>
                  Ventas 30 días
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                Bs. {dashboardSummary.sales_forecast.next_30_days?.toLocaleString() || '0'}
              </Typography>
              <Chip
                label={dashboardSummary.sales_forecast.trend || 'N/A'}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          {/* Salud del Inventario */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Package size={24} color="#f59e0b" />
                <Typography variant="h6" ml={1}>
                  Salud Inventario
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {dashboardSummary.inventory.health_score || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={dashboardSummary.inventory.health_score || 0}
                color={getHealthColor(dashboardSummary.inventory.health_score || 0)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          {/* Alertas Críticas */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AlertTriangle size={24} color="#ef4444" />
                <Typography variant="h6" ml={1}>
                  Alertas Críticas
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {dashboardSummary.inventory.critical_alerts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                de {dashboardSummary.inventory.total_alerts || 0} totales
              </Typography>
            </CardContent>
          </Card>

          {/* Clientes VIP */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Users size={24} color="#8b5cf6" />
                <Typography variant="h6" ml={1}>
                  Clientes VIP
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {dashboardSummary.customers.vip_customers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {dashboardSummary.customers.total_segments || 0} segmentos
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Gráficos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Gráfico de Predicción de Ventas */}
        <Card>
          <CardContent>
            {salesChartData && <Line data={salesChartData} options={salesChartOptions} />}
            {salesForecast && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Resumen:</strong> Ventas predichas: Bs.{' '}
                  {salesForecast.summary.total_predicted_sales.toLocaleString()} |
                  Promedio diario: Bs.{' '}
                  {salesForecast.summary.avg_daily_sales.toLocaleString()} |
                  Cantidad: {salesForecast.summary.total_predicted_quantity} unidades
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Inventario */}
        <Card>
          <CardContent>
            {inventoryChartData && (
              <Bar data={inventoryChartData} options={inventoryChartOptions} />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Tabla de Alertas de Inventario */}
      {inventoryAnalysis && inventoryAnalysis.alerts && inventoryAnalysis.alerts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Alertas de Inventario Activas
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Tipo de Alerta</TableCell>
                    <TableCell align="right">Stock Actual</TableCell>
                    <TableCell align="right">Stock Recomendado</TableCell>
                    <TableCell>Urgencia</TableCell>
                    <TableCell>Mensaje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryAnalysis.alerts.slice(0, 10).map((alert, index) => (
                    <TableRow key={index}>
                      <TableCell>{alert.product_name}</TableCell>
                      <TableCell>
                        <Chip label={alert.alert_type} size="small" color="warning" />
                      </TableCell>
                      <TableCell align="right">{alert.current_stock}</TableCell>
                      <TableCell align="right">{alert.recommended_stock}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${alert.urgency_level}/10`}
                          size="small"
                          color={getUrgencyColor(alert.urgency_level)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {alert.message}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      {inventoryAnalysis && inventoryAnalysis.recommendations && inventoryAnalysis.recommendations.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Recomendaciones del Sistema
            </Typography>
            {inventoryAnalysis.recommendations.map((rec, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {rec}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
      </Container>
    </>
  );
};

export default MLDashboard;
