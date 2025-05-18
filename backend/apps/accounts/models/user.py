from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


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
    
    ROLE_CHOICES = (
        ('citizen', 'Công dân'),
        ('officer', 'Cán bộ'),
        ('chairman', 'Chủ tịch'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    blockchain_id = models.CharField(max_length=100, blank=True, null=True)
    
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
        has_role_field = self.role == 'chairman'
        has_roles_relationship = self.roles.filter(name='chairman').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    @property
    def is_officer(self):
        # Check both role field and roles ManyToMany relationship for better compatibility
        has_role_field = self.role == 'officer'
        has_roles_relationship = self.roles.filter(name='officer').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    @property
    def is_citizen(self):
        # Check both role field and roles ManyToMany relationship for better compatibility
        has_role_field = self.role == 'citizen'
        has_roles_relationship = self.roles.filter(name='citizen').exists()
        
        # Return True if either condition is met
        return has_role_field or has_roles_relationship
    
    class Meta:
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        ordering = ['email']
