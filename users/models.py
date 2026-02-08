from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(unique=True, null=True, blank=True)
    national_id = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    wallet_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
class Transaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=100, unique=True)
    transaction_type = models.CharField(max_length=50) 
    visa_type = models.CharField(max_length=50, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)