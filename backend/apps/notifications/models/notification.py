from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Notification(models.Model):
    """
    Model đại diện cho thông báo trong hệ thống
    """
    TYPE_CHOICES = [
        ('info', 'Thông tin'),
        ('success', 'Thành công'),
        ('warning', 'Cảnh báo'),
        ('error', 'Lỗi'),
        ('request', 'Yêu cầu'),
        ('approval', 'Phê duyệt'),
        ('system', 'Hệ thống'),
    ]
    
    # Người nhận thông báo
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', verbose_name="Người nhận")
    
    # Thông tin cơ bản
    title = models.CharField(max_length=100, verbose_name="Tiêu đề")
    message = models.TextField(verbose_name="Nội dung")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info', verbose_name="Loại thông báo")
    
    # Trạng thái
    is_read = models.BooleanField(default=False, verbose_name="Đã đọc")
    is_sent = models.BooleanField(default=False, verbose_name="Đã gửi")
    is_email_sent = models.BooleanField(default=False, verbose_name="Đã gửi email")
    
    # Liên kết đến đối tượng liên quan (Document, Request, v.v.)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Loại đối tượng")
    object_id = models.CharField(max_length=50, null=True, blank=True, verbose_name="ID đối tượng")
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Metadata bổ sung
    data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu bổ sung")
    
    # Liên kết
    url = models.CharField(max_length=255, blank=True, null=True, verbose_name="URL liên kết")
    action_text = models.CharField(max_length=50, blank=True, null=True, verbose_name="Chữ hiển thị trên nút hành động")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời điểm đọc")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời điểm gửi")
    
    # Thông tin về nguồn thông báo
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications', verbose_name="Người tạo")
    
    def __str__(self):
        return f"{self.title} - {self.recipient.email}"
    
    def mark_as_read(self):
        """Đánh dấu thông báo đã đọc"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_sent(self):
        """Đánh dấu thông báo đã gửi"""
        from django.utils import timezone
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])
    
    class Meta:
        verbose_name = "Thông báo"
        verbose_name_plural = "Thông báo"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient']),
            models.Index(fields=['is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['content_type', 'object_id']),
        ]
