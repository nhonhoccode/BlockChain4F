from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.accounts.models import User

class Document(models.Model):
    STATUS_CHOICES = (
        ('draft', _('Nháp')),
        ('pending', _('Đang chờ')),
        ('processing', _('Đang xử lý')),
        ('approved', _('Đã phê duyệt')),
        ('rejected', _('Từ chối')),
        ('issued', _('Đã cấp')),
        ('revoked', _('Đã thu hồi')),
    )
    
    TYPE_CHOICES = (
        ('birth_certificate', _('Giấy khai sinh')),
        ('death_certificate', _('Giấy chứng tử')),
        ('marriage_certificate', _('Giấy chứng nhận kết hôn')),
        ('household_registration', _('Đăng ký hộ khẩu')),
        ('temporary_residence', _('Đăng ký tạm trú')),
        ('identification', _('Giấy tờ tùy thân')),
        ('land_use_right', _('Giấy chứng nhận quyền sử dụng đất')),
        ('business_license', _('Giấy phép kinh doanh')),
        ('other', _('Khác')),
    )
    
    title = models.CharField(_('Tiêu đề'), max_length=255)
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    document_type = models.CharField(_('Loại giấy tờ'), max_length=50, choices=TYPE_CHOICES)
    document_number = models.CharField(_('Số giấy tờ'), max_length=50, blank=True, null=True)
    content = models.TextField(_('Nội dung'), blank=True, null=True)
    
    issued_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blockchain_documents', verbose_name=_('Công dân'))
    issued_by = models.CharField(_('Cơ quan cấp'), max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_documents', verbose_name=_('Người tạo'))
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blockchain_approved_documents', verbose_name=_('Người phê duyệt'))
    
    issue_date = models.DateField(_('Ngày cấp'), blank=True, null=True)
    expiry_date = models.DateField(_('Ngày hết hạn'), blank=True, null=True)
    
    status = models.CharField(_('Trạng thái'), max_length=20, choices=STATUS_CHOICES, default='draft')
    is_verified = models.BooleanField(_('Đã xác minh blockchain'), default=False)
    blockchain_hash = models.CharField(_('Hash blockchain'), max_length=255, blank=True, null=True)
    
    metadata = models.JSONField(_('Metadata'), default=dict, blank=True)
    attachments = models.JSONField(_('Tệp đính kèm'), default=list, blank=True)
    
    created_at = models.DateTimeField(_('Ngày tạo'), default=timezone.now)
    updated_at = models.DateTimeField(_('Ngày cập nhật'), auto_now=True)
    
    class Meta:
        verbose_name = _('Giấy tờ')
        verbose_name_plural = _('Giấy tờ')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, self.status)
    
    @property
    def document_type_display(self):
        return dict(self.TYPE_CHOICES).get(self.document_type, self.document_type)
    
    @property
    def verification_status(self):
        if not self.is_verified:
            return 'Chưa xác minh'
        return 'Đã xác minh' 