from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import json
import hashlib


class UserManager(BaseUserManager):
    """
    Manager tùy chỉnh cho model User
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email là bắt buộc')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            # Đặt mật khẩu không thể sử dụng cho tài khoản không cần mật khẩu (OAuth)
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser phải có is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser phải có is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)
    
    def create_google_user(self, email, **extra_fields):
        """
        Tạo người dùng từ Google OAuth
        """
        user = self.create_user(email, password=None, **extra_fields)
        user.is_oauth = True  # Đánh dấu người dùng OAuth
        user.save(using=self._db)
        return user


class User(AbstractUser):
    """
    Custom User model that uses email instead of username
    and has role-based permissions
    """
    username = models.CharField(max_length=150, blank=True, null=True)  # Make username optional
    email = models.EmailField(_('email address'), unique=True)
    roles = models.ManyToManyField('accounts.Role', related_name='users', blank=True)
    
    # Additional fields
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    blockchain_address = models.CharField(max_length=50, blank=True, null=True)
    
    # Last blockchain update
    last_blockchain_update = models.DateTimeField(blank=True, null=True)
    
    is_oauth = models.BooleanField(default=False, verbose_name="Là tài khoản OAuth")
    
    USER_TYPE_CHOICES = (
        ('citizen', _('Citizen')),
        ('officer', _('Officer')),
        ('chairman', _('Chairman')),
        ('admin', _('Admin')),
    )
    
    ROLE_CHOICES = (
        ('CITIZEN', _('Citizen')),
        ('OFFICER', _('Officer')),
        ('CHAIRMAN', _('Chairman')),
        ('ADMIN', _('Admin')),
    )
    
    user_type = models.CharField(_('User Type'), max_length=10, choices=USER_TYPE_CHOICES, default='citizen')
    role = models.CharField(_('Role'), max_length=10, choices=ROLE_CHOICES, default='CITIZEN')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(_('Address'), blank=True, null=True)
    identification_number = models.CharField(_('Identification Number'), max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(_('Profile Picture'), upload_to='profile_pictures/', blank=True, null=True)
    
    # Blockchain related fields
    blockchain_id = models.CharField(_('Blockchain ID'), max_length=50, blank=True, null=True, unique=True)
    blockchain_status = models.CharField(_('Blockchain Status'), max_length=20, blank=True, null=True, 
                                         choices=(
                                             ('NOT_REGISTERED', _('Not Registered')),
                                             ('REGISTERED', _('Registered')),
                                             ('UPDATED', _('Updated')),
                                             ('ERROR', _('Error')),
                                         ), default='NOT_REGISTERED')
    blockchain_tx_id = models.CharField(_('Blockchain Transaction ID'), max_length=100, blank=True, null=True)
    blockchain_timestamp = models.DateTimeField(_('Blockchain Timestamp'), blank=True, null=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Username is not required for creating a user

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def has_role(self, role):
        return self.role == role
    
    @property
    def is_chairman(self):
        # Check both role field and roles ManyToMany relationship for better compatibility
        has_role_field = self.role == 'CHAIRMAN'
        has_roles_relationship = self.roles.filter(name='CHAIRMAN').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    @property
    def is_officer(self):
        # Check both role field and roles ManyToMany relationship for better compatibility
        has_role_field = self.role == 'OFFICER'
        has_roles_relationship = self.roles.filter(name='OFFICER').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    @property
    def is_citizen(self):
        # Check both role field and roles ManyToMany relationship for better compatibility
        has_role_field = self.role == 'CITIZEN'
        has_roles_relationship = self.roles.filter(name='CITIZEN').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Tạo blockchain_id nếu chưa có
        if not self.blockchain_id and is_new:
            try:
                from apps.blockchain.services.blockchain_service import BlockchainService
                blockchain_service = BlockchainService()
                user_prefix = 'USR'
                self.blockchain_id = blockchain_service.generate_blockchain_id(prefix=user_prefix)
            except ImportError:
                # If blockchain service is not available, generate a simple ID
                import uuid
                self.blockchain_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
        
        # Save user to database first
        super().save(*args, **kwargs)
        
        # Đăng ký người dùng trên blockchain nếu chưa đăng ký
        if (is_new or self.blockchain_status == 'NOT_REGISTERED') and not kwargs.get('update_fields'):
            try:
                from apps.blockchain.services.blockchain_service import BlockchainService
                blockchain_service = BlockchainService()
                result = blockchain_service.register_user_on_blockchain(self)
                
                if result.get('success'):
                    # Cập nhật trạng thái blockchain
                    self.blockchain_status = 'REGISTERED'
                    self.blockchain_tx_id = result.get('txId')
                    self.blockchain_timestamp = timezone.now()
                    # Save without triggering this function again
                    super().save(update_fields=['blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            except (ImportError, Exception) as e:
                print(f"Error registering user on blockchain: {str(e)}")
                # Set status to indicate blockchain registration failed
                self.blockchain_status = 'ERROR'
    
    def calculate_data_hash(self):
        """Tạo hash từ dữ liệu user để lưu và xác thực trên blockchain"""
        # Tạo một dict chứa các thông tin quan trọng của user
        data = {
            'id': str(self.id),
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
        }
        
        # Chuyển đổi dict thành chuỗi JSON và tạo hash
        data_string = json.dumps(data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        return data_hash
    
    async def save_to_blockchain(self):
        """Lưu thông tin người dùng vào blockchain"""
        # Import service ở đây để tránh circular import
        from apps.blockchain.services.user_contract import user_contract_service
        
        # Tạo hash từ dữ liệu user
        data_hash = self.calculate_data_hash()
        
        # Chuẩn bị dữ liệu để lưu vào blockchain
        user_data = {
            'id': self.blockchain_id or f"USER-{self.id}",
            'role': self.role,
            'name': self.full_name,
            'email': self.email,
            'created_by': 'system',
            'status': 'ACTIVE' if self.is_active else 'INACTIVE',
            'metadata': json.dumps({
                'is_verified': self.is_verified,
                'data_hash': data_hash
            }),
        }
        
        try:
            # Gọi service để lưu vào blockchain
            response = await user_contract_service.register_user(user_data)
            tx_id = response.get('txId')
            
            # Cập nhật trạng thái blockchain
            self.last_blockchain_update = timezone.now()
            
            # Lưu thông tin vào BlockchainRecord model
            from django.contrib.contenttypes.models import ContentType
            from apps.blockchain.models import BlockchainRecord
            
            content_type = ContentType.objects.get_for_model(self)
            
            BlockchainRecord.objects.create(
                transaction_id=tx_id,
                network='hyperledger',
                content_type=content_type,
                object_id=str(self.id),
                record_type='officer_approval' if self.is_officer else 'user_registration',
                status='confirmed',
                data={
                    'user_id': self.blockchain_id,
                    'action': 'register',
                    'role': self.role,
                    'data_hash': data_hash
                },
                verification_hash=data_hash,
                is_verified=True,
                verification_timestamp=timezone.now(),
                confirmed_at=timezone.now()
            )
            
            # Cập nhật model
            User.objects.filter(id=self.id).update(
                last_blockchain_update=self.last_blockchain_update
            )
            
            return tx_id
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error saving user to blockchain: {str(e)}")
            return None
    
    async def update_role_on_blockchain(self, new_role, approver_id=None):
        """Cập nhật vai trò người dùng trên blockchain"""
        # Import service ở đây để tránh circular import
        from apps.blockchain.services.user_contract import user_contract_service
        
        try:
            # Gọi service để cập nhật vai trò trên blockchain
            response = await user_contract_service.update_user_role(
                self.blockchain_id or f"USER-{self.id}",
                new_role,
                approver_id
            )
            
            tx_id = response.get('txId')
            
            # Cập nhật trạng thái blockchain
            self.last_blockchain_update = timezone.now()
            
            # Lưu thông tin vào BlockchainRecord model
            from django.contrib.contenttypes.models import ContentType
            from apps.blockchain.models import BlockchainRecord
            
            content_type = ContentType.objects.get_for_model(self)
            
            BlockchainRecord.objects.create(
                transaction_id=tx_id,
                network='hyperledger',
                content_type=content_type,
                object_id=str(self.id),
                record_type='role_update',
                status='confirmed',
                data={
                    'user_id': self.blockchain_id,
                    'action': 'update_role',
                    'new_role': new_role,
                    'approver_id': approver_id
                },
                verification_hash=self.calculate_data_hash(),
                is_verified=True,
                verification_timestamp=timezone.now(),
                confirmed_at=timezone.now()
            )
            
            # Cập nhật model
            User.objects.filter(id=self.id).update(
                last_blockchain_update=self.last_blockchain_update
            )
            
            return tx_id
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating user role on blockchain: {str(e)}")
            return None
    
    def verify_on_blockchain(self):
        """
        Xác thực người dùng trên blockchain
        """
        try:
            from apps.blockchain.services.blockchain_service import BlockchainService
            blockchain_service = BlockchainService()
            
            # Tạo dữ liệu để xác thực
            user_data = {
                'id': self.id,
                'username': self.username,
                'email': self.email,
                'role': self.role,
                'identification_number': self.identification_number
            }
            
            result = blockchain_service.verify_user(self.blockchain_id, user_data)
            return result
        except (ImportError, Exception) as e:
            print(f"Error verifying user on blockchain: {str(e)}")
            return {'success': False, 'error': str(e), 'verified': False}
    
    class Meta:
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        ordering = ['email']
