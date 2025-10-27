/**
 * Servicio API para Machine Learning
 * Maneja todas las llamadas a los endpoints de ML
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Obtener token del localStorage
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token;
};

// Configuración de axios con autenticación
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/ml`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== TIPOS ====================

export interface SalesPrediction {
  date: string;
  predicted_sales: number;
  predicted_quantity: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface SalesForecastResponse {
  success: boolean;
  predictions: SalesPrediction[];
  summary: {
    total_predicted_sales: number;
    avg_daily_sales: number;
    total_predicted_quantity: number;
  };
}

export interface ProductRecommendation {
  product_id: string;
  product_name: string;
  similarity_score: number;
  price: number;
  image_url: string | null;
  rank: number;
}

export interface ProductRecommendationsResponse {
  success: boolean;
  source_product_id: string;
  recommendations: ProductRecommendation[];
}

export interface CustomerSegment {
  segment_type: string;
  rfm_scores: {
    recency: number;
    frequency: number;
    monetary: number;
  };
  characteristics: string[];
  recommendations: string[];
}

export interface InventoryAlert {
  product_id: string;
  product_name: string;
  alert_type: string;
  current_stock: number;
  recommended_stock: number;
  urgency_level: number;
  message: string;
}

export interface InventoryAnalysisResponse {
  success: boolean;
  total_products: number;
  alerts: InventoryAlert[];
  alerts_by_type: { [key: string]: number };
  health_score: number;
  health_status: string;
  recommendations: string[];
}

export interface DashboardSummary {
  sales_forecast: {
    next_7_days: number;
    next_30_days: number;
    trend: string;
  };
  inventory: {
    total_alerts: number;
    critical_alerts: number;
    health_score: number;
  };
  customers: {
    total_segments: number;
    vip_customers: number;
    at_risk_customers: number;
  };
  recommendations: {
    total_products: number;
    avg_similarity: number;
  };
}

// ==================== FUNCIONES API ====================

/**
 * Entrenar modelo de predicción de ventas
 */
export const trainSalesForecastModel = async (modelType: string = 'random_forest') => {
  const response = await apiClient.post('/train-sales-forecast/', {
    model_type: modelType,
  });
  return response.data;
};

/**
 * Predecir ventas futuras
 */
export const predictSales = async (daysAhead: number = 30): Promise<SalesForecastResponse> => {
  const response = await apiClient.post('/predict-sales/', {
    days_ahead: daysAhead,
  });
  return response.data;
};

/**
 * Entrenar modelo de recomendaciones
 */
export const trainProductRecommendationModel = async () => {
  const response = await apiClient.post('/train-product-recommendation/');
  return response.data;
};

/**
 * Obtener recomendaciones para un producto
 */
export const getProductRecommendations = async (
  productId: string,
  topN: number = 5
): Promise<ProductRecommendationsResponse> => {
  const response = await apiClient.get(`/product-recommendations/${productId}/`, {
    params: { top_n: topN },
  });
  return response.data;
};

/**
 * Entrenar modelo de segmentación de clientes
 */
export const trainCustomerSegmentationModel = async () => {
  const response = await apiClient.post('/train-customer-segmentation/');
  return response.data;
};

/**
 * Obtener segmento de un cliente
 */
export const getCustomerSegment = async (customerId: string): Promise<CustomerSegment> => {
  const response = await apiClient.get(`/customer-segment/${customerId}/`);
  return response.data;
};

/**
 * Analizar inventario
 */
export const analyzeInventory = async (): Promise<InventoryAnalysisResponse> => {
  const response = await apiClient.get('/inventory-analysis/');
  return response.data;
};

/**
 * Obtener recomendaciones de reorden
 */
export const getReorderRecommendations = async () => {
  const response = await apiClient.get('/reorder-recommendations/');
  return response.data;
};

/**
 * Obtener score de salud del inventario
 */
export const getInventoryHealth = async () => {
  const response = await apiClient.get('/inventory-health/');
  return response.data;
};

/**
 * Obtener resumen del dashboard ML
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get('/dashboard-summary/');
  return response.data;
};

/**
 * Listar todos los modelos ML
 */
export const listMLModels = async () => {
  const response = await apiClient.get('/models/');
  return response.data;
};

/**
 * Obtener historial de predicciones
 */
export const getPredictionHistory = async () => {
  const response = await apiClient.get('/predictions/');
  return response.data;
};

/**
 * Obtener logs de entrenamiento
 */
export const getTrainingLogs = async () => {
  const response = await apiClient.get('/training-logs/');
  return response.data;
};

export default {
  // Training
  trainSalesForecastModel,
  trainProductRecommendationModel,
  trainCustomerSegmentationModel,
  
  // Predictions
  predictSales,
  getProductRecommendations,
  getCustomerSegment,
  
  // Inventory
  analyzeInventory,
  getReorderRecommendations,
  getInventoryHealth,
  
  // Dashboard
  getDashboardSummary,
  
  // Admin
  listMLModels,
  getPredictionHistory,
  getTrainingLogs,
};
