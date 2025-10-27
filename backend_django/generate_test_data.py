"""
Script para generar datos de prueba consistentes para la tienda de ropa
Ejecutar con: python manage.py shell < generate_test_data.py
o: python manage.py shell -c "exec(open('generate_test_data.py').read())"
"""
import os
import django
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Brand, Size, Color, Product, ProductVariant
from orders.models import PaymentMethod, Order, OrderItem, Payment, Invoice
from permissions.models import Permission, Role, UserRole

User = get_user_model()


def clear_data():
    """Limpiar todos los datos existentes"""
    print("🗑️  Limpiando datos existentes...")
    
    # Orden de eliminación para respetar foreign keys
    Invoice.objects.all().delete()
    Payment.objects.all().delete()
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    ProductVariant.objects.all().delete()
    Product.objects.all().delete()
    PaymentMethod.objects.all().delete()
    Color.objects.all().delete()
    Size.objects.all().delete()
    Brand.objects.all().delete()
    Category.objects.all().delete()
    UserRole.objects.all().delete()
    Role.objects.all().delete()
    Permission.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()  # Mantener superusuarios si existen
    
    print("✅ Datos limpiados correctamente\n")


def create_permissions():
    """Crear permisos del sistema"""
    print("🔐 Creando permisos...")
    
    permissions_data = [
        # Productos
        ('view_products', 'Ver Productos', 'products', 'Puede ver listado de productos'),
        ('create_products', 'Crear Productos', 'products', 'Puede crear nuevos productos'),
        ('edit_products', 'Editar Productos', 'products', 'Puede editar productos existentes'),
        ('delete_products', 'Eliminar Productos', 'products', 'Puede eliminar productos'),
        ('manage_inventory', 'Gestionar Inventario', 'inventory', 'Puede gestionar stock e inventario'),
        
        # Ventas
        ('view_sales', 'Ver Ventas', 'sales', 'Puede ver listado de ventas'),
        ('create_sales', 'Crear Ventas', 'sales', 'Puede registrar nuevas ventas'),
        ('edit_sales', 'Editar Ventas', 'sales', 'Puede editar ventas'),
        ('cancel_sales', 'Cancelar Ventas', 'sales', 'Puede cancelar ventas'),
        ('process_refunds', 'Procesar Devoluciones', 'sales', 'Puede procesar devoluciones'),
        
        # Órdenes
        ('view_orders', 'Ver Pedidos', 'orders', 'Puede ver listado de pedidos'),
        ('create_orders', 'Crear Pedidos', 'orders', 'Puede crear nuevos pedidos'),
        ('edit_orders', 'Editar Pedidos', 'orders', 'Puede editar pedidos'),
        ('cancel_orders', 'Cancelar Pedidos', 'orders', 'Puede cancelar pedidos'),
        ('process_orders', 'Procesar Pedidos', 'orders', 'Puede procesar y despachar pedidos'),
        
        # Facturación
        ('view_invoices', 'Ver Facturas', 'billing', 'Puede ver facturas'),
        ('create_invoices', 'Crear Facturas', 'billing', 'Puede crear facturas'),
        ('edit_invoices', 'Editar Facturas', 'billing', 'Puede editar facturas'),
        ('cancel_invoices', 'Cancelar Facturas', 'billing', 'Puede cancelar facturas'),
        ('send_invoices', 'Enviar Facturas', 'billing', 'Puede enviar facturas a clientes'),
        
        # Clientes
        ('view_customers', 'Ver Clientes', 'customers', 'Puede ver listado de clientes'),
        ('create_customers', 'Crear Clientes', 'customers', 'Puede crear nuevos clientes'),
        ('edit_customers', 'Editar Clientes', 'customers', 'Puede editar información de clientes'),
        ('delete_customers', 'Desactivar Clientes', 'customers', 'Puede desactivar clientes'),
        
        # Empleados
        ('view_employees', 'Ver Empleados', 'employees', 'Puede ver listado de empleados'),
        ('create_employees', 'Crear Empleados', 'employees', 'Puede crear nuevos empleados'),
        ('edit_employees', 'Editar Empleados', 'employees', 'Puede editar información de empleados'),
        ('delete_employees', 'Desactivar Empleados', 'employees', 'Puede desactivar empleados'),
        ('manage_roles', 'Gestionar Roles', 'employees', 'Puede asignar roles y permisos'),
        
        # Reportes
        ('view_reports', 'Ver Reportes', 'reports', 'Puede ver reportes básicos'),
        ('view_advanced_reports', 'Ver Reportes Avanzados', 'reports', 'Puede ver reportes avanzados'),
        ('export_reports', 'Exportar Reportes', 'reports', 'Puede exportar reportes'),
        ('request_reports', 'Solicitar Reportes', 'reports', 'Puede solicitar reportes personalizados'),
        
        # Compras
        ('view_purchases', 'Ver Compras', 'purchases', 'Puede ver listado de compras'),
        ('create_purchases', 'Crear Compras', 'purchases', 'Puede registrar nuevas compras'),
        ('edit_purchases', 'Editar Compras', 'purchases', 'Puede editar compras'),
        
        # Configuración
        ('view_settings', 'Ver Configuración', 'settings', 'Puede ver configuración del sistema'),
        ('edit_settings', 'Editar Configuración', 'settings', 'Puede editar configuración del sistema'),
        ('manage_payment_methods', 'Gestionar Métodos de Pago', 'settings', 'Puede gestionar métodos de pago'),
    ]
    
    permissions = []
    for codename, name, category, description in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=codename,
            defaults={
                'name': name,
                'category': category,
                'description': description,
                'is_active': True
            }
        )
        permissions.append(permission)
        if created:
            print(f"  ✓ Permiso creado: {name}")
    
    print(f"✅ {len(permissions)} permisos creados\n")
    return permissions


