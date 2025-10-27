/**
 * Componente de Recomendaciones de Productos ML
 * Muestra recomendaciones basadas en Machine Learning para productos seleccionados
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Rating,
} from '@mui/material';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mlService, { ProductRecommendationsResponse } from '../services/mlService';
import AppHeader from '../components/AppHeader';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string;
}

const ProductRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendationsResponse | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Cargar lista de productos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/products/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setProducts(data);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar la lista de productos');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product: Product | null) => {
    setSelectedProduct(product);
    setRecommendations(null);
    
    if (!product) return;

    try {
      setLoadingRecommendations(true);
      setError(null);
      const recs = await mlService.getProductRecommendations(product.id, 10);
      setRecommendations(recs);
    } catch (err: any) {
      console.error('Error al obtener recomendaciones:', err);
      setError(err.response?.data?.message || 'Error al obtener recomendaciones');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleTrainModel = async () => {
    try {
      setLoading(true);
      setError(null);
      await mlService.trainProductRecommendationModel();
      alert('Modelo de recomendaciones entrenado exitosamente');
    } catch (err: any) {
      console.error('Error al entrenar modelo:', err);
      setError(err.response?.data?.message || 'Error al entrenar el modelo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <>
        <AppHeader title="Recomendaciones de Productos" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Recomendaciones de Productos" />
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
        </Box>      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Selector de Producto */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Selecciona un producto para ver recomendaciones
          </Typography>
          <Autocomplete
            options={products}
            getOptionLabel={(option) => `${option.name} - Bs. ${option.price.toLocaleString()}`}
            value={selectedProduct}
            onChange={(_, newValue) => handleProductSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar producto"
                placeholder="Escribe el nombre del producto..."
                variant="outlined"
              />
            )}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Loading Recomendaciones */}
      {loadingRecommendations && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary" mt={2}>
              Generando recomendaciones con IA...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Producto Seleccionado */}
      {selectedProduct && !loadingRecommendations && (
        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" mb={1}>
              📦 Producto Seleccionado
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {selectedProduct.name}
            </Typography>
            <Typography variant="h6" mt={1}>
              Bs. {selectedProduct.price.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Sparkles size={28} color="#f59e0b" />
            <Typography variant="h5" fontWeight="bold">
              Productos Recomendados ({recommendations.recommendations.length})
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
                lg: '1fr 1fr 1fr 1fr 1fr',
              },
              gap: 3,
            }}
          >
            {recommendations.recommendations.map((rec) => (
              <Card
                key={rec.product_id}
                sx={{
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                {/* Rank Badge */}
                <Chip
                  label={`#${rec.rank}`}
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1,
                    fontWeight: 'bold',
                  }}
                />

                {/* Similarity Score Badge */}
                <Chip
                  label={`${(rec.similarity_score * 100).toFixed(1)}%`}
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    fontWeight: 'bold',
                  }}
                />

                {/* Product Image */}
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {rec.image_url ? (
                    <img
                      src={rec.image_url}
                      alt={rec.product_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Typography variant="h1" color="text.secondary">
                      📦
                    </Typography>
                  )}
                </CardMedia>

                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3em',
                    }}
                  >
                    {rec.product_name}
                  </Typography>

                  <Typography variant="h5" color="primary" fontWeight="bold" mt={1}>
                    Bs. {rec.price.toLocaleString()}
                  </Typography>

                  <Box display="flex" alignItems="center" mt={2} gap={1}>
                    <TrendingUp size={16} color="#10b981" />
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      Similitud: {(rec.similarity_score * 100).toFixed(1)}%
                    </Typography>
                  </Box>

                  <Rating
                    value={rec.similarity_score * 5}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Info Footer */}
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>ℹ️ Método Híbrido:</strong> Estas recomendaciones se generan usando un
              algoritmo híbrido que combina:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>
                <strong>Filtrado Colaborativo:</strong> Analiza productos frecuentemente
                comprados juntos
              </li>
              <li>
                <strong>Filtrado por Contenido:</strong> Considera características similares
                (categoría, género, precio)
              </li>
            </ul>
          </Alert>
        </Box>
      )}

      {/* Empty State */}
      {recommendations && recommendations.recommendations.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No se encontraron recomendaciones para este producto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El modelo necesita más datos de ventas para generar recomendaciones precisas.
          </Typography>
        </Box>
      )}

      {/* Initial State */}
      {!selectedProduct && !loadingRecommendations && (
        <Box textAlign="center" py={8}>
          <Sparkles size={64} color="#9ca3af" />
          <Typography variant="h6" color="text.secondary" mt={2} mb={1}>
            Selecciona un producto arriba
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El sistema ML generará recomendaciones personalizadas instantáneamente
          </Typography>
        </Box>
      )}
      </Container>
    </>
  );
};

export default ProductRecommendations;
