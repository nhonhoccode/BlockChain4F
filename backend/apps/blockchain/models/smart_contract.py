from django.db import models
from django.conf import settings


class SmartContract(models.Model):
    """
    Model lưu trữ thông tin về các smart contract được sử dụng trong hệ thống
    """
    NETWORK_CHOICES = [
        ('hyperledger', 'Hyperledger Fabric'),
        ('quorum', 'Quorum'),
    ]
    
    TYPE_CHOICES = [
        ('document', 'Quản lý giấy tờ'),
        ('user', 'Quản lý người dùng'),
        ('officer', 'Quản lý cán bộ'),
        ('admin', 'Quản lý hành chính'),
        ('verification', 'Xác thực'),
        ('other', 'Khác'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Đang hoạt động'),
        ('inactive', 'Không hoạt động'),
        ('deprecated', 'Không dùng nữa'),
        ('testing', 'Đang kiểm thử'),
    ]
    
    # Thông tin cơ bản
    name = models.CharField(max_length=100, verbose_name="Tên contract")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    version = models.CharField(max_length=20, verbose_name="Phiên bản")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Loại contract")
    
    # Thông tin blockchain
    network = models.CharField(max_length=20, choices=NETWORK_CHOICES, verbose_name="Mạng blockchain")
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Địa chỉ contract") # Địa chỉ contract trên blockchain
    channel = models.CharField(max_length=100, blank=True, null=True, verbose_name="Channel") # Chỉ dùng cho Hyperledger
    chaincode_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Chaincode ID") # Chỉ dùng cho Hyperledger
    
    # Thông tin ABI và bytecode
    abi = models.JSONField(default=dict, blank=True, verbose_name="ABI")
    bytecode = models.TextField(blank=True, null=True, verbose_name="Bytecode")
    source_code = models.TextField(blank=True, null=True, verbose_name="Mã nguồn")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Trạng thái")
    
    # Thông tin người dùng
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_contracts', verbose_name="Chủ sở hữu")
    
    # Metadata
    functions = models.JSONField(default=list, blank=True, verbose_name="Danh sách hàm")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadata")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deployed_at = models.DateTimeField(blank=True, null=True, verbose_name="Thời gian triển khai")
    
    def __str__(self):
        return f"{self.name} v{self.version} ({self.get_type_display()}) - {self.get_status_display()}"
    
    @property
    def is_active(self):
        """Kiểm tra contract có đang hoạt động không"""
        return self.status == 'active'
    
    @property
    def network_display(self):
        """Hiển thị tên mạng"""
        return self.get_network_display()
    
    @property
    def explorer_url(self):
        """Tạo URL để xem contract trên blockchain explorer"""
        if not self.address:
            return None
            
        if self.network == 'hyperledger':
            return f"/blockchain/explorer/hyperledger/chaincode/{self.chaincode_id}"
        elif self.network == 'quorum':
            return f"/blockchain/explorer/quorum/address/{self.address}"
        return None
    
    class Meta:
        verbose_name = "Smart Contract"
        verbose_name_plural = "Smart Contracts"
        ordering = ['type', 'name', '-version']
        unique_together = ['name', 'version', 'network']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['address']),
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['network']),
        ]
