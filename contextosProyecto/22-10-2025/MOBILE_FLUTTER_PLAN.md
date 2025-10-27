# 📱 PLAN DE ACTUALIZACIÓN MÓVIL FLUTTER

## 🎯 Objetivo
Sincronizar la aplicación móvil Flutter con todas las mejoras y funcionalidades agregadas al frontend React durante la sesión de hoy.

---

## 📊 Estado Actual de Mobile Flutter

### ✅ Ya Implementado:
1. **Estructura base**
   - `main.dart` con providers (Auth, Product, Cart)
   - `AppTheme` con tema claro y oscuro
   - `SplashScreen` con animaciones

2. **Providers existentes** (en `lib/providers/`):
   - `AuthProvider`
   - `ProductProvider`
   - `CartProvider`

3. **Carpetas de screens**:
   - `screens/auth/` - Solo splash_screen.dart
   - `screens/admin/` - Vacío
   - `screens/customer/` - Vacío

---

## 🚀 Actualizaciones Necesarias

### 1. Sistema de Temas Mejorado (ALTA PRIORIDAD)

#### Agregar ThemeProvider con 4 paletas
```dart
// lib/providers/theme_provider.dart
class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  String _palette = 'default'; // default, vibrant, creative, minimal
  
  ThemeMode get themeMode => _themeMode;
  String get palette => _palette;
  
  void toggleTheme() {
    _themeMode = _themeMode == ThemeMode.light 
      ? ThemeMode.dark 
      : ThemeMode.light;
    notifyListeners();
    _savePreferences();
  }
  
  void setPalette(String newPalette) {
    _palette = newPalette;
    notifyListeners();
    _savePreferences();
  }
  
  Future<void> _savePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', _themeMode.toString());
    await prefs.setString('theme_palette', _palette);
  }
  
  Future<void> loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final savedMode = prefs.getString('theme_mode');
    final savedPalette = prefs.getString('theme_palette') ?? 'default';
    
    if (savedMode != null) {
      _themeMode = savedMode.contains('dark') 
        ? ThemeMode.dark 
        : ThemeMode.light;
    }
    _palette = savedPalette;
    notifyListeners();
  }
}
```

#### Actualizar AppTheme con paletas
```dart
// lib/utils/app_theme.dart
class AppTheme {
  static const Map<String, Map<String, Color>> palettes = {
    'default': {
      'primary': Color(0xFFEC4899), // Rosa
      'secondary': Color(0xFF06B6D4), // Cyan
    },
    'vibrant': {
      'primary': Color(0xFFFF0080), // Rosa neón
      'secondary': Color(0xFF0080FF), // Azul eléctrico
    },
    'creative': {
      'primary': Color(0xFFFBBF24), // Amarillo
      'secondary': Color(0xFF60A5FA), // Celeste
    },
    'minimal': {
      'primary': Color(0xFF000000), // Negro
      'secondary': Color(0xFF84CC16), // Verde lima
    },
  };
  
  static ThemeData getTheme(String palette, bool isDark) {
    final colors = palettes[palette] ?? palettes['default']!;
    
    return ThemeData(
      useMaterial3: true,
      brightness: isDark ? Brightness.dark : Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: colors['primary']!,
        secondary: colors['secondary']!,
        brightness: isDark ? Brightness.dark : Brightness.light,
      ),
      // ... resto de configuración
    );
  }
}
```

---

### 2. Pantallas de Autenticación

#### Login Screen
```dart
// lib/screens/auth/login_screen.dart
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(
      _emailController.text,
      _passwordController.text,
    );
    
    setState(() => _isLoading = false);
    
    if (success) {
      // Navegar según rol
      final user = authProvider.user;
      if (user.role == 'admin' || user.role == 'manager') {
        Navigator.pushReplacementNamed(context, '/admin/dashboard');
      } else if (user.role == 'employee') {
        Navigator.pushReplacementNamed(context, '/employee/dashboard');
      } else {
        Navigator.pushReplacementNamed(context, '/customer/home');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al iniciar sesión')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ... UI con formulario de login
    );
  }
}
```

#### Register Screen
```dart
// lib/screens/auth/register_screen.dart
// Similar al login pero con campos adicionales: nombre, apellido, teléfono
```

---

### 3. Dashboard Admin

#### Admin Dashboard
```dart
// lib/screens/admin/admin_dashboard_screen.dart
class AdminDashboardScreen extends StatefulWidget {
  @override
  _AdminDashboardScreenState createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _selectedIndex = 0;
  
  final List<Widget> _screens = [
    DashboardHomeScreen(),
    EmployeeListScreen(),
    ProductListScreen(),
    CustomerListScreen(),
    ProfileScreen(),
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Empleados',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory),
            label: 'Productos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.group),
            label: 'Clientes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}
```

---

### 4. CRUD Empleados (NUEVO)

#### Employee List Screen
```dart
// lib/screens/admin/employee_list_screen.dart
class EmployeeListScreen extends StatefulWidget {
  @override
  _EmployeeListScreenState createState() => _EmployeeListScreenState();
}

class _EmployeeListScreenState extends State<EmployeeListScreen> {
  List<Employee> _employees = [];
  List<Employee> _filteredEmployees = [];
  String _searchQuery = '';
  String _roleFilter = 'all';
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadEmployees();
  }
  
  Future<void> _loadEmployees() async {
    setState(() => _isLoading = true);
    final employees = await EmployeeService.getAll();
    setState(() {
      _employees = employees;
      _filteredEmployees = employees;
      _isLoading = false;
    });
  }
  
  void _filterEmployees() {
    setState(() {
      _filteredEmployees = _employees.where((emp) {
        final matchesSearch = emp.firstName.toLowerCase().contains(_searchQuery) ||
                             emp.lastName.toLowerCase().contains(_searchQuery) ||
                             emp.email.toLowerCase().contains(_searchQuery);
        final matchesRole = _roleFilter == 'all' || emp.role == _roleFilter;
        return matchesSearch && matchesRole;
      }).toList();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Empleados'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => Navigator.pushNamed(context, '/admin/employees/create'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar empleados...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value.toLowerCase());
                _filterEmployees();
              },
            ),
          ),
          // Role filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildFilterChip('Todos', 'all'),
                _buildFilterChip('Admin', 'admin'),
                _buildFilterChip('Manager', 'manager'),
                _buildFilterChip('Empleado', 'employee'),
              ],
            ),
          ),
          // Employee list
          Expanded(
            child: _isLoading
              ? Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: _filteredEmployees.length,
                  itemBuilder: (context, index) {
                    final employee = _filteredEmployees[index];
                    return _buildEmployeeCard(employee);
                  },
                ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFilterChip(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: _roleFilter == value,
        onSelected: (selected) {
          setState(() => _roleFilter = value);
          _filterEmployees();
        },
      ),
    );
  }
  
  Widget _buildEmployeeCard(Employee employee) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(employee.initials),
        ),
        title: Text('${employee.firstName} ${employee.lastName}'),
        subtitle: Text(employee.email),
        trailing: Chip(
          label: Text(employee.role),
          backgroundColor: _getRoleColor(employee.role),
        ),
        onTap: () => Navigator.pushNamed(
          context,
          '/admin/employees/detail',
          arguments: employee.id,
        ),
      ),
    );
  }
  
  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin': return Colors.red[100]!;
      case 'manager': return Colors.orange[100]!;
      case 'employee': return Colors.blue[100]!;
      default: return Colors.grey[100]!;
    }
  }
}
```

#### Employee Detail Screen
```dart
// lib/screens/admin/employee_detail_screen.dart
// Pantalla para ver y editar detalles del empleado
// Similar a EmployeeDetail.tsx del frontend
```

#### Employee Create Screen
```dart
// lib/screens/admin/employee_create_screen.dart
// Formulario para crear nuevo empleado
// Incluir generador de contraseñas
// Similar a EmployeeCreate.tsx del frontend
```

---

### 5. CRUD Productos (Actualizar)

#### Product List Screen
```dart
// lib/screens/admin/product_list_screen.dart
// Actualizar para incluir:
// - Crear producto real (no simulado)
// - Editar producto real
// - Eliminar con confirmación
// - Gestión de variantes
```

---

### 6. CRUD Clientes (Actualizar)

#### Customer List Screen
```dart
// lib/screens/admin/customer_list_screen.dart
// Actualizar para incluir:
// - Ver órdenes del cliente
// - Verificar email
// - Toggle estado activo/inactivo
// - Filtros múltiples
```

---

### 7. Perfil de Usuario

#### Profile Screen
```dart
// lib/screens/shared/profile_screen.dart
class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _selectedTab = 0;
  
  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final theme = Provider.of<ThemeProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Mi Perfil'),
      ),
      body: Column(
        children: [
          // Header con avatar
          _buildProfileHeader(user),
          // Tabs
          TabBar(
            controller: _tabController,
            tabs: [
              Tab(text: 'Información'),
              Tab(text: 'Seguridad'),
              Tab(text: 'Preferencias'),
            ],
          ),
          // Tab views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildInfoTab(user),
                _buildSecurityTab(),
                _buildPreferencesTab(theme),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildPreferencesTab(ThemeProvider theme) {
    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        // Tema
        Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Apariencia', style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 16),
                SwitchListTile(
                  title: Text('Modo Oscuro'),
                  value: theme.themeMode == ThemeMode.dark,
                  onChanged: (value) => theme.toggleTheme(),
                ),
                ListTile(
                  title: Text('Paleta de Colores'),
                  subtitle: Text(theme.palette),
                  trailing: Icon(Icons.palette),
                  onTap: () => _showPaletteDialog(theme),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  void _showPaletteDialog(ThemeProvider theme) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Seleccionar Paleta'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildPaletteOption('default', 'Boutique Clásico', theme),
            _buildPaletteOption('vibrant', 'Vibrante y Juvenil', theme),
            _buildPaletteOption('creative', 'Creativa y Divertida', theme),
            _buildPaletteOption('minimal', 'Minimal y Moderna', theme),
          ],
        ),
      ),
    );
  }
  
  Widget _buildPaletteOption(String value, String label, ThemeProvider theme) {
    return RadioListTile(
      title: Text(label),
      value: value,
      groupValue: theme.palette,
      onChanged: (newValue) {
        theme.setPalette(newValue as String);
        Navigator.pop(context);
      },
    );
  }
}
```

---

### 8. Servicios API

#### Employee Service
```dart
// lib/services/employee_service.dart
class EmployeeService {
  static const String baseUrl = 'http://localhost:8000/api';
  
  static Future<List<Employee>> getAll() async {
    final token = await AuthService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/users/?role=employee,manager,admin'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Employee.fromJson(json)).toList();
    } else {
      throw Exception('Error al cargar empleados');
    }
  }
  
  static Future<Employee> getById(String id) async { /* ... */ }
  
  static Future<Employee> create(Map<String, dynamic> data) async { /* ... */ }
  
  static Future<Employee> update(String id, Map<String, dynamic> data) async { /* ... */ }
  
  static Future<void> delete(String id) async { /* ... */ }
  
  static Future<void> toggleStatus(String id) async { /* ... */ }
}
```

#### Customer Service (Actualizar)
```dart
// lib/services/customer_service.dart
// Agregar métodos:
// - getOrders(customerId)
// - verifyEmail(customerId)
// - toggleStatus(customerId)
```

---

### 9. Modelos

