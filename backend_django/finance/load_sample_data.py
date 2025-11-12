"""
Script para cargar datos de prueba de finanzas
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from finance.models import ExpenseCategory, Expense, Transaction
from orders.models import Order, Payment

User = get_user_model()


def create_expense_categories():
    """Crear categorías de gastos"""
    print("📁 Creando categorías de gastos...")
    
    categories = [
        # Gastos Fijos
        {
            'name': 'Alquiler del Local',
            'category_type': 'fixed',
            'description': 'Alquiler mensual del local comercial',
            'color': '#1a1a1a',
            'icon': 'Home'
        },
        {
            'name': 'Servicios Básicos',
            'category_type': 'fixed',
            'description': 'Luz, agua, internet, teléfono',
            'color': '#2d2d2d',
            'icon': 'Zap'
        },
        {
            'name': 'Sueldos de Empleados',
            'category_type': 'fixed',
            'description': 'Salarios mensuales del personal',
            'color': '#404040',
            'icon': 'Users'
        },
        {
            'name': 'Software y Plataformas',
            'category_type': 'fixed',
            'description': 'Suscripciones a software, hosting, dominios',
            'color': '#525252',
            'icon': 'Code'
        },
        
        # Gastos Variables
        {
            'name': 'Compra de Inventario',
            'category_type': 'variable',
            'description': 'Compra de productos para reventa',
            'color': '#666666',
            'icon': 'Package'
        },
        {
            'name': 'Marketing y Publicidad',
            'category_type': 'variable',
            'description': 'Campañas publicitarias, redes sociales',
            'color': '#7a7a7a',
            'icon': 'TrendingUp'
        },
        {
            'name': 'Comisiones de Pago',
            'category_type': 'variable',
            'description': 'Comisiones de tarjetas, QR, pasarelas',
            'color': '#8c8c8c',
            'icon': 'CreditCard'
        },
        {
            'name': 'Envíos y Logística',
            'category_type': 'variable',
            'description': 'Costos de envío, transporte, paquetería',
            'color': '#999999',
            'icon': 'Truck'
        },
        {
            'name': 'Mantenimiento',
            'category_type': 'variable',
            'description': 'Reparaciones, mantenimiento de equipos',
            'color': '#a6a6a6',
            'icon': 'Tool'
        },
        {
            'name': 'Impuestos',
            'category_type': 'variable',
            'description': 'Impuestos, tasas municipales',
            'color': '#b3b3b3',
            'icon': 'FileText'
        },
    ]
    
    created_categories = []
    for cat_data in categories:
        category, created = ExpenseCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            print(f"  ✅ {category.name}")
        created_categories.append(category)
    
    return created_categories


def create_expenses(categories, admin_user):
    """Crear gastos de prueba de los últimos 3 meses"""
    print("\n💸 Creando gastos de prueba...")
    
    # Obtener fechas para los últimos 3 meses
    today = timezone.now().date()
    start_date = today - timedelta(days=90)
    
    # Datos de ejemplo para gastos fijos (mensuales)
    fixed_expenses = [
        {
            'category_name': 'Alquiler del Local',
            'amount': Decimal('1500.00'),
            'beneficiary': 'Inmobiliaria Central',
            'payment_method': 'bank_transfer',
            'description': 'Alquiler mensual local comercial',
        },
        {
            'category_name': 'Servicios Básicos',
            'amount': Decimal('250.00'),
            'beneficiary': 'Servicios Municipales',
            'payment_method': 'bank_transfer',
            'description': 'Luz, agua, internet',
        },
        {
            'category_name': 'Sueldos de Empleados',
            'amount': Decimal('5000.00'),
            'beneficiary': 'Planilla de Empleados',
            'payment_method': 'bank_transfer',
            'description': 'Sueldos mensuales (2 empleados)',
        },
        {
            'category_name': 'Software y Plataformas',
            'amount': Decimal('150.00'),
            'beneficiary': 'Servicios Cloud',
            'payment_method': 'credit_card',
            'description': 'Hosting, dominios, software',
        },
    ]
    
    # Crear gastos fijos para cada mes
    for i in range(3):  # 3 meses
        month_date = today - timedelta(days=30 * i)
        for expense_data in fixed_expenses:
            category = next((c for c in categories if c.name == expense_data['category_name']), None)
            if category:
                Expense.objects.create(
                    category=category,
                    description=expense_data['description'],
                    amount=expense_data['amount'],
                    status='paid',
                    payment_method=expense_data['payment_method'],
                    beneficiary=expense_data['beneficiary'],
                    expense_date=month_date.replace(day=5),
                    paid_date=month_date.replace(day=5),
                    created_by=admin_user,
                    paid_by=admin_user,
                )
    
    # Gastos variables (aleatorios)
    variable_expenses = [
        {
            'category_name': 'Compra de Inventario',
            'amounts': [800, 1200, 1500, 900, 1100],
            'beneficiaries': ['Proveedor A', 'Proveedor B', 'Proveedor C'],
            'payment_method': 'bank_transfer',
        },
        {
            'category_name': 'Marketing y Publicidad',
            'amounts': [200, 300, 150, 400, 250],
            'beneficiaries': ['Facebook Ads', 'Google Ads', 'Instagram Ads'],
            'payment_method': 'credit_card',
        },
        {
            'category_name': 'Comisiones de Pago',
            'amounts': [50, 75, 100, 60, 80],
            'beneficiaries': ['Mercado Pago', 'Paypal', 'Stripe'],
            'payment_method': 'bank_transfer',
        },
        {
            'category_name': 'Envíos y Logística',
            'amounts': [120, 180, 150, 200, 170],
            'beneficiaries': ['Courier Express', 'DHL', 'FedEx'],
            'payment_method': 'cash',
        },
        {
            'category_name': 'Mantenimiento',
            'amounts': [80, 120, 100],
            'beneficiaries': ['Técnico Local', 'Reparaciones Generales'],
            'payment_method': 'cash',
        },
    ]
    
    expense_count = 0
    for days in range(90):
        date = start_date + timedelta(days=days)
        
        # Crear 1-3 gastos variables aleatorios por día
        num_expenses = random.randint(0, 2)
        for _ in range(num_expenses):
            expense_type = random.choice(variable_expenses)
            category = next((c for c in categories if c.name == expense_type['category_name']), None)
            
            if category:
                Expense.objects.create(
                    category=category,
                    description=f"{expense_type['category_name']} - {date.strftime('%d/%m/%Y')}",
                    amount=Decimal(str(random.choice(expense_type['amounts']))),
                    status='paid',
                    payment_method=expense_type['payment_method'],
                    beneficiary=random.choice(expense_type['beneficiaries']),
                    expense_date=date,
                    paid_date=date,
                    created_by=admin_user,
                    paid_by=admin_user,
                )
                expense_count += 1
    
    print(f"  ✅ {expense_count} gastos variables creados")
    print(f"  ✅ {len(fixed_expenses) * 3} gastos fijos creados")


def create_income_transactions():
    """Crear transacciones de ingresos basadas en las órdenes existentes"""
    print("\n💰 Creando transacciones de ingresos...")
    
    # Obtener órdenes completadas de los últimos 3 meses
    today = timezone.now().date()
    start_date = today - timedelta(days=90)
    
    orders = Order.objects.filter(
        status__in=['delivered', 'confirmed'],
        created_at__date__gte=start_date
    ).select_related('customer')
    
    transaction_count = 0
    for order in orders:
        # Obtener pagos de la orden
        payments = Payment.objects.filter(order=order, status='completed')
        
        for payment in payments:
            Transaction.objects.get_or_create(
                order=order,
                transaction_type='income',
                defaults={
                    'channel': 'online' if order.order_type == 'online' else 'in_store',
                    'amount': payment.amount,
                    'description': f"Venta #{order.order_number}",
                    'payment_method_name': payment.payment_method.name,
                    'transaction_date': order.created_at,
                    'created_by': order.customer,
                }
            )
            transaction_count += 1
    
    print(f"  ✅ {transaction_count} transacciones de ingresos creadas")


def create_expense_transactions():
    """Crear transacciones de egresos basadas en los gastos"""
    print("\n📤 Creando transacciones de egresos...")
    
    expenses = Expense.objects.filter(status='paid').select_related('category', 'created_by')
    
    transaction_count = 0
    for expense in expenses:
        Transaction.objects.get_or_create(
            expense=expense,
            transaction_type='expense',
            defaults={
                'channel': 'administrative',
                'amount': expense.amount,
                'description': expense.description,
                'expense_category': expense.category,
                'payment_method_name': expense.get_payment_method_display(),
                'transaction_date': timezone.make_aware(
                    datetime.combine(expense.expense_date, datetime.min.time())
                ),
                'created_by': expense.created_by,
            }
        )
        transaction_count += 1
    
    print(f"  ✅ {transaction_count} transacciones de egresos creadas")


def main():
    print("=" * 60)
    print("🚀 CARGANDO DATOS DE PRUEBA - SISTEMA FINANCIERO")
    print("=" * 60)
    
    # Obtener usuario admin
    try:
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            print("❌ No se encontró un usuario admin")
            return
        
        print(f"\n👤 Usuario admin: {admin_user.email}")
        
        # Crear categorías
        categories = create_expense_categories()
        
        # Crear gastos
        create_expenses(categories, admin_user)
        
        # Crear transacciones de ingresos
        create_income_transactions()
        
        # Crear transacciones de egresos
        create_expense_transactions()
        
        print("\n" + "=" * 60)
        print("✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE")
        print("=" * 60)
        
        # Resumen
        print("\n📊 RESUMEN:")
        print(f"  • Categorías de gastos: {ExpenseCategory.objects.count()}")
        print(f"  • Gastos registrados: {Expense.objects.count()}")
        print(f"  • Transacciones totales: {Transaction.objects.count()}")
        print(f"    - Ingresos: {Transaction.objects.filter(transaction_type='income').count()}")
        print(f"    - Egresos: {Transaction.objects.filter(transaction_type='expense').count()}")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
