from django.db import models


class DocumentType(models.Model):
    """
    Model định nghĩa các loại giấy tờ hành chính được hỗ trợ trong hệ thống
    """
    COMPLEXITY_CHOICES = [
        ('simple', 'Đơn giản'),
        ('medium', 'Trung bình'),
        ('complex', 'Phức tạp'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Tên loại giấy tờ")
    code = models.CharField(max_length=20, unique=True, verbose_name="Mã giấy tờ")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    
    # Thông tin quy trình
    requires_officer_approval = models.BooleanField(default=True, verbose_name="Yêu cầu cán bộ xã phê duyệt")
    requires_chairman_approval = models.BooleanField(default=False, verbose_name="Yêu cầu chủ tịch phê duyệt")
    estimated_processing_days = models.PositiveSmallIntegerField(default=3, verbose_name="Thời gian xử lý dự kiến (ngày)")
    complexity = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES, default='medium', verbose_name="Độ phức tạp")
    
    # Trường dữ liệu yêu cầu
    required_fields = models.JSONField(default=list, help_text="Các trường dữ liệu bắt buộc", blank=True)
    optional_fields = models.JSONField(default=list, help_text="Các trường dữ liệu tùy chọn", blank=True)
    
    # Thông tin tài liệu đính kèm
    required_attachments = models.JSONField(default=list, help_text="Các tài liệu đính kèm bắt buộc", blank=True)
    optional_attachments = models.JSONField(default=list, help_text="Các tài liệu đính kèm không bắt buộc", blank=True)
    
    # Thông tin blockchain
    store_on_blockchain = models.BooleanField(default=True, verbose_name="Lưu trữ trên blockchain")
    blockchain_contract = models.CharField(max_length=100, blank=True, null=True, verbose_name="Smart contract")
    
    # Các thông tin khác
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Phí xử lý (VND)")
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    
    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        verbose_name = "Loại giấy tờ"
        verbose_name_plural = "Loại giấy tờ"
        ordering = ['name']
