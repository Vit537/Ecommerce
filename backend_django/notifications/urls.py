from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationSettingsViewSet,
    NotificationViewSet,
    NotificationTemplateViewSet
)

router = DefaultRouter()
router.register(r'settings', NotificationSettingsViewSet, basename='notification-settings')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'templates', NotificationTemplateViewSet, basename='notification-templates')

urlpatterns = [
    path('', include(router.urls)),
]
