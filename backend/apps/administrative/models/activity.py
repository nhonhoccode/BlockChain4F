from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.accounts.models import User

class Activity(models.Model):
    TYPE_CHOICES = (
        ('login', _('Đăng nhập')),
        ('request_created', _('Tạo yêu cầu')),
        ('request_updated', _('Cập nhật yêu cầu')),
        ('request_submitted', _('Nộp yêu cầu')),
        ('request_approved', _('Phê duyệt yêu cầu')),
        ('request_rejected', _('Từ chối yêu cầu')),
        ('document_created', _('Tạo giấy tờ')),
        ('document_updated', _('Cập nhật giấy tờ')),
        ('document_approved', _('Phê duyệt giấy tờ')),
        ('document_issued', _('Cấp giấy tờ')),
        ('document_verified', _('Xác minh giấy tờ')),
        ('notification', _('Thông báo')),
        ('system', _('Hoạt động hệ thống')),
        ('other', _('Khác')),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities', verbose_name=_('Người dùng'))
    activity_type = models.CharField(_('Loại hoạt động'), max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(_('Tiêu đề'), max_length=255)
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    
    # Các tham chiếu đến đối tượng liên quan
    request = models.ForeignKey('administrative.AdminRequest', on_delete=models.SET_NULL, null=True, blank=True, related_name='activities', verbose_name=_('Yêu cầu liên quan'))
    document = models.ForeignKey('administrative.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='activities', verbose_name=_('Giấy tờ liên quan'))
    
    is_read = models.BooleanField(_('Đã đọc'), default=False)
    is_important = models.BooleanField(_('Quan trọng'), default=False)
    
    metadata = models.JSONField(_('Dữ liệu bổ sung'), default=dict, blank=True)
    created_at = models.DateTimeField(_('Ngày tạo'), default=timezone.now)
    updated_at = models.DateTimeField(_('Ngày cập nhật'), auto_now=True)
    
    class Meta:
        verbose_name = _('Hoạt động')
        verbose_name_plural = _('Hoạt động')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def activity_type_display(self):
        return dict(self.TYPE_CHOICES).get(self.activity_type, self.activity_type)
    
    def mark_as_read(self):
        """Đánh dấu là đã đọc"""
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])
    
    @classmethod
    def log_activity(cls, user, activity_type, title, description=None, request=None, document=None, is_important=False, metadata=None):
        """
        Tạo một bản ghi hoạt động mới
        """
        if metadata is None:
            metadata = {}
            
        return cls.objects.create(
            user=user,
            activity_type=activity_type,
            title=title,
            description=description,
            request=request,
            document=document,
            is_important=is_important,
            metadata=metadata
        ) 