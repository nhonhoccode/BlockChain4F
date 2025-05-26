from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.accounts.models import User

class Request(models.Model):
    STATUS_CHOICES = (
        ('draft', _('Nháp')),
        ('submitted', _('Đã gửi')),
        ('pending', _('Đang chờ')),
        ('processing', _('Đang xử lý')),
        ('additional_info_requested', _('Yêu cầu bổ sung thông tin')),
        ('completed', _('Hoàn thành')),
        ('approved', _('Đã phê duyệt')),
        ('rejected', _('Từ chối')),
        ('cancelled', _('Đã hủy')),
    )
    
    PRIORITY_CHOICES = (
        ('low', _('Thấp')),
        ('normal', _('Bình thường')),
        ('medium', _('Trung bình')),
        ('high', _('Cao')),
        ('urgent', _('Khẩn cấp')),
    )
    
    TYPE_CHOICES = (
        ('document_issuance', _('Cấp giấy tờ')),
        ('document_renewal', _('Gia hạn giấy tờ')),
        ('document_modification', _('Sửa đổi giấy tờ')),
        ('document_cancellation', _('Hủy giấy tờ')),
        ('information_request', _('Yêu cầu thông tin')),
        ('blockchain_verification', _('Xác minh blockchain')),
        ('other', _('Khác')),
    )
    
    title = models.CharField(_('Tiêu đề'), max_length=255)
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    request_type = models.CharField(_('Loại yêu cầu'), max_length=50, choices=TYPE_CHOICES)
    
    requestor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests', verbose_name=_('Công dân'))
    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blockchain_assigned_requests', verbose_name=_('Cán bộ xử lý'))
    
    status = models.CharField(_('Trạng thái'), max_length=30, choices=STATUS_CHOICES, default='draft')
    priority = models.CharField(_('Mức ưu tiên'), max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    needs_chairman_approval = models.BooleanField(_('Cần phê duyệt của chủ tịch'), default=False)
    is_visible_to_citizen = models.BooleanField(_('Hiển thị cho công dân'), default=True)
    
    rejection_reason = models.TextField(_('Lý do từ chối'), blank=True, null=True)
    additional_notes = models.TextField(_('Ghi chú bổ sung'), blank=True, null=True)
    
    documents = models.ManyToManyField('Document', blank=True, related_name='related_requests', verbose_name=_('Giấy tờ liên quan'))
    
    attachments = models.JSONField(_('Tệp đính kèm'), default=list, blank=True)
    form_data = models.JSONField(_('Dữ liệu biểu mẫu'), default=dict, blank=True)
    
    created_at = models.DateTimeField(_('Ngày tạo'), default=timezone.now)
    submitted_at = models.DateTimeField(_('Ngày nộp'), blank=True, null=True)
    processed_at = models.DateTimeField(_('Ngày xử lý'), blank=True, null=True)
    updated_at = models.DateTimeField(_('Ngày cập nhật'), auto_now=True)
    
    class Meta:
        verbose_name = _('Yêu cầu')
        verbose_name_plural = _('Yêu cầu')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)
    
    @property
    def priority_display(self):
        return dict(self.PRIORITY_CHOICES).get(self.priority, self.priority)
    
    @property
    def request_type_display(self):
        return dict(self.TYPE_CHOICES).get(self.request_type, self.request_type)
    
    def submit(self):
        """Nộp yêu cầu"""
        self.status = 'submitted'
        self.submitted_at = timezone.now()
        self.save()
    
    def process(self, officer=None):
        """Bắt đầu xử lý yêu cầu"""
        self.status = 'processing'
        if officer:
            self.officer = officer
        self.save()
    
    def approve(self):
        """Phê duyệt yêu cầu"""
        self.status = 'approved'
        self.processed_at = timezone.now()
        self.save()
    
    def reject(self, reason):
        """Từ chối yêu cầu"""
        self.status = 'rejected'
        self.rejection_reason = reason
        self.processed_at = timezone.now()
        self.save() 