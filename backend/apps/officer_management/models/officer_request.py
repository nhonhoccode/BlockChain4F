from django.db import models
from django.conf import settings
import uuid


class OfficerRequest(models.Model):
    """
    Model đại diện cho yêu cầu đăng ký làm cán bộ xã
    """
    STATUS_CHOICES = [
        ('pending', 'Đang chờ xét duyệt'),
        ('reviewing', 'Đang xem xét'),
        ('additional_info_required', 'Yêu cầu bổ sung thông tin'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Từ chối'),
        ('revoked', 'Thu hồi'),
    ]
    
    ROLE_CHOICES = [
        ('general_admin', 'Cán bộ hành chính chung'),
        ('land_admin', 'Cán bộ địa chính'),
        ('civil_status', 'Cán bộ hộ tịch'),
        ('cultural_social', 'Cán bộ văn hóa - xã hội'),
        ('military', 'Cán bộ quân sự'),
        ('financial', 'Cán bộ tài chính'),
        ('justice', 'Cán bộ tư pháp'),
        ('other', 'Chức vụ khác'),
    ]
    
    # Thông tin cơ bản
    request_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã yêu cầu")
    reference_number = models.CharField(max_length=50, unique=True, verbose_name="Số tham chiếu")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='officer_requests', verbose_name="Người yêu cầu")
    
    # Thông tin vai trò
    requested_role = models.CharField(max_length=30, choices=ROLE_CHOICES, verbose_name="Vai trò yêu cầu")
    role_description = models.TextField(blank=True, null=True, verbose_name="Mô tả vai trò")
    
    # Thông tin cá nhân bổ sung
    education = models.TextField(blank=True, null=True, verbose_name="Trình độ học vấn")
    experience = models.TextField(blank=True, null=True, verbose_name="Kinh nghiệm")
    qualifications = models.TextField(blank=True, null=True, verbose_name="Bằng cấp/Chứng chỉ")
    motivation = models.TextField(blank=True, null=True, verbose_name="Lý do ứng tuyển")
    
    # Thông tin xử lý
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_officer_requests', verbose_name="Người xem xét")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_officer_requests', verbose_name="Người phê duyệt")
    
    # Thông tin phản hồi
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Lý do từ chối")
    additional_info_request = models.TextField(blank=True, null=True, verbose_name="Yêu cầu bổ sung thông tin")
    additional_info_response = models.TextField(blank=True, null=True, verbose_name="Phản hồi bổ sung")
    
    # Thông tin thời gian
    submitted_date = models.DateTimeField(auto_now_add=True, verbose_name="Ngày nộp")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Cập nhật lần cuối")
    approved_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày phê duyệt")
    rejected_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày từ chối")
    
    # Blockchain
    is_recorded_blockchain = models.BooleanField(default=False, verbose_name="Đã ghi blockchain")
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    
    def __str__(self):
        return f"{self.reference_number} - {self.user.email} - {self.get_requested_role_display()}"
    
    def save(self, *args, **kwargs):
        # Tự động tạo số tham chiếu khi tạo mới
        if not self.reference_number:
            from django.utils import timezone
            year = timezone.now().year
            # Lấy số lượng yêu cầu trong năm hiện tại
            count = OfficerRequest.objects.filter(submitted_date__year=year).count()
            # Tạo số tham chiếu theo định dạng: OFF-YYYY-XXXXX
            self.reference_number = f"OFF-{year}-{count+1:05d}"
        
        super(OfficerRequest, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Yêu cầu đăng ký cán bộ"
        verbose_name_plural = "Yêu cầu đăng ký cán bộ"
        ordering = ['-submitted_date', 'status']
        indexes = [
            models.Index(fields=['request_id']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['requested_role']),
        ]
