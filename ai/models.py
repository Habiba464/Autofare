from django.db import models

class AIModelLog(models.Model):
    detection_id = models.AutoField(primary_key=True)
    trip = models.ForeignKey('toll.Trip', on_delete=models.CASCADE, related_name='ai_detections')
    plate_number = models.CharField(max_length=20)
    vehicle_type = models.CharField(max_length=50)

class Violation(models.Model):
    violation_no = models.AutoField(primary_key=True)
    trip = models.ForeignKey('toll.Trip', on_delete=models.CASCADE, related_name='violations')
    vehicle_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    current_violation_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Logic: 10% increase logic would be a method here or in a Celery task