from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.administrative.models.document import Document
from apps.administrative.models.request import AdminRequest
import random

class Command(BaseCommand):
    help = 'Connects completed requests to documents'

    def handle(self, *args, **options):
        # Lấy danh sách yêu cầu đã hoàn thành
        completed_requests = AdminRequest.objects.filter(status='completed')
        
        if not completed_requests.exists():
            self.stdout.write(self.style.WARNING('No completed requests found.'))
            return
        
        # Lấy danh sách documents
        documents = Document.objects.all()
        
        if not documents.exists():
            self.stdout.write(self.style.WARNING('No documents found.'))
            return
        
        # Tìm documents chưa được kết nối với request
        unlinked_documents = documents.filter(source_request__isnull=True)
        
        connected_count = 0
        created_count = 0
        
        # Kết nối documents với requests
        for request in completed_requests:
            # Tìm xem đã có document nào liên kết với request này chưa
            existing_document = Document.objects.filter(source_request=request).first()
            
            if existing_document:
                self.stdout.write(self.style.SUCCESS(f'Request {request.id} already has linked document {existing_document.document_id}'))
                continue
            
            # Kiểm tra nếu request đã có resulting_document
            if request.resulting_document:
                self.stdout.write(self.style.SUCCESS(f'Request {request.id} already has resulting document {request.resulting_document.document_id}'))
                continue
            
            # Nếu còn documents chưa liên kết, dùng một document
            if unlinked_documents.exists():
                document = unlinked_documents.first()
                
                # Cập nhật document với thông tin từ request
                document.citizen = request.requestor
                document.document_type = request.document_type.code if hasattr(request.document_type, 'code') else 'other'
                document.title = request.title or f"{request.document_type.name if request.document_type else 'Document'}"
                document.save()
                
                # Cập nhật request với document này
                request.resulting_document = document
                request.save()
                
                # Xóa document khỏi danh sách unlinked
                unlinked_documents = unlinked_documents.exclude(id=document.id)
                
                self.stdout.write(self.style.SUCCESS(f'Connected document {document.document_id} to request {request.id}'))
                connected_count += 1
            else:
                # Tạo document mới cho request
                document_type = request.document_type.code if hasattr(request.document_type, 'code') else 'other'
                document_title = request.title or f"{request.document_type.name if request.document_type else 'Document'}"
                
                # Tìm officer để gán là người cấp giấy tờ
                officer = request.assigned_officer or request.approver or User.objects.filter(is_staff=True).first()
                
                document = Document.objects.create(
                    document_id=f'DOC-{request.reference_number}',
                    document_type=document_type,
                    title=document_title,
                    description=request.description or f"Generated from request {request.reference_number}",
                    status='active',
                    citizen=request.requestor,
                    issued_by=officer,
                    issue_date=request.completed_date or timezone.now().date(),
                    valid_from=timezone.now().date(),
                    blockchain_status=False
                )
                
                # Cập nhật request với document mới
                request.resulting_document = document
                request.save()
                
                self.stdout.write(self.style.SUCCESS(f'Created new document {document.document_id} for request {request.id}'))
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully connected {connected_count} documents and created {created_count} new documents for completed requests')) 