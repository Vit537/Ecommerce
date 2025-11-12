# 📧 GUÍA DE NOTIFICACIONES POR EMAIL - RESEND

## 📋 Resumen

Sistema de notificaciones por email implementado usando **Resend** para enviar emails a contactos registrados.

## 🔑 Configuración Actual

- **API Key**: `re_Bzg3g6B4_JYMa8eD5FhpMfmrRF7j2f35W`
- **From Email**: `onboarding@resend.dev`
- **From Name**: `SPORTSWEAR`

### Contactos Permitidos en Resend

Solo estos emails pueden recibir mensajes:
- ✅ `henrysalas2558@gmail.com`
- ✅ `sure.pencil@gmail.com`
- ✅ `goku02820@gmail.com`

---

## 📨 Tipos de Emails Implementados

### 1. 🎯 Email Personalizado (Broadcast)

**Para qué sirve**: El admin puede enviar mensajes personalizados a múltiples contactos (promociones, anuncios, descuentos especiales).

**Endpoint**: `POST /api/notifications/settings/broadcast_email/`

**Body**:
```json
{
  "recipients": [
    "henrysalas2558@gmail.com",
    "sure.pencil@gmail.com"
  ],
  "subject": "¡Descuento Especial Solo por Hoy! 🎉",
  "message": "Aprovecha un 30% de descuento en toda la tienda. Válido solo hasta medianoche.",
  "is_html": false
}
```

**Opciones**:
- `recipients`: Array de emails (deben estar en la lista permitida)
- `subject`: Asunto del email
- `message`: Contenido del mensaje
- `is_html`: 
  - `false` → El mensaje se envuelve en una plantilla SPORTSWEAR automáticamente
  - `true` → Envías tu propio HTML personalizado

**Ejemplo con HTML personalizado**:
```json
{
  "recipients": ["henrysalas2558@gmail.com"],
  "subject": "Nueva Colección 2025",
  "message": "<html><body style='font-family: Arial;'><h1>¡Nueva Colección!</h1><p>Descubre nuestras prendas deportivas de última generación.</p></body></html>",
  "is_html": true
}
```

---

### 2. 📊 Reporte Diario de Ventas

**Para qué sirve**: Envía un resumen de las ventas del día al administrador con estadísticas detalladas.

**Endpoint**: `POST /api/notifications/settings/send_daily_report/`

**Body (opcional)**:
```json
{
  "date": "2025-01-15"  // Opcional - si no se proporciona, usa la fecha actual
}
```

**El reporte incluye**:
- 💰 Total de ventas del día
- 📦 Número de órdenes
- 💳 Ticket promedio
- 👥 Nuevos clientes
- 📊 Ventas por método de pago
- 🏆 Top 5 productos más vendidos

**Ejemplo de uso**:
```bash
# Reporte del día actual
POST /api/notifications/settings/send_daily_report/

# Reporte de una fecha específica
POST /api/notifications/settings/send_daily_report/
Body: { "date": "2025-01-10" }
```

---

### 3. 🛍️ Confirmación de Compra (Automático)

**Para qué sirve**: Se envía automáticamente cuando un cliente completa una compra.

**Cuándo se envía**:
- ✅ Cuando se crea una orden en el sistema POS (cajero)
- ✅ Cuando un pago por Stripe se completa exitosamente
- ✅ Cuando un cliente confirma un pago por QR

**Contenido del email**:
- Número de orden
- Fecha de compra
- Método de pago
- Detalle de productos comprados
- Total de la orden
- Estado del pago (pagado completo o saldo pendiente)

**Nota**: Solo se envía si el cliente tiene un email válido (no se envía a clientes walk-in).

---

## 🔧 Comandos de Configuración

### Configurar Resend
```bash
python manage.py setup_resend
```

Este comando:
- ✅ Configura la API key de Resend
- ✅ Establece el email de origen (`onboarding@resend.dev`)
- ✅ Muestra los contactos permitidos
- ✅ Configura el email del admin

---

## 📱 Ejemplos de Uso desde el Frontend

### 1. Enviar Email Personalizado

