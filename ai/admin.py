from django.contrib import admin
from .models import AIModelLog, Violation

# Register your models here.
admin.site.register(AIModelLog)
admin.site.register(Violation)
