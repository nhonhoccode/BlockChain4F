from django.db import models
from django.conf import settings
import uuid
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from apps.accounts.models import User
from .document import Document


class AdminRequest(models.Model):
    """
    Model đại diện cho một yêu cầu cấp giấy tờ từ công dân
    """
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('submitted', 'Đã nộp'),
        ('in_review', 'Đang xem xét'),
        ('additional_info_required', 'Yêu cầu bổ sung thông tin'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Từ chối'),
        ('processing', 'Đang xử lý'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Thấp'),
        ('normal', 'Bình thường'),
        ('high', 'Cao'),
        ('urgent', 'Khẩn cấp'),
    ]
    
    # Thông tin cơ bản
    request_id = models.CharField(max_length=50, unique=True, verbose_name="Mã yêu cầu")
    reference_number = models.CharField(max_length=50, unique=True, verbose_name="Số tham chiếu")
    document_type = models.ForeignKey('administrative.DocumentType', on_delete=models.PROTECT, related_name='requests', verbose_name="Loại giấy tờ")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    
    # Thông tin người dùng
    requestor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_requests', verbose_name="Người yêu cầu")
    assigned_officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_admin_requests', verbose_name="Cán bộ xử lý")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_admin_requests', verbose_name="Người phê duyệt")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal', verbose_name="Mức độ ưu tiên")
    
    # Thông tin thời gian
    submitted_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày nộp")
    approved_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày phê duyệt")
    completed_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày hoàn thành")
    due_date = models.DateField(null=True, blank=True, verbose_name="Ngày đến hạn")
    
    # Thông tin ghi chú và phản hồi
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Lý do từ chối")
    additional_info_request = models.TextField(blank=True, null=True, verbose_name="Yêu cầu bổ sung thông tin")
    additional_info_response = models.TextField(blank=True, null=True, verbose_name="Phản hồi bổ sung")
    
    # Dữ liệu bổ sung
    data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu")
    
    # Thông tin blockchain
    is_recorded_blockchain = models.BooleanField(default=False, verbose_name="Đã ghi blockchain")
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    blockchain_status = models.BooleanField(_('Đã lưu blockchain'), default=False)
    blockchain_tx_id = models.CharField(_('Mã giao dịch blockchain'), max_length=100, blank=True, null=True)
    blockchain_timestamp = models.DateTimeField(_('Thời gian lưu blockchain'), blank=True, null=True)
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    blockchain_updated_at = models.DateTimeField(blank=True, null=True)
    
    # Relations
    citizen = models.ForeignKey(
        User,
        related_name='submitted_admin_requests',
        on_delete=models.CASCADE,
        verbose_name=_('Công dân'),
        null=True,
        blank=True
    )
    resulting_document = models.ForeignKey(
        Document,
        related_name='source_request',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Giấy tờ kết quả')
    )
    
    def __str__(self):
        return f"{self.reference_number} - {self.title}"
    
    @property
    def is_overdue(self):
        """Kiểm tra yêu cầu có quá hạn không"""
        if not self.due_date:
            return False
        return self.due_date < timezone.now().date() and self.status not in ['completed', 'cancelled', 'rejected']
    
    @property
    def days_until_due(self):
        """Tính số ngày còn lại đến hạn"""
        if not self.due_date:
            return None
        return (self.due_date - timezone.now().date()).days
    
    def save(self, *args, **kwargs):
        # Tự động tạo số tham chiếu nếu chưa có
        if not self.reference_number:
            year = timezone.now().year
            # Tạo số tham chiếu dựa trên định dạng: REQ-YYYY-XXXXX (XXXXX là số tự tăng)
            count = AdminRequest.objects.filter(created_at__year=year).count()
            self.reference_number = f"REQ-{year}-{count+1:05d}"
        
        # Tự động tạo request_id nếu chưa có
        if not self.request_id:
            self.request_id = str(uuid.uuid4())
        
        super(AdminRequest, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Yêu cầu"
        verbose_name_plural = "Yêu cầu"
        ordering = ['-created_at', 'status']
        indexes = [
            models.Index(fields=['request_id']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['requestor']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
        ]
    
    def assign_to_officer(self, officer, save=True):
        """Assign the request to an officer"""
        self.assigned_officer = officer
        self.status = 'processing'
        self.updated_at = timezone.now()
        
        if save:
            self.save()
        
        return self
    
    def complete_request(self, document=None, comments=None, save=True):
        """Mark the request as completed"""
        self.status = 'completed'
        
        if document:
            self.resulting_document = document
            
        if comments:
            self.notes = comments
            
        self.updated_at = timezone.now()
        
        if save:
            self.save()
            
        return self
    
    def reject_request(self, reason, save=True):
        """Reject the request with a reason"""
        self.status = 'rejected'
        self.rejection_reason = reason
        self.updated_at = timezone.now()
        
        if save:
            self.save()
            
        return self
    
    def cancel_request(self, save=True):
        """Cancel the request (by citizen)"""
        # Only allow cancellation for pending requests
        if self.status == 'pending':
            self.status = 'cancelled'
            self.updated_at = timezone.now()
            
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
