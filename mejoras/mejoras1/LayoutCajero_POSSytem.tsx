import React, { useState } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, QrCode, Clock, User, Package } from 'lucide-react';

const CashierLayout = () => {
  const [cart, setCart] = useState([
    { id: 1, name: 'Hoodie Training', size: 'M', color: 'Negro', price: 89.99, quantity: 1, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100' },
    { id: 2, name: 'Pantalón Wide Leg', size: 'L', color: 'Gris', price: 69.99, quantity: 2, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('efectivo');

  const products = [
    { id: 1, name: 'Hoodie Training', price: 89.99, stock: 15, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100', category: 'Deportivo' },
    { id: 2, name: 'Pantalón Wide', price: 69.99, stock: 23, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100', category: 'Casual' },
    { id: 3, name: 'Jersey Térmico', price: 79.99, stock: 18, image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=100', category: 'Deportivo' },
    { id: 4, name: 'Short Training', price: 49.99, stock: 30, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=100', category: 'Deportivo' }
  ];

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Sidebar - Productos */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e8e8e8'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem'
          }}>
            Punto de Venta
          </div>
          <div style={{
            position: 'relative'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999999'
            }} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #e8e8e8',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem'
          }}>
            {products.map(product => (
              <div key={product.id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e8',
                borderRadius: '0.75rem',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem',
                  overflow: 'hidden'
                }}>
                  <img src={product.image} alt={product.name} style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }} />
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.name}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#1a1a1a'
                  }}>
                    ${product.price}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: product.stock > 10 ? '#4caf50' : '#ff9800',
                    fontWeight: '600'
                  }}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Carrito y Pago */}
      <div style={{
        width: '420px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Cajero */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontSize: '0.875rem',
              color: '#666666',
              marginBottom: '0.25rem'
            }}>
              Cajero
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              María González
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f5f5f5',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem'
          }}>
            <Clock size={16} color="#666666" />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              14:32
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShoppingCart size={18} />
            Orden actual ({cart.length} items)
          </div>

          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#999999'
            }}>
              <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e8e8e8',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <img src={item.image} alt={item.name} style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '0.5rem',
                    objectFit: 'cover'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      marginBottom: '0.25rem'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#666666',
                      marginBottom: '0.5rem'
                    }}>
                      {item.size} • {item.color}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '0.375rem',
                        padding: '0.25rem'
                      }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          color: '#666666'
                        }}>
                          <Minus size={14} />
                        </button>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#1a1a1a',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          color: '#666666'
                        }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#1a1a1a'
                        }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button onClick={() => removeItem(item.id)} style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          color: '#f44336',
                          display: 'flex'
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div style={{
          borderTop: '2px solid #e8e8e8',
          padding: '1.5rem',
          backgroundColor: '#fafafa'
        }}>
          {/* Método de pago */}
          <div style={{
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '0.75rem'
            }}>
              Método de pago
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {[
                { id: 'efectivo', label: 'Efectivo', icon: DollarSign },
                { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                { id: 'qr', label: 'QR', icon: QrCode }
              ].map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    style={{
                      padding: '0.75rem',
                      border: selectedPayment === method.id ? '2px solid #1a1a1a' : '1px solid #e8e8e8',
                      borderRadius: '0.5rem',
                      backgroundColor: selectedPayment === method.id ? '#f5f5f5' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={20} color={selectedPayment === method.id ? '#1a1a1a' : '#666666'} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: selectedPayment === method.id ? '600' : '400',
                      color: selectedPayment === method.id ? '#1a1a1a' : '#666666'
                    }}>
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totales */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#666666' }}>Subtotal</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px dashed #e8e8e8'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#666666' }}>IVA (13%)</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                ${(calculateTotal() * 0.13).toFixed(2)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a1a' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a' }}>
                ${(calculateTotal() * 1.13).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e8e8e8',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#666666',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Cancelar
            </button>
            <button style={{
              flex: 2,
              padding: '1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Completar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierLayout;