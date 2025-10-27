import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

// Datos de ejemplo
const sampleProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    originalPrice: 1299.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium.png',
    rating: 4.8,
    reviews: 1250,
    category: 'Smartphones'
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    price: 1099.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606.png',
    rating: 4.9,
    reviews: 890,
    category: 'Laptops'
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    price: 249.99,
    originalPrice: 279.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202209.png',
    rating: 4.7,
    reviews: 2100,
    category: 'Auriculares'
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210.png',
    rating: 4.8,
    reviews: 650,
    category: 'Tablets'
  },
  {
    id: '5',
    name: 'Apple Watch Series 9',
    price: 399.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-gps-select-202309-41mm-pink.png',
    rating: 4.6,
    reviews: 1800,
    category: 'Smartwatch'
  },
  {
    id: '6',
    name: 'Mac Studio M3',
    price: 1999.99,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-studio-select-202306.png',
    rating: 4.9,
    reviews: 320,
    category: 'Computadoras'
  }
];

export default function HomePage() {
  const handleAddToCart = (productId: string) => {
    console.log('Agregando al carrito:', productId);
    // Aquí iría la lógica para agregar al carrito
  };

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorito:', productId);
    // Aquí iría la lógica para manejar favoritos
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">MiStore</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Descubre los mejores productos con la mejor experiencia de compra
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Explorar Productos
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir MiStore?</h2>
              <p className="text-lg text-gray-600">Características que nos hacen únicos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
                <p className="text-gray-600">Entrega en 24-48 horas en toda la ciudad</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Garantía Total</h3>
                <p className="text-gray-600">30 días de garantía en todos nuestros productos</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mejores Precios</h3>
                <p className="text-gray-600">Precios competitivos y ofertas exclusivas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Productos Destacados</h2>
              <p className="text-lg text-gray-600">Descubre nuestros productos más populares</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sampleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¡Mantente Actualizado!</h2>
            <p className="text-xl text-blue-100 mb-8">Suscríbete para recibir ofertas exclusivas y novedades</p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Suscribirse
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MiStore</h3>
              <p className="text-gray-400">La mejor experiencia de compra online</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Smartphones</li>
                <li>Laptops</li>
                <li>Tablets</li>
                <li>Accesorios</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Garantías</li>
                <li>Devoluciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MiStore. Todos los derechos reservados. Basado en componentes de Saleor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}