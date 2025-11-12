from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseCategoryViewSet, ExpenseViewSet, 
    TransactionViewSet, FinancialDashboardViewSet
)

router = DefaultRouter()
router.register(r'categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'dashboard', FinancialDashboardViewSet, basename='financial-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
