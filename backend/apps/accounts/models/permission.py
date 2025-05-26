from django.db import models


class CustomPermission(models.Model):
    """
    Custom permission model for fine-grained access control
    """
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Permission grouping
    module = models.CharField(max_length=50, blank=True, null=True)
    
    # Related role (can be assigned to multiple roles)
    roles = models.ManyToManyField('accounts.Role', related_name='permissions', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Custom Permission'
        verbose_name_plural = 'Custom Permissions'
        ordering = ['module', 'name']
        unique_together = ('name', 'module')
