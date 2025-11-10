import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import CartDrawer from '../Cart/CartDrawer';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { categoryService, Category } from '../../../services/productService';

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, isCartOpen, openCart, closeCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-300 z-40">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/shop" className="text-2xl font-bold text-black uppercase tracking-wider">
              SPORTSWEAR
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/shop" 
                className="text-sm font-medium text-black uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                Todos los productos
              </Link>
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="text-sm font-medium text-gray-600 uppercase tracking-wider hover:text-black transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button className="p-2 hover:bg-gray-100 transition-colors">
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <button className="p-2 hover:bg-gray-100 transition-colors">
                <Heart size={20} />
              </button>

              {/* Cart */}
              <button 
                onClick={openCart}
                className="relative p-2 hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User */}
              <button 
                onClick={() => navigate(isAuthenticated ? '/profile' : '/customer/login')}
                className="p-2 hover:bg-gray-100 transition-colors relative"
                title={isAuthenticated ? user?.first_name : 'Iniciar sesión'}
              >
                <User size={20} />
                {isAuthenticated && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden border-t border-gray-300 py-4 space-y-2">
              <Link 
                to="/shop" 
                className="block py-2 text-sm font-medium text-black uppercase tracking-wider hover:bg-gray-100 px-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Todos los productos
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="block py-2 text-sm font-medium text-gray-600 uppercase tracking-wider hover:bg-gray-100 px-4 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-4">
                SPORTSWEAR
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Moda deportiva minimalista para un estilo de vida activo
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
                Tienda
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Todos los productos
                  </Link>
                </li>
                <li>
                  <Link to="/shop?is_featured=true" className="hover:text-white transition-colors">
                    Destacados
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    Nuevos ingresos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
                Ayuda
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Envíos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Devoluciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Términos y condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SPORTSWEAR. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default CustomerLayout;
