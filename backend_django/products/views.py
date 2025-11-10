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
    SupplierSerializer
)


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
 
