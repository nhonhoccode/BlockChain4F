import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.administrative.models import Document, DocumentType
from apps.accounts.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Create mock documents for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email of the user to create documents for',
            default='nhon1@gmail.com'
        )
        parser.add_argument(
            '--count',
            type=int,
            help='Number of documents to create',
            default=5
        )

    def handle(self, *args, **options):
        user_email = options['user_email']
        count = options['count']
        
        try:
            # Find the user
            user = User.objects.get(email=user_email)
            self.stdout.write(f"Found user: {user.email}")
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with email {user_email} not found"))
            return

        # Sample document types and data
        document_samples = [
            {
                'title': 'Giấy khai sinh',
                'document_type': 'birth_certificate',
                'description': 'Giấy khai sinh của công dân',
                'status': 'active',
                'content': {
                    'fullName': 'Nguyễn Văn A',
                    'dateOfBirth': '1990-05-15',
                    'placeOfBirth': 'TP. Hồ Chí Minh',
                    'fatherName': 'Nguyễn Văn B',
                    'motherName': 'Trần Thị C'
                }
            },
            {
                'title': 'Chứng minh nhân dân',
                'document_type': 'id_card',
                'description': 'Chứng minh nhân dân của công dân',
                'status': 'active',
                'content': {
                    'fullName': 'Nguyễn Văn A',
                    'idNumber': '079090012345',
                    'dateOfBirth': '1990-05-15',
                    'permanentAddress': '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM'
                }
            },
            {
                'title': 'Giấy đăng ký kết hôn',
                'document_type': 'marriage_certificate',
                'description': 'Giấy đăng ký kết hôn',
                'status': 'active',
                'content': {
                    'husbandName': 'Nguyễn Văn A',
                    'wifeName': 'Trần Thị B',
                    'marriageDate': '2020-06-20',
                    'marriagePlace': 'UBND Quận 1, TP.HCM'
                }
            },
            {
                'title': 'Xác nhận thường trú',
                'document_type': 'residence_certificate',
                'description': 'Xác nhận đăng ký thường trú',
                'status': 'active',
                'content': {
                    'fullName': 'Nguyễn Văn A',
                    'permanentAddress': '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
                    'registrationDate': '2021-01-15'
                }
            },
            {
                'title': 'Xác nhận tạm trú',
                'document_type': 'temporary_residence',
                'description': 'Xác nhận tạm trú 6 tháng',
                'status': 'active',
                'content': {
                    'fullName': 'Nguyễn Văn A',
                    'temporaryAddress': '456 Đường DEF, Phường ABC, Quận 2, TP.HCM',
                    'duration': '6 tháng',
                    'startDate': '2024-01-01'
                }
            }
        ]

        # Create documents
        created_count = 0
        for i in range(min(count, len(document_samples))):
            sample = document_samples[i]
            
            # Generate unique document ID
            doc_id = f"{sample['document_type'].upper()}-{datetime.now().strftime('%Y%m%d')}-{i+1:03d}"
            
            # Random dates
            issued_date = datetime.now() - timedelta(days=random.randint(30, 365))
            valid_until = None
            if sample['document_type'] == 'id_card':
                valid_until = issued_date + timedelta(days=365*10)  # ID cards valid for 10 years
            elif sample['document_type'] == 'temporary_residence':
                valid_until = issued_date + timedelta(days=180)  # 6 months
            
            # Create document
            document = Document.objects.create(
                citizen=user,
                document_id=doc_id,
                title=sample['title'],
                document_type=sample['document_type'],
                description=sample['description'],
                status=sample['status'],
                issue_date=issued_date.date(),
                valid_from=issued_date.date(),
                valid_until=valid_until.date() if valid_until else None,
                content=sample['content'],
                blockchain_status=random.choice([True, False]),
                blockchain_tx_id=f"0x{''.join(random.choices('0123456789abcdef', k=64))}" if random.choice([True, False]) else None,
                blockchain_timestamp=issued_date if random.choice([True, False]) else None
            )
            
            created_count += 1
            self.stdout.write(f"Created document: {document.document_id} - {document.title}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} mock documents for {user.email}')
        ) 