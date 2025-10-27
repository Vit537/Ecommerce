/**
 * Componente de Segmentación de Clientes ML
 * Visualiza segmentos de clientes usando K-Means y análisis RFM
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
  Chip,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import mlService, { CustomerSegment } from '../services/mlService';
import AppHeader from '../components/AppHeader';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface SegmentStats {
  segment_type: string;
  count: number;
  percentage: number;
  color: string;
}

const CustomerSegmentation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSegment, setCustomerSegment] = useState<CustomerSegment | null>(null);
  const [segmentStats, setSegmentStats] = useState<SegmentStats[]>([]);
  const [loadingSegment, setLoadingSegment] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadSegmentStats();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/auth/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setCustomers(data.filter((u: any) => u.role === 'customer'));
    } catch (err: any) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadSegmentStats = async () => {
    try {
      await axios.get('http://localhost:8000/api/ml/dashboard-summary/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      // Simular estadísticas de segmentos (en producción vendría del backend)
      const mockStats: SegmentStats[] = [
        { segment_type: 'VIP', count: 26, percentage: 26, color: '#8b5cf6' },
        { segment_type: 'Frequent', count: 48, percentage: 48, color: '#10b981' },
        { segment_type: 'Occasional', count: 15, percentage: 15, color: '#f59e0b' },
        { segment_type: 'At Risk', count: 5, percentage: 5, color: '#ef4444' },
        { segment_type: 'New', count: 6, percentage: 6, color: '#3b82f6' },
      ];
      setSegmentStats(mockStats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleCustomerSelect = async (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setCustomerSegment(null);
    
    if (!customer) return;

    try {
      setLoadingSegment(true);
      setError(null);
      const segment = await mlService.getCustomerSegment(customer.id);
      setCustomerSegment(segment);
    } catch (err: any) {
      console.error('Error al obtener segmento:', err);
      setError(err.response?.data?.message || 'Error al obtener segmento del cliente');
    } finally {
      setLoadingSegment(false);
    }
  };

  const handleTrainModel = async () => {
    try {
      setLoading(true);
      setError(null);
      await mlService.trainCustomerSegmentationModel();
      alert('Modelo de segmentación entrenado exitosamente');
      await loadSegmentStats();
    } catch (err: any) {
      console.error('Error al entrenar modelo:', err);
      setError(err.response?.data?.message || 'Error al entrenar el modelo');
    } finally {
      setLoading(false);
    }
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'vip':
        return '👑';
      case 'frequent':
        return '⭐';
      case 'occasional':
        return '🔵';
      case 'at risk':
        return '⚠️';
      case 'new':
        return '🆕';
      case 'inactive':
        return '😴';
      default:
        return '👤';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'vip':
        return '#8b5cf6';
      case 'frequent':
        return '#10b981';
      case 'occasional':
        return '#f59e0b';
      case 'at risk':
        return '#ef4444';
      case 'new':
        return '#3b82f6';
      case 'inactive':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  // Datos para gráfico de pastel
  const pieChartData = {
    labels: segmentStats.map((s) => `${s.segment_type} (${s.count})`),
    datasets: [
      {
        data: segmentStats.map((s) => s.count),
        backgroundColor: segmentStats.map((s) => s.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Segmentos de Clientes',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / 100) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  if (loading && customers.length === 0) {
    return (
      <>
        <AppHeader title="Segmentación de Clientes" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Segmentación de Clientes" />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Botón de entrenar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTrainModel}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '🎓 Entrenar Modelo'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

      {/* Distribución de Segmentos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Gráfico */}
        <Card>
          <CardContent>
            <Pie data={pieChartData} options={pieChartOptions} />
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Estadísticas por Segmento
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Segmento</TableCell>
                    <TableCell align="right">Clientes</TableCell>
                    <TableCell align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {segmentStats.map((stat) => (
                    <TableRow key={stat.segment_type}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span style={{ fontSize: '20px' }}>
                            {getSegmentIcon(stat.segment_type)}
                          </span>
                          <Chip
                            label={stat.segment_type}
                            size="small"
                            sx={{
                              bgcolor: stat.color,
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">{stat.count}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="text.secondary">{stat.percentage}%</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Selector de Cliente */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Buscar segmento de un cliente específico
          </Typography>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name} (${option.email})`
            }
            value={selectedCustomer}
            onChange={(_, newValue) => handleCustomerSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar cliente"
                placeholder="Escribe el nombre o email..."
                variant="outlined"
              />
            )}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Loading Segmento */}
      {loadingSegment && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary" mt={2}>
              Analizando perfil del cliente...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Detalles del Segmento del Cliente */}
      {customerSegment && !loadingSegment && (
        <Box>
          {/* Cliente Seleccionado */}
          <Card
            sx={{
              mb: 3,
              bgcolor: getSegmentColor(customerSegment.segment_type),
              color: 'white',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h3">
                  {getSegmentIcon(customerSegment.segment_type)}
                </Typography>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedCustomer?.first_name} {selectedCustomer?.last_name}
                  </Typography>
                  <Typography variant="body1">{selectedCustomer?.email}</Typography>
                </Box>
              </Box>
              <Chip
                label={customerSegment.segment_type}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  px: 2,
                  py: 1,
                }}
              />
            </CardContent>
          </Card>

          {/* Scores RFM */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={3}>
                📊 Scores RFM (Recency, Frequency, Monetary)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                {/* Recency */}
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {customerSegment.rfm_scores.recency}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Recency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qué tan reciente fue su última compra
                  </Typography>
                </Box>

                {/* Frequency */}
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {customerSegment.rfm_scores.frequency}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Frequency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Con qué frecuencia compra
                  </Typography>
                </Box>

                {/* Monetary */}
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {customerSegment.rfm_scores.monetary}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Monetary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cuánto gasta en promedio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Características y Recomendaciones */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Características */}
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Activity size={24} />
                  <Typography variant="h6" fontWeight="bold">
                    Características del Segmento
                  </Typography>
                </Box>
                {customerSegment.characteristics.map((char, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {char}
                  </Alert>
                ))}
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TrendingUp size={24} />
                  <Typography variant="h6" fontWeight="bold">
                    Recomendaciones de Acción
                  </Typography>
                </Box>
                {customerSegment.recommendations.map((rec, index) => (
                  <Alert key={index} severity="success" sx={{ mb: 1 }}>
                    {rec}
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Initial State */}
      {!selectedCustomer && !loadingSegment && (
        <Box textAlign="center" py={8}>
          <Users size={64} color="#9ca3af" />
          <Typography variant="h6" color="text.secondary" mt={2} mb={1}>
            Selecciona un cliente arriba
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El sistema ML analizará su perfil y mostrará su segmento RFM
          </Typography>
        </Box>
      )}
      </Container>
    </>
  );
};

export default CustomerSegmentation;