def create_roles(permissions):
    """Crear roles del sistema con permisos asignados"""
    print("👥 Creando roles...")
    
    # Obtener permisos por codename
    def get_perms(*codenames):
        return Permission.objects.filter(codename__in=codenames)
    
    # ROL: Administrador (acceso total)
    admin_role, created = Role.objects.get_or_create(
        name='Administrador',
        defaults={
            'description': 'Acceso total al sistema. Puede gestionar todo.',
            'role_type': 'system',
            'is_system': True,
            'can_be_assigned_by_admin': True,
        }
    )
    admin_role.permissions.set(permissions)  # Todos los permisos
    print(f"  ✓ Rol: Administrador ({admin_role.permissions.count()} permisos)")
    
    # ROL: Cajero/Trabajador (ventas en tienda física)
    cashier_perms = get_perms(
        'view_products', 'manage_inventory',
        'view_sales', 'create_sales', 'edit_sales',
        'view_orders', 'create_orders', 'process_orders',
        'view_invoices', 'create_invoices', 'send_invoices',
        'view_customers', 'create_customers', 'edit_customers',
        'view_reports', 'export_reports',
        'manage_payment_methods'
    )
    cashier_role, created = Role.objects.get_or_create(
        name='Cajero',
        defaults={
            'description': 'Personal de tienda física. Puede registrar ventas, gestionar inventario y atender clientes.',
            'role_type': 'business',
            'is_system': True,
            'can_be_assigned_by_admin': True,
        }
    )
    cashier_role.permissions.set(cashier_perms)
    print(f"  ✓ Rol: Cajero ({cashier_role.permissions.count()} permisos)")
    
    # ROL: Cliente (e-commerce)
    customer_perms = get_perms(
        'view_products',
        'view_orders',
        'view_invoices',
        'request_reports'
    )
    customer_role, created = Role.objects.get_or_create(
        name='Cliente',
        defaults={
            'description': 'Cliente de e-commerce. Puede ver productos, hacer pedidos y ver su historial.',
            'role_type': 'business',
            'is_system': True,
            'can_be_assigned_by_admin': False,
        }
    )
    customer_role.permissions.set(customer_perms)
    print(f"  ✓ Rol: Cliente ({customer_role.permissions.count()} permisos)")
    
    # ROL: Gerente
    manager_perms = get_perms(
        'view_products', 'create_products', 'edit_products', 'manage_inventory',
        'view_sales', 'create_sales', 'edit_sales', 'cancel_sales', 'process_refunds',
        'view_orders', 'create_orders', 'edit_orders', 'cancel_orders', 'process_orders',
        'view_invoices', 'create_invoices', 'edit_invoices', 'send_invoices',
        'view_customers', 'create_customers', 'edit_customers',
        'view_employees', 'create_employees', 'edit_employees',
        'view_reports', 'view_advanced_reports', 'export_reports', 'request_reports',
        'view_purchases', 'create_purchases', 'edit_purchases',
        'view_settings', 'manage_payment_methods'
    )
    manager_role, created = Role.objects.get_or_create(
        name='Gerente',
        defaults={
            'description': 'Gerente de tienda. Acceso amplio sin funciones críticas del sistema.',
            'role_type': 'business',
            'is_system': False,
            'can_be_assigned_by_admin': True,
        }
    )
    manager_role.permissions.set(manager_perms)
    print(f"  ✓ Rol: Gerente ({manager_role.permissions.count()} permisos)")
    
    print("✅ Roles creados correctamente\n")
    return {
        'admin': admin_role,
        'cashier': cashier_role,
        'customer': customer_role,
        'manager': manager_role
    }


