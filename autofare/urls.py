
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to AutoFare")

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('trips/', include('trips.urls')),
    path('payment/', include('payment.urls')),
    path('ai/', include('ai.urls')),
    path('vehicles/', include('vehicles.urls')),
    path('violations/', include('violations.urls')),
    path('notifications/', include('notifications.urls')),
    path('adminelweb/', include('Adminelweb.urls')),
]
