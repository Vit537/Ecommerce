from rest_framework.routers import DefaultRouter

from .api import ReportExecutionViewSet, ReportTemplateViewSet
from .views import AvailableReportModelViewSet, UserSavedReportViewSet, AIReportViewSet

router = DefaultRouter()
router.register('templates', ReportTemplateViewSet, basename='report-templates')
router.register('executions', ReportExecutionViewSet, basename='report-executions')
router.register('models', AvailableReportModelViewSet, basename='report-models')
router.register('saved', UserSavedReportViewSet, basename='saved-reports')
router.register('ai', AIReportViewSet, basename='ai-reports')

urlpatterns = router.urls
