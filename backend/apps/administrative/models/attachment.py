from django.db import models
from django.conf import settings
import uuid
import os


def attachment_file_path(instance, filename):
    """Tạo đường dẫn lưu trữ cho file đính kèm"""
    # Tạo đường dẫn theo cấu trúc: attachments/request_id/file_uuid_filename
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    
    if instance.request:
        return f"attachments/requests/{instance.request.request_id}/{new_filename}"
    elif instance.document:
        return f"attachments/documents/{instance.document.document_id}/{new_filename}"
    else:
        return f"attachments/other/{new_filename}"


class Attachment(models.Model):
    """
    Model đại diện cho tài liệu đính kèm trong hệ thống
    """
    TYPE_CHOICES = [
        ('identity_card', 'Căn cước công dân/CMND'),
        ('birth_certificate', 'Giấy khai sinh'),
        ('household_registration', 'Sổ hộ khẩu'),
        ('marriage_certificate', 'Giấy chứng nhận kết hôn'),
        ('property_certificate', 'Giấy chứng nhận quyền sở hữu'),
        ('tax_document', 'Tài liệu thuế'),
        ('business_registration', 'Giấy đăng ký kinh doanh'),
        ('qualification', 'Văn bằng/Chứng chỉ'),
        ('supporting_document', 'Tài liệu hỗ trợ'),
        ('application_form', 'Đơn đăng ký'),
        ('photo', 'Ảnh'),
        ('other', 'Khác'),
    ]
    
    # Thông tin cơ bản
    attachment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã tài liệu")
    name = models.CharField(max_length=255, verbose_name="Tên tài liệu")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    attachment_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name="Loại tài liệu")
    
    # File
    file = models.FileField(upload_to=attachment_file_path, verbose_name="File")
    file_size = models.PositiveIntegerField(default=0, verbose_name="Kích thước (bytes)")
    file_type = models.CharField(max_length=50, blank=True, null=True, verbose_name="Loại file")
    
    # Liên kết
    request = models.ForeignKey('administrative.AdminRequest', on_delete=models.CASCADE, related_name='attachments', null=True, blank=True, verbose_name="Yêu cầu")
    document = models.ForeignKey('administrative.Document', on_delete=models.CASCADE, related_name='attachments', null=True, blank=True, verbose_name="Giấy tờ")
    
    # Thông tin người tải lên
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_attachments', verbose_name="Người tải lên")
    
    # Thông tin xác thực
    is_verified = models.BooleanField(default=False, verbose_name="Đã xác thực")
    verification_hash = models.CharField(max_length=100, blank=True, null=True, verbose_name="Mã băm xác thực")
    verification_date = models.DateTimeField(blank=True, null=True, verbose_name="Ngày xác thực")
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_attachments', verbose_name="Người xác thực")
    
    # Blockchain
    is_stored_blockchain = models.BooleanField(default=False, verbose_name="Đã lưu blockchain")
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    @property
    def file_extension(self):
        """Lấy phần mở rộng của file"""
        return os.path.splitext(self.file.name)[1].lower() if self.file else None
    
    @property
    def is_image(self):
        """Kiểm tra file có phải là ảnh không"""
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        return self.file_extension in image_extensions
    
    @property
    def is_pdf(self):
        """Kiểm tra file có phải là PDF không"""
        return self.file_extension == '.pdf'
    
    def save(self, *args, **kwargs):
        # Cập nhật kích thước file nếu có file
        if self.file and hasattr(self.file, 'size'):
            self.file_size = self.file.size
            
        # Cập nhật loại file nếu có file
        if self.file and not self.file_type:
            import mimetypes
            self.file_type = mimetypes.guess_type(self.file.name)[0]
            
        super(Attachment, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Tài liệu đính kèm"
        verbose_name_plural = "Tài liệu đính kèm"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['attachment_id']),
            models.Index(fields=['request']),
            models.Index(fields=['document']),
            models.Index(fields=['attachment_type']),
        ]