def create_users(roles):
    """Crear usuarios de prueba"""
    print("👤 Creando usuarios...")
    
    users = {}
    
    # 1. Super Usuario (para desarrollo)
    superuser, created = User.objects.get_or_create(
        email='superadmin@boutique.com',
        defaults={
            'first_name': 'Super',
            'last_name': 'Administrador',
            'role': 'admin',
            'user_type': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'is_email_verified': True,
        }
    )
    if created:
        superuser.set_password('admin123')
        superuser.save()
        print(f"  ✓ Super Usuario: {superuser.email} (password: admin123)")
    users['superuser'] = superuser
    
    # 2. Administrador del Sistema
    admin, created = User.objects.get_or_create(
        email='admin@boutique.com',
        defaults={
            'username': 'admin@boutique.com',
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'role': 'admin',
            'user_type': 'admin',
            'phone': '+591 7777-0001',
            'is_staff': True,
            'is_active': True,
            'is_email_verified': True,
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        UserRole.objects.create(user=admin, role=roles['admin'], assigned_by=superuser)
        print(f"  ✓ Administrador: {admin.email} (password: admin123)")
    users['admin'] = admin
    
    # 3. Cajero/Trabajador
    cashier, created = User.objects.get_or_create(
        email='cajero@boutique.com',
        defaults={
            'username': 'cajero@boutique.com',
            'first_name': 'María',
            'last_name': 'González',
            'role': 'employee',
            'user_type': 'staff',
            'phone': '+591 7777-0002',
            'is_staff': True,
            'is_active': True,
            'is_active_employee': True,
            'is_email_verified': True,
            'hire_date': timezone.now().date() - timedelta(days=180),
            'salary': Decimal('3500.00'),
            'department': 'Ventas',
        }
    )
    if created:
        cashier.set_password('cajero123')
        cashier.save()
        UserRole.objects.create(user=cashier, role=roles['cashier'], assigned_by=admin)
        print(f"  ✓ Cajero: {cashier.email} (password: cajero123)")
    users['cashier'] = cashier
    
    # 4. Gerente
    manager, created = User.objects.get_or_create(
        email='gerente@boutique.com',
        defaults={
            'username': 'gerente@boutique.com',
            'first_name': 'Carlos',
            'last_name': 'Rodríguez',
            'role': 'manager',
            'user_type': 'staff',
            'phone': '+591 7777-0003',
            'is_staff': True,
            'is_active': True,
            'is_active_employee': True,
            'is_email_verified': True,
            'hire_date': timezone.now().date() - timedelta(days=365),
            'salary': Decimal('5000.00'),
            'department': 'Gestión',
        }
    )
    if created:
        manager.set_password('gerente123')
        manager.save()
        UserRole.objects.create(user=manager, role=roles['manager'], assigned_by=admin)
        print(f"  ✓ Gerente: {manager.email} (password: gerente123)")
    users['manager'] = manager
    
    # 5. Clientes
    customers_data = [
        ('Ana', 'Martínez', 'ana.martinez@email.com', '+591 7888-0001'),
        ('Pedro', 'López', 'pedro.lopez@email.com', '+591 7888-0002'),
        ('Sofía', 'Ramírez', 'sofia.ramirez@email.com', '+591 7888-0003'),
        ('Diego', 'Fernández', 'diego.fernandez@email.com', '+591 7888-0004'),
        ('Laura', 'Torres', 'laura.torres@email.com', '+591 7888-0005'),
    ]
    
    users['customers'] = []
    for first_name, last_name, email, phone in customers_data:
        customer, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'customer',
                'user_type': 'customer',
                'phone': phone,
                'is_active': True,
                'is_email_verified': True,
                'address': f'Calle Principal #{random.randint(100, 999)}, La Paz, Bolivia',
            }
        )
        if created:
            customer.set_password('cliente123')
            customer.save()
            UserRole.objects.create(user=customer, role=roles['customer'])
            print(f"  ✓ Cliente: {customer.email} (password: cliente123)")
        users['customers'].append(customer)
    
    print(f"✅ {2 + len(customers_data) + 2} usuarios creados\n")
    return users


