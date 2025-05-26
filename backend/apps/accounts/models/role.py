from django.db import models


class Role(models.Model):
    """
    Model representing user roles in the system (Chairman, Officer, Citizen)
    """
    CHAIRMAN = 'chairman'
    OFFICER = 'officer'
    CITIZEN = 'citizen'
    OFFICER_PENDING = 'officer_pending'
    
    ROLE_CHOICES = [
        (CHAIRMAN, 'Chairman'),
        (OFFICER, 'Officer'),
        (CITIZEN, 'Citizen'),
        (OFFICER_PENDING, 'Officer Pending'),
    ]
    
    name = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=CITIZEN,
        unique=True
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']
