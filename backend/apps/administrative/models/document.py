from django.db import models
from django.conf import settings
import uuid


class Document(models.Model):
    """
    Model đại diện cho một giấy tờ cụ thể đã được tạo trong hệ thống
    """
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('issued', 'Đã ban hành'),
        ('revoked', 'Thu hồi'),
        ('expired', 'Hết hạn'),
    ]
    
    # Thông tin cơ bản
    document_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã giấy tờ")
    reference_number = models.CharField(max_length=50, unique=True, verbose_name="Số tham chiếu")
    document_type = models.ForeignKey('administrative.DocumentType', on_delete=models.PROTECT, related_name='documents', verbose_name="Loại giấy tờ")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    content = models.TextField(verbose_name="Nội dung")
    
    # Thông tin liên quan đến người dùng
    issued_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_documents', verbose_name="Người nhận")
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='issued_documents', verbose_name="Người cấp")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    is_verified_blockchain = models.BooleanField(default=False, verbose_name="Đã xác thực blockchain")
    
    # Thông tin thời gian
    issued_date = models.DateField(null=True, blank=True, verbose_name="Ngày cấp")
    valid_from = models.DateField(null=True, blank=True, verbose_name="Có hiệu lực từ")
    valid_until = models.DateField(null=True, blank=True, verbose_name="Có hiệu lực đến")
    
    # Thông tin xác thực
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    blockchain_address = models.CharField(max_length=100, blank=True, null=True, verbose_name="Địa chỉ blockchain")
    verification_hash = models.CharField(max_length=100, blank=True, null=True, verbose_name="Mã băm xác thực")
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True, verbose_name="Mã QR")
    
    # Dữ liệu bổ sung
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadata")
    data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu")
    
    # File tài liệu
    document_file = models.FileField(upload_to='documents/', blank=True, null=True, verbose_name="File giấy tờ")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    revoked_at = models.DateTimeField(blank=True, null=True)
    blockchain_updated_at = models.DateTimeField(blank=True, null=True)
    
    # Liên kết đến yêu cầu ban đầu
    request = models.ForeignKey('administrative.Request', on_delete=models.SET_NULL, related_name='resulting_documents', null=True, blank=True, verbose_name="Yêu cầu")
    
    def __str__(self):
        return f"{self.reference_number} - {self.title}"
    
    @property
    def is_valid(self):
        """Kiểm tra giấy tờ có còn hiệu lực không"""
        from django.utils import timezone
        now = timezone.now().date()
        return (self.status == 'issued' and 
                self.valid_from <= now and 
                (self.valid_until is None or self.valid_until >= now))
    
    def generate_verification_hash(self):
        """Tạo mã băm để xác thực"""
        import hashlib
        from django.utils import timezone
        
        # Tạo chuỗi dữ liệu với các thông tin quan trọng
        data_string = f"{self.document_id}|{self.reference_number}|{self.issued_to.id}|{self.issued_date}|{timezone.now().timestamp()}"
        
        # Tạo mã băm
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def save(self, *args, **kwargs):
        # Tạo mã băm xác thực nếu chưa có
        if not self.verification_hash and self.status == 'issued':
            self.verification_hash = self.generate_verification_hash()
        
        super(Document, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Giấy tờ"
        verbose_name_plural = "Giấy tờ"
        ordering = ['-issued_date', 'reference_number']
        indexes = [
            models.Index(fields=['document_id']),
            models.Index(fields=['reference_number']),
            models.Index(fields=['issued_to']),
            models.Index(fields=['status']),
        ]
