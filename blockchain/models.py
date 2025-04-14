from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import hashlib
import json
import re
import os
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal


def get_document_upload_path(instance, filename):
    """Generate a unique path for uploaded documents."""
    # Create path like: documents/request_123/citizen/filename.pdf
    folder = 'citizen' if instance.uploaded_by == instance.request.user else 'officer'
    return f'documents/request_{instance.request.id}/{folder}/{filename}'


class RequestCategory(models.Model):
    """Model for administrative request categories"""
    
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    
    # For assigning officials to specific categories
    assigned_officials = models.ManyToManyField(
        User, 
        related_name='assigned_categories',
        blank=True,
        limit_choices_to={'profile__role': 'OFFICIAL', 'profile__approval_status': 'APPROVED'}
    )
    
    # For form processing rules
    required_fields = models.JSONField(default=dict, blank=True, help_text="JSON defining required fields for this category")
    form_template = models.JSONField(default=dict, blank=True, help_text="JSON template for form structure")
    
    # For blockchain tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Request Category"
        verbose_name_plural = "Request Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class AdministrativeRequest(models.Model):
    """Model for administrative requests from citizens"""
    
    # Request choices
    REQUEST_TYPE_CHOICES = [
        ('BIRTH_CERT', 'Birth Certificate'),
        ('RESIDENCE_CERT', 'Residence Certificate'),
        ('MARRIAGE_CERT', 'Marriage Certificate'),
        ('BUS_PERMIT', 'Business Permit'),
        ('LAND_TITLE', 'Land Title'),
        ('OTHER', 'Other'),
    ]
    
    # Status choices
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('ADDITIONAL_INFO', 'Additional Information Needed'),
        ('APPROVED', 'Approved'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    ]
    
    # User who submitted this request
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='administrative_requests')
    
    # Request details
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    category = models.ForeignKey(RequestCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    description = models.TextField()
    
    # Additional form data storage
    form_data = models.JSONField(default=dict, blank=True, help_text="JSON data storing form fields specific to this request type")
    
    # Applicant information
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    
    # Payment information
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    payment_status = models.CharField(max_length=10, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
    ])
    
    # Status info
    status = models.CharField(max_length=20, default='PENDING', choices=STATUS_CHOICES)
    
    # Assignment information
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_by_requests')
    assignment_date = models.DateTimeField(null=True, blank=True)
    
    # Blockchain information
    user_hash = models.CharField(max_length=66, unique=True)
    tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Deadline information
    estimated_completion_date = models.DateField(null=True, blank=True)
    pickup_date = models.DateField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.user_hash:
            # Create a hash of user information for blockchain
            user_info = f"{self.full_name}{self.phone_number}{self.address}"
            self.user_hash = hashlib.sha256(user_info.encode()).hexdigest()
        super().save(*args, **kwargs)
    
    def get_masked_name(self):
        """Return the masked version of the user's name."""
        parts = self.full_name.split()
        if len(parts) >= 2:
            return f"{parts[0]} {'*' * len(parts[1])}"
        return self.full_name
    
    def get_masked_phone(self):
        """Return the masked version of the phone number."""
        if len(self.phone_number) > 3:
            return '*' * (len(self.phone_number) - 3) + self.phone_number[-3:]
        return self.phone_number
    
    def get_masked_address(self):
        """Return the masked version of the address."""
        parts = self.address.split(',')
        if len(parts) > 1:
            return parts[0] + ',' + '*' * len(parts[1])
        return self.address
    
    def __str__(self):
        return f"{self.get_request_type_display()} - {self.get_masked_name()}"


class RequestStatusUpdate(models.Model):
    """Model for tracking status updates."""
    
    request = models.ForeignKey(AdministrativeRequest, on_delete=models.CASCADE, related_name='status_updates')
    old_status = models.CharField(max_length=20, choices=AdministrativeRequest.STATUS_CHOICES)
    new_status = models.CharField(max_length=20, choices=AdministrativeRequest.STATUS_CHOICES)
    comments = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    tx_hash = models.CharField(max_length=66, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.request} - {self.old_status} to {self.new_status}"


class RequestDocument(models.Model):
    """Model for storing documents related to administrative requests."""
    
    DOCUMENT_TYPE_CHOICES = [
        ('SUBMISSION', 'Initial Submission'),
        ('SUPPORTING_DOC', 'Supporting Document'),
        ('ADDITIONAL_INFO', 'Additional Information'),
        ('OFFICIAL_RESPONSE', 'Official Response'),
        ('CERTIFICATE', 'Certificate'),
        ('PERMIT', 'Permit'),
        ('OTHER', 'Other Document'),
    ]
    
    request = models.ForeignKey(AdministrativeRequest, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to=get_document_upload_path)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    is_public = models.BooleanField(default=True, help_text="If checked, the document is visible to all parties involved with this request")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def filename(self):
        return os.path.basename(self.file.name)
    
    def is_citizen_document(self):
        return self.uploaded_by == self.request.user
    
    def __str__(self):
        return f"{self.title} - {self.request}"


class DocumentRequest(models.Model):
    """Model for requesting additional documents from citizens."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('FULFILLED', 'Fulfilled'),
        ('EXPIRED', 'Expired'),
    ]
    
    request = models.ForeignKey(AdministrativeRequest, on_delete=models.CASCADE, related_name='document_requests')
    title = models.CharField(max_length=255)
    description = models.TextField()
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_documents')
    status = models.CharField(max_length=10, default='PENDING', choices=STATUS_CHOICES)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.request}" 