from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('', views.profile, name='profile'),
    path('test/', views.profile, name='profile-test'),
]