#### Employee Model
```dart
// lib/models/employee.dart
class Employee {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String username;
  final String? phone;
  final String? address;
  final String role; // admin, manager, employee
  final bool isActive;
  final DateTime dateJoined;
  final DateTime? lastLogin;
  
  Employee({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.username,
    this.phone,
    this.address,
    required this.role,
    required this.isActive,
    required this.dateJoined,
    this.lastLogin,
  });
  
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : '';
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return '$first$last'.toUpperCase();
  }
  
  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'].toString(),
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      phone: json['phone'],
      address: json['address'],
      role: json['role'] ?? 'employee',
      isActive: json['is_active'] ?? true,
      dateJoined: DateTime.parse(json['date_joined']),
      lastLogin: json['last_login'] != null 
        ? DateTime.parse(json['last_login']) 
        : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'username': username,
      'phone': phone,
      'address': address,
      'role': role,
      'is_active': isActive,
      'date_joined': dateJoined.toIso8601String(),
      'last_login': lastLogin?.toIso8601String(),
    };
  }
}
```

---

### 10. Widgets Reutilizables

#### App Header
```dart
// lib/widgets/app_header.dart
class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  
  const AppHeader({
    Key? key,
    required this.title,
    this.actions,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      actions: actions,
      elevation: 0,
    );
  }
  
  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}
```

#### Statistics Card
```dart
// lib/widgets/statistics_card.dart
class StatisticsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  
  const StatisticsCard({
    Key? key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 📦 Dependencias a Agregar

Actualizar `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # Network
  http: ^1.1.2
  dio: ^5.4.0
  
  # Local Storage
  shared_preferences: ^2.2.2
  
  # Utils
  intl: ^0.18.1
  uuid: ^4.2.2
  
  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Forms
  flutter_form_builder: ^9.1.1
  
  # Charts (para dashboards)
  fl_chart: ^0.65.0