def create_categories():
    """Crear categorías de productos"""
    print("📁 Creando categorías...")
    
    categories_data = [
        # Categorías principales
        ('Ropa de Hombre', 'ropa-hombre', 'clothing', 'men', 'Todo el Año', None, 1),
        ('Ropa de Mujer', 'ropa-mujer', 'clothing', 'women', 'Todo el Año', None, 2),
        ('Ropa Unisex', 'ropa-unisex', 'clothing', 'unisex', 'Todo el Año', None, 3),
        ('Calzado', 'calzado', 'footwear', None, 'Todo el Año', None, 4),
        ('Accesorios', 'accesorios', 'accessories', None, 'Todo el Año', None, 5),
        ('Ropa Interior', 'ropa-interior', 'underwear', None, 'Todo el Año', None, 6),
        ('Ropa Deportiva', 'ropa-deportiva', 'sportswear', None, 'Todo el Año', None, 7),
    ]
    
    categories = {}
    for name, slug, cat_type, gender, season, parent, order in categories_data:
        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'category_type': cat_type,
                'target_gender': gender,
                'season': season,
                'parent': parent,
                'sort_order': order,
                'is_active': True,
            }
        )
        categories[slug] = category
        if created:
            print(f"  ✓ Categoría: {name}")
    
    # Subcategorías
    subcategories_data = [
        ('Camisas', 'camisas-hombre', 'clothing', 'men', categories['ropa-hombre'], 11),
        ('Pantalones', 'pantalones-hombre', 'clothing', 'men', categories['ropa-hombre'], 12),
        ('Vestidos', 'vestidos-mujer', 'clothing', 'women', categories['ropa-mujer'], 21),
        ('Blusas', 'blusas-mujer', 'clothing', 'women', categories['ropa-mujer'], 22),
        ('Jeans', 'jeans', 'clothing', 'unisex', categories['ropa-unisex'], 31),
        ('Zapatillas', 'zapatillas', 'footwear', None, categories['calzado'], 41),
        ('Botas', 'botas', 'footwear', None, categories['calzado'], 42),
    ]
    
    for name, slug, cat_type, gender, parent, order in subcategories_data:
        category, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'category_type': cat_type,
                'target_gender': gender,
                'parent': parent,
                'sort_order': order,
                'is_active': True,
            }
        )
        categories[slug] = category
        if created:
            print(f"    ✓ Subcategoría: {name}")
    
    print(f"✅ {len(categories)} categorías creadas\n")
    return categories


