from django.db import models
from django.conf import settings
import uuid


class Approval(models.Model):
    """
    Model đại diện cho quy trình phê duyệt giấy tờ quan trọng bởi chủ tịch
    """
    STATUS_CHOICES = [
        ('pending', 'Đang chờ'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Từ chối'),
        ('revoked', 'Thu hồi'),
    ]
    
    # Thông tin cơ bản
    approval_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã phê duyệt")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    
    # Liên kết đến giấy tờ hoặc yêu cầu
    document = models.ForeignKey('administrative.Document', on_delete=models.CASCADE, related_name='approvals', null=True, blank=True, verbose_name="Giấy tờ")
    request = models.ForeignKey('administrative.Request', on_delete=models.CASCADE, related_name='approvals', null=True, blank=True, verbose_name="Yêu cầu")
    
    # Thông tin người dùng
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requested_approvals', verbose_name="Người yêu cầu phê duyệt")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='given_approvals', verbose_name="Người phê duyệt")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    
    # Thông tin phê duyệt
    priority = models.PositiveSmallIntegerField(default=0, verbose_name="Mức độ ưu tiên")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    approval_reason = models.TextField(blank=True, null=True, verbose_name="Lý do phê duyệt")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Lý do từ chối")
    
    # Thông tin thời gian
    requested_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian yêu cầu")
    due_date = models.DateField(null=True, blank=True, verbose_name="Thời hạn phê duyệt")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian phê duyệt")
    
    # Blockchain
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    is_recorded_blockchain = models.BooleanField(default=False, verbose_name="Đã ghi blockchain")
    
    # Thông tin chữ ký điện tử
    digital_signature = models.TextField(blank=True, null=True, verbose_name="Chữ ký điện tử")
    signature_timestamp = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian ký")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    @property
    def is_valid(self):
        """Kiểm tra phê duyệt còn hiệu lực không"""
        return self.status == 'approved'
    
    @property
    def is_overdue(self):
        """Kiểm tra quá hạn phê duyệt"""
        from django.utils import timezone
        if not self.due_date or self.status != 'pending':
            return False
        return self.due_date < timezone.now().date()
    
    @property
    def days_pending(self):
        """Tính số ngày chờ phê duyệt"""
        from django.utils import timezone
        return (timezone.now().date() - self.requested_at.date()).days
    
    def save(self, *args, **kwargs):
        if self.status == 'approved' and not self.approved_at:
            from django.utils import timezone
            self.approved_at = timezone.now()
            
        super(Approval, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Phê duyệt"
        verbose_name_plural = "Phê duyệt"
        ordering = ['-requested_at', 'status', 'priority']
        indexes = [
            models.Index(fields=['approval_id']),
            models.Index(fields=['document']),
            models.Index(fields=['request']),
            models.Index(fields=['status']),
            models.Index(fields=['requested_by']),
            models.Index(fields=['approver']),
        ]
