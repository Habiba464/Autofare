from django.urls import path
from django.http import HttpResponse

def ai_home(request):
    return HttpResponse("AI Home")

urlpatterns = [
    path('', ai_home, name='ai-home'),
]
