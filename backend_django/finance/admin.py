from django.contrib import admin
from .models import ExpenseCategory, Expense, Transaction, AccountBalance


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['expense_number', 'description', 'amount', 'category', 'status', 'expense_date', 'beneficiary']
    list_filter = ['status', 'category', 'payment_method', 'expense_date']
    search_fields = ['expense_number', 'description', 'beneficiary', 'invoice_number']
    date_hierarchy = 'expense_date'
    readonly_fields = ['expense_number', 'created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_type', 'amount', 'description', 'channel', 'payment_method_name', 'transaction_date']
    list_filter = ['transaction_type', 'channel', 'transaction_date']
    search_fields = ['description', 'payment_method_name']
    date_hierarchy = 'transaction_date'
    readonly_fields = ['created_at']


@admin.register(AccountBalance)
class AccountBalanceAdmin(admin.ModelAdmin):
    list_display = ['balance', 'daily_income', 'daily_expense', 'monthly_income', 'monthly_expense', 'last_updated']
    readonly_fields = ['last_updated']
