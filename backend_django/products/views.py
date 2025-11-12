from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.db.models.functions import Coalesce

from .models import Product, Category, Brand, ProductVariant, Supplier
from .serializers import (
    ProductSerializer, 
    CategorySerializer, 
    BrandSerializer, 
    ProductVariantSerializer,
    SupplierSerializer,
    ProductCreateUpdateSerializer
)
from .utils import process_product_images, delete_product_image


class ProductViewSet(viewsets.ModelViewSet):
    """
    Product endpoint with server-side filtering, searching and ordering.
    
    Permissions:
      - GET (list, retrieve): Public access - anyone can view products
      - POST, PUT, PATCH, DELETE: Requires authentication (admin/staff only)

    Supported query params:
      - search: full text search on name, description, sku, brand name, category name
      - category: category id (UUID) to filter by category (includes exact match)
      - brand: brand id (UUID)
      - ordering: e.g. ordering=price or ordering=-created_at
      - stock_status: 'low' (some variant stock >0 and <10) or 'out' (all variants stock == 0)
      - page, page_size handled by DRF pagination
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Permite lectura pública
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'status']
    search_fields = ['name', 'description', 'sku', 'brand__name', 'category__name']
    ordering_fields = ['price', 'created_at']

    def get_serializer_class(self):
        """Usar serializer diferente para crear/actualizar"""
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().prefetch_related('variants')
        # Annotate total stock across variants to support stock-based filters
        queryset = queryset.annotate(annotated_total_stock=Coalesce(Sum('variants__stock_quantity'), 0))

        # Filter by category id (exact)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__id=category)

        # Filter by brand id
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(brand__id=brand)

        # Stock status filter
        stock_status = self.request.query_params.get('stock_status', None)
        if stock_status == 'low':
            # any variant has stock >0 and <10
            queryset = queryset.filter(variants__stock_quantity__gt=0, variants__stock_quantity__lt=10).distinct()
        elif stock_status == 'out':
            # annotated_total_stock == 0
            queryset = queryset.filter(annotated_total_stock=0)

        return queryset

    def create(self, request, *args, **kwargs):
        """Crear producto con manejo de imágenes"""
        try:
            # Extraer imágenes del request
            image_files = request.FILES.getlist('images')
            
            # Crear el producto
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Procesar imágenes si existen
            if image_files:
                product_name = serializer.validated_data.get('name', 'product')
                image_urls = process_product_images(image_files, product_name)
                serializer.validated_data['images'] = image_urls
            
            # Guardar producto
            if request.user.is_authenticated:
                serializer.validated_data['created_by'] = request.user
            
            self.perform_create(serializer)
            
            # Retornar con serializer de lectura
            headers = self.get_success_headers(serializer.data)
            product = Product.objects.get(pk=serializer.data['id'])
            return_serializer = ProductSerializer(product, context={'request': request})
            
            return Response(return_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        except Exception as e:
            return Response(
                {'error': f'Error al crear producto: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Actualizar producto con manejo de imágenes"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Extraer imágenes del request
            image_files = request.FILES.getlist('images')
            
            # Actualizar datos del producto
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            # Procesar nuevas imágenes si existen
            if image_files:
                product_name = serializer.validated_data.get('name', instance.name)
                # Eliminar imágenes antiguas y procesar nuevas
                existing_images = instance.images if isinstance(instance.images, list) else []
                image_urls = process_product_images(image_files, product_name, existing_images)
                serializer.validated_data['images'] = image_urls
            
            self.perform_update(serializer)
            
            # Retornar con serializer de lectura
            product = Product.objects.get(pk=instance.pk)
            return_serializer = ProductSerializer(product, context={'request': request})
            
            return Response(return_serializer.data)
        
        except Exception as e:
            return Response(
                {'error': f'Error al actualizar producto: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """Eliminar producto y sus imágenes"""
        try:
            instance = self.get_object()
            
            # Eliminar imágenes asociadas
            if instance.images and isinstance(instance.images, list):
                for image_url in instance.images:
                    delete_product_image(image_url)
            
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        except Exception as e:
            return Response(
                {'error': f'Error al eliminar producto: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )



class CategoryViewSet(viewsets.ModelViewSet):
    """
    Category endpoint - Public read access for customers to browse categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Permite lectura pública


class BrandViewSet(viewsets.ModelViewSet):
    """
    Brand endpoint - Public read access for customers to filter by brand
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Permite lectura pública


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    Product Variant endpoint - Public read access for customers to see available variants
    """
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Permite lectura pública


class SupplierViewSet(viewsets.ModelViewSet):
    """
    Supplier endpoint - Requires authentication (admin/staff only)
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]  # Solo admin/staff
 
