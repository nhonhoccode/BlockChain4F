from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from apps.accounts.models import User
from apps.administrative.models.document import Document
from apps.administrative.models.request import AdminRequest
import uuid

class Command(BaseCommand):
    help = 'Đảm bảo tất cả các documents từ yêu cầu đã hoàn thành được liên kết với công dân'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Xử lý lại tất cả các documents ngay cả khi đã liên kết')

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        # Lấy danh sách các yêu cầu đã hoàn thành
        completed_requests = AdminRequest.objects.filter(status='completed')
        self.stdout.write(f"Tìm thấy {completed_requests.count()} yêu cầu đã hoàn thành")
        
        # Đếm số yêu cầu đã được liên kết với document
        linked_requests = completed_requests.filter(resulting_document__isnull=False)
        self.stdout.write(f"Trong đó có {linked_requests.count()} yêu cầu đã có document")
        
        # Đếm số yêu cầu chưa được liên kết với document
        unlinked_requests = completed_requests.filter(resulting_document__isnull=True)
        self.stdout.write(f"Còn {unlinked_requests.count()} yêu cầu chưa có document")
        
        documents_updated = 0
        documents_created = 0
        
        # Xử lý các yêu cầu đã hoàn thành
        for request in completed_requests:
            # Xử lý các yêu cầu đã có document
            if request.resulting_document:
                if force:
                    # Cập nhật document hiện tại để đảm bảo đã liên kết với công dân
                    document = request.resulting_document
                    if not document.citizen and request.requestor:
                        document.citizen = request.requestor
                        document.save()
                        self.stdout.write(f"Đã cập nhật citizen cho document {document.document_id}")
                        documents_updated += 1
                    else:
                        self.stdout.write(f"Document {document.document_id} đã được liên kết đúng với công dân")
                continue
            
            # Xử lý các yêu cầu chưa có document
            try:
                # Tạo document mới
                document_id = f"DOC-REF-{request.request_id}"
                
                # Xác định loại document
                doc_type = request.document_type.code if hasattr(request.document_type, 'code') else request.request_id.split('-')[0]
                
                # Tạo tiêu đề và mô tả
                title = f"Giấy tờ từ yêu cầu {request.reference_number or request.request_id}"
                desc = request.description or f"Giấy tờ được tạo từ yêu cầu {request.request_id}"
                
                # Xác định người cấp giấy tờ
                officer = request.assigned_officer or request.approver
                if not officer:
                    officer = User.objects.filter(is_staff=True).first()
                
                # Tạo document mới
                document = Document.objects.create(
                    document_id=document_id,
                    document_type=doc_type,
                    title=title,
                    description=desc,
                    status='active',
                    citizen=request.requestor,
                    issued_by=officer,
                    issue_date=request.completed_date or timezone.now().date(),
                    valid_from=request.completed_date or timezone.now().date(),
                    blockchain_status=True,
                    blockchain_tx_id=f'TX-{uuid.uuid4().hex[:16]}',
                    blockchain_timestamp=timezone.now()
                )
                
                # Liên kết document với request
                request.resulting_document = document
                request.save()
                
                self.stdout.write(f"Đã tạo document mới {document.document_id} cho yêu cầu {request.request_id}")
                documents_created += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Lỗi khi xử lý yêu cầu {request.request_id}: {str(e)}"))
        
        # Kiểm tra các documents có citizen không
        orphan_documents = Document.objects.filter(citizen__isnull=True)
        if orphan_documents.exists():
            self.stdout.write(f"Tìm thấy {orphan_documents.count()} documents không có công dân")
            
            # Tìm các yêu cầu có documents này
            for document in orphan_documents:
                try:
                    # Tìm request liên quan
                    request = AdminRequest.objects.filter(resulting_document=document).first()
                    if request and request.requestor:
                        document.citizen = request.requestor
                        document.save()
                        self.stdout.write(f"Đã liên kết document {document.document_id} với công dân {request.requestor.id}")
                        documents_updated += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Lỗi khi xử lý document {document.document_id}: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS(f"Hoàn thành: đã cập nhật {documents_updated} documents và tạo {documents_created} documents mới")) 