from django.db import models
from django.conf import settings
import uuid


class Request(models.Model):
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
    request_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã yêu cầu")
    reference_number = models.CharField(max_length=50, unique=True, verbose_name="Số tham chiếu")
    document_type = models.ForeignKey('administrative.DocumentType', on_delete=models.PROTECT, related_name='requests', verbose_name="Loại giấy tờ")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    
    # Thông tin người dùng
    requestor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_requests', verbose_name="Người yêu cầu")
    assigned_officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests', verbose_name="Cán bộ xử lý")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_requests', verbose_name="Người phê duyệt")
    
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
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    blockchain_updated_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.reference_number} - {self.title}"
    
    @property
    def is_overdue(self):
        """Kiểm tra yêu cầu có quá hạn không"""
        from django.utils import timezone
        if not self.due_date:
            return False
        return self.due_date < timezone.now().date() and self.status not in ['completed', 'cancelled', 'rejected']
    
    @property
    def days_until_due(self):
        """Tính số ngày còn lại đến hạn"""
        from django.utils import timezone
        if not self.due_date:
            return None
        return (self.due_date - timezone.now().date()).days
    
    def save(self, *args, **kwargs):
        # Tự động tạo số tham chiếu nếu chưa có
        if not self.reference_number:
            from django.utils import timezone
            year = timezone.now().year
            # Tạo số tham chiếu dựa trên định dạng: REQ-YYYY-XXXXX (XXXXX là số tự tăng)
            count = Request.objects.filter(created_at__year=year).count()
            self.reference_number = f"REQ-{year}-{count+1:05d}"
        
        super(Request, self).save(*args, **kwargs)
    
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
