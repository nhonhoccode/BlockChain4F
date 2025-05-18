from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.conf import settings
import uuid


class BlockchainRecord(models.Model):
    """
    Model lưu trữ thông tin về các giao dịch blockchain trong hệ thống
    Sử dụng Generic Foreign Key để liên kết với bất kỳ đối tượng nào (Document, Request, Officer, v.v.)
    """
    NETWORK_CHOICES = [
        ('hyperledger', 'Hyperledger Fabric'),
        ('quorum', 'Quorum'),
    ]
    
    TYPE_CHOICES = [
        ('document_creation', 'Tạo giấy tờ'),
        ('document_update', 'Cập nhật giấy tờ'),
        ('document_revocation', 'Thu hồi giấy tờ'),
        ('officer_approval', 'Phê duyệt cán bộ'),
        ('request_creation', 'Tạo yêu cầu'),
        ('request_update', 'Cập nhật yêu cầu'),
        ('verification', 'Xác thực'),
        ('signature', 'Ký số'),
        ('other', 'Khác'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Đang chờ'),
        ('submitted', 'Đã gửi'),
        ('confirmed', 'Đã xác nhận'),
        ('failed', 'Thất bại'),
    ]
    
    # Thông tin cơ bản
    record_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã bản ghi")
    transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID giao dịch blockchain")
    transaction_hash = models.CharField(max_length=255, blank=True, null=True, verbose_name="Hash giao dịch")
    
    # Thông tin blockchain
    network = models.CharField(max_length=20, choices=NETWORK_CHOICES, default='hyperledger', verbose_name="Mạng blockchain")
    smart_contract = models.ForeignKey('blockchain.SmartContract', on_delete=models.SET_NULL, null=True, related_name='records', verbose_name="Smart contract")
    block_number = models.PositiveIntegerField(blank=True, null=True, verbose_name="Số block")
    
    # Liên kết đến đối tượng liên quan (Document, Request, v.v.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name="Loại đối tượng")
    object_id = models.CharField(max_length=50, verbose_name="ID đối tượng")
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Metadata
    record_type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name="Loại bản ghi")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu") # Dữ liệu được lưu trữ trên blockchain
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadata") # Thông tin bổ sung về giao dịch
    
    # Thông tin người dùng
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='blockchain_records', verbose_name="Người tạo")
    
    # Thông tin xác thực
    verification_hash = models.CharField(max_length=255, blank=True, null=True, verbose_name="Hash xác thực")
    is_verified = models.BooleanField(default=False, verbose_name="Đã xác thực")
    verification_timestamp = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian xác thực")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian xác nhận")
    
    # Xử lý lỗi
    error_message = models.TextField(blank=True, null=True, verbose_name="Thông báo lỗi")
    retry_count = models.PositiveSmallIntegerField(default=0, verbose_name="Số lần thử lại")
    
    def __str__(self):
        return f"{self.record_id} - {self.get_record_type_display()} - {self.get_status_display()}"
    
    @property
    def object_type(self):
        """Trả về tên kiểu đối tượng"""
        return self.content_type.model if self.content_type else None
    
    @property
    def transaction_url(self):
        """Tạo URL để xem giao dịch trên blockchain explorer"""
        if not self.transaction_hash:
            return None
            
        if self.network == 'hyperledger':
            return f"/blockchain/explorer/hyperledger/tx/{self.transaction_hash}"
        elif self.network == 'quorum':
            return f"/blockchain/explorer/quorum/tx/{self.transaction_hash}"
        return None
    
    class Meta:
        verbose_name = "Bản ghi blockchain"
        verbose_name_plural = "Bản ghi blockchain"
        ordering = ['-created_at', 'status']
        indexes = [
            models.Index(fields=['record_id']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['status']),
            models.Index(fields=['record_type']),
            models.Index(fields=['created_by']),
        ]
