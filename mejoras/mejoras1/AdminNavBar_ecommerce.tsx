import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Home, Users, Package, ShoppingCart, Shield, UserCog, Brain, MessageSquare, BarChart3, Settings, X, Menu, Bell, Search } from 'lucide-react';

const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin/dashboard',
    section: 'main'
  },
  {
    id: 'products',
    label: 'Productos',
    icon: Package,
    section: 'main',
    subsections: [
      { id: 'products-list', label: 'Lista de productos', path: '/admin/products' },
      { id: 'categories', label: 'Categorías', path: '/admin/categories' },
      { id: 'brands', label: 'Marcas', path: '/admin/brands' },
      { id: 'variants', label: 'Variantes', path: '/admin/variants' },
      { id: 'inventory', label: 'Inventario', path: '/admin/inventory' }
    ]
  },
  {
    id: 'orders',
    label: 'Órdenes',
    icon: ShoppingCart,
    section: 'main',
    subsections: [
      { id: 'orders-list', label: 'Todas las órdenes', path: '/admin/orders' },
      { id: 'payments', label: 'Pagos', path: '/admin/payments' },
      { id: 'invoices', label: 'Facturas', path: '/admin/invoices' },
      { id: 'cart', label: 'Carritos', path: '/admin/carts' }
    ]
  },
  {
    id: 'customers',
    label: 'Clientes',
    icon: Users,
    section: 'main',
    subsections: [
      { id: 'customers-list', label: 'Todos los clientes', path: '/admin/customers' },
      { id: 'addresses', label: 'Direcciones', path: '/admin/addresses' }
    ]
  },
  {
    id: 'employees',
    label: 'Empleados',
    icon: UserCog,
    section: 'main',
    path: '/admin/employees'
  },
  {
    id: 'iam',
    label: 'Seguridad',
    icon: Shield,
    section: 'security',
    subsections: [
      { id: 'users', label: 'Usuarios', path: '/admin/users' },
      { id: 'roles', label: 'Roles', path: '/admin/roles' },
      { id: 'permissions', label: 'Permisos', path: '/admin/permissions' }
    ]
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    icon: Brain,
    section: 'analytics',
    subsections: [
      { id: 'predictions', label: 'Predicciones', path: '/admin/ml/predictions' },
      { id: 'recommendations', label: 'Recomendaciones', path: '/admin/ml/recommendations' },
      { id: 'trends', label: 'Tendencias', path: '/admin/ml/trends' }
    ]
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: BarChart3,
    section: 'analytics',
    path: '/admin/reports'
  },
  {
    id: 'assistant',
    label: 'Asistente IA',
    icon: MessageSquare,
    section: 'tools',
    path: '/admin/assistant'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    section: 'tools',
    path: '/admin/settings'
  }
];

const AdminNavbar = () => {
  const [openSections, setOpenSections] = useState({});
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  const toggleSection = (id) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleItemClick = (id, path) => {
    setActiveItem(id);
    console.log('Navegando a:', path);
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isOpen = openSections[item.id];
    const hasSubsections = item.subsections && item.subsections.length > 0;
    const isActive = activeItem === item.id;

    return (
      <div style={{ marginBottom: '0.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: isActive && !hasSubsections ? '#1a1a1a' : 'transparent',
            color: isActive && !hasSubsections ? '#ffffff' : '#1a1a1a'
          }}
          onClick={() => {
            if (hasSubsections) {
              toggleSection(item.id);
            } else {
              handleItemClick(item.id, item.path);
            }
          }}
          onMouseEnter={(e) => {
            if (!isActive || hasSubsections) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive || hasSubsections) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
          </div>
          {hasSubsections && (
            isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </div>
        
        {hasSubsections && isOpen && (
          <div style={{ marginTop: '0.25rem', marginLeft: '2.5rem' }}>
            {item.subsections.map(sub => (
              <div
                key={sub.id}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeItem === sub.id ? '#f5f5f5' : 'transparent',
                  fontSize: '0.875rem',
                  color: activeItem === sub.id ? '#1a1a1a' : '#666666',
                  fontWeight: activeItem === sub.id ? '600' : '400'
                }}
                onClick={() => handleItemClick(sub.id, sub.path)}
                onMouseEnter={(e) => {
                  if (activeItem !== sub.id) {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeItem !== sub.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {sub.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const groupedNav = {
    main: navigationConfig.filter(item => item.section === 'main'),
    security: navigationConfig.filter(item => item.section === 'security'),
    analytics: navigationConfig.filter(item => item.section === 'analytics'),
    tools: navigationConfig.filter(item => item.section === 'tools')
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fafafa', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: isNavOpen ? '280px' : '0',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e8e8e8',
        transition: 'width 0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a1a', letterSpacing: '1px' }}>
              ADMIN
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.25rem' }}>
              Panel de control
            </div>
          </div>
          <button onClick={() => setIsNavOpen(false)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#666666'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0 1rem',
              marginBottom: '0.5rem'
            }}>
              Principal
            </div>
            {groupedNav.main.map(item => <NavItem key={item.id} item={item} />)}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0 1rem',
              marginBottom: '0.5rem'
            }}>
              Seguridad
            </div>
            {groupedNav.security.map(item => <NavItem key={item.id} item={item} />)}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0 1rem',
              marginBottom: '0.5rem'
            }}>
              Análisis
            </div>
            {groupedNav.analytics.map(item => <NavItem key={item.id} item={item} />)}
          </div>

          <div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#999999',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0 1rem',
              marginBottom: '0.5rem'
            }}>
              Herramientas
            </div>
            {groupedNav.tools.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e8e8e8',
          backgroundColor: '#fafafa'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#1a1a1a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '700'
            }}>
              AD
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a1a1a' }}>
                Admin
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                admin@store.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e8e8e8',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!isNavOpen && (
            <button onClick={() => setIsNavOpen(true)} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#1a1a1a'
            }}>
              <Menu size={20} />
            </button>
          )}
          
          <div style={{ flex: 1, maxWidth: '500px', marginLeft: isNavOpen ? '0' : '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999999'
              }} />
              <input
                type="text"
                placeholder="Buscar..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '1px solid #e8e8e8',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#fafafa'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              position: 'relative',
              color: '#1a1a1a'
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                width: '8px',
                height: '8px',
                backgroundColor: '#f44336',
                borderRadius: '50%'
              }} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '0.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Dashboard
            </h1>
            <p style={{ color: '#666666', marginBottom: '2rem' }}>
              Panel de administración general
            </p>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Ventas Hoy', value: '$2,543', change: '+12.5%', icon: ShoppingCart, color: '#1a1a1a' },
                { label: 'Productos', value: '234', change: '+5', icon: Package, color: '#666666' },
                { label: 'Clientes', value: '1,234', change: '+23', icon: Users, color: '#999999' },
                { label: 'Órdenes', value: '89', change: '+8', icon: BarChart3, color: '#1a1a1a' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '1rem',
                    padding: '1.5rem',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={24} color={stat.color} />
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#4caf50',
                        backgroundColor: '#e8f5e9',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        height: 'fit-content'
                      }}>
                        {stat.change}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Box */}
            <div style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Sistema de Gestión Completo
              </h3>
              <p style={{ color: '#e8e8e8', marginBottom: '1.5rem' }}>
                Navega por las secciones del menú lateral para acceder a todas las funcionalidades
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>✅ Gestión de productos</div>
                <div>✅ Control de inventario</div>
                <div>✅ Análisis de ventas</div>
                <div>✅ Machine Learning</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;