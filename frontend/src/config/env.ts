// Configuración de entorno que funciona tanto en desarrollo como en producción

// En producción, window._env_ es inyectado por el script config.js
// En desarrollo, usamos import.meta.env de Vite
declare global {
  interface Window {
    _env_?: {
      VITE_API_URL: string;
      VITE_APP_NAME: string;
      VITE_APP_VERSION: string;
    };
  }
}

const getEnvVar = (key: string, defaultValue: string): string => {
  // Primero intentamos obtener desde window._env_ (producción)
  if (typeof window !== 'undefined' && window._env_) {
    const value = window._env_[key as keyof typeof window._env_];
    if (value) return value;
  }
  
  // Si no existe, usamos import.meta.env (desarrollo)
  const viteEnv = import.meta.env[key];
  if (viteEnv) return viteEnv as string;
  
  // Finalmente, el valor por defecto
  return defaultValue;
};

export const config = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8000'),
  appName: getEnvVar('VITE_APP_NAME', 'Boutique E-commerce'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
