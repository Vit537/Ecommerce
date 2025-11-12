from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class ExpenseCategory(models.Model):
    """
    Categorías de gastos/egresos
    """
    CATEGORY_TYPES = [
        ('fixed', 'Gasto Fijo'),
        ('variable', 'Gasto Variable'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    color = models.CharField(max_length=7, default='#666666')  # Color para visualización
    icon = models.CharField(max_length=50, blank=True, null=True)  # Nombre del ícono
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category_type', 'name']
        verbose_name = 'Categoría de Gasto'
        verbose_name_plural = 'Categorías de Gastos'
    
    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class Expense(models.Model):
    """
    Registro de egresos/gastos de la empresa
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('cancelled', 'Cancelado'),
        ('scheduled', 'Programado'),
    ]
    
    PAYMENT_METHODS = [
        ('cash', 'Efectivo'),
        ('bank_transfer', 'Transferencia Bancaria'),
        ('debit_card', 'Tarjeta de Débito'),
        ('credit_card', 'Tarjeta de Crédito'),
        ('check', 'Cheque'),
        ('mobile_payment', 'Pago Móvil'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense_number = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name='expenses')
    
    # Información del gasto
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    # Beneficiario
    beneficiary = models.CharField(max_length=200)  # A quién se le pagó
    invoice_number = models.CharField(max_length=100, blank=True, null=True)  # Número de factura/comprobante
    
    # Fechas
    expense_date = models.DateField()  # Fecha del gasto
    due_date = models.DateField(null=True, blank=True)  # Fecha de vencimiento
    paid_date = models.DateField(null=True, blank=True)  # Fecha de pago
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    receipt_url = models.URLField(blank=True, null=True)  # URL del comprobante/recibo
    
    # Auditoría
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Usuario que procesó el pago
    paid_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='paid_expenses')
    
    class Meta:
        ordering = ['-expense_date', '-created_at']
        indexes = [
            models.Index(fields=['expense_number']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['expense_date']),
            models.Index(fields=['beneficiary']),
        ]
        verbose_name = 'Egreso'
        verbose_name_plural = 'Egresos'
    
    def __str__(self):
        return f"{self.expense_number} - {self.description} - ${self.amount}"
    
    def save(self, *args, **kwargs):
        if not self.expense_number:
            # Generate expense number
            from django.utils import timezone
            date_str = timezone.now().strftime('%Y%m%d')
            last_expense = Expense.objects.filter(
                expense_number__startswith=f'EGR-{date_str}'
            ).order_by('-expense_number').first()
            
            if last_expense:
                last_number = int(last_expense.expense_number.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            
            self.expense_number = f'EGR-{date_str}-{new_number:04d}'
        
        # Actualizar paid_date si el estado cambia a paid
        if self.status == 'paid' and not self.paid_date:
            from django.utils import timezone
            self.paid_date = timezone.now().date()
        
        super().save(*args, **kwargs)


class Transaction(models.Model):
    """
    Registro consolidado de todas las transacciones (ingresos y egresos)
    para análisis de flujo de caja
    """
    TRANSACTION_TYPES = [
        ('income', 'Ingreso'),
        ('expense', 'Egreso'),
    ]
    
    CHANNELS = [
        ('online', 'Tienda Web'),
        ('in_store', 'Tienda Física'),
        ('administrative', 'Administrativo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    
    # Monto
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Descripción
    description = models.CharField(max_length=255)
    
    # Categoría (solo para egresos)
    expense_category = models.ForeignKey(
        ExpenseCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='transactions'
    )
    
    # Referencias
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='transactions'
    )
    expense = models.ForeignKey(
        Expense, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='transactions'
    )
    payment_method_name = models.CharField(max_length=100)  # Nombre del método de pago
    
    # Fechas
    transaction_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Balance después de la transacción (opcional, para mantener histórico)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Usuario responsable
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transactions')
    
    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['transaction_type']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['channel']),
            models.Index(fields=['expense_category']),
        ]
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
    
    def __str__(self):
        type_label = "Ingreso" if self.transaction_type == 'income' else "Egreso"
        return f"{type_label} - ${self.amount} - {self.description}"


class AccountBalance(models.Model):
    """
    Balance de la cuenta de la tienda
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    # Estadísticas del día
    daily_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daily_expense = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daily_net = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Estadísticas del mes
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_expense = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_net = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = 'Balance de Cuenta'
        verbose_name_plural = 'Balances de Cuenta'
    
    def __str__(self):
        return f"Balance: ${self.balance}"
    
    @classmethod
    def get_current_balance(cls):
        """Obtener o crear el balance actual"""
        balance, created = cls.objects.get_or_create(
            pk='00000000-0000-0000-0000-000000000001'
        )
        return balance
