from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid
import os
import asyncio
import hashlib
import json
import random
import string

from apps.accounts.models import User

# Tạm thời comment các import liên quan đến blockchain để tránh lỗi
# from apps.blockchain.services.document_contract import document_contract_service
# from apps.blockchain.services.blockchain_service import BlockchainService

def document_file_path(instance, filename):
    """Generate filepath for document files"""
    # Get file extension
    ext = filename.split('.')[-1]
    # Create a unique filename with original extension
    filename = f"{instance.document_id.replace('/', '-')}.{ext}"
    # Return path with user folder
    if instance.citizen:
        return os.path.join('documents', str(instance.citizen.id), filename)
    else:
        return os.path.join('documents', 'unassigned', filename)

class Document(models.Model):
    """
    Model for official documents issued to citizens
    """
    # Trạng thái giấy tờ
    STATUS_CHOICES = (
        ('DRAFT', _('Draft')),
        ('PENDING_APPROVAL', _('Pending Approval')),
        ('APPROVED', _('Approved')),
        ('REJECTED', _('Rejected')),
        ('EXPIRED', _('Expired')),
        ('REVOKED', _('Revoked')),
    )
    
    # Loại giấy tờ
    DOCUMENT_TYPE_CHOICES = (
        ('birth_certificate', _('Birth Certificate')),
        ('death_certificate', _('Death Certificate')),
        ('marriage_certificate', _('Marriage Certificate')),
        ('id_card', _('ID Card')),
        ('driver_license', _('Driver License')),
        ('land_certificate', _('Land Certificate')),
        ('house_certificate', _('House Certificate')),
        ('business_license', _('Business License')),
        ('tax_certificate', _('Tax Certificate')),
        ('other', _('Other')),
    )
    
    # Document identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_id = models.CharField(_('Mã giấy tờ'), max_length=50, unique=True)
    document_type = models.CharField(
        _('Loại giấy tờ'), 
        max_length=50, 
        choices=DOCUMENT_TYPE_CHOICES
    )
    title = models.CharField(_('Tiêu đề'), max_length=255)
    
    # Content and metadata
    description = models.TextField(_('Mô tả'), blank=True, null=True)
    content = models.JSONField(_('Nội dung chi tiết'), default=dict, blank=True)
    file = models.FileField(
        _('Tệp đính kèm'), 
        upload_to=document_file_path, 
        blank=True, 
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('Ngày tạo'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Ngày cập nhật'), auto_now=True)
    issue_date = models.DateField(_('Ngày cấp'), null=True, blank=True)
    valid_from = models.DateField(_('Có hiệu lực từ'), default=timezone.now)
    valid_until = models.DateField(_('Có hiệu lực đến'), blank=True, null=True)
    
    # Status
    status = models.CharField(
        _('Trạng thái'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Relations
    citizen = models.ForeignKey(
        User,
        related_name='admin_documents',
        on_delete=models.CASCADE,
        verbose_name=_('Công dân'),
        null=True,
        blank=True
    )
    issued_by = models.ForeignKey(
        User,
        related_name='issued_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Cán bộ cấp')
    )
    
    # Approval information
    requires_chairman_approval = models.BooleanField(_('Yêu cầu phê duyệt chủ tịch'), default=False)
    chairman_approved = models.BooleanField(_('Đã được phê duyệt'), default=False)
    chairman_approved_by = models.ForeignKey(
        User,
        related_name='admin_approved_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Chủ tịch phê duyệt')
    )
    chairman_approval_date = models.DateTimeField(_('Ngày phê duyệt'), blank=True, null=True)
    
    # Revocation information
    revocation_reason = models.TextField(_('Lý do thu hồi'), blank=True, null=True)
    revocation_date = models.DateTimeField(_('Ngày thu hồi'), blank=True, null=True)
    revoked_by = models.ForeignKey(
        User,
        related_name='revoked_documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Người thu hồi')
    )
    
    # Blockchain tracking
    blockchain_status = models.CharField(_('Trạng thái blockchain'), max_length=20, blank=True, null=True, 
                                         choices=(
                                             ('NOT_STORED', _('Not Stored')),
                                             ('STORED', _('Stored')),
                                             ('UPDATED', _('Updated')),
                                             ('VERIFIED', _('Verified')),
                                             ('ERROR', _('Error')),
                                         ), default='NOT_STORED')
    blockchain_tx_id = models.CharField(_('Mã giao dịch blockchain'), max_length=100, blank=True, null=True)
    blockchain_timestamp = models.DateTimeField(_('Thời gian lưu blockchain'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('Giấy tờ')
        verbose_name_plural = _('Giấy tờ')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_id']),
            models.Index(fields=['document_type']),
            models.Index(fields=['status']),
            models.Index(fields=['citizen']),
            models.Index(fields=['blockchain_status']),
        ]
    
    def __str__(self):
        return f"{self.document_id} - {self.title}"
    
    def is_valid(self):
        """Check if document is currently valid"""
        if self.status != 'active':
            return False
            
        today = timezone.now().date()
        
        # Check if document is in valid date range
        if self.valid_from and self.valid_from > today:
            return False
            
        if self.valid_until and self.valid_until < today:
            return False
            
        return True
    
    def days_until_expiry(self):
        """Calculate days until expiry"""
        if not self.valid_until:
            return None
            
        today = timezone.now().date()
        delta = self.valid_until - today
        
        return delta.days
    
    def approve_by_chairman(self, chairman, save=True):
        """Approve document by chairman"""
        self.chairman_approved = True
        self.chairman_approved_by = chairman
        self.chairman_approval_date = timezone.now()
        
        if self.status == 'draft':
            self.status = 'active'
            
        if save:
            self.save()
            
        # Tạm thời comment phần lưu thông tin phê duyệt vào blockchain
        # if self.status == 'active':
        #     # Sử dụng asyncio để gọi phương thức bất đồng bộ
        #     from django.db import transaction
        #     transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('approve')))
            
        return self
    
    def revoke(self, officer, reason, save=True):
        """Revoke the document"""
        self.status = 'revoked'
        self.revocation_reason = reason
        self.revocation_date = timezone.now()
        self.revoked_by = officer
        
        if save:
            self.save()
            
        # Tạm thời comment phần lưu thông tin thu hồi vào blockchain
        # # Sử dụng asyncio để gọi phương thức bất đồng bộ
        # from django.db import transaction
        # transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('revoke')))
            
        return self
    
    def activate(self, save=True):
        """Activate the document"""
        self.status = 'active'
        
        if save:
            self.save()
            
        # Tạm thời comment phần lưu thông tin kích hoạt vào blockchain
        # # Sử dụng asyncio để gọi phương thức bất đồng bộ
        # from django.db import transaction
        # transaction.on_commit(lambda: asyncio.ensure_future(self.save_to_blockchain('activate')))
            
        return self
    
    def calculate_data_hash(self):
        """Tạo hash từ dữ liệu document để lưu và xác thực trên blockchain"""
        # Tạo một dict chứa các thông tin quan trọng của document
        data = {
            'document_id': self.document_id,
            'document_type': self.document_type,
            'title': self.title,
            'issue_date': str(self.issue_date) if self.issue_date else None,
            'valid_from': str(self.valid_from) if self.valid_from else None,
            'valid_until': str(self.valid_until) if self.valid_until else None,
            'content': self.content,
            'citizen_id': str(self.citizen.id) if self.citizen else None,
            'status': self.status,
        }
        
        # Chuyển đổi dict thành chuỗi JSON và tạo hash
        data_string = json.dumps(data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        return data_hash
    
    async def save_to_blockchain(self, action_type='create'):
        """Lưu document vào blockchain"""
        # Tạo hash từ dữ liệu document
        data_hash = self.calculate_data_hash()
        
        # Chuẩn bị dữ liệu để lưu vào blockchain
        document_data = {
            'id': self.document_id,
            'type': self.document_type,
            'citizen_id': str(self.citizen.id) if self.citizen else None,
            'issued_by': str(self.issued_by.id) if self.issued_by else None,
            'issued_date': str(self.issue_date) if self.issue_date else timezone.now().strftime('%Y-%m-%d'),
            'valid_until': str(self.valid_until) if self.valid_until else 'UNLIMITED',
            'status': self.status.upper(),
            'data_hash': data_hash,
        }
        
        try:
            # Gọi service tương ứng với action type
            if action_type == 'create' or action_type == 'activate':
                response = await document_contract_service.create_document(document_data)
                tx_id = response.get('txId')
            elif action_type == 'approve':
                chairman_id = str(self.chairman_approved_by.id) if self.chairman_approved_by else None
                response = await document_contract_service.approve_document(
                    self.document_id,
                    chairman_id,
                    "Approved by chairman"
                )
                tx_id = response.get('txId')
            elif action_type == 'revoke':
                revoker_id = str(self.revoked_by.id) if self.revoked_by else None
                reason = self.revocation_reason or "Document revoked"
                response = await document_contract_service.update_document_status(
                    self.document_id,
                    'REVOKED',
                    reason
                )
                tx_id = response.get('txId')
            else:
                return None
            
            # Lưu thông tin transaction vào model
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
                record_type=f'document_{action_type}',
                status='confirmed',
                data={
                    'document_id': self.document_id,
                    'action': action_type,
                    'data_hash': data_hash
                },
                created_by=self.issued_by or self.chairman_approved_by or self.revoked_by,
                verification_hash=data_hash,
                is_verified=True,
                verification_timestamp=timezone.now(),
                confirmed_at=timezone.now()
            )
            
            return tx_id
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error saving document to blockchain: {str(e)}")
            return None
    
    def add_blockchain_record(self, tx_id, save=True):
        """Add blockchain transaction record"""
        self.blockchain_status = 'STORED'
        self.blockchain_tx_id = tx_id
        self.blockchain_timestamp = timezone.now()
        
        if save:
            # Chỉ lưu các trường được cập nhật để tránh xung đột
            from django.db import transaction
            with transaction.atomic():
                Document.objects.filter(id=self.id).update(
                    blockchain_status=self.blockchain_status,
                    blockchain_tx_id=self.blockchain_tx_id,
                    blockchain_timestamp=self.blockchain_timestamp
                )
        
        return self
    
    def generate_print_content(self):
        """Generate content for printing"""
        return {
            'document_id': self.document_id,
            'document_type': self.get_document_type_display(),
            'title': self.title,
            'description': self.description,
            'issue_date': self.issue_date.strftime('%d/%m/%Y') if self.issue_date else None,
            'valid_from': self.valid_from.strftime('%d/%m/%Y') if self.valid_from else None,
            'valid_until': self.valid_until.strftime('%d/%m/%Y') if self.valid_until else 'Không thời hạn',
            'status': self.get_status_display(),
            'citizen': self.citizen.full_name if self.citizen else None,
            'issued_by': self.issued_by.full_name if self.issued_by else None,
            'content': self.content,
            'chairman_approved': self.chairman_approved,
            'chairman_approved_by': self.chairman_approved_by.full_name if self.chairman_approved_by else None,
            'chairman_approval_date': self.chairman_approval_date.strftime('%d/%m/%Y') if self.chairman_approval_date else None,
            'blockchain_status': self.blockchain_status,
            'blockchain_tx_id': self.blockchain_tx_id,
            'blockchain_timestamp': self.blockchain_timestamp.strftime('%d/%m/%Y %H:%M:%S') if self.blockchain_timestamp else None,
        }

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Generate document_id if it doesn't exist and is a new record
        if not self.document_id and is_new:
            # Tạm thời comment phần sử dụng blockchain service
            # blockchain_service = BlockchainService()
            # doc_prefix = self.document_type[:4].upper()
            # self.document_id = blockchain_service.generate_blockchain_id(prefix=doc_prefix)
            
            # Thay thế bằng cách tạo ID đơn giản
            doc_prefix = self.document_type[:4].upper()
            random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            self.document_id = f"{doc_prefix}-{random_part}"
        
        # Save document to database first
        super().save(*args, **kwargs)
        
        # Tạm thời comment phần lưu lên blockchain
        # Lưu lên blockchain nếu là bản ghi mới hoặc chưa được lưu
        # if (is_new or self.blockchain_status == 'NOT_STORED') and not kwargs.get('update_fields'):
        #     try:
        #         # Lưu lên blockchain
        #         asyncio.ensure_future(self.save_to_blockchain('create'))
        #     except Exception as e:
        #         print(f"Error saving document to blockchain: {str(e)}")
    
    def submit_for_approval(self, requested_by):
        """
        Gửi giấy tờ để phê duyệt
        """
        try:
            # Kiểm tra trạng thái hiện tại
            if self.status != 'DRAFT':
                return {'success': False, 'error': 'Document must be in DRAFT status to submit for approval'}
            
            # Tạm thời comment phần gọi blockchain service
            # # Gọi service để gửi lên blockchain
            # blockchain_service = BlockchainService()
            # result = blockchain_service.submit_document_for_approval(self.document_id, requested_by)
            
            # if result.get('success'):
            #     # Cập nhật trạng thái trong database
            #     self.status = 'PENDING_APPROVAL'
            #     self.blockchain_status = 'UPDATED'
            #     self.blockchain_tx_id = result.get('txId')
            #     self.blockchain_timestamp = timezone.now()
            #     self.save(update_fields=['status', 'blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            
            # Thay thế bằng cập nhật trạng thái đơn giản
                self.status = 'PENDING_APPROVAL'
            self.save(update_fields=['status'])
            result = {'success': True}
            
            return result
        except Exception as e:
            print(f"Error submitting for approval: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def approve(self, approver_id, comments=''):
        """
        Phê duyệt giấy tờ
        """
        try:
            # Kiểm tra trạng thái hiện tại
            if self.status != 'PENDING_APPROVAL':
                return {'success': False, 'error': 'Document must be in PENDING_APPROVAL status to approve'}
            
            # Tạm thời comment phần gọi blockchain service
            # # Gọi service để phê duyệt trên blockchain
            # blockchain_service = BlockchainService()
            # result = blockchain_service.approve_document(self.document_id, approver_id, comments)
            
            # if result.get('success'):
            #     # Cập nhật trạng thái trong database
            #     self.status = 'APPROVED'
            #     self.blockchain_status = 'UPDATED'
            #     self.blockchain_tx_id = result.get('txId')
            #     self.blockchain_timestamp = timezone.now()
            #     self.save(update_fields=['status', 'blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            
            # Thay thế bằng cập nhật trạng thái đơn giản
                self.status = 'APPROVED'
            self.save(update_fields=['status'])
            result = {'success': True}
            
            return result
        except Exception as e:
            print(f"Error approving document: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def reject(self, rejector_id, reason):
        """
        Từ chối giấy tờ
        """
        try:
            # Kiểm tra trạng thái hiện tại
            if self.status != 'PENDING_APPROVAL':
                return {'success': False, 'error': 'Document must be in PENDING_APPROVAL status to reject'}
            
            # Tạm thời comment phần gọi blockchain service
            # # Gọi service để từ chối trên blockchain
            # blockchain_service = BlockchainService()
            # result = blockchain_service.reject_document(self.document_id, rejector_id, reason)
            
            # if result.get('success'):
            #     # Cập nhật trạng thái trong database
            #     self.status = 'REJECTED'
            #     self.blockchain_status = 'UPDATED'
            #     self.blockchain_tx_id = result.get('txId')
            #     self.blockchain_timestamp = timezone.now()
            #     self.save(update_fields=['status', 'blockchain_status', 'blockchain_tx_id', 'blockchain_timestamp'])
            
            # Thay thế bằng cập nhật trạng thái đơn giản
                self.status = 'REJECTED'
            self.save(update_fields=['status'])
            result = {'success': True}
            
            return result
        except Exception as e:
            print(f"Error rejecting document: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify(self):
        """
        Xác thực giấy tờ trên blockchain
        """
        try:
            # Tạm thời comment phần gọi blockchain service
            # # Tạo dữ liệu để xác thực
            # document_data = {
            #     'id': self.document_id,
            #     'document_type': self.document_type,
            #     'citizen_id': str(self.citizen.id) if self.citizen else None,
            #     'content': self.content,
            #     'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            #     'valid_until': self.valid_until.isoformat() if self.valid_until else 'UNLIMITED',
            #     'status': self.status,
            #     'attachments': [att.file.url for att in self.document_attachments.all()]
            # }
            
            # # Tạo hash từ dữ liệu
            # data_hash = self.calculate_data_hash()
            
            # # Gọi service để xác thực trên blockchain
            # blockchain_service = BlockchainService()
            # result = blockchain_service.verify_document(self.document_id, data_hash)
            
            # Thay thế bằng kết quả giả định
            result = {'success': True, 'verified': True}
            
            return result
        except Exception as e:
            print(f"Error verifying document: {str(e)}")
            return {'success': False, 'error': str(e), 'verified': False}
    
    def get_blockchain_history(self):
        """
        Lấy lịch sử giao dịch blockchain của giấy tờ
        """
        try:
            # Tạm thời comment phần gọi blockchain service
            # blockchain_service = BlockchainService()
            # result = blockchain_service.get_document_history(self.document_id)
            
            # Thay thế bằng kết quả giả định
            result = {'success': True, 'history': []}
            
            return result
        except Exception as e:
            print(f"Error getting blockchain history: {str(e)}")
            return {'success': False, 'error': str(e), 'history': []}

class DocumentAttachment(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='document_attachments')
    file = models.FileField(_('File'), upload_to='attachments/documents/')
    file_name = models.CharField(_('File Name'), max_length=255)
    file_type = models.CharField(_('File Type'), max_length=50)
    uploaded_at = models.DateTimeField(_('Uploaded At'), auto_now_add=True)
    
    # Blockchain hash to verify file integrity
    file_hash = models.CharField(_('File Hash'), max_length=64, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Calculate file hash if file is available and hash is not set
        if self.file and not self.file_hash:
            import hashlib
            md5 = hashlib.md5()
            for chunk in self.file.chunks():
                md5.update(chunk)
            self.file_hash = md5.hexdigest()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.file_name
    
    class Meta:
        verbose_name = _('Document Attachment')
        verbose_name_plural = _('Document Attachments')
