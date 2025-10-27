from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Department(models.Model):
    """
    Departamentos de la tienda
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Position(models.Model):
    """
    Puestos de trabajo disponibles
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    description = models.TextField(blank=True, null=True)
    min_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    required_skills = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['department__name', 'title']
        unique_together = ('title', 'department')
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"


class Employee(models.Model):
    """
    Información específica de empleados (extiende el modelo User)
    """
    EMPLOYMENT_STATUS_CHOICES = [
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
        ('on_leave', 'En Licencia'),
        ('terminated', 'Terminado'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Tiempo Completo'),
        ('part_time', 'Medio Tiempo'),
        ('temporary', 'Temporal'),
        ('contractor', 'Contratista'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_employees')
    
    # Información laboral
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS_CHOICES, default='active')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    
    # Información salarial
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Porcentaje de comisión
    
    # Información de contacto de emergencia
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    # Información bancaria
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Horario de trabajo
    work_schedule = models.JSONField(default=dict, blank=True)  # {"monday": {"start": "09:00", "end": "17:00"}, ...}
    
    # Información adicional
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__last_name', 'user__first_name']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['employment_status']),
            models.Index(fields=['department']),
            models.Index(fields=['hire_date']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.employee_id})"
    
    @property
    def is_active_employee(self):
        return self.employment_status == 'active'
    
    @property
    def years_of_service(self):
        from django.utils import timezone
        if self.termination_date:
            end_date = self.termination_date
        else:
            end_date = timezone.now().date()
        
        years = end_date.year - self.hire_date.year
        if end_date.month < self.hire_date.month or (end_date.month == self.hire_date.month and end_date.day < self.hire_date.day):
            years -= 1
        return years
    
    def save(self, *args, **kwargs):
        if not self.employee_id:
            # Generate employee ID
            last_employee = Employee.objects.order_by('-employee_id').first()
            if last_employee and last_employee.employee_id.startswith('EMP'):
                try:
                    last_number = int(last_employee.employee_id.split('-')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            self.employee_id = f'EMP-{new_number:04d}'
        
        # Update user information
        if self.user:
            self.user.is_active_employee = self.is_active_employee
            self.user.department = self.department.name if self.department else None
            self.user.salary = self.base_salary
            self.user.hire_date = self.hire_date
            self.user.save()
        
        super().save(*args, **kwargs)


class Attendance(models.Model):
    """
    Registro de asistencia de empleados
    """
    STATUS_CHOICES = [
        ('present', 'Presente'),
        ('absent', 'Ausente'),
        ('late', 'Tarde'),
        ('sick_leave', 'Licencia Médica'),
        ('vacation', 'Vacaciones'),
        ('personal_leave', 'Permiso Personal'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    
    # Horarios
    scheduled_start = models.TimeField()
    scheduled_end = models.TimeField()
    actual_start = models.TimeField(null=True, blank=True)
    actual_end = models.TimeField(null=True, blank=True)
    
    # Tiempos calculados
    hours_worked = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    break_time = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    # Información adicional
    notes = models.TextField(blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_attendance')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date', 'employee__user__last_name']
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.date} - {self.get_status_display()}"
    
    def calculate_hours(self):
        """Calcular horas trabajadas automáticamente"""
        if self.actual_start and self.actual_end:
            from datetime import datetime, timedelta
            start = datetime.combine(self.date, self.actual_start)
            end = datetime.combine(self.date, self.actual_end)
            
            # Si terminó al día siguiente
            if end < start:
                end += timedelta(days=1)
            
            total_time = end - start
            self.hours_worked = total_time.total_seconds() / 3600 - float(self.break_time)
            
            # Calcular horas extra (más de 8 horas)
            if self.hours_worked > 8:
                self.overtime_hours = self.hours_worked - 8
            else:
                self.overtime_hours = 0
    
    def save(self, *args, **kwargs):
        self.calculate_hours()
        super().save(*args, **kwargs)


class Payroll(models.Model):
    """
    Nómina de empleados
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('calculated', 'Calculada'),
        ('approved', 'Aprobada'),
        ('paid', 'Pagada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    pay_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Ingresos
    base_salary_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Deducciones
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    social_security_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Totales
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Información adicional
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True, null=True)
    calculated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='calculated_payrolls')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_payrolls')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employee', 'pay_period_start', 'pay_period_end')
        ordering = ['-pay_period_end', 'employee__user__last_name']
        indexes = [
            models.Index(fields=['employee', 'pay_period_start']),
            models.Index(fields=['pay_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Nómina {self.employee.user.get_full_name()} - {self.pay_period_start} al {self.pay_period_end}"
    
    def calculate_payroll(self):
        """Calcular nómina automáticamente"""
        # Calcular ingresos base
        if self.employee.employment_type == 'full_time':
            # Salario mensual fijo
            self.base_salary_amount = self.employee.base_salary
        elif self.employee.hourly_rate:
            # Pago por horas
            self.base_salary_amount = self.hours_worked * self.employee.hourly_rate
        
        # Calcular horas extra
        if self.employee.hourly_rate and self.overtime_hours > 0:
            overtime_rate = self.employee.hourly_rate * Decimal('1.5')  # 1.5x rate for overtime
            self.overtime_amount = self.overtime_hours * overtime_rate
        
        # Calcular total bruto
        self.gross_pay = (
            self.base_salary_amount + 
            self.overtime_amount + 
            self.commission_amount + 
            self.bonus_amount
        )
        
        # Calcular deducciones (ejemplo simplificado)
        self.tax_deduction = self.gross_pay * Decimal('0.15')  # 15% impuesto
        self.social_security_deduction = self.gross_pay * Decimal('0.08')  # 8% seguro social
        
        self.total_deductions = (
            self.tax_deduction + 
            self.social_security_deduction + 
            self.other_deductions
        )
        
        # Calcular pago neto
        self.net_pay = self.gross_pay - self.total_deductions
    
    def save(self, *args, **kwargs):
        if self.status in ['calculated', 'approved', 'paid']:
            self.calculate_payroll()
        super().save(*args, **kwargs)