def create_brands():
    """Crear marcas"""
    print("🏷️  Creando marcas...")
    
    brands_data = [
        ('Nike', 'Estados Unidos'),
        ('Adidas', 'Alemania'),
        ('Zara', 'España'),
        ('H&M', 'Suecia'),
        ('Levi\'s', 'Estados Unidos'),
        ('Puma', 'Alemania'),
        ('Calvin Klein', 'Estados Unidos'),
        ('Tommy Hilfiger', 'Estados Unidos'),
        ('Polo', 'Estados Unidos'),
        ('Lacoste', 'Francia'),
    ]
    
    brands = {}
    for name, country in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=name,
            defaults={
                'country_origin': country,
                'is_active': True,
            }
        )
        brands[name] = brand
        if created:
            print(f"  ✓ Marca: {name}")
    
    print(f"✅ {len(brands)} marcas creadas\n")
    return brands


def create_sizes():
    """Crear tallas"""
    print("📏 Creando tallas...")
    
    sizes_data = [
        # Tallas de ropa
        ('XS', 'clothing', 1),
        ('S', 'clothing', 2),
        ('M', 'clothing', 3),
        ('L', 'clothing', 4),
        ('XL', 'clothing', 5),
        ('XXL', 'clothing', 6),
        # Tallas de calzado
        ('36', 'shoes', 11),
        ('37', 'shoes', 12),
        ('38', 'shoes', 13),
        ('39', 'shoes', 14),
        ('40', 'shoes', 15),
        ('41', 'shoes', 16),
        ('42', 'shoes', 17),
        ('43', 'shoes', 18),
        ('44', 'shoes', 19),
        # Tallas de accesorios
        ('Único', 'accessories', 21),
    ]
    
    sizes = {}
    for name, size_type, order in sizes_data:
        size, created = Size.objects.get_or_create(
            name=name,
            size_type=size_type,
            defaults={
                'sort_order': order,
                'is_active': True,
            }
        )
        sizes[f"{name}-{size_type}"] = size
        if created:
            print(f"  ✓ Talla: {name} ({size_type})")
    
    print(f"✅ {len(sizes)} tallas creadas\n")
    return sizes


def create_colors():
    """Crear colores"""
    print("🎨 Creando colores...")
    
    colors_data = [
        ('Negro', '#000000'),
        ('Blanco', '#FFFFFF'),
        ('Azul', '#0000FF'),
        ('Rojo', '#FF0000'),
        ('Verde', '#008000'),
        ('Amarillo', '#FFFF00'),
        ('Gris', '#808080'),
        ('Beige', '#F5F5DC'),
        ('Marrón', '#A52A2A'),
        ('Rosa', '#FFC0CB'),
        ('Naranja', '#FFA500'),
        ('Morado', '#800080'),
        ('Celeste', '#87CEEB'),
        ('Vino', '#722F37'),
    ]
    
    colors = {}
    for name, hex_code in colors_data:
        color, created = Color.objects.get_or_create(
            name=name,
            defaults={
                'hex_code': hex_code,
                'is_active': True,
            }
        )
        colors[name] = color
        if created:
            print(f"  ✓ Color: {name}")
    
    print(f"✅ {len(colors)} colores creados\n")
    return colors


