from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from .models import ExpenseCategory, Expense, Transaction, AccountBalance
from .serializers import (
    ExpenseCategorySerializer, ExpenseSerializer, TransactionSerializer,
    AccountBalanceSerializer, FinancialSummarySerializer, CashFlowSerializer
)
from orders.models import Order, Payment


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de categorías de gastos
    """
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active', None)
        category_type = self.request.query_params.get('category_type', None)
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        
        return queryset


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de egresos
    """
    queryset = Expense.objects.select_related('category', 'created_by', 'paid_by').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        status_param = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if category:
            queryset = queryset.filter(category_id=category)
        if start_date:
            queryset = queryset.filter(expense_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(expense_date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """
        Marcar un gasto como pagado
        """
        expense = self.get_object()
        expense.status = 'paid'
        expense.paid_by = request.user
        expense.paid_date = timezone.now().date()
        expense.save()
        
        # Crear transacción
        Transaction.objects.create(
            transaction_type='expense',
            channel='administrative',
            amount=expense.amount,
            description=expense.description,
            expense_category=expense.category,
            expense=expense,
            payment_method_name=expense.get_payment_method_display(),
            transaction_date=timezone.now(),
            created_by=request.user
        )
        
        return Response({'status': 'Gasto marcado como pagado'})


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para transacciones
    """
    queryset = Transaction.objects.select_related(
        'expense_category', 'order', 'expense', 'created_by'
    ).all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        transaction_type = self.request.query_params.get('type', None)
        channel = self.request.query_params.get('channel', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if channel:
            queryset = queryset.filter(channel=channel)
        if start_date:
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            queryset = queryset.filter(transaction_date__gte=start_datetime)
        if end_date:
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            queryset = queryset.filter(transaction_date__lte=end_datetime)
        
        return queryset


class FinancialDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet para el dashboard financiero
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Obtener resumen financiero
        """
        period = request.query_params.get('period', 'month')  # day, week, month, year
        
        # Calcular fechas
        today = timezone.now().date()
        if period == 'day':
            start_date = today
            end_date = today
        elif period == 'week':
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif period == 'month':
            start_date = today.replace(day=1)
            # Último día del mes
            if today.month == 12:
                end_date = today.replace(day=31)
            else:
                end_date = (today.replace(month=today.month + 1, day=1) - timedelta(days=1))
        else:  # year
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(month=12, day=31)
        
        # Obtener ingresos (órdenes completadas)
        income_orders = Order.objects.filter(
            status__in=['delivered', 'confirmed'],
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        
        total_income = income_orders.aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        # Ingresos por canal
        income_by_channel = {}
        for order_type in ['online', 'in_store']:
            channel_income = income_orders.filter(order_type=order_type).aggregate(
                total=Sum('total_amount')
            )['total'] or Decimal('0.00')
            income_by_channel[order_type] = float(channel_income)
        
        # Ingresos por método de pago
        income_by_payment = {}
        payments = Payment.objects.filter(
            order__in=income_orders,
            status='completed'
        ).select_related('payment_method')
        
        for payment in payments:
            method_name = payment.payment_method.name
            if method_name not in income_by_payment:
                income_by_payment[method_name] = 0
            income_by_payment[method_name] += float(payment.amount)
        
        # Obtener egresos
        expenses = Expense.objects.filter(
            status='paid',
            expense_date__gte=start_date,
            expense_date__lte=end_date
        )
        
        total_expense = expenses.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Gastos por categoría
        expense_by_category = {}
        for expense in expenses.select_related('category'):
            category_name = expense.category.name
            if category_name not in expense_by_category:
                expense_by_category[category_name] = 0
            expense_by_category[category_name] += float(expense.amount)
        
        # Calcular utilidad neta
        net_profit = total_income - total_expense
        
        # Balance actual
        balance = AccountBalance.get_current_balance()
        
        summary_data = {
            'period': period,
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'net_profit': float(net_profit),
            'income_by_channel': income_by_channel,
            'income_by_payment_method': income_by_payment,
            'expense_by_category': expense_by_category,
            'current_balance': float(balance.balance)
        }
        
        serializer = FinancialSummarySerializer(summary_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def cash_flow(self, request):
        """
        Obtener flujo de caja diario
        """
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        cash_flow = []
        current_balance = Decimal('0.00')
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            
            # Ingresos del día
            daily_income = Order.objects.filter(
                status__in=['delivered', 'confirmed'],
                created_at__date=date
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            # Egresos del día
            daily_expense = Expense.objects.filter(
                status='paid',
                expense_date=date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            daily_net = daily_income - daily_expense
            current_balance += daily_net
            
            cash_flow.append({
                'date': date,
                'income': float(daily_income),
                'expense': float(daily_expense),
                'net': float(daily_net),
                'balance': float(current_balance)
            })
        
        serializer = CashFlowSerializer(cash_flow, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """
        Obtener balance actual de la cuenta
        """
        balance = AccountBalance.get_current_balance()
        serializer = AccountBalanceSerializer(balance)
        return Response(serializer.data)
