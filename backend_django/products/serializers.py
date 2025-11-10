from rest_framework import serializers
from .models import Product, Category, Brand, Size, Color, ProductVariant, Supplier


class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    
    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {
            'image_url': {'required': False},
            'description': {'required': False},
            'season': {'required': False},
            'target_gender': {'required': False},
            'parent': {'required': False},
        }
    
    def create(self, validated_data):
        # Auto-generate slug if not provided
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['name'])
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Update slug if name changed
        if 'name' in validated_data and not validated_data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(validated_data['name'])
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        
        return super().update(instance, validated_data)


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'


class ProductVariantSerializer(serializers.ModelSerializer):
    size = SizeSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    available_stock = serializers.ReadOnlyField()
    final_price = serializers.ReadOnlyField()
    needs_restock = serializers.ReadOnlyField()
    
    class Meta:
        model = ProductVariant
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    colors = ColorSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    total_stock = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar productos
    """
    # Hacer campos opcionales para flexibilidad
    sku = serializers.CharField(required=False, allow_blank=True)
    images = serializers.ListField(required=False, allow_empty=True)
    dimensions = serializers.DictField(required=False, allow_empty=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'required': False},
            'meta_title': {'required': False},
            'meta_description': {'required': False},
            'material': {'required': False},
            'care_instructions': {'required': False},
            'weight': {'required': False},
            'cost_price': {'required': False},
            'compare_at_price': {'required': False},
            'barcode': {'required': False},
            'season': {'required': False},
        }
    
    def create(self, validated_data):
        # Manejar sizes y colors como ManyToMany
        sizes_data = validated_data.pop('sizes', [])
        colors_data = validated_data.pop('colors', [])
        
        # Si no hay SKU, se generará automáticamente en el modelo
        if not validated_data.get('sku'):
            validated_data.pop('sku', None)
        
        # Asignar usuario si está disponible
        if self.context.get('request'):
            validated_data['created_by'] = self.context['request'].user
        
        product = Product.objects.create(**validated_data)
        
        if sizes_data:
            product.sizes.set(sizes_data)
        if colors_data:
            product.colors.set(colors_data)
            
        return product
    
    def update(self, instance, validated_data):
        # Manejar sizes y colors como ManyToMany
        sizes_data = validated_data.pop('sizes', None)
        colors_data = validated_data.pop('colors', None)
        
        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar relaciones ManyToMany
        if sizes_data is not None:
            instance.sizes.set(sizes_data)
        if colors_data is not None:
            instance.colors.set(colors_data)
            
        return instance


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'