def create_products(categories, brands, sizes, colors, users):
    """Crear productos con variantes"""
    print("👕 Creando productos...")
    
    products_data = [
        # (nombre, categoría_slug, marca, precio, costo, género, material, descripción, tallas, colores)
        ('Camisa Casual Manga Larga', 'camisas-hombre', 'Zara', 299.00, 150.00, 'men', '100% Algodón', 
         'Camisa casual perfecta para uso diario', ['S', 'M', 'L', 'XL'], ['Blanco', 'Azul', 'Gris']),
        
        ('Pantalón Jean Clásico', 'jeans', 'Levi\'s', 450.00, 220.00, 'unisex', '98% Algodón, 2% Elastano',
         'Jean de corte clásico con durabilidad excepcional', ['S', 'M', 'L', 'XL', 'XXL'], ['Azul', 'Negro', 'Gris']),
        
        ('Vestido Floral Verano', 'vestidos-mujer', 'H&M', 380.00, 180.00, 'women', '100% Poliéster',
         'Vestido ligero ideal para días de verano', ['XS', 'S', 'M', 'L'], ['Rosa', 'Celeste', 'Amarillo']),
        
        ('Blusa Elegante', 'blusas-mujer', 'Zara', 250.00, 120.00, 'women', '95% Poliéster, 5% Elastano',
         'Blusa elegante para ocasiones especiales', ['XS', 'S', 'M', 'L', 'XL'], ['Blanco', 'Negro', 'Beige']),
        
        ('Zapatillas Deportivas', 'zapatillas', 'Nike', 650.00, 320.00, 'unisex', 'Material sintético',
         'Zapatillas deportivas con tecnología de amortiguación', ['38', '39', '40', '41', '42', '43'], ['Negro', 'Blanco', 'Azul']),
        
        ('Botas de Cuero', 'botas', 'Tommy Hilfiger', 890.00, 450.00, 'unisex', 'Cuero genuino',
         'Botas elegantes de cuero de alta calidad', ['37', '38', '39', '40', '41', '42'], ['Negro', 'Marrón']),
        
        ('Polo Deportivo', 'ropa-deportiva', 'Adidas', 180.00, 90.00, 'unisex', '100% Poliéster',
         'Polo deportivo con tecnología que absorbe la humedad', ['S', 'M', 'L', 'XL', 'XXL'], ['Negro', 'Blanco', 'Verde', 'Azul']),
        
        ('Chaqueta de Cuero', 'ropa-hombre', 'Calvin Klein', 1200.00, 600.00, 'men', 'Cuero genuino',
         'Chaqueta de cuero premium estilo motociclista', ['M', 'L', 'XL', 'XXL'], ['Negro', 'Marrón']),
        
        ('Sudadera con Capucha', 'ropa-deportiva', 'Puma', 320.00, 160.00, 'unisex', '80% Algodón, 20% Poliéster',
         'Sudadera cómoda perfecta para entrenamientos', ['S', 'M', 'L', 'XL', 'XXL'], ['Gris', 'Negro', 'Azul', 'Rojo']),
        
        ('Bufanda de Lana', 'accesorios', 'Lacoste', 150.00, 70.00, 'unisex', '100% Lana',
         'Bufanda suave y cálida para clima frío', ['Único'], ['Gris', 'Beige', 'Negro', 'Vino']),
    ]
    
    products = []
    for prod_data in products_data:
        (name, cat_slug, brand_name, price, cost, gender, material, desc, 
         size_names, color_names) = prod_data
        
        product = Product.objects.create(
            name=name,
            description=desc,
            sku=f'PROD-{random.randint(10000, 99999)}',
            price=Decimal(str(price)),
            cost_price=Decimal(str(cost)),
            compare_at_price=Decimal(str(price * 1.2)),  # 20% más para mostrar descuento
            category=categories.get(cat_slug),
            brand=brands.get(brand_name),
            target_gender=gender,
            material=material,
            status='active',
            is_featured=random.choice([True, False]),
            is_on_sale=random.choice([True, False, False]),  # 33% de probabilidad
            created_by=users['admin'],
        )
        
        # Añadir tallas y colores
        size_type = 'shoes' if cat_slug in ['zapatillas', 'botas'] else ('accessories' if cat_slug == 'accesorios' else 'clothing')
        for size_name in size_names:
            size_key = f"{size_name}-{size_type}"
            if size_key in sizes:
                product.sizes.add(sizes[size_key])
        
        for color_name in color_names:
            if color_name in colors:
                product.colors.add(colors[color_name])
        
        # Crear variantes (combinaciones de talla y color)
        variant_count = 0
        for size_name in size_names:
            size_key = f"{size_name}-{size_type}"
            if size_key not in sizes:
                continue
            
            for color_name in color_names:
                if color_name not in colors:
                    continue
                
                stock = random.randint(5, 50)
                variant = ProductVariant.objects.create(
                    product=product,
                    size=sizes[size_key],
                    color=colors[color_name],
                    sku_variant=f'{product.sku}-{size_name}-{color_name[:3].upper()}',
                    stock_quantity=stock,
                    min_stock_level=5,
                    reserved_quantity=0,
                    price_adjustment=Decimal('0.00'),
                    is_active=True,
                )
                variant_count += 1
        
        products.append(product)
        print(f"  ✓ Producto: {name} ({variant_count} variantes)")
    
    print(f"✅ {len(products)} productos creados\n")
    return products


