"""
Servicio de email usando Resend
"""
import resend
from django.utils import timezone
from .models import NotificationSettings, Notification
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Servicio para enviar emails usando Resend"""
    
    def __init__(self):
        self.settings = self._get_settings()
        if self.settings and self.settings.resend_api_key:
            resend.api_key = self.settings.resend_api_key
    
    def _get_settings(self):
        """Obtiene la configuración de notificaciones"""
        try:
            return NotificationSettings.objects.first()
        except Exception as e:
            logger.error(f"Error obteniendo configuración: {e}")
            return None
    
    def send_email(self, to_email: str, subject: str, html_content: str, 
                   event_type: str = 'general', user=None, metadata: dict = None):
        """
        Envía un email usando Resend
        
        Args:
            to_email: Email del destinatario
            subject: Asunto del email
            html_content: Contenido HTML del email
            event_type: Tipo de evento que genera el email
            user: Usuario relacionado (opcional)
            metadata: Datos adicionales (opcional)
        
        Returns:
            dict: Respuesta de Resend con el ID del email
        """
        if not self.settings or not self.settings.resend_api_key:
            logger.error("Resend API key no configurada")
            self._create_notification(
                user=user,
                event_type=event_type,
                title=subject,
                message="Email no enviado: API key no configurada",
                to_email=to_email,
                status='failed',
                error="API key no configurada",
                metadata=metadata
            )
            raise ValueError("Resend API key no configurada")
        
        try:
            # Enviar email con Resend
            params = {
                "from": f"{self.settings.from_name} <{self.settings.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            
            logger.info(f"Enviando email a {to_email} con asunto: {subject}")
            response = resend.Emails.send(params)
            
            # Guardar notificación como enviada
            notification = self._create_notification(
                user=user,
                event_type=event_type,
                title=subject,
                message=f"Email enviado a {to_email}",
                to_email=to_email,
                status='sent',
                email_id=response.get('id'),
                metadata=metadata
            )
            
            logger.info(f"Email enviado exitosamente. ID: {response.get('id')}")
            return response
            
        except Exception as e:
            logger.error(f"Error enviando email: {str(e)}")
            
            # Guardar notificación como fallida
            self._create_notification(
                user=user,
                event_type=event_type,
                title=subject,
                message=f"Error al enviar email a {to_email}",
                to_email=to_email,
                status='failed',
                error=str(e),
                metadata=metadata
            )
            
            raise
    
    def _create_notification(self, user, event_type, title, message, to_email,
                            status='pending', email_id=None, error=None, metadata=None):
        """Crea un registro de notificación en la base de datos"""
        try:
            notification = Notification.objects.create(
                user=user,
                notification_type='email',
                event_type=event_type,
                title=title,
                message=message,
                recipient_email=to_email,
                email_id=email_id,
                status=status,
                error_message=error,
                metadata=metadata or {},
                sent_at=timezone.now() if status == 'sent' else None
            )
            return notification
        except Exception as e:
            logger.error(f"Error creando notificación: {e}")
            return None
    
    def send_order_confirmation(self, order, user):
        """Envía email de confirmación de orden"""
        if not self.settings or not self.settings.enable_order_confirmation:
            logger.info("Confirmación de órdenes deshabilitada")
            return None
        
        subject = f"¡Gracias por tu compra! Orden #{order.id}"
        
        # Construir HTML del email
        html_content = self._build_order_confirmation_html(order, user)
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            html_content=html_content,
            event_type='order_created',
            user=user,
            metadata={'order_id': str(order.id), 'total': str(order.total)}
        )
    
    def send_payment_notification(self, payment, user):
        """Envía email de notificación de pago recibido"""
        if not self.settings or not self.settings.enable_payment_notifications:
            logger.info("Notificaciones de pago deshabilitadas")
            return None
        
        subject = f"Pago recibido - Cuota #{payment.payment_number}"
        
        html_content = self._build_payment_notification_html(payment, user)
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            html_content=html_content,
            event_type='payment_received',
            user=user,
            metadata={
                'payment_id': str(payment.id),
                'amount': str(payment.amount),
                'remaining': str(payment.order.remaining_balance)
            }
        )
    
    def send_low_stock_alert(self, product):
        """Envía alerta de stock bajo al administrador"""
        if not self.settings or not self.settings.enable_low_stock_alerts:
            logger.info("Alertas de stock bajo deshabilitadas")
            return None
        
        if not self.settings.admin_email:
            logger.error("Email del administrador no configurado")
            return None
        
        subject = f"⚠️ ALERTA: Stock bajo de {product.name}"
        
        html_content = self._build_low_stock_alert_html(product)
        
        return self.send_email(
            to_email=self.settings.admin_email,
            subject=subject,
            html_content=html_content,
            event_type='low_stock',
            metadata={
                'product_id': str(product.id),
                'product_name': product.name,
                'current_stock': product.stock
            }
        )
    
    def send_daily_sales_report(self, report_data):
        """Envía reporte diario de ventas al administrador"""
        if not self.settings or not self.settings.enable_daily_reports:
            logger.info("Reportes diarios deshabilitados")
            return None
        
        if not self.settings.admin_email:
            logger.error("Email del administrador no configurado")
            return None
        
        from datetime import date
        today = date.today()
        subject = f"📊 Reporte de Ventas - {today.strftime('%d/%m/%Y')}"
        
        html_content = self._build_daily_report_html(report_data, today)
        
        return self.send_email(
            to_email=self.settings.admin_email,
            subject=subject,
            html_content=html_content,
            event_type='daily_sales_report',
            metadata=report_data
        )
    
    # ==================== HTML BUILDERS ====================
    
    def _build_order_confirmation_html(self, order, user):
        """Construye el HTML para confirmación de orden"""
        items_html = ""
        for item in order.items.all():
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    {item.product.name}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                    {item.quantity}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    Bs. {item.price:.2f}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                    Bs. {item.subtotal:.2f}
                </td>
            </tr>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                                        SPORTSWEAR
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                        ¡Gracias por tu compra!
                                    </h2>
                                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                        Hola {user.first_name or 'Cliente'},
                                    </p>
                                    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                        Tu pedido ha sido confirmado. A continuación, encontrarás los detalles de tu compra:
                                    </p>
                                    
                                    <!-- Order Details -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                        <tr>
                                            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">
                                                <strong>Número de Orden:</strong>
                                            </td>
                                            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px; text-align: right;">
                                                #{order.id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">
                                                <strong>Fecha:</strong>
                                            </td>
                                            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px; text-align: right;">
                                                {order.created_at.strftime('%d/%m/%Y %H:%M')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">
                                                <strong>Método de Pago:</strong>
                                            </td>
                                            <td style="padding: 12px 0; color: #1a1a1a; font-size: 14px; text-align: right;">
                                                {order.payment_method.name if order.payment_method else 'N/A'}
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Order Items -->
                                    <h3 style="margin: 32px 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                        Productos
                                    </h3>
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                        <thead>
                                            <tr style="background-color: #f9fafb;">
                                                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Producto
                                                </th>
                                                <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Cant.
                                                </th>
                                                <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Precio
                                                </th>
                                                <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items_html}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="3" style="padding: 16px; text-align: right; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                                                    TOTAL:
                                                </td>
                                                <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: 700; color: #1a1a1a;">
                                                    Bs. {order.total:.2f}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    
                                    <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                                        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                        © 2025 SPORTSWEAR. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    def _build_payment_notification_html(self, payment, user):
        """Construye el HTML para notificación de pago"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                                        SPORTSWEAR
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <div style="text-align: center; margin-bottom: 24px;">
                                        <div style="display: inline-block; background-color: #d4f4dd; color: #0d9488; padding: 12px 24px; border-radius: 8px; font-size: 18px; font-weight: 600;">
                                            ✓ Pago Recibido
                                        </div>
                                    </div>
                                    
                                    <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center;">
                                        ¡Gracias por tu pago!
                                    </h2>
                                    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; line-height: 1.5; text-align: center;">
                                        Hemos recibido tu cuota #{payment.payment_number} correctamente.
                                    </p>
                                    
                                    <!-- Payment Details -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                                        <tr>
                                            <td style="padding: 16px; background-color: #f9fafb; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Orden
                                            </td>
                                            <td style="padding: 16px; background-color: #f9fafb; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                #{payment.order.id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Monto Pagado
                                            </td>
                                            <td style="padding: 16px; font-size: 16px; font-weight: 700; color: #0d9488; text-align: right;">
                                                Bs. {payment.amount:.2f}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Fecha de Pago
                                            </td>
                                            <td style="padding: 16px; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                {payment.payment_date.strftime('%d/%m/%Y %H:%M')}
                                            </td>
                                        </tr>
                                        <tr style="border-top: 2px solid #e5e7eb;">
                                            <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Total Orden
                                            </td>
                                            <td style="padding: 16px; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                Bs. {payment.order.total:.2f}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Total Pagado
                                            </td>
                                            <td style="padding: 16px; font-size: 14px; color: #0d9488; text-align: right;">
                                                Bs. {payment.order.paid_amount:.2f}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 16px; font-size: 16px; font-weight: 700; color: #1a1a1a;">
                                                Saldo Pendiente
                                            </td>
                                            <td style="padding: 16px; font-size: 18px; font-weight: 700; color: {'#dc2626' if payment.order.remaining_balance > 0 else '#0d9488'}; text-align: right;">
                                                Bs. {payment.order.remaining_balance:.2f}
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    {f'''
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-top: 24px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                            ⚠️ Recordatorio de Saldo Pendiente
                                        </p>
                                        <p style="margin: 8px 0 0; color: #92400e; font-size: 14px;">
                                            Aún tienes un saldo pendiente de <strong>Bs. {payment.order.remaining_balance:.2f}</strong>. 
                                            No olvides realizar tu próximo pago.
                                        </p>
                                    </div>
                                    ''' if payment.order.remaining_balance > 0 else f'''
                                    <div style="background-color: #d4f4dd; border-left: 4px solid #0d9488; padding: 16px; border-radius: 8px; margin-top: 24px;">
                                        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                                            ✓ Orden Completamente Pagada
                                        </p>
                                        <p style="margin: 8px 0 0; color: #065f46; font-size: 14px;">
                                            ¡Felicitaciones! Has completado el pago de tu orden.
                                        </p>
                                    </div>
                                    '''}
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                        © 2025 SPORTSWEAR. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    def _build_low_stock_alert_html(self, product):
        """Construye el HTML para alerta de stock bajo"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #dc2626; padding: 32px 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                        ⚠️ ALERTA DE STOCK
                                    </h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                        Stock Bajo Detectado
                                    </h2>
                                    <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                        El siguiente producto tiene un stock bajo y necesita ser reabastecido pronto:
                                    </p>
                                    
                                    <!-- Product Details -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 2px solid #fecaca; border-radius: 8px; overflow: hidden;">
                                        <tr style="background-color: #fef2f2;">
                                            <td colspan="2" style="padding: 16px;">
                                                <h3 style="margin: 0; color: #dc2626; font-size: 18px; font-weight: 600;">
                                                    {product.name}
                                                </h3>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Stock Actual
                                            </td>
                                            <td style="padding: 12px 16px; font-size: 20px; font-weight: 700; color: #dc2626; text-align: right;">
                                                {product.stock} unidades
                                            </td>
                                        </tr>
                                        <tr style="background-color: #f9fafb;">
                                            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                SKU
                                            </td>
                                            <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                {product.sku or 'N/A'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Categoría
                                            </td>
                                            <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                {product.category.name if product.category else 'Sin categoría'}
                                            </td>
                                        </tr>
                                        <tr style="background-color: #f9fafb;">
                                            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                Precio
                                            </td>
                                            <td style="padding: 12px 16px; font-size: 14px; color: #1a1a1a; text-align: right;">
                                                Bs. {product.price:.2f}
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-top: 24px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                            💡 Recomendación
                                        </p>
                                        <p style="margin: 8px 0 0; color: #92400e; font-size: 14px;">
                                            Considera reabastecer este producto lo antes posible para evitar quedarte sin stock.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                        © 2025 SPORTSWEAR. Sistema de Alertas Automáticas.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    def _build_daily_report_html(self, report_data, date):
        """Construye el HTML para reporte diario"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 32px 40px; text-align: center;">
                                    <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">
                                        📊 REPORTE DIARIO
                                    </h1>
                                    <p style="margin: 0; color: #9ca3af; font-size: 16px;">
                                        {date.strftime('%A, %d de %B de %Y')}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 24px; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                                        Resumen de Ventas
                                    </h2>
                                    
                                    <!-- Summary Cards -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                                        <tr>
                                            <td style="width: 48%; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                                                <div style="color: #15803d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                                    TOTAL VENDIDO
                                                </div>
                                                <div style="color: #15803d; font-size: 32px; font-weight: 700;">
                                                    Bs. {report_data.get('total_sales', 0):.2f}
                                                </div>
                                            </td>
                                            <td style="width: 4%;"></td>
                                            <td style="width: 48%; padding: 20px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                                                <div style="color: #1e40af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                                    ÓRDENES
                                                </div>
                                                <div style="color: #1e40af; font-size: 32px; font-weight: 700;">
                                                    {report_data.get('total_orders', 0)}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                                        <tr>
                                            <td style="width: 48%; padding: 20px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
                                                <div style="color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                                    TICKET PROMEDIO
                                                </div>
                                                <div style="color: #92400e; font-size: 28px; font-weight: 700;">
                                                    Bs. {report_data.get('avg_ticket', 0):.2f}
                                                </div>
                                            </td>
                                            <td style="width: 4%;"></td>
                                            <td style="width: 48%; padding: 20px; background-color: #fce7f3; border-radius: 8px; border: 1px solid #fbcfe8;">
                                                <div style="color: #9f1239; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                                    NUEVOS CLIENTES
                                                </div>
                                                <div style="color: #9f1239; font-size: 28px; font-weight: 700;">
                                                    {report_data.get('new_customers', 0)}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Payment Methods -->
                                    <h3 style="margin: 32px 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                        Por Método de Pago
                                    </h3>
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                        <thead>
                                            <tr style="background-color: #f9fafb;">
                                                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Método
                                                </th>
                                                <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Monto
                                                </th>
                                                <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Órdenes
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {self._build_payment_methods_rows(report_data.get('by_payment_method', {}))}
                                        </tbody>
                                    </table>
                                    
                                    <!-- Top Products -->
                                    <h3 style="margin: 32px 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                        Productos Más Vendidos
                                    </h3>
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                        <thead>
                                            <tr style="background-color: #f9fafb;">
                                                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Producto
                                                </th>
                                                <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Vendidos
                                                </th>
                                                <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #6b7280;">
                                                    Ingresos
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {self._build_top_products_rows(report_data.get('top_products', []))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                        © 2025 SPORTSWEAR. Reporte Automático Diario.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    def _build_payment_methods_rows(self, payment_methods):
        """Construye las filas para los métodos de pago"""
        if not payment_methods:
            return """
            <tr>
                <td colspan="3" style="padding: 16px; text-align: center; color: #6b7280; font-size: 14px;">
                    No hay datos disponibles
                </td>
            </tr>
            """
        
        rows = ""
        for method, data in payment_methods.items():
            rows += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a;">
                    {method}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a; text-align: right; font-weight: 600;">
                    Bs. {data.get('total', 0):.2f}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
                    {data.get('count', 0)}
                </td>
            </tr>
            """
        return rows
    
    def _build_top_products_rows(self, top_products):
        """Construye las filas para los productos más vendidos"""
        if not top_products:
            return """
            <tr>
                <td colspan="3" style="padding: 16px; text-align: center; color: #6b7280; font-size: 14px;">
                    No hay datos disponibles
                </td>
            </tr>
            """
        
        rows = ""
        for product in top_products[:5]:  # Top 5
            rows += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a;">
                    {product.get('name', 'N/A')}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a; text-align: center; font-weight: 600;">
                    {product.get('quantity', 0)}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1a1a1a; text-align: right; font-weight: 600;">
                    Bs. {product.get('revenue', 0):.2f}
                </td>
            </tr>
            """
        return rows


# Singleton instance
email_service = EmailService()
