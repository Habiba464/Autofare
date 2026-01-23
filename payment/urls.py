from django.urls import path
from django.http import HttpResponse

def payment_home(request):
    return HttpResponse("Payment Home")

urlpatterns = [
    path('', payment_home, name='payment-home'),
]
