from django.db import models
from django.conf import settings
import uuid


class OfficerAssignment(models.Model):
    """
    Model đại diện cho nhiệm vụ được giao cho cán bộ xã
    """
    STATUS_CHOICES = [
        ('assigned', 'Đã phân công'),
        ('in_progress', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
        ('overdue', 'Quá hạn'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Thấp'),
        ('normal', 'Bình thường'),
        ('high', 'Cao'),
        ('urgent', 'Khẩn cấp'),
    ]
    
    # Thông tin cơ bản
    assignment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="Mã nhiệm vụ")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề nhiệm vụ")
    description = models.TextField(verbose_name="Mô tả nhiệm vụ")
    
    # Thông tin người dùng
    officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments', verbose_name="Cán bộ được giao")
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_assignments', verbose_name="Người giao nhiệm vụ")
    
    # Thông tin trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned', verbose_name="Trạng thái")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal', verbose_name="Mức độ ưu tiên")
    
    # Thông tin thời gian
    assigned_date = models.DateTimeField(auto_now_add=True, verbose_name="Ngày giao")
    due_date = models.DateTimeField(verbose_name="Thời hạn")
    start_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày bắt đầu")
    completed_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày hoàn thành")
    
    # Thông tin theo dõi
    progress = models.PositiveSmallIntegerField(default=0, verbose_name="Tiến độ (%)")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    completion_notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú hoàn thành")
    
    # Liên kết đến các công việc khác
    parent_assignment = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subtasks', verbose_name="Nhiệm vụ cha")
    related_request = models.ForeignKey('administrative.AdminRequest', on_delete=models.SET_NULL, null=True, blank=True, related_name='officer_assignments', verbose_name="Yêu cầu liên quan")
    
    # Dấu thời gian
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.officer.email} - {self.get_status_display()}"
    
    @property
    def is_overdue(self):
        """Kiểm tra công việc có quá hạn không"""
        from django.utils import timezone
        return (self.due_date < timezone.now() and 
                self.status not in ['completed', 'cancelled'])
    
    @property
    def days_remaining(self):
        """Tính số ngày còn lại đến hạn"""
        from django.utils import timezone
        now = timezone.now()
        if self.due_date > now:
            return (self.due_date - now).days
        return 0
    
    def update_status(self):
        """Cập nhật trạng thái dựa trên tiến độ và thời hạn"""
        from django.utils import timezone
        now = timezone.now()
        
        # Nếu đã hoàn thành 100%
        if self.progress == 100 and self.status != 'completed':
            self.status = 'completed'
            self.completed_date = now
        # Nếu đang làm việc
        elif self.progress > 0 and self.progress < 100 and self.status != 'in_progress':
            self.status = 'in_progress'
            if not self.start_date:
                self.start_date = now
        # Nếu quá hạn
        elif self.due_date < now and self.status not in ['completed', 'cancelled']:
            self.status = 'overdue'
    
    def save(self, *args, **kwargs):
        self.update_status()
        super(OfficerAssignment, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Nhiệm vụ cán bộ"
        verbose_name_plural = "Nhiệm vụ cán bộ"
        ordering = ['-assigned_date', 'priority', 'status']
        indexes = [
            models.Index(fields=['assignment_id']),
            models.Index(fields=['officer']),
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['due_date']),
        ]
