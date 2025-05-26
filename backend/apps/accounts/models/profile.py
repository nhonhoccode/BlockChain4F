from django.db import models
from django.utils.translation import gettext_lazy as _


class Profile(models.Model):
    """
    Profile model for storing additional user information
    """
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='profile')
    
    # Personal information
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    
    # Address information
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    ward = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    
    # Identification
    id_card_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    id_card_issue_date = models.DateField(blank=True, null=True)
    id_card_issue_place = models.CharField(max_length=100, blank=True, null=True)
    
    # Additional contact
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    # Profile picture
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    # OAuth information
    oauth_provider = models.CharField(max_length=50, blank=True, null=True)
    oauth_uid = models.CharField(max_length=255, blank=True, null=True)
    oauth_data = models.JSONField(blank=True, null=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        ordering = ['user__email']
