from django.db import models
from django.conf import settings
import uuid


class Feedback(models.Model):
    """
    Model đại diện cho phản hồi, góp ý từ người dùng
    """
    STATUS_CHOICES = [
        ('pending', 'Đang chờ xử lý'),
        ('in_progress', 'Đang xử lý'),
        ('resolved', 'Đã giải quyết'),
        ('closed', 'Đã đóng'),
        ('rejected', 'Từ chối'),
    ]
    
    TYPE_CHOICES = [
        ('suggestion', 'Góp ý'),
        ('complaint', 'Phàn nàn'),
        ('question', 'Câu hỏi'),
        ('bug_report', 'Báo lỗi'),
        ('other', 'Khác'),
    ]
    
    # Thông tin cơ bản
    feedback_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã phản hồi")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    content = models.TextField(verbose_name="Nội dung")
    feedback_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='suggestion', verbose_name="Loại phản hồi")
    
    # Thông tin người dùng
    submitter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks', verbose_name="Người gửi")
    handler = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_feedbacks', verbose_name="Người xử lý")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    
    # Thông tin liên quan
    related_document = models.ForeignKey('administrative.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks', verbose_name="Giấy tờ liên quan")
    related_request = models.ForeignKey('administrative.AdminRequest', on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks', verbose_name="Yêu cầu liên quan")
    
    # Thông tin phản hồi từ cán bộ
    response = models.TextField(blank=True, null=True, verbose_name="Phản hồi")
    response_date = models.DateTimeField(blank=True, null=True, verbose_name="Ngày phản hồi")
    
    # Thông tin đánh giá từ người dùng
    is_satisfied = models.BooleanField(null=True, blank=True, verbose_name="Hài lòng với phản hồi")
    satisfaction_rating = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="Đánh giá (1-5)")
    satisfaction_comment = models.TextField(blank=True, null=True, verbose_name="Nhận xét thêm")
    
    # Dấu thời gian
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    
    # Thông tin bổ sung
    is_public = models.BooleanField(default=False, verbose_name="Công khai")
    is_anonymous = models.BooleanField(default=False, verbose_name="Ẩn danh")
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    def respond(self, response_text, handler):
        """Thêm phản hồi từ cán bộ xã"""
        from django.utils import timezone
        self.response = response_text
        self.handler = handler
        self.response_date = timezone.now()
        self.status = 'resolved'
        self.save(update_fields=['response', 'handler', 'response_date', 'status'])
    
    def rate_satisfaction(self, rating, comment=None, is_satisfied=None):
        """Đánh giá mức độ hài lòng với phản hồi"""
        self.satisfaction_rating = rating
        self.satisfaction_comment = comment
        self.is_satisfied = is_satisfied
        self.save(update_fields=['satisfaction_rating', 'satisfaction_comment', 'is_satisfied'])
    
    class Meta:
        verbose_name = "Phản hồi"
        verbose_name_plural = "Phản hồi"
        ordering = ['-created_at', 'status']
        indexes = [
            models.Index(fields=['feedback_id']),
            models.Index(fields=['submitter']),
            models.Index(fields=['handler']),
            models.Index(fields=['status']),
            models.Index(fields=['feedback_type']),
        ]