def create_payment_methods():
    """Crear métodos de pago"""
    print("💳 Creando métodos de pago...")
    
    payment_methods_data = [
        ('Efectivo', 'cash', 'Pago en efectivo', 0, 0),
        ('Tarjeta de Crédito Visa', 'credit_card', 'Pago con tarjeta Visa', 2.5, 0),
        ('Tarjeta de Crédito Mastercard', 'credit_card', 'Pago con tarjeta Mastercard', 2.5, 0),
        ('Tarjeta de Débito', 'debit_card', 'Pago con tarjeta de débito', 1.5, 0),
        ('Transferencia Bancaria', 'bank_transfer', 'Transferencia bancaria directa', 0, 0),
        ('Pago QR', 'mobile_payment', 'Pago mediante código QR', 1.0, 0),
    ]
    
    payment_methods = {}
    for name, ptype, desc, fee_pct, fee_fixed in payment_methods_data:
        pm, created = PaymentMethod.objects.get_or_create(
            name=name,
            defaults={
                'payment_type': ptype,
                'description': desc,
                'is_active': True,
                'processing_fee_percentage': Decimal(str(fee_pct)),
                'processing_fee_fixed': Decimal(str(fee_fixed)),
            }
        )
        payment_methods[name] = pm
        if created:
            print(f"  ✓ Método de pago: {name}")
    
    print(f"✅ {len(payment_methods)} métodos de pago creados\n")
    return payment_methods


def create_orders(products, users, payment_methods):
    """Crear órdenes de prueba"""
    print("🛒 Creando órdenes...")
    
    customers = users['customers']
    cashier = users['cashier']
    
    orders = []
    for i in range(10):
        # Seleccionar cliente aleatorio
        customer = random.choice(customers)
        
        # Tipo de orden
        order_type = random.choice(['online', 'in_store', 'in_store', 'online'])
        
        # Crear orden
        order = Order.objects.create(
            customer=customer,
            order_type=order_type,
            status=random.choice(['confirmed', 'processing', 'delivered', 'delivered']),
            shipping_address={
                'street': f'Calle {random.randint(1, 100)}',
                'city': 'La Paz',
                'state': 'La Paz',
                'country': 'Bolivia',
                'zip_code': '00000',
            },
            billing_address={
                'street': customer.address if customer.address else 'Sin dirección',
                'city': 'La Paz',
                'state': 'La Paz',
                'country': 'Bolivia',
            },
            processed_by=cashier if order_type == 'in_store' else None,
            created_at=timezone.now() - timedelta(days=random.randint(1, 90)),
        )
        
        # Añadir items a la orden (2-5 productos)
        num_items = random.randint(2, 5)
        selected_products = random.sample(products, min(num_items, len(products)))
        
        subtotal = Decimal('0.00')
        for product in selected_products:
            # Seleccionar variante aleatoria
            variants = list(product.variants.filter(stock_quantity__gt=0))
            if not variants:
                continue
            
            variant = random.choice(variants)
            quantity = random.randint(1, 3)
            unit_price = product.price
            total_price = unit_price * quantity
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_variant=variant,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
            )
            
            subtotal += total_price
            
            # Reducir stock
            variant.stock_quantity = max(0, variant.stock_quantity - quantity)
            variant.save()
        
        # Calcular totales
        tax_rate = Decimal('0.13')  # 13% de impuesto
        tax_amount = subtotal * tax_rate
        shipping_cost = Decimal('0.00') if order_type == 'in_store' else Decimal('30.00')
        total_amount = subtotal + tax_amount + shipping_cost
        
        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.shipping_cost = shipping_cost
        order.total_amount = total_amount
        order.save()
        
        # Crear pago
        payment_method = random.choice(list(payment_methods.values()))
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=total_amount,
            status='completed',
            transaction_id=f'TXN-{random.randint(100000, 999999)}',
            processed_by=cashier if order_type == 'in_store' else None,
            processed_at=order.created_at + timedelta(minutes=random.randint(1, 30)),
        )
        
        # Crear factura
        invoice = Invoice.objects.create(
            order=order,
            customer=customer,
            invoice_type='sale',
            status='paid',
            tax_rate=tax_rate * 100,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            issue_date=order.created_at.date(),
            due_date=order.created_at.date() + timedelta(days=30),
            created_by=cashier if order_type == 'in_store' else users['admin'],
        )
        
        orders.append(order)
        print(f"  ✓ Orden {order.order_number}: {order.items.count()} items, Total: Bs. {total_amount:.2f}")
    
    print(f"✅ {len(orders)} órdenes creadas\n")
    return orders


