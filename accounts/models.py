from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile model"""
    
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('OFFICIAL', 'Commune Official'),
        ('CHAIRMAN', 'Commune Chairman'),
        ('ORGANIZATION', 'Organization/Enterprise'),
    ]
    
    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    AUTHORITY_LEVEL_CHOICES = [
        ('LOW', 'Low - Basic document processing'),
        ('MEDIUM', 'Medium - Document verification and approval'),
        ('HIGH', 'High - Full administrative authority'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_profiles')
    approval_date = models.DateTimeField(null=True, blank=True)
    
    # Personal information
    citizen_id = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # For organizations
    organization_name = models.CharField(max_length=100, blank=True, null=True)
    business_license = models.CharField(max_length=50, blank=True, null=True)
    
    # For blockchain integration
    ethereum_address = models.CharField(max_length=42, blank=True, null=True)
    
    # Authority delegation
    authority_level = models.CharField(max_length=20, choices=AUTHORITY_LEVEL_CHOICES, default='LOW')
    delegated_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='delegated_profiles')
    delegation_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_masked_citizen_id(self):
        """Return the masked version of the citizen ID."""
        if self.citizen_id and len(self.citizen_id) > 3:
            return '*' * (len(self.citizen_id) - 3) + self.citizen_id[-3:]
        return self.citizen_id
    
    def get_masked_phone(self):
        """Return the masked version of the phone number."""
        if self.phone_number and len(self.phone_number) > 3:
            return '*' * (len(self.phone_number) - 3) + self.phone_number[-3:]
        return self.phone_number
    
    def is_official(self):
        """Check if user is a commune official."""
        return self.role == 'OFFICIAL'
    
    def is_chairman(self):
        """Check if user is a commune chairman."""
        return self.role == 'CHAIRMAN'
    
    def is_organization(self):
        """Check if user is an organization/enterprise."""
        return self.role == 'ORGANIZATION'
    
    def is_pending_approval(self):
        """Check if user is pending approval."""
        return self.role == 'OFFICIAL' and self.approval_status == 'PENDING'
    
    def has_authority(self, required_level):
        """Check if user has the required authority level."""
        if not self.is_official() or self.approval_status != 'APPROVED':
            return False
        
        authority_levels = {
            'LOW': 0,
            'MEDIUM': 1,
            'HIGH': 2
        }
        
        user_level = authority_levels.get(self.authority_level, -1)
        required_level = authority_levels.get(required_level, -1)
        
        return user_level >= required_level
    
    def __str__(self):
        if self.role == 'ORGANIZATION' and self.organization_name:
            return f"{self.organization_name} ({self.user.username})"
        return f"{self.user.username} - {self.get_role_display()}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile for every new User."""
    if created:
        # Set superusers and staff users as chairmen
        if instance.is_superuser or instance.is_staff:
            UserProfile.objects.create(
                user=instance,
                role='CHAIRMAN',
                approval_status='APPROVED'
            )
        else:
            UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when the User is saved."""
    # Check if profile exists, create if it doesn't
    try:
        # Update role to CHAIRMAN if user becomes a superuser or staff
        if instance.is_superuser or instance.is_staff:
            if instance.profile.role != 'CHAIRMAN':
                instance.profile.role = 'CHAIRMAN'
                
        instance.profile.save()
    except UserProfile.DoesNotExist:
        # Create profile with appropriate role
        if instance.is_superuser or instance.is_staff:
            UserProfile.objects.create(
                user=instance,
                role='CHAIRMAN',
                approval_status='APPROVED'
            )
        else:
            UserProfile.objects.create(user=instance) 