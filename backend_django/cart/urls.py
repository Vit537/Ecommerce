from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.CartViewSet, basename='cart')
router.register(r'items', views.CartItemViewSet, basename='cart-items')

urlpatterns = [
    path('', include(router.urls)),
]