def main():
    """Función principal"""
    print("=" * 60)
    print("🏪 GENERADOR DE DATOS DE PRUEBA - BOUTIQUE")
    print("=" * 60)
    print()
    
    # Confirmación automática en entorno de desarrollo
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        print("✓ Modo automático activado")
    else:
        response = input("⚠️  ¿Estás seguro de que quieres limpiar y regenerar todos los datos? (si/no): ")
        if response.lower() not in ['si', 'sí', 's', 'yes', 'y']:
            print("❌ Operación cancelada")
            return
    
    print()
    
    # Ejecutar en orden
    clear_data()
    permissions = create_permissions()
    roles = create_roles(permissions)
    users = create_users(roles)
    categories = create_categories()
    brands = create_brands()
    sizes = create_sizes()
    colors = create_colors()
    products = create_products(categories, brands, sizes, colors, users)
    payment_methods = create_payment_methods()
    orders = create_orders(products, users, payment_methods)
    
    print()
    print("=" * 60)
    print("✅ DATOS DE PRUEBA GENERADOS EXITOSAMENTE")
    print("=" * 60)
    print()
    print("👤 CREDENCIALES DE ACCESO:")
    print("-" * 60)
    print("Super Admin: superadmin@boutique.com / admin123")
    print("Administrador: admin@boutique.com / admin123")
    print("Cajero: cajero@boutique.com / cajero123")
    print("Gerente: gerente@boutique.com / gerente123")
    print("Clientes: *.@email.com / cliente123")
    print("-" * 60)
    print()
    print("📊 RESUMEN:")
    print(f"  • Permisos: {Permission.objects.count()}")
    print(f"  • Roles: {Role.objects.count()}")
    print(f"  • Usuarios: {User.objects.count()}")
    print(f"  • Categorías: {Category.objects.count()}")
    print(f"  • Marcas: {Brand.objects.count()}")
    print(f"  • Tallas: {Size.objects.count()}")
    print(f"  • Colores: {Color.objects.count()}")
    print(f"  • Productos: {Product.objects.count()}")
    print(f"  • Variantes: {ProductVariant.objects.count()}")
    print(f"  • Métodos de Pago: {PaymentMethod.objects.count()}")
    print(f"  • Órdenes: {Order.objects.count()}")
    print(f"  • Facturas: {Invoice.objects.count()}")
    print()


if __name__ == '__main__':
    main()
