"""
Servicio de integración con Stripe para procesamiento de pagos
"""
import stripe
from django.conf import settings
from decimal import Decimal
from typing import Dict, Any

# Configurar Stripe con la clave secreta
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """
    Servicio para manejar operaciones con Stripe
    """
    
    @staticmethod
    def create_payment_intent(amount: Decimal, currency: str = 'usd', metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Crear un Payment Intent en Stripe
        
        Args:
            amount: Monto en la moneda especificada (se convertirá a centavos)
            currency: Moneda del pago (default: 'usd')
            metadata: Información adicional para adjuntar al payment intent
            
        Returns:
            Dict con la información del Payment Intent creado
        """
        try:
            # Stripe espera el monto en centavos
            amount_cents = int(amount * 100)
            
            # Crear el Payment Intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return {
                'id': intent.id,
                'client_secret': intent.client_secret,
                'status': intent.status,
                'amount': amount,
                'currency': currency,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error al crear Payment Intent: {str(e)}")
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Recuperar información de un Payment Intent
        
        Args:
            payment_intent_id: ID del Payment Intent
            
        Returns:
            Dict con la información del Payment Intent
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'id': intent.id,
                'status': intent.status,
                'amount': Decimal(intent.amount) / 100,
                'currency': intent.currency,
                'metadata': intent.metadata,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error al recuperar Payment Intent: {str(e)}")
    
    @staticmethod
    def confirm_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Confirmar un Payment Intent
        
        Args:
            payment_intent_id: ID del Payment Intent
            
        Returns:
            Dict con la información actualizada
        """
        try:
            intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return {
                'id': intent.id,
                'status': intent.status,
                'amount': Decimal(intent.amount) / 100,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error al confirmar Payment Intent: {str(e)}")
    
    @staticmethod
    def cancel_payment_intent(payment_intent_id: str) -> Dict[str, Any]:
        """
        Cancelar un Payment Intent
        
        Args:
            payment_intent_id: ID del Payment Intent
            
        Returns:
            Dict con la información actualizada
        """
        try:
            intent = stripe.PaymentIntent.cancel(payment_intent_id)
            return {
                'id': intent.id,
                'status': intent.status,
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Error al cancelar Payment Intent: {str(e)}")
    
    @staticmethod
    def construct_webhook_event(payload: bytes, sig_header: str) -> Any:
        """
        Construir y verificar un evento de webhook de Stripe
        
        Args:
            payload: Cuerpo de la petición del webhook
            sig_header: Header de firma de Stripe
            
        Returns:
            Evento de Stripe verificado
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError:
            raise Exception("Payload inválido")
        except stripe.error.SignatureVerificationError:
            raise Exception("Firma inválida del webhook")


# Instancia del servicio
stripe_service = StripeService()
