from django.core.management.base import BaseCommand
from apps.administrative.models import Document, Request
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Create real documents from completed requests'

    def handle(self, *args, **options):
        completed_requests = Request.objects.filter(status='completed')

        for request in completed_requests:
            # Tạo một document mới từ request đã hoàn thành
            document_id = f"DOC-REF-{request.request_id}"
            
            # Lấy thông tin document type từ request
            doc_type = request.document_type or 'OTHER'
            
            # Tạo nội dung mẫu tùy theo loại giấy tờ
            sample_content = {}
            if 'CMND' in doc_type or 'CCCD' in doc_type:
                sample_content = {
                    'fullName': f"{request.citizen.first_name} {request.citizen.last_name}",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'permanentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'idNumber': f"0{random.randint(10000000, 99999999)}",
                    'issueDate': request.completed_date.strftime('%Y-%m-%d') if request.completed_date else timezone.now().strftime('%Y-%m-%d'),
                    'issuePlace': 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư'
                }
            elif 'DKKH' in doc_type:
                sample_content = {
                    'fullName': f"{request.citizen.first_name} {request.citizen.last_name}",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'permanentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'currentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'registrationDate': request.completed_date.strftime('%Y-%m-%d') if request.completed_date else timezone.now().strftime('%Y-%m-%d'),
                    'householdMembers': [
                        {'fullName': f"{request.citizen.first_name} {request.citizen.last_name}", 'relationship': 'Chủ hộ'},
                        {'fullName': 'Nguyễn Thị B', 'relationship': 'Vợ'},
                        {'fullName': 'Nguyễn Văn C', 'relationship': 'Con'}
                    ]
                }
            elif 'GCT' in doc_type:
                sample_content = {
                    'fullName': f"{request.citizen.first_name} {request.citizen.last_name}",
                    'dateOfBirth': '1990-01-01',
                    'dateOfDeath': request.completed_date.strftime('%Y-%m-%d') if request.completed_date else timezone.now().strftime('%Y-%m-%d'),
                    'placeOfDeath': 'Bệnh viện XYZ, Thành phố HCM',
                    'causeOfDeath': 'Tự nhiên',
                    'declarerName': 'Nguyễn Thị B',
                    'declarerRelationship': 'Vợ',
                    'declarationDate': request.completed_date.strftime('%Y-%m-%d') if request.completed_date else timezone.now().strftime('%Y-%m-%d')
                }
            else:
                sample_content = {
                    'fullName': f"{request.citizen.first_name} {request.citizen.last_name}",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'address': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'documentPurpose': 'Xác nhận thông tin cá nhân',
                    'validFrom': request.completed_date.strftime('%Y-%m-%d') if request.completed_date else timezone.now().strftime('%Y-%m-%d')
                }
            
            document = Document.objects.create(
                document_id=document_id,
                document_type=doc_type,
                title=f"Giấy tờ từ yêu cầu REF-{request.request_id}",
                description=request.description,
                content=sample_content,  # Thêm nội dung mẫu cho giấy tờ
                citizen=request.citizen,
                issued_by=request.approver or request.assigned_officer,
                issue_date=request.completed_date or timezone.now().date(),
                valid_from=request.completed_date or timezone.now().date(),
                status='active'
            )