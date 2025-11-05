import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';

const CustomerLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  // Datos de ejemplo
  const products = [
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

  const categories = [
    { name: 'Todo', active: true },
    { name: 'Deportivo', active: false },
    { name: 'Casual', active: false },
    { name: 'Urbano', active: false },
    { name: 'Clásico', active: false }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e8e8e8',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            letterSpacing: '2px'
          }}>
            SPORTSWEAR
          </div>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }} className="desktop-nav">
            {categories.map(cat => (
              <button key={cat.name} style={{
                background: 'none',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: cat.active ? '600' : '400',
                color: cat.active ? '#1a1a1a' : '#666666',
                cursor: 'pointer',
                padding: '0.5rem 0',
                borderBottom: cat.active ? '2px solid #1a1a1a' : '2px solid transparent',
                transition: 'all 0.25s'
              }}>
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a1a1a',
              padding: '0.5rem'
            }}>
              <Search size={20} />
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a1a1a',
              padding: '0.5rem'
            }}>
              <Heart size={20} />
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a1a1a',
              padding: '0.5rem',
              position: 'relative'
            }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1a1a1a',
              padding: '0.5rem'
            }}>
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '600px',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.9
        }} />
        <div style={{
          position: 'relative',
          maxWidth: '1280px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem'
        }}>
          <div style={{
            maxWidth: '600px'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#666666',
              letterSpacing: '2px',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              Nueva Colección
            </div>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '700',
              color: '#1a1a1a',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Colección<br />Deportiva 2024
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#666666',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Diseños minimalistas para un estilo de vida activo
            </p>
            <button style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              padding: '1rem 2.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.25s',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Ver Catálogo
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '5rem 1.5rem'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Bestsellers
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666666'
          }}>
            Los más populares de la temporada
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid #e8e8e8',
              transition: 'all 0.25s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = '#d0d0d0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e8e8e8';
            }}>
              <div style={{
                position: 'relative',
                aspectRatio: '3/4',
                backgroundColor: '#f5f5f5',
                overflow: 'hidden'
              }}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <button style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s'
                }}>
                  <Heart size={18} />
                </button>
              </div>
              <div style={{
                padding: '1.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#999999',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.5rem'
                }}>
                  {product.category}
                </div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.75rem'
                }}>
                  {product.name}
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {product.colors.map(color => (
                    <div key={color} style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: color === 'Negro' ? '#1a1a1a' : color === 'Gris' ? '#9e9e9e' : color === 'Blanco' ? '#ffffff' : '#f5f5f5',
                      border: '1px solid #e8e8e8'
                    }} />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1a1a1a'
                  }}>
                    ${product.price}
                  </span>
                  <button style={{
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '4rem 1.5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '1rem'
            }}>SPORTSWEAR</h4>
            <p style={{
              color: '#999999',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              Moda deportiva y casual para un estilo de vida activo
            </p>
          </div>
          <div>
            <h5 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Tienda</h5>
            <ul style={{
              listStyle: 'none',
              fontSize: '0.875rem',
              color: '#999999'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Hombre</li>
              <li style={{ marginBottom: '0.5rem' }}>Mujer</li>
              <li style={{ marginBottom: '0.5rem' }}>Accesorios</li>
            </ul>
          </div>
          <div>
            <h5 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Ayuda</h5>
            <ul style={{
              listStyle: 'none',
              fontSize: '0.875rem',
              color: '#999999'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Contacto</li>
              <li style={{ marginBottom: '0.5rem' }}>Envíos</li>
              <li style={{ marginBottom: '0.5rem' }}>Devoluciones</li>
            </ul>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #2d2d2d',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#666666',
          fontSize: '0.875rem'
        }}>
          © 2024 Sportswear. Todos los derechos reservados.
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
        }
      `}</style>
    </div>
  );
};

export default CustomerLayout;