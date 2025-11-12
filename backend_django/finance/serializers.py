from rest_framework import serializers
from .models import ExpenseCategory, Expense, Transaction, AccountBalance


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'category_type', 'description', 'is_active', 
                  'color', 'icon', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.category_type', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    paid_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'expense_number', 'category', 'category_name', 'category_type',
            'description', 'amount', 'status', 'payment_method',
            'beneficiary', 'invoice_number',
            'expense_date', 'due_date', 'paid_date',
            'notes', 'receipt_url',
            'created_by', 'created_by_name', 'paid_by', 'paid_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'expense_number', 'created_at', 'updated_at', 'paid_date']
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None
    
    def get_paid_by_name(self, obj):
        if obj.paid_by:
            return obj.paid_by.get_full_name() or obj.paid_by.email
        return None


class TransactionSerializer(serializers.ModelSerializer):
    expense_category_name = serializers.CharField(source='expense_category.name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    expense_number = serializers.CharField(source='expense.expense_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'channel', 'amount', 'description',
            'expense_category', 'expense_category_name',
            'order', 'order_number', 'expense', 'expense_number',
            'payment_method_name', 'transaction_date', 'balance_after',
            'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AccountBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountBalance
        fields = [
            'id', 'balance', 'last_updated',
            'daily_income', 'daily_expense', 'daily_net',
            'monthly_income', 'monthly_expense', 'monthly_net'
        ]
        read_only_fields = ['id', 'last_updated']


class FinancialSummarySerializer(serializers.Serializer):
    """
    Serializer para resumen financiero
    """
    period = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Ingresos por canal
    income_by_channel = serializers.DictField()
    
    # Ingresos por método de pago
    income_by_payment_method = serializers.DictField()
    
    # Gastos por categoría
    expense_by_category = serializers.DictField()
    
    # Balance actual
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2)


class CashFlowSerializer(serializers.Serializer):
    """
    Serializer para flujo de caja
    """
    date = serializers.DateField()
    income = serializers.DecimalField(max_digits=10, decimal_places=2)
    expense = serializers.DecimalField(max_digits=10, decimal_places=2)
    net = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
