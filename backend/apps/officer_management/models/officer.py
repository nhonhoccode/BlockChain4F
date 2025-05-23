from django.db import models
from django.conf import settings
import uuid

class Officer(models.Model):
    """
    Model representing an officer user with additional information
    """
    # Basic information
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='officer_profile')
    officer_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã cán bộ")
    
    # Position information
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name="Chức vụ")
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name="Phòng/Ban")
    
    # Additional officer information
    bio = models.TextField(blank=True, null=True, verbose_name="Tiểu sử")
    start_date = models.DateField(blank=True, null=True, verbose_name="Ngày bắt đầu")
    end_date = models.DateField(blank=True, null=True, verbose_name="Ngày kết thúc")
    
    # Jurisdiction area
    jurisdiction_ward = models.CharField(max_length=100, blank=True, null=True, verbose_name="Phường/Xã quản lý")
    jurisdiction_district = models.CharField(max_length=100, blank=True, null=True, verbose_name="Quận/Huyện quản lý")
    jurisdiction_city = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tỉnh/Thành phố quản lý")
    
    # Status information
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    
    # Approval information
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_officers', verbose_name="Người phê duyệt")
    approved_date = models.DateTimeField(blank=True, null=True, verbose_name="Ngày phê duyệt")
    
    # Blockchain information
    is_recorded_blockchain = models.BooleanField(default=False, verbose_name="Đã ghi blockchain")
    blockchain_transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.position or 'Officer'}"
    
    class Meta:
        verbose_name = "Cán bộ xã"
        verbose_name_plural = "Cán bộ xã"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['officer_id']),
            models.Index(fields=['user']),
            models.Index(fields=['position']),
            models.Index(fields=['is_active']),
        ] 