```

---

## 🔄 Orden de Implementación

### Fase 1: Infraestructura (1-2 horas)
1. ✅ Actualizar dependencias en `pubspec.yaml`
2. ✅ Crear `ThemeProvider` con 4 paletas
3. ✅ Actualizar `AppTheme` con paletas dinámicas
4. ✅ Crear modelos: `Employee`, actualizar `Customer`
5. ✅ Crear servicios: `EmployeeService`, actualizar `CustomerService`

### Fase 2: Autenticación (1 hora)
6. ✅ Crear `LoginScreen`
7. ✅ Crear `RegisterScreen`
8. ✅ Actualizar `SplashScreen` para verificar autenticación

### Fase 3: Admin Screens (2-3 horas)
9. ✅ Crear `AdminDashboardScreen` con navegación
10. ✅ Crear `EmployeeListScreen`
11. ✅ Crear `EmployeeDetailScreen`
12. ✅ Crear `EmployeeCreateScreen`
13. ✅ Actualizar `ProductListScreen` con CRUD real
14. ✅ Actualizar `CustomerListScreen` con funciones completas

### Fase 4: Perfil y Preferencias (1 hora)
15. ✅ Crear `ProfileScreen` con tabs
16. ✅ Implementar cambio de contraseña
17. ✅ Implementar selector de tema y paleta

### Fase 5: Testing y Polish (1 hora)
18. ✅ Probar todas las funcionalidades
19. ✅ Verificar navegación
20. ✅ Ajustar UI/UX
21. ✅ Actualizar README.md

---

## 📝 Checklist de Completado

### Infraestructura
- [ ] ThemeProvider creado
- [ ] AppTheme actualizado con 4 paletas
- [ ] Employee model creado
- [ ] EmployeeService creado
- [ ] CustomerService actualizado

### Pantallas
- [ ] LoginScreen
- [ ] RegisterScreen
- [ ] SplashScreen actualizado
- [ ] AdminDashboardScreen
- [ ] EmployeeListScreen
- [ ] EmployeeDetailScreen
- [ ] EmployeeCreateScreen
- [ ] ProductListScreen actualizado
- [ ] CustomerListScreen actualizado
- [ ] ProfileScreen con tabs
- [ ] Theme settings dialog

### Funcionalidades
- [ ] Login/Logout funcional
- [ ] CRUD Empleados completo
- [ ] CRUD Productos real (no simulado)
- [ ] CRUD Clientes con ver órdenes
- [ ] Cambio de contraseña
- [ ] Sistema de temas con persistencia
- [ ] Filtros de búsqueda
- [ ] Validaciones de formularios

### Testing
- [ ] Login como admin
- [ ] Login como employee
- [ ] Login como customer
- [ ] Crear empleado
- [ ] Editar empleado
- [ ] Eliminar empleado
- [ ] Ver clientes
- [ ] Ver productos
- [ ] Cambiar tema
- [ ] Cambiar paleta de colores

---

## 📚 Archivos a Crear

### Providers (5 archivos)
1. `lib/providers/theme_provider.dart`
2. `lib/providers/employee_provider.dart`
3. (Actualizar) `lib/providers/auth_provider.dart`
4. (Actualizar) `lib/providers/product_provider.dart`
5. (Actualizar) `lib/providers/customer_provider.dart`

### Services (3 archivos)
1. `lib/services/employee_service.dart`
2. (Actualizar) `lib/services/customer_service.dart`
3. (Actualizar) `lib/services/product_service.dart`

### Models (2 archivos)
1. `lib/models/employee.dart`
2. (Actualizar) `lib/models/customer.dart`

### Screens (14 archivos)
1. `lib/screens/auth/login_screen.dart`
2. `lib/screens/auth/register_screen.dart`
3. `lib/screens/admin/admin_dashboard_screen.dart`
4. `lib/screens/admin/dashboard_home_screen.dart`
5. `lib/screens/admin/employee_list_screen.dart`
6. `lib/screens/admin/employee_detail_screen.dart`
7. `lib/screens/admin/employee_create_screen.dart`
8. `lib/screens/admin/product_list_screen.dart`
9. `lib/screens/admin/product_detail_screen.dart`
10. `lib/screens/admin/customer_list_screen.dart`
11. `lib/screens/admin/customer_detail_screen.dart`
12. `lib/screens/shared/profile_screen.dart`
13. `lib/screens/customer/home_screen.dart`
14. `lib/screens/employee/employee_dashboard_screen.dart`

### Widgets (5 archivos)
1. `lib/widgets/app_header.dart`
2. `lib/widgets/statistics_card.dart`
3. `lib/widgets/theme_selector_dialog.dart`
4. `lib/widgets/password_change_dialog.dart`
5. `lib/widgets/confirmation_dialog.dart`

### Utils (1 archivo)
1. (Actualizar) `lib/utils/app_theme.dart`

**TOTAL: 30 archivos a crear/actualizar**

---

## ⏱️ Estimación de Tiempo

- **Fase 1 (Infraestructura)**: 1-2 horas
- **Fase 2 (Autenticación)**: 1 hora
- **Fase 3 (Admin Screens)**: 2-3 horas
- **Fase 4 (Perfil)**: 1 hora
- **Fase 5 (Testing)**: 1 hora

**TOTAL ESTIMADO: 6-8 horas de desarrollo**

---

## 🎯 Prioridades

### ALTA (Hacer HOY si hay tiempo)
1. ThemeProvider con 4 paletas
2. LoginScreen funcional
3. ProfileScreen con selector de tema

### MEDIA (Próxima sesión)
4. EmployeeListScreen
5. EmployeeCreateScreen
6. EmployeeDetailScreen

### BAJA (Después)
7. Actualizar productos con CRUD real
8. Actualizar clientes con ver órdenes

---

## 📱 Próximos Pasos Inmediatos

1. **Actualizar `pubspec.yaml`** con dependencias
2. **Crear `ThemeProvider`** con 4 paletas
3. **Actualizar `main.dart`** para incluir ThemeProvider
4. **Crear `LoginScreen`** básico
5. **Probar cambio de tema** en la app

---

**Fecha**: 21 de Octubre, 2025  
**Estado**: Plan creado, listo para implementar  
**Siguiente**: Comenzar con Fase 1 (Infraestructura)
