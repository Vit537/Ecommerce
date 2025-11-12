import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  Package,
  ShoppingCart,
  Shield,
  UserCog,
  Brain,
  MessageSquare,
  BarChart3,
  Settings,
  X,
  Menu,
  Bell,
  Search,
  User,
  FileText,
  DollarSign,
  LogOut,
  ChevronUp,
  Sparkles,
  CreditCard,
  Clock,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import AIAssistantChatEnhanced from "../AIAssistant/AIAssistantChatEnhanced";
import NotificationDropdown from "./NotificationDropdown";
// import AIAssistantChat from '../AIAssistant/AIAssistantChat';

const navigationConfig = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/admin",
    section: "main",
  },
  {
    id: "products",
    label: "Inventario",
    icon: Package,
    section: "main",
    subsections: [
      {
        id: "products-list",
        label: "Lista de productos",
        path: "/admin/products",
      },
      { id: "categories", label: "Categorías", path: "/admin/categories" },
      // { id: 'brands', label: 'Marcas', path: '/admin/brands' },
      // { id: 'variants', label: 'Variantes', path: '/admin/variants' },
      // { id: 'inventory', label: 'Inventario', path: '/admin/inventory' }
    ],
  },
  // {
  //   id: "orders",
  //   label: "Órdenes",
  //   icon: ShoppingCart,
  //   section: "main",
  //   subsections: [
  //     { id: "orders-list", label: "Todas las órdenes", path: "/admin/orders" },
  //     { id: "payments", label: "Pagos", path: "/admin/payments" },
  //     { id: "invoices", label: "Facturas", path: "/admin/invoices" },
  //     { id: "cart", label: "Carritos", path: "/admin/carts" },
  //   ],
  // },
  {
    id: "customers",
    label: "Clientes",
    icon: Users,
    section: "main",
    subsections: [
      {
        id: "customers-list",
        label: "Gestión de clientes",
        path: "/admin/customers",
      },
      // { id: "addresses", label: "Direcciones", path: "/admin/addresses" },
    ],
  },
  {
    id: "staff",
    label: "Usuarios del Sistema",
    icon: UserCog,
    section: "main",
    subsections: [
      {
        id: "staff-list",
        label: "Cajeros y Administradores",
        path: "/admin/staff",
      },
      // {
      //   id: "employees-list",
      //   label: "Empleados",
      //   path: "/admin/employees",
      // },
    ],
  },
  {
    id: "cashier",
    label: "Cajero",
    icon: CreditCard,
   
    section: "operations",
    subsections: [
      {
        id: "cashier-pos",
        label: "Punto de Venta (POS)",
        path: "/cashier/pos",
      },
      {
        id: "cashier-shifts",
        label: "Turnos y Cierres",
        path: "/cashier/turnos",
      },
      {
        id: "cashier-pickup",
        label: "Retiro de Pedidos",
        path: "/cashier/retiros",
      },
    ],
  },
  // {
  //   id: "iam",
  //   label: "Seguridad",
  //   icon: Shield,
  //   section: "security",
  //   subsections: [
  //     { id: "roles", label: "Roles", path: "/admin/roles" },
  //     { id: "permissions", label: "Permisos", path: "/admin/permissions" },
  //   ],
  // },
  {
    id: "ml",
    label: "Machine Learning",
    icon: Brain,
    section: "analytics",
    subsections: [
      { id: "dashboard", label: "Dashboard ML", path: "/admin/ml/dashboard" },
      {
        id: "predictions",
        label: "Predicciones",
        path: "/admin/ml/predictions",
      },
      {
        id: "recommendations",
        label: "Recomendaciones",
        path: "/admin/ml/recommendations",
      },
      { id: "trends", label: "Tendencias", path: "/admin/ml/trends" },
      {
        id: "customer-segmentation",
        label: "Segmentación de Clientes",
        path: "/admin/ml/customer-segmentation",
      },
    ],
  },
  {
    id: "reports",
    label: "Reportes",
    icon: BarChart3,
    section: "analytics",
    path: "/admin/reports",
  },
  {
    id: "invoices",
    label: "Facturas",
    icon: FileText,
    section: "analytics",
    path: "/admin/invoices",
  },
  {
    id: "finance",
    label: "Finanzas",
    icon: DollarSign,
    section: "analytics",
    subsections: [
      {
        id: "finance-dashboard",
        label: "Dashboard Financiero",
        path: "/admin/finance/dashboard",
      },
      {
        id: "expenses",
        label: "Gestión de Egresos",
        path: "/admin/finance/expenses",
      },
      {
        id: "transactions",
        label: "Transacciones",
        path: "/admin/finance/transactions",
      },
    ],
  },
  {
    id: "assistant",
    label: "Asistente IA",
    icon: Sparkles,
    section: "tools",
    // No tiene path porque abre un modal/drawer, no navega
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    section: "tools",
    subsections: [
      {
        id: "notifications-settings",
        label: "Notificaciones",
        path: "/admin/settings/notifications",
      },
    ],
  },
];

interface AdminNavbarProps {
  children?: React.ReactNode;
}

// UserDropdown component
interface UserDropdownProps {
  user: any;
  logout: () => void;
  handleItemClick: (id: string, path?: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  logout,
  handleItemClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    handleItemClick("profile", "/profile");
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.first_name?.[0]?.toUpperCase() ||
            user?.email?.[0]?.toUpperCase() ||
            "U"}
        </div>

