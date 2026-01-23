from django.urls import path
from django.http import HttpResponse

def vehicles_home(request):
    return HttpResponse("Vehicles Home")

urlpatterns = [
    path('', vehicles_home, name='vehicles-home'),
]
