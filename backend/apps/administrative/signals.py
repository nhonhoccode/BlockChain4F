from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import uuid

from apps.administrative.models.request import AdminRequest
from apps.administrative.models.document import Document

@receiver(post_save, sender=AdminRequest)
def auto_connect_document_to_completed_request(sender, instance, created, **kwargs):
    """
    Tự động tạo và kết nối document khi một yêu cầu được đánh dấu là hoàn thành
    """
    # Chỉ xử lý khi yêu cầu có trạng thái 'completed' và chưa có document
    if instance.status == 'completed' and not instance.resulting_document:
        try:
            # Tạo document mới
            document_id = f"DOC-REF-{instance.request_id}"
            
            # Xác định loại document
            doc_type = instance.document_type.code if hasattr(instance.document_type, 'code') else instance.request_id.split('-')[0]
            
            # Tạo tiêu đề và mô tả
            title = f"Giấy tờ từ yêu cầu {instance.reference_number or instance.request_id}"
            desc = instance.description or f"Giấy tờ được tạo từ yêu cầu {instance.request_id}"
            
            # Xác định người cấp giấy tờ
            officer = instance.assigned_officer or instance.approver
            
            # Tạo document mới
            document = Document.objects.create(
                document_id=document_id,
                document_type=doc_type,
                title=title,
                description=desc,
                status='active',
                citizen=instance.requestor,
                issued_by=officer,
                issue_date=instance.completed_date or timezone.now().date(),
                valid_from=instance.completed_date or timezone.now().date(),
                blockchain_status=True,
                blockchain_tx_id=f'TX-{uuid.uuid4().hex[:16]}',
                blockchain_timestamp=timezone.now()
            )
            
            # Cập nhật request với document mới
            instance.resulting_document = document
            
            # Lưu lại nhưng tránh gọi lại signal này để tránh vòng lặp vô hạn
            AdminRequest.objects.filter(id=instance.id).update(resulting_document=document)
            
            print(f"Đã tự động tạo document {document.document_id} cho yêu cầu {instance.request_id}")
            
        except Exception as e:
            print(f"Lỗi khi tự động tạo document cho yêu cầu {instance.request_id}: {str(e)}") 