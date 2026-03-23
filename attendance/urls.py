from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'requests', views.AttendanceRequestViewSet, basename='requests')

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', views.get_csrf_token, name='csrf'),  # ADD THIS LINE
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('me/', views.get_current_user, name='current_user'),
    path('register/', views.user_register, name='register'),
    path('mark-absent/', views.run_daily_absent_marking, name='mark_absent'),
]