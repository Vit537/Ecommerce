/**
 * Utilities para manejo de imágenes
 */

/**
 * Obtiene la URL de imagen por defecto para productos
 */
export const getDefaultProductImage = (): string => {
  // Usando un servicio de placeholder images con color consistente para e-commerce
  return 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Producto';
};

/**
 * Obtiene la primera imagen del producto o la imagen por defecto
 */
export const getProductImage = (images: string[] | undefined): string => {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  return getDefaultProductImage();
};

/**
 * Manejador de error de imagen - cambia a imagen por defecto
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== getDefaultProductImage()) {
    img.src = getDefaultProductImage();
  }
};

/**
 * Componente SVG para imagen placeholder cuando no hay conexión
 */
export const PlaceholderSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`text-gray-300 ${className}`}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm8 3l3 4H7l2-3 2 2 3-3z" />
  </svg>
);