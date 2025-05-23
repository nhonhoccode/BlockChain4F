from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid
import os

from apps.accounts.models import User

def document_file_path(instance, filename):
    """Generate filepath for document files"""
    # Get file extension
    ext = filename.split('.')[-1]
    # Create a unique filename with original extension
    filename = f"{instance.document_id.replace('/', '-')}.{ext}"
    # Return path with user folder
    if instance.citizen:
        return os.path.join('documents', str(instance.citizen.id), filename)
    else:
        return os.path.join('documents', 'unassigned', filename)

class Document(models.Model):
    """
    Model for official documents issued to citizens
    """
    DOCUMENT_STATUS_CHOICES = (
        ('draft', _('Bản nháp')),
        ('active', _('Đang hiệu lực')),
        ('revoked', _('Đã thu hồi')),
        ('expired', _('Hết hạn')),
    )
    
    DOCUMENT_TYPE_CHOICES = (
        ('birth_certificate', _('Giấy khai sinh')),
        ('id_card', _('Chứng minh nhân dân')),
        ('residence_certificate', _('Đăng ký thường trú')),
        ('marriage_certificate', _('Giấy đăng ký kết hôn')),
        ('temporary_residence', _('Xác nhận tạm trú')),
        ('death_certificate', _('Giấy chứng tử')),
        ('other', _('Khác')),
    )
    
    # Document identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_id = models.CharField(_('Mã giấy tờ'), max_length=50, unique=True)
    document_type = models.CharField(
        _('Loại giấy tờ'), 
        max_length=50, 
        choices=DOCUMENT_TYPE_CHOICES
    )
    title = models.CharField(_('Tiêu đề'), max_length=255)
    
    # Content and metadata
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    content = models.JSONField(_('Nội dung chi tiết'), default=dict, blank=True)
    file = models.FileField(
        _('Tệp đính kèm'), 
        upload_to=document_file_path, 
        blank=True, 
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('Ngày tạo'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Ngày cập nhật'), auto_now=True)
    issue_date = models.DateField(_('Ngày cấp'), null=True, blank=True)
    valid_from = models.DateField(_('Có hiệu lực từ'), default=timezone.now)
    valid_until = models.DateField(_('Có hiệu lực đến'), blank=True, null=True)
    
    # Status
    status = models.CharField(
        _('Trạng thái'),
        max_length=20,
        choices=DOCUMENT_STATUS_CHOICES,
        default='draft'
    )
    
    # Relations
    citizen = models.ForeignKey(
        User,
        related_name='admin_documents',
        on_delete=models.CASCADE,
        verbose_name=_('Công dân'),
        null=True,
        blank=True
    )
    issued_by = models.ForeignKey(
        User,
        related_name='issued_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Cán bộ cấp')
    )
    
    # Approval information
    requires_chairman_approval = models.BooleanField(_('Yêu cầu phê duyệt chủ tịch'), default=False)
    chairman_approved = models.BooleanField(_('Đã được phê duyệt'), default=False)
    chairman_approved_by = models.ForeignKey(
        User,
        related_name='admin_approved_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Chủ tịch phê duyệt')
    )
    chairman_approval_date = models.DateTimeField(_('Ngày phê duyệt'), blank=True, null=True)
    
    # Revocation information
    revocation_reason = models.TextField(_('Lý do thu hồi'), blank=True, null=True)
    revocation_date = models.DateTimeField(_('Ngày thu hồi'), blank=True, null=True)
    revoked_by = models.ForeignKey(
        User,
        related_name='revoked_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Người thu hồi')
    )
    
    # Blockchain tracking
    blockchain_status = models.BooleanField(_('Đã lưu blockchain'), default=False)
    blockchain_tx_id = models.CharField(_('Mã giao dịch blockchain'), max_length=100, blank=True, null=True)
    blockchain_timestamp = models.DateTimeField(_('Thời gian lưu blockchain'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('Giấy tờ')
        verbose_name_plural = _('Giấy tờ')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_id']),
            models.Index(fields=['document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['citizen']),
            models.Index(fields=['blockchain_status']),
        ]
    
    def __str__(self):
        return f"{self.document_id} - {self.title}"
    
    def is_valid(self):
        """Check if document is currently valid"""
        if self.status != 'active':
            return False
            
        today = timezone.now().date()
        
        # Check if document is in valid date range
        if self.valid_from and self.valid_from > today:
            return False
            
        if self.valid_until and self.valid_until < today:
            return False
            
        return True
    
    def days_until_expiry(self):
        """Calculate days until expiry"""
        if not self.valid_until:
            return None
            
        today = timezone.now().date()
        delta = self.valid_until - today
        
        return delta.days
    
    def approve_by_chairman(self, chairman, save=True):
        """Approve document by chairman"""
        self.chairman_approved = True
        self.chairman_approved_by = chairman
        self.chairman_approval_date = timezone.now()
        
        if self.status == 'draft':
            self.status = 'active'
            
        if save:
            self.save()
            
        return self
    
    def revoke(self, officer, reason, save=True):
        """Revoke the document"""
        self.status = 'revoked'
        self.revocation_reason = reason
        self.revocation_date = timezone.now()
        self.revoked_by = officer
        
        if save:
            self.save()
            
        return self
    
    def activate(self, save=True):
        """Activate the document"""
        self.status = 'active'
        
        if save:
            self.save()
            
        return self
    
    def add_blockchain_record(self, tx_id, save=True):
        """Add blockchain transaction record"""
        self.blockchain_status = True
        self.blockchain_tx_id = tx_id
        self.blockchain_timestamp = timezone.now()
        
        if save:
            self.save()
            
        return self
