from django.urls import path
from . import views

urlpatterns = [
    path('', views.attendance_dashboard, name='attendance'),
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('leave/', views.apply_leave, name='leave'),
    path('wfh/', views.apply_wfh, name='wfh'),
]