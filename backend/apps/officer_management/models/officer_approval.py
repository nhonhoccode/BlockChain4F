from django.db import models
from django.conf import settings
import uuid


class OfficerApproval(models.Model):
    """
    Model đại diện cho quy trình phê duyệt cán bộ xã bởi chủ tịch xã
    """
    STATUS_CHOICES = [
        ('pending', 'Đang chờ'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Từ chối'),
        ('revoked', 'Thu hồi'),
    ]
    
    # Thông tin cơ bản
    approval_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã phê duyệt")
    
    # Liên kết đến yêu cầu cán bộ
    officer_request = models.OneToOneField('officer_management.OfficerRequest', on_delete=models.CASCADE, related_name='approval', verbose_name="Yêu cầu cán bộ")
    
    # Thông tin người phê duyệt
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='officer_approvals', verbose_name="Người phê duyệt")
    
    # Thông tin phê duyệt
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    approval_reason = models.TextField(blank=True, null=True, verbose_name="Lý do phê duyệt")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Lý do từ chối")
    
    # Thông tin công việc sau khi phê duyệt
    assigned_duties = models.TextField(blank=True, null=True, verbose_name="Nhiệm vụ được giao")
    start_date = models.DateField(null=True, blank=True, verbose_name="Ngày bắt đầu")
    end_date = models.DateField(null=True, blank=True, verbose_name="Ngày kết thúc")
    probation_period = models.PositiveSmallIntegerField(default=3, verbose_name="Thời gian thử việc (tháng)")
    
    # Thông tin thời gian
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày phê duyệt")
    
    # Blockchain
    is_recorded_blockchain = models.BooleanField(default=False, verbose_name="Đã ghi blockchain")
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    
    # Thông tin chữ ký điện tử
    digital_signature = models.TextField(blank=True, null=True, verbose_name="Chữ ký điện tử")
    signature_timestamp = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian ký")
    
    def __str__(self):
        return f"Phê duyệt: {self.officer_request.reference_number} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        # Cập nhật thời gian phê duyệt
        if self.status == 'approved' and not self.approved_at:
            from django.utils import timezone
            self.approved_at = timezone.now()
            
        # Cập nhật trạng thái của yêu cầu cán bộ tương ứng
        if self.status == 'approved' and self.officer_request.status != 'approved':
            self.officer_request.status = 'approved'
            self.officer_request.approved_date = self.approved_at
            self.officer_request.approver = self.approver
            self.officer_request.save()
        elif self.status == 'rejected' and self.officer_request.status != 'rejected':
            self.officer_request.status = 'rejected'
            self.officer_request.rejected_date = timezone.now()
            self.officer_request.rejection_reason = self.rejection_reason
            self.officer_request.save()
            
        super(OfficerApproval, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Phê duyệt cán bộ"
        verbose_name_plural = "Phê duyệt cán bộ"
        ordering = ['-created_at', 'status']
        indexes = [
            models.Index(fields=['approval_id']),
            models.Index(fields=['officer_request']),
            models.Index(fields=['approver']),
            models.Index(fields=['status']),
        ]