```typescript
// frontend/src/services/notificationService.ts

export const sendBroadcastEmail = async (data: {
  recipients: string[];
  subject: string;
  message: string;
  is_html?: boolean;
}) => {
  const response = await apiService.post(
    '/notifications/settings/broadcast_email/',
    data
  );
  return response;
};

// Uso en componente
const handleSendPromotion = async () => {
  try {
    const result = await sendBroadcastEmail({
      recipients: [
        'henrysalas2558@gmail.com',
        'sure.pencil@gmail.com'
      ],
      subject: '🔥 Flash Sale - 50% OFF',
      message: 'Solo por hoy, aprovecha 50% de descuento en toda la tienda.',
      is_html: false
    });
    
    console.log('Emails enviados:', result.results);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 2. Enviar Reporte Diario

```typescript
export const sendDailyReport = async (date?: string) => {
  const response = await apiService.post(
    '/notifications/settings/send_daily_report/',
    date ? { date } : {}
  );
  return response;
};

// Uso en componente
const handleSendReport = async () => {
  try {
    const result = await sendDailyReport();
    alert('Reporte enviado exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎨 Diseño de los Emails

Todos los emails siguen el diseño minimalista de SPORTSWEAR:

### Colores
- **Negro (#1a1a1a)**: Headers, títulos principales
- **Blanco (#ffffff)**: Backgrounds, texto en headers
- **Gris (#6b7280)**: Texto secundario, descripciones
- **Verde (#0d9488)**: Montos pagados, estados exitosos
- **Rojo (#dc2626)**: Saldos pendientes, alertas

### Estructura
```
┌─────────────────────────┐
│   SPORTSWEAR (Header)   │ ← Negro con texto blanco
├─────────────────────────┤
│                         │
│   Contenido Principal   │ ← Fondo blanco
│   • Texto en gris       │
│   • Detalles de orden   │
│   • Tabla de productos  │
│                         │
├─────────────────────────┤
│   Footer con info       │ ← Fondo gris claro
└─────────────────────────┘
```

---

## ⚙️ Configuración Avanzada

### Habilitar/Deshabilitar Tipos de Notificaciones

```python
# En Django Admin o via API
settings = NotificationSettings.objects.first()
settings.enable_order_confirmation = True   # Confirmación de órdenes
settings.enable_payment_notifications = True # Notificaciones de pago
settings.enable_daily_reports = True        # Reportes diarios
settings.save()
```

### Cambiar Hora del Reporte Diario

```python
settings = NotificationSettings.objects.first()
settings.daily_report_time = '20:00:00'  # 8:00 PM
settings.save()
```

---

## 🔍 Monitoreo

### Ver Notificaciones Enviadas

```bash
# Endpoint para admin
GET /api/notifications/notifications/

# Filtrar por tipo
GET /api/notifications/notifications/?event_type=order_created
GET /api/notifications/notifications/?event_type=broadcast
GET /api/notifications/notifications/?event_type=daily_sales_report

# Filtrar por estado
GET /api/notifications/notifications/?status=sent
GET /api/notifications/notifications/?status=failed
```

### Ver Estadísticas

```typescript
// Obtener conteo de notificaciones no leídas
GET /api/notifications/notifications/unread_count/

// Marcar todas como leídas
POST /api/notifications/notifications/mark_all_as_read/
```

---

## 🚨 Solución de Problemas

### Email no se envía

1. **Verificar que el destinatario esté en la lista permitida**:
   - Solo `henrysalas2558@gmail.com`, `sure.pencil@gmail.com`, `goku02820@gmail.com`

2. **Verificar configuración**:
   ```bash
   python manage.py shell
   >>> from notifications.models import NotificationSettings
   >>> settings = NotificationSettings.objects.first()
   >>> print(settings.resend_api_key)  # Debe mostrar la key
   >>> print(settings.from_email)       # Debe ser onboarding@resend.dev
   ```

3. **Probar conexión**:
   ```bash
   POST /api/notifications/settings/test_connection/
   ```

### Error "API key no configurada"

```bash
# Reconfigurar Resend
python manage.py setup_resend
```

---

## 📚 Próximas Mejoras

- [ ] Programar envío automático del reporte diario (celery/cron)
- [ ] Agregar plantillas HTML personalizables desde el admin
- [ ] Soporte para attachments (PDFs de facturas)
- [ ] Estadísticas de apertura de emails (tracking)
- [ ] Sistema de templates con variables dinámicas

---

## 👨‍💻 Desarrollado Por

**SPORTSWEAR E-commerce**  
Stack: Django REST + React + TypeScript + Resend  
Última actualización: Noviembre 2025
