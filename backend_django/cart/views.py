from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, CartItemCreateUpdateSerializer
from products.models import ProductVariant


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """
        Obtener o crear el carrito del usuario
        """
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Agregar un item al carrito
        Payload: { "product_variant": "uuid", "quantity": 1 }
        """
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        product_variant_id = request.data.get('product_variant')
        quantity = int(request.data.get('quantity', 1))
        
        if not product_variant_id:
            return Response(
                {'error': 'Se requiere product_variant'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variant = ProductVariant.objects.get(id=product_variant_id, is_active=True)
        except ProductVariant.DoesNotExist:
            return Response(
                {'error': 'Variante de producto no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar stock disponible
        if variant.available_stock < quantity:
            return Response(
                {
                    'error': 'Stock insuficiente',
                    'available_stock': variant.available_stock
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Buscar si ya existe este item en el carrito
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product_variant=variant,
                defaults={
                    'product': variant.product,
                    'quantity': quantity,
                    'unit_price': variant.final_price
                }
            )
            
            if not created:
                # Si ya existe, actualizar cantidad
                new_quantity = cart_item.quantity + quantity
                
                if variant.available_stock < new_quantity:
                    return Response(
                        {
                            'error': 'Stock insuficiente para la cantidad solicitada',
                            'current_in_cart': cart_item.quantity,
                            'available_stock': variant.available_stock
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                cart_item.quantity = new_quantity
                cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """
        Actualizar cantidad de un item
        Payload: { "item_id": "uuid", "quantity": 2 }
        """
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        
        if quantity < 1:
            return Response(
                {'error': 'La cantidad debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar stock
        if cart_item.product_variant.available_stock < quantity:
            return Response(
                {
                    'error': 'Stock insuficiente',
                    'available_stock': cart_item.product_variant.available_stock
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """
        Eliminar un item del carrito
        Payload: { "item_id": "uuid" }
        """
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """
        Vaciar el carrito
        """
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response(
                {'message': 'Carrito vaciado correctamente'},
                status=status.HTTP_200_OK
            )
        except Cart.DoesNotExist:
            return Response(
                {'message': 'No hay carrito para vaciar'},
                status=status.HTTP_404_NOT_FOUND
            )


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)