        {/* User Name (hidden on small screens) */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.email?.split("@")[0] || "Usuario"}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-10 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.first_name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.email?.split("@")[0] || "Usuario"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || "Sin email"}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Mi Perfil</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleItemClick("settings", "/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AdminNavbar: React.FC<AdminNavbarProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Configurar el item activo basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    console.log("🔗 [AdminNavbar] Ruta actual:", currentPath);

    let itemFound = false;

    // Encontrar el item o subitem activo basado en la ruta
    navigationConfig.forEach((item) => {
      if (item.path === currentPath) {
        setActiveItem(item.id);
        console.log("📍 [AdminNavbar] Item principal activo:", item.id);
        itemFound = true;
        return;
      }

      if (item.subsections) {
        item.subsections.forEach((sub) => {
          if (sub.path === currentPath) {
            setActiveItem(sub.id);
            setOpenSections((prev) => ({ ...prev, [item.id]: true }));
            console.log(
              "📍 [AdminNavbar] Subsección activa:",
              sub.id,
              "del item:",
              item.id
            );
            itemFound = true;
            return;
          }
        });
      }
    });

    if (!itemFound) {
      console.log(
        "⚠️ [AdminNavbar] No se encontró item para la ruta:",
        currentPath
      );
    }
  }, [location.pathname]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (id: string, path?: string) => {
    console.log("🔗 [AdminNavbar] Click en item:", id, "path:", path);
    setActiveItem(id);
    if (path) {
      console.log("🚀 [AdminNavbar] Navegando a:", path);
      navigate(path);
    } else {
      switch (id) {
        case "assistant":
          setIsChatOpen(true);
          setIsChatMinimized(false);
          break;
        // Puedes agregar más casos aquí en el futuro
        default:
          console.warn(`No hay acción definida para el item: ${id}`);
      }
      console.log("⚠️ [AdminNavbar] No hay path para el item:", id);
    }
  };

  const NavItem = ({ item }: { item: (typeof navigationConfig)[0] }) => {
    const Icon = item.icon;
    const isOpen = openSections[item.id];
    const hasSubsections = item.subsections && item.subsections.length > 0;
    const isActive = activeItem === item.id;

    return (
      <div className="mb-1">
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive && !hasSubsections
              ? "bg-primary text-primary"
              : "hover:bg-secondary"
          }`}
          onClick={() => {
            if (hasSubsections) {
              toggleSection(item.id);
            } else {
              handleItemClick(item.id, item.path);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasSubsections &&
            (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>

        {hasSubsections && isOpen && (
          <div className="mt-1 ml-10">
            {item.subsections!.map((sub) => (
              <div
                key={sub.id}
                className={`px-4 py-2.5 rounded-md cursor-pointer transition-all text-sm ${
                  activeItem === sub.id
                    ? "bg-secondary text-primary font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleItemClick(sub.id, sub.path)}
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
    main: navigationConfig.filter((item) => item.section === "main"),
    operations: navigationConfig.filter((item) => item.section === "operations"),
    security: navigationConfig.filter((item) => item.section === "security"),
    analytics: navigationConfig.filter((item) => item.section === "analytics"),
    tools: navigationConfig.filter((item) => item.section === "tools"),
  };

  return (
    <div className="flex h-screen bg-secondary font-sans">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          isNavOpen ? "w-[280px]" : "w-0"
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-primary tracking-wide">
              ADMIN
            </div>
            <div className="text-xs text-gray-600 mt-1">Panel de control</div>
          </div>
          <button
            onClick={() => setIsNavOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Principal
            </div>
            {groupedNav.main.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          {/* Bloque para operaciones (Cajero) */}
          {groupedNav.operations.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Operaciones
              </div>
              {groupedNav.operations.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* <div className="mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Seguridad
            </div>
            {groupedNav.security.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div> */}

          <div className="mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Análisis
            </div>
            {groupedNav.analytics.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Herramientas
            </div>
            {groupedNav.tools.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {!isNavOpen && (
            <button
              onClick={() => setIsNavOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
            >
              <Menu size={20} />
            </button>
          )}

          <div className={`flex-1 max-w-[500px] ${isNavOpen ? "" : "ml-4"}`}>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {/* AI Assistant Button */}
            {/* <button 
              onClick={() => {
                setIsChatOpen(true);
                setIsChatMinimized(false);
              }}
              className="relative p-2 hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white rounded-lg transition-all duration-200 text-primary group"
              title="Asistente IA"
            >
              <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
            </button> */}

            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-primary"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Profile Dropdown */}
            <UserDropdown
              user={user}
              logout={logout}
              handleItemClick={handleItemClick}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children || (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold text-primary mb-2 font-display">
                Dashboard
              </h1>
              <p className="text-gray-600 mb-8">
                Panel de administración general
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    label: "Ventas Hoy",
                    value: "$2,543",
                    change: "+12.5%",
                    icon: ShoppingCart,
                    color: "#1a1a1a",
                  },
                  {
                    label: "Productos",
                    value: "234",
                    change: "+5",
                    icon: Package,
                    color: "#666666",
                  },
                  {
                    label: "Clientes",
                    value: "1,234",
                    change: "+23",
                    icon: Users,
                    color: "#999999",
                  },
                  {
                    label: "Órdenes",
                    value: "89",
                    change: "+8",
                    icon: BarChart3,
                    color: "#1a1a1a",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Icon size={24} color={stat.color} />
                        </div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full h-fit">
                          {stat.change}
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="bg-primary text-tertiary rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-2">
                  Sistema de Gestión Completo
                </h3>
                <p className="text-gray-500 mb-6">
                  Navega por las secciones del menú lateral para acceder a todas
                  las funcionalidades
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>✅ Gestión de productos</div>
                  <div>✅ Control de inventario</div>
                  <div>✅ Análisis de ventas</div>
                  <div>✅ Machine Learning</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Chat */}
      <AIAssistantChatEnhanced
        // <AIAssistantChatEnhanced
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setIsChatMinimized(false);
        }}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        isMinimized={isChatMinimized}
      />

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default AdminNavbar;
