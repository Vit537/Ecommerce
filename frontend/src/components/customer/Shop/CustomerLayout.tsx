import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  colors: string[];
}

interface Category {
  name: string;
  active: boolean;
}

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const products: Product[] = [
    {
      id: 1,
      name: 'Hoodie Training',
      category: 'Deportivo',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      colors: ['Negro', 'Gris', 'Blanco']
    },
    {
      id: 2,
      name: 'Pantalón Wide Leg',
      category: 'Casual',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
      colors: ['Negro', 'Beige']
    },
    {
      id: 3,
      name: 'Jersey Térmico',
      category: 'Deportivo',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400',
      colors: ['Azul', 'Negro']
    },
    {
      id: 4,
      name: 'Short Training',
      category: 'Deportivo',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
      colors: ['Negro', 'Gris']
    }
  ];

  const categories: Category[] = [
    { name: 'Todo', active: true },
    { name: 'Deportivo', active: false },
    { name: 'Casual', active: false },
    { name: 'Urbano', active: false },
    { name: 'Clásico', active: false }
  ];

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'Negro': 'bg-primary',
      'Gris': 'bg-gray-500',
      'Blanco': 'bg-white',
      'Beige': 'bg-[#f5f5dc]',
      'Azul': 'bg-blue-600'
    };
    return colorMap[color] || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold text-primary tracking-[2px]">
            SPORTSWEAR
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            {categories.map(cat => (
              <button 
                key={cat.name}
                className={`text-sm font-${cat.active ? 'semibold' : 'normal'} py-2 border-b-2 transition-all ${
                  cat.active 
                    ? 'text-primary border-primary' 
                    : 'text-gray-600 border-transparent hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <Heart size={20} />
            </button>
            <button className="relative p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white rounded-full w-[18px] h-[18px] text-[10px] flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {children || (
        <>
          {/* Hero Section */}
          <section className="relative h-[600px] bg-gray-100 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative max-w-7xl mx-auto h-full flex items-center px-6">
              <div className="max-w-2xl">
                <div className="text-sm font-semibold text-gray-600 tracking-[2px] mb-4 uppercase">
                  Nueva Colección
                </div>
                <h1 className="text-6xl font-bold text-primary leading-tight mb-6 font-display">
                  Colección<br />Deportiva 2024
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Diseños minimalistas para un estilo de vida activo
                </p>
                <button className="btn-primary">
                  Ver Catálogo
                </button>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-2 font-display">
                Bestsellers
              </h2>
              <p className="text-base text-gray-600">
                Los más populares de la temporada
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:-translate-y-2 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                      <Heart size={18} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-base font-semibold text-primary mb-3">
                      {product.name}
                    </h3>
                    <div className="flex gap-2 mb-4">
                      {product.colors.map(color => (
                        <div 
                          key={color}
                          className={`w-5 h-5 rounded-full border border-gray-200 ${getColorClass(color)}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      <button className="btn-primary">
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-primary text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                <div>
                  <h4 className="text-lg font-bold mb-4">SPORTSWEAR</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Moda deportiva y casual para un estilo de vida activo
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold mb-4 uppercase tracking-wider">Tienda</h5>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="hover:text-white cursor-pointer transition-colors">Hombre</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Mujer</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Accesorios</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold mb-4 uppercase tracking-wider">Ayuda</h5>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="hover:text-white cursor-pointer transition-colors">Contacto</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Envíos</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Devoluciones</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-8 text-center text-gray-600 text-sm">
                © 2024 Sportswear. Todos los derechos reservados.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default CustomerLayout;
