from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.administrative.models import AdminRequest, Document
import random
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates test data for administrative requests and documents'

    def add_arguments(self, parser):
        parser.add_argument('--requests', type=int, default=10, help='Number of requests to create')
        parser.add_argument('--documents', type=int, default=5, help='Number of documents to create')

    def handle(self, *args, **options):
        num_requests = options['requests']
        num_documents = options['documents']
        
        # Create test users if they don't exist
        self.create_test_users()
        
        # Get users for data creation
        citizens = User.objects.filter(role='citizen')
        officers = User.objects.filter(role='officer')
        
        if not citizens.exists():
            self.stdout.write(self.style.ERROR('No citizen users found. Create users with citizen role first.'))
            return
            
        if not officers.exists():
            self.stdout.write(self.style.WARNING('No officer users found. Some data will be created without officer assignment.'))
        
        # Create test requests
        self.create_test_requests(citizens, officers, num_requests)
        
        # Create test documents
        self.create_test_documents(citizens, officers, num_documents)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {num_requests} requests and {num_documents} documents'))

    def create_test_users(self):
        """Create test users if they don't exist"""
        # Create citizen users
        if not User.objects.filter(username='citizen1').exists():
            User.objects.create_user(
                username='citizen1',
                email='citizen1@example.com',
                password='password123',
                first_name='Nguyễn',
                last_name='Văn A',
                role='citizen'
            )
            self.stdout.write(self.style.SUCCESS('Created citizen1 user'))
            
        if not User.objects.filter(username='citizen2').exists():
            User.objects.create_user(
                username='citizen2',
                email='citizen2@example.com',
                password='password123',
                first_name='Trần',
                last_name='Thị B',
                role='citizen'
            )
            self.stdout.write(self.style.SUCCESS('Created citizen2 user'))
            
        # Create officer users
        if not User.objects.filter(username='officer1').exists():
            User.objects.create_user(
                username='officer1',
                email='officer1@example.com',
                password='password123',
                first_name='Lê',
                last_name='Văn C',
                role='officer'
            )
            self.stdout.write(self.style.SUCCESS('Created officer1 user'))
            
        # Create chairman user
        if not User.objects.filter(username='chairman').exists():
            User.objects.create_user(
                username='chairman',
                email='chairman@example.com',
                password='password123',
                first_name='Phạm',
                last_name='Văn D',
                role='chairman'
            )
            self.stdout.write(self.style.SUCCESS('Created chairman user'))

    def create_test_requests(self, citizens, officers, num_requests):
        """Create test administrative requests"""
        request_types = [
            'Giấy khai sinh',
            'Chứng minh nhân dân',
            'Đăng ký thường trú',
            'Giấy đăng ký kết hôn',
            'Xác nhận tạm trú',
            'Giấy chứng tử'
        ]
        
        statuses = ['pending', 'processing', 'completed', 'rejected']
        
        for i in range(num_requests):
            # Select random data
            citizen = random.choice(citizens)
            request_type = random.choice(request_types)
            status = random.choice(statuses)
            
            # Create request ID
            type_code_map = {
                'Giấy khai sinh': 'KS',
                'Chứng minh nhân dân': 'CMND',
                'Đăng ký thường trú': 'TT',
                'Giấy đăng ký kết hôn': 'KH',
                'Xác nhận tạm trú': 'XT',
                'Giấy chứng tử': 'CT'
            }
            type_code = type_code_map.get(request_type, 'YC')
            date_str = timezone.now().strftime('%Y%m%d')
            request_id = f"{type_code}-{date_str}-{i+1:03d}"
            
            # Create description
            descriptions = {
                'Giấy khai sinh': 'Đăng ký khai sinh cho con',
                'Chứng minh nhân dân': 'Đổi CMND mới do hết hạn',
                'Đăng ký thường trú': 'Đăng ký thường trú tại địa chỉ mới',
                'Giấy đăng ký kết hôn': 'Đăng ký kết hôn',
                'Xác nhận tạm trú': 'Xác nhận tạm trú 6 tháng',
                'Giấy chứng tử': 'Đăng ký giấy chứng tử'
            }
            description = descriptions.get(request_type, f'Yêu cầu {request_type}')
            
            # Set dates
            created_at = timezone.now() - timedelta(days=random.randint(1, 30))
            updated_at = created_at
            
            # Set assigned officer based on status
            assigned_to = None
            if status in ['processing', 'completed', 'rejected'] and officers.exists():
                assigned_to = random.choice(officers)
                updated_at = created_at + timedelta(days=random.randint(1, 5))
            
            # Set comments based on status
            comments = None
            if status == 'completed':
                comments = 'Đã hoàn thành và cấp giấy'
            elif status == 'rejected':
                comments = 'Thiếu giấy tờ cần thiết'
            elif status == 'processing':
                comments = 'Đang xử lý hồ sơ'
            
            # Create the request
            request = AdminRequest.objects.create(
                request_id=request_id,
                request_type=request_type,
                description=description,
                status=status,
                citizen=citizen,
                assigned_to=assigned_to,
                comments=comments,
                created_at=created_at,
                updated_at=updated_at
            )
            
            self.stdout.write(f'Created request: {request.request_id}')

    def create_test_documents(self, citizens, officers, num_documents):
        """Create test documents"""
        document_types = [
            'birth_certificate',
            'id_card',
            'residence_certificate',
            'marriage_certificate',
            'temporary_residence',
            'death_certificate'
        ]
        
        statuses = ['active', 'draft', 'revoked', 'expired']
        
        type_names = {
            'birth_certificate': 'Giấy khai sinh',
            'id_card': 'Chứng minh nhân dân',
            'residence_certificate': 'Đăng ký thường trú',
            'marriage_certificate': 'Giấy đăng ký kết hôn',
            'temporary_residence': 'Xác nhận tạm trú',
            'death_certificate': 'Giấy chứng tử'
        }
        
        for i in range(num_documents):
            # Select random data
            citizen = random.choice(citizens)
            doc_type = random.choice(document_types)
            status = random.choice(statuses)
            
            # Create document ID
            type_code_map = {
                'birth_certificate': 'KS',
                'id_card': 'CMND',
                'residence_certificate': 'TT',
                'marriage_certificate': 'KH',
                'temporary_residence': 'XT',
                'death_certificate': 'CT'
            }
            type_code = type_code_map.get(doc_type, 'TL')
            date_str = timezone.now().strftime('%Y%m%d')
            document_id = f"{type_code}-{date_str}-{i+1:03d}"
            
            # Set dates
            created_at = timezone.now() - timedelta(days=random.randint(1, 90))
            updated_at = created_at
            issue_date = created_at.date()
            valid_from = issue_date
            valid_until = issue_date + timedelta(days=365*5)  # 5 years validity
            
            # Set issued_by based on status
            issued_by = None
            if status in ['active', 'revoked', 'expired'] and officers.exists():
                issued_by = random.choice(officers)
                
            # Create the document
            document = Document.objects.create(
                document_id=document_id,
                document_type=doc_type,
                title=type_names.get(doc_type, 'Unknown Document'),
                description=f"{type_names.get(doc_type, 'Document')} cho {citizen.first_name} {citizen.last_name}",
                status=status,
                citizen=citizen,
                issued_by=issued_by,
                issue_date=issue_date,
                valid_from=valid_from,
                valid_until=valid_until,
                created_at=created_at,
                updated_at=updated_at,
                blockchain_status=(random.random() > 0.7)  # 30% chance to be on blockchain
            )
            
            # Add blockchain data for some documents
            if document.blockchain_status:
                document.blockchain_tx_id = f"0x{random.randint(0, 2**64):016x}"
                document.blockchain_timestamp = document.created_at + timedelta(hours=random.randint(1, 24))
                document.save()
            
            self.stdout.write(f'Created document: {document.document_id}') 