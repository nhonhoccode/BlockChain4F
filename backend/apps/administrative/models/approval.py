from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid
import asyncio
import hashlib
import json


class Approval(models.Model):
    """
    Model for tracking approval processes for administrative requests
    """
    STATUS_CHOICES = (
        ('pending', _('Đang chờ duyệt')),
        ('approved', _('Đã duyệt')),
        ('rejected', _('Đã từ chối')),
        ('cancelled', _('Đã hủy')),
    )
    
    TYPE_CHOICES = (
        ('document_issuance', _('Cấp giấy tờ')),
        ('document_modification', _('Sửa đổi giấy tờ')),
        ('document_revocation', _('Thu hồi giấy tờ')),
        ('officer_appointment', _('Bổ nhiệm cán bộ')),
        ('officer_removal', _('Miễn nhiệm cán bộ')),
        ('request_approval', _('Phê duyệt yêu cầu')),
        ('other', _('Khác')),
    )
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    approval_id = models.CharField(_('Mã phê duyệt'), max_length=50, unique=True)
    
    # Approval type and metadata
    approval_type = models.CharField(_('Loại phê duyệt'), max_length=50, choices=TYPE_CHOICES, default='request_approval')
    title = models.CharField(_('Tiêu đề'), max_length=255)
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    
    # Related content - using ContentType framework
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.CharField(_('ID đối tượng'), max_length=50, default='0')
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Status tracking
    status = models.CharField(_('Trạng thái'), max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Request info
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='requested_approvals',
        on_delete=models.CASCADE,
        verbose_name=_('Người yêu cầu')
    )
    requested_at = models.DateTimeField(_('Thời gian yêu cầu'), auto_now_add=True)
    
    # Approval info
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='approved_approvals',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Người phê duyệt')
    )
    approved_at = models.DateTimeField(_('Thời gian phê duyệt'), blank=True, null=True)
    rejection_reason = models.TextField(_('Lý do từ chối'), blank=True, null=True)
    
    # Blockchain tracking
    blockchain_status = models.BooleanField(_('Đã lưu blockchain'), default=False)
    blockchain_tx_id = models.CharField(_('Mã giao dịch blockchain'), max_length=100, blank=True, null=True)
    blockchain_timestamp = models.DateTimeField(_('Thời gian lưu blockchain'), blank=True, null=True)
    
    # Additional data
    metadata = models.JSONField(_('Metadata'), default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Phê duyệt')
        verbose_name_plural = _('Phê duyệt')
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['approval_id']),
            models.Index(fields=['status']),
            models.Index(fields=['approval_type']),
            models.Index(fields=['requested_by']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.approval_id} - {self.title} ({self.get_status_display()})"
    
    def approve(self, approver, save=True):
        """Approve the request"""
        self.status = 'approved'
        self.approved_by = approver
        self.approved_at = timezone.now()
        
        if save:
            self.save()
            
        # Lưu thông tin phê duyệt vào blockchain
        from django.db import transaction
        transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('approve')))
            
        return self
    
    def reject(self, approver, reason=None, save=True):
        """Reject the request"""
        self.status = 'rejected'
        self.approved_by = approver  # We still record who rejected it
        self.approved_at = timezone.now()
        self.rejection_reason = reason
        
        if save:
            self.save()
            
        # Lưu thông tin từ chối vào blockchain
        from django.db import transaction
        transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('reject')))
            
        return self
    
    def cancel(self, save=True):
        """Cancel the request"""
        self.status = 'cancelled'
        
        if save:
            self.save()
            
        # Lưu thông tin hủy vào blockchain
        from django.db import transaction
        transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('cancel')))
            
        return self
    
    def calculate_data_hash(self):
        """Tạo hash từ dữ liệu phê duyệt để lưu và xác thực trên blockchain"""
        # Tạo một dict chứa các thông tin quan trọng
        data = {
            'approval_id': self.approval_id,
            'approval_type': self.approval_type,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'object_id': self.object_id,
            'requested_by': str(self.requested_by.id),
            'requested_at': self.requested_at.isoformat() if self.requested_at else None,
            'approved_by': str(self.approved_by.id) if self.approved_by else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
        }
        
        # Chuyển đổi dict thành chuỗi JSON và tạo hash
        data_string = json.dumps(data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        return data_hash
    
    async def save_to_blockchain(self, action_type='create'):
        """Lưu thông tin phê duyệt vào blockchain"""
        # Import service ở đây để tránh circular import
        from apps.blockchain.services.admin_contract import admin_contract_service
        
        # Tạo hash từ dữ liệu
        data_hash = self.calculate_data_hash()
        
        try:
            if action_type == 'create':
                # Chuẩn bị dữ liệu để tạo approval request mới
                request_data = {
                    'id': self.approval_id,
                    'workflow_id': f"WORKFLOW-{self.approval_type}",
                    'object_id': self.object_id,
                    'object_type': self.content_type.model if self.content_type else 'unknown',
                    'requested_by': str(self.requested_by.id),
                    'details': json.dumps({
                        'title': self.title,
                        'description': self.description,
                        'data_hash': data_hash
                    }),
                    'status': 'PENDING',
                }
                
                # Gọi service để tạo approval request
                response = await admin_contract_service.create_approval_request(request_data)
                tx_id = response.get('txId')
                
            elif action_type in ['approve', 'reject', 'cancel']:
                # Chuyển đổi trạng thái
                status_map = {
                    'approve': 'APPROVED',
                    'reject': 'REJECTED',
                    'cancel': 'CANCELLED'
                }
                
                # Gọi service để cập nhật trạng thái
                response = await admin_contract_service.update_approval_request_status(
                    self.approval_id,
                    status_map[action_type],
                    str(self.approved_by.id) if self.approved_by else str(self.requested_by.id),
                    self.rejection_reason if action_type == 'reject' else None
                )
                tx_id = response.get('txId')
                
            else:
                return None
            
            # Cập nhật trạng thái blockchain
            self.add_blockchain_record(tx_id)
            
            # Lưu thông tin vào BlockchainRecord model
            from django.contrib.contenttypes.models import ContentType
            from apps.blockchain.models import BlockchainRecord
            
            content_type = ContentType.objects.get_for_model(self)
            
            BlockchainRecord.objects.create(
                transaction_id=tx_id,
                network='ethereum',
                content_type=content_type,
                object_id=str(self.id),
                record_type=f'approval_{action_type}',
                status='confirmed',
                data={
                    'approval_id': self.approval_id,
                    'action': action_type,
                    'data_hash': data_hash
                },
                created_by=self.approved_by if action_type in ['approve', 'reject'] else self.requested_by,
                verification_hash=data_hash,
                is_verified=True,
                verification_timestamp=timezone.now(),
                confirmed_at=timezone.now()
            )
            
            return tx_id
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error saving approval to blockchain: {str(e)}")
            return None
    
    def add_blockchain_record(self, tx_id, save=True):
        """Add blockchain transaction record"""
        self.blockchain_status = True
        self.blockchain_tx_id = tx_id
        self.blockchain_timestamp = timezone.now()
        
        if save:
            # Chỉ lưu các trường được cập nhật để tránh xung đột
            from django.db import transaction
            with transaction.atomic():
                Approval.objects.filter(id=self.id).update(
                    blockchain_status=self.blockchain_status,
                    blockchain_tx_id=self.blockchain_tx_id,
                    blockchain_timestamp=self.blockchain_timestamp
                )
        
        return self
    
    def save(self, *args, **kwargs):
        # Tạo approval_id nếu chưa có
        if not self.approval_id:
            date_prefix = timezone.now().strftime('%Y%m%d')
            
            # Tìm approval_id mới nhất trong ngày để tạo số thứ tự
            last_approval = Approval.objects.filter(
                approval_id__startswith=f"APR-{date_prefix}"
            ).order_by('approval_id').last()
            
            if last_approval:
                # Lấy số thứ tự từ approval_id cuối cùng và tăng thêm 1
                last_number = int(last_approval.approval_id.split('-')[-1])
                new_number = last_number + 1
            else:
                # Nếu không có approval nào trong ngày, bắt đầu từ 1
                new_number = 1
                
            # Tạo approval_id mới
            self.approval_id = f"APR-{date_prefix}-{new_number:03d}"
        
        # Gọi phương thức save ban đầu
        super().save(*args, **kwargs)
        
        # Lưu vào blockchain nếu đây là bản ghi mới và chưa có thông tin blockchain
        if not self.blockchain_status:
            # Sử dụng asyncio để gọi phương thức bất đồng bộ
            from django.db import transaction
            transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('create')))
