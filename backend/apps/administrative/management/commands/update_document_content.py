from django.core.management.base import BaseCommand
from apps.administrative.models import Document
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Cập nhật nội dung mẫu cho tất cả các document hiện có'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Cập nhật cả các document đã có nội dung')

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        # Lấy tất cả document hiện có
        if force:
            documents = Document.objects.all()
            self.stdout.write(f'Tìm thấy {documents.count()} documents để cập nhật (bao gồm cả document đã có nội dung)')
        else:
            documents = Document.objects.filter(content__isnull=True) | Document.objects.filter(content={})
            self.stdout.write(f'Tìm thấy {documents.count()} documents không có nội dung để cập nhật')
        
        count_updated = 0
        
        for doc in documents:
            # Tạo nội dung mẫu tùy theo loại document
            doc_type = doc.document_type or 'OTHER'
            sample_content = {}
            
            if 'CMND' in doc_type or 'CCCD' in doc_type:
                sample_content = {
                    'fullName': f"{doc.citizen.first_name} {doc.citizen.last_name}" if doc.citizen else "Nguyễn Văn A",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'permanentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'idNumber': f"0{random.randint(10000000, 99999999)}",
                    'issueDate': doc.issue_date.strftime('%Y-%m-%d') if doc.issue_date else timezone.now().strftime('%Y-%m-%d'),
                    'issuePlace': 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư'
                }
            elif 'DKKH' in doc_type:
                sample_content = {
                    'fullName': f"{doc.citizen.first_name} {doc.citizen.last_name}" if doc.citizen else "Nguyễn Văn A",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'permanentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'currentAddress': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'registrationDate': doc.issue_date.strftime('%Y-%m-%d') if doc.issue_date else timezone.now().strftime('%Y-%m-%d'),
                    'householdMembers': [
                        {'fullName': f"{doc.citizen.first_name} {doc.citizen.last_name}" if doc.citizen else "Nguyễn Văn A", 'relationship': 'Chủ hộ'},
                        {'fullName': 'Nguyễn Thị B', 'relationship': 'Vợ'},
                        {'fullName': 'Nguyễn Văn C', 'relationship': 'Con'}
                    ]
                }
            elif 'GCT' in doc_type:
                sample_content = {
                    'fullName': f"{doc.citizen.first_name} {doc.citizen.last_name}" if doc.citizen else "Nguyễn Văn A",
                    'dateOfBirth': '1990-01-01',
                    'dateOfDeath': doc.issue_date.strftime('%Y-%m-%d') if doc.issue_date else timezone.now().strftime('%Y-%m-%d'),
                    'placeOfDeath': 'Bệnh viện XYZ, Thành phố HCM',
                    'causeOfDeath': 'Tự nhiên',
                    'declarerName': 'Nguyễn Thị B',
                    'declarerRelationship': 'Vợ',
                    'declarationDate': doc.issue_date.strftime('%Y-%m-%d') if doc.issue_date else timezone.now().strftime('%Y-%m-%d')
                }
            else:
                sample_content = {
                    'fullName': f"{doc.citizen.first_name} {doc.citizen.last_name}" if doc.citizen else "Nguyễn Văn A",
                    'dateOfBirth': '1990-01-01',
                    'gender': 'Nam',
                    'address': 'Phường XYZ, Quận ABC, Thành phố HCM',
                    'documentPurpose': 'Xác nhận thông tin cá nhân',
                    'validFrom': doc.issue_date.strftime('%Y-%m-%d') if doc.issue_date else timezone.now().strftime('%Y-%m-%d')
                }
            
            # Cập nhật document
            doc.content = sample_content
            
            # Thêm thông tin blockchain nếu chưa có
            if not doc.blockchain_status:
                doc.blockchain_status = True
                doc.blockchain_tx_id = f"0x{''.join([random.choice('0123456789abcdef') for _ in range(64)])}"
                doc.blockchain_timestamp = timezone.now()
            
            doc.save()
            count_updated += 1
            self.stdout.write(f'Đã cập nhật document {doc.document_id} ({doc.id})')
        
        self.stdout.write(self.style.SUCCESS(f'Hoàn thành: đã cập nhật {count_updated}/{documents.count()} documents')) 