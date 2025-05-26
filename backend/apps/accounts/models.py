from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Role(models.Model):
    """
    Model vai trò người dùng:
    - citizen: Công dân
    - officer: Cán bộ xã
    - chairman: Chủ tịch xã (admin)
    """
    ROLE_CHOICES = (
        ('citizen', 'Công dân'),
        ('officer', 'Cán bộ xã'),
        ('chairman', 'Chủ tịch xã (Admin)')
    )
    
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Vai trò"
        verbose_name_plural = "Vai trò"
    
    def __str__(self):
        for role_value, role_name in self.ROLE_CHOICES:
            if self.name == role_value:
                return role_name
        return self.name

class Profile(models.Model):
    """
    Model hồ sơ người dùng mở rộng từ User model mặc định
    Chứa thông tin chi tiết về người dùng
    """
    GENDER_CHOICES = (
        ('male', 'Nam'),
        ('female', 'Nữ'),
        ('other', 'Khác'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='profiles')
    
    # Thông tin cá nhân
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male', blank=True, null=True, verbose_name="Giới tính")
    id_number = models.CharField(max_length=20, blank=True, null=True, unique=True, verbose_name="Số CMND/CCCD")
    id_issue_date = models.DateField(blank=True, null=True, verbose_name="Ngày cấp")
    id_issue_place = models.CharField(max_length=100, blank=True, null=True, verbose_name="Nơi cấp")
    
    # Địa chỉ
    address = models.CharField(max_length=255, blank=True, null=True)
    ward = models.CharField(max_length=100, blank=True, null=True, verbose_name="Phường/Xã")
    district = models.CharField(max_length=100, blank=True, null=True, verbose_name="Quận/Huyện")
    province = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tỉnh/Thành phố")
    
    # Dành cho cán bộ và chủ tịch xã
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name="Chức vụ")
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name="Phòng ban")
    is_approved = models.BooleanField(default=False, verbose_name="Đã được phê duyệt")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_profiles')
    approved_at = models.DateTimeField(blank=True, null=True)
    
    # Thông tin bổ sung
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True, verbose_name="Tiểu sử")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Hồ sơ người dùng"
        verbose_name_plural = "Hồ sơ người dùng"
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.get_role_display()}"
    
    def get_role_display(self):
        return self.role.get_name_display() if self.role else "Chưa phân quyền"
    
    def get_full_address(self):
        address_parts = []
        if self.address:
            address_parts.append(self.address)
        if self.ward:
            address_parts.append(self.ward)
        if self.district:
            address_parts.append(self.district)
        if self.province:
            address_parts.append(self.province)
        
        return ", ".join(address_parts) if address_parts else "Chưa cập nhật" 