from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Role, Profile, CustomPermission
from apps.administrative.models import DocumentType, Document, AdminRequest, Approval, Attachment
from apps.officer_management.models import OfficerRequest, OfficerApproval, OfficerAssignment
from apps.feedback.models import Feedback
from apps.notifications.models import Notification
from django.utils import timezone
import random
from django.db import transaction
from faker import Faker
import os
from datetime import timedelta

User = get_user_model()
fake = Faker('vi_VN')  # Sử dụng tiếng Việt

class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu cho hệ thống'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-users',
            action='store_true',
            help='Không tạo dữ liệu người dùng',
        )
        parser.add_argument(
            '--no-documents',
            action='store_true',
            help='Không tạo dữ liệu giấy tờ',
        )
        parser.add_argument(
            '--no-requests',
            action='store_true',
            help='Không tạo dữ liệu yêu cầu',
        )
        parser.add_argument(
            '--citizens',
            type=int,
            default=10,
            help='Số lượng công dân cần tạo',
        )
        parser.add_argument(
            '--officers',
            type=int,
            default=5,
            help='Số lượng cán bộ cần tạo',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Bắt đầu tạo dữ liệu mẫu...')
        
        # Tạo dữ liệu người dùng nếu cần
        if not options['no_users']:
            self.create_roles_and_permissions()
            self.create_users(options['citizens'], options['officers'])
        
        # Tạo dữ liệu giấy tờ nếu cần
        if not options['no_documents']:
            self.create_document_types()
        
        # Tạo dữ liệu yêu cầu nếu cần
        if not options['no_requests']:
            self.create_requests()
        
        self.stdout.write(self.style.SUCCESS('Hoàn thành tạo dữ liệu mẫu!'))

    def create_roles_and_permissions(self):
        self.stdout.write('Tạo vai trò và quyền hạn...')
        
        # Tạo các vai trò
        roles = {
            Role.CHAIRMAN: 'Chủ tịch xã',
            Role.OFFICER: 'Cán bộ xã',
            Role.CITIZEN: 'Công dân'
        }
        
        role_objects = {}
        for role_name, role_desc in roles.items():
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={'description': role_desc}
            )
            role_objects[role_name] = role
            
            if created:
                self.stdout.write(f'Đã tạo vai trò: {role_desc}')
            else:
                self.stdout.write(f'Vai trò đã tồn tại: {role_desc}')
        
        # Tạo các quyền
        permissions = [
            # Quyền cho công dân
            {'name': 'Xem hồ sơ cá nhân', 'codename': 'view_own_profile', 'module': 'profile', 'roles': [Role.CITIZEN, Role.OFFICER, Role.CHAIRMAN]},
            {'name': 'Chỉnh sửa hồ sơ cá nhân', 'codename': 'edit_own_profile', 'module': 'profile', 'roles': [Role.CITIZEN, Role.OFFICER, Role.CHAIRMAN]},
            {'name': 'Tạo yêu cầu mới', 'codename': 'create_request', 'module': 'administrative', 'roles': [Role.CITIZEN]},
            {'name': 'Xem yêu cầu cá nhân', 'codename': 'view_own_requests', 'module': 'administrative', 'roles': [Role.CITIZEN]},
            {'name': 'Gửi phản hồi', 'codename': 'submit_feedback', 'module': 'feedback', 'roles': [Role.CITIZEN]},
            
            # Quyền cho cán bộ xã
            {'name': 'Xem danh sách công dân', 'codename': 'view_citizens', 'module': 'accounts', 'roles': [Role.OFFICER, Role.CHAIRMAN]},
            {'name': 'Xem danh sách yêu cầu', 'codename': 'view_requests', 'module': 'administrative', 'roles': [Role.OFFICER, Role.CHAIRMAN]},
            {'name': 'Xử lý yêu cầu', 'codename': 'process_requests', 'module': 'administrative', 'roles': [Role.OFFICER]},
            {'name': 'Tạo giấy tờ', 'codename': 'create_documents', 'module': 'administrative', 'roles': [Role.OFFICER]},
            {'name': 'Xem báo cáo', 'codename': 'view_reports', 'module': 'reports', 'roles': [Role.OFFICER, Role.CHAIRMAN]},
            
            # Quyền cho chủ tịch xã
            {'name': 'Quản lý cán bộ', 'codename': 'manage_officers', 'module': 'officer_management', 'roles': [Role.CHAIRMAN]},
            {'name': 'Phê duyệt cán bộ', 'codename': 'approve_officers', 'module': 'officer_management', 'roles': [Role.CHAIRMAN]},
            {'name': 'Phê duyệt giấy tờ quan trọng', 'codename': 'approve_important_documents', 'module': 'administrative', 'roles': [Role.CHAIRMAN]},
            {'name': 'Quản lý hệ thống', 'codename': 'manage_system', 'module': 'system', 'roles': [Role.CHAIRMAN]},
        ]
        
        for perm_data in permissions:
            perm, created = CustomPermission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults={
                    'name': perm_data['name'],
                    'module': perm_data['module'],
                    'description': perm_data['name']
                }
            )
            
            # Gán quyền cho vai trò
            for role_name in perm_data['roles']:
                role = role_objects.get(role_name)
                if role:
                    perm.roles.add(role)
            
            if created:
                self.stdout.write(f'Đã tạo quyền: {perm_data["name"]}')
            else:
                self.stdout.write(f'Quyền đã tồn tại: {perm_data["name"]}')

    def create_users(self, num_citizens, num_officers):
        self.stdout.write(f'Tạo {num_citizens} công dân và {num_officers} cán bộ...')
        
        # Lấy các vai trò
        try:
            chairman_role = Role.objects.get(name=Role.CHAIRMAN)
            officer_role = Role.objects.get(name=Role.OFFICER)
            citizen_role = Role.objects.get(name=Role.CITIZEN)
        except Role.DoesNotExist:
            self.stdout.write(self.style.ERROR('Lỗi: Các vai trò chưa được tạo. Vui lòng chạy migrations trước.'))
            return
        
        # Tạo chủ tịch xã (nếu chưa có)
        if not User.objects.filter(roles=chairman_role).exists():
            chairman = User.objects.create_user(
                email='chairman@example.com',
                password='Password@123',
                first_name='Nguyễn Văn',
                last_name='Chủ Tịch',
                phone_number='0987654321',
                is_verified=True,
                is_staff=True
            )
            chairman.roles.add(chairman_role)
            
            Profile.objects.create(
                user=chairman,
                address=fake.address(),
                id_number='012345678910',
                date_of_birth=fake.date_of_birth(minimum_age=30, maximum_age=60),
                gender='M',
                position='Chủ tịch UBND xã',
                bio='Chủ tịch UBND xã nhiệm kỳ 2020-2025'
            )
            
            self.stdout.write(self.style.SUCCESS(f'Đã tạo tài khoản chủ tịch xã: {chairman.email}'))
        
        # Tạo cán bộ xã
        for i in range(num_officers):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f'officer{i+1}@example.com'
            
            if not User.objects.filter(email=email).exists():
                officer = User.objects.create_user(
                    email=email,
                    password='Password@123',
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=fake.phone_number(),
                    is_verified=True
                )
                officer.roles.add(officer_role)
                
                Profile.objects.create(
                    user=officer,
                    address=fake.address(),
                    id_number=f'01{i}345678910',
                    date_of_birth=fake.date_of_birth(minimum_age=25, maximum_age=55),
                    gender=random.choice(['M', 'F']),
                    position=random.choice(['Cán bộ tư pháp', 'Cán bộ địa chính', 'Cán bộ văn hóa', 'Cán bộ tài chính', 'Cán bộ hộ tịch']),
                    bio=f'Cán bộ xã với {random.randint(1, 15)} năm kinh nghiệm'
                )
                
                self.stdout.write(f'Đã tạo cán bộ xã: {officer.email}')
        
        # Tạo công dân
        for i in range(num_citizens):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f'citizen{i+1}@example.com'
            
            if not User.objects.filter(email=email).exists():
                citizen = User.objects.create_user(
                    email=email,
                    password='Password@123',
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=fake.phone_number(),
                    is_verified=True
                )
                citizen.roles.add(citizen_role)
                
                Profile.objects.create(
                    user=citizen,
                    address=fake.address(),
                    id_number=f'02{i}345678910',
                    date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=80),
                    gender=random.choice(['M', 'F']),
                    occupation=random.choice(['Nông dân', 'Giáo viên', 'Công nhân', 'Kinh doanh', 'Sinh viên', 'Hưu trí']),
                    bio=fake.text(max_nb_chars=100)
                )
                
                self.stdout.write(f'Đã tạo công dân: {citizen.email}')

    def create_document_types(self):
        self.stdout.write('Tạo các loại giấy tờ hành chính...')
        
        document_types = [
            {
                'name': 'Giấy khai sinh',
                'code': 'GKS',
                'description': 'Giấy chứng nhận khai sinh cho trẻ em',
                'required_fields': ['tên_người_được_khai_sinh', 'ngày_sinh', 'nơi_sinh', 'giới_tính', 'tên_cha', 'tên_mẹ'],
                'approval_required': False,
                'template': '<h1>GIẤY KHAI SINH</h1><p>Họ tên: {{tên_người_được_khai_sinh}}</p><p>Ngày sinh: {{ngày_sinh}}</p><p>Nơi sinh: {{nơi_sinh}}</p><p>Giới tính: {{giới_tính}}</p><p>Cha: {{tên_cha}}</p><p>Mẹ: {{tên_mẹ}}</p>'
            },
            {
                'name': 'Giấy chứng nhận kết hôn',
                'code': 'GCNKH',
                'description': 'Giấy chứng nhận kết hôn giữa hai người',
                'required_fields': ['tên_chồng', 'ngày_sinh_chồng', 'hộ_khẩu_thường_trú_chồng', 'tên_vợ', 'ngày_sinh_vợ', 'hộ_khẩu_thường_trú_vợ', 'ngày_đăng_ký'],
                'approval_required': True,
                'template': '<h1>GIẤY CHỨNG NHẬN KẾT HÔN</h1><p>Chồng: {{tên_chồng}}, sinh ngày {{ngày_sinh_chồng}}</p><p>Địa chỉ: {{hộ_khẩu_thường_trú_chồng}}</p><p>Vợ: {{tên_vợ}}, sinh ngày {{ngày_sinh_vợ}}</p><p>Địa chỉ: {{hộ_khẩu_thường_trú_vợ}}</p><p>Đăng ký ngày: {{ngày_đăng_ký}}</p>'
            },
            {
                'name': 'Xác nhận tình trạng hôn nhân',
                'code': 'XNTTHM',
                'description': 'Giấy xác nhận tình trạng hôn nhân của một người',
                'required_fields': ['họ_tên', 'ngày_sinh', 'nơi_cư_trú', 'tình_trạng_hôn_nhân', 'mục_đích_sử_dụng'],
                'approval_required': False,
                'template': '<h1>GIẤY XÁC NHẬN TÌNH TRẠNG HÔN NHÂN</h1><p>Họ tên: {{họ_tên}}</p><p>Ngày sinh: {{ngày_sinh}}</p><p>Nơi cư trú: {{nơi_cư_trú}}</p><p>Tình trạng hôn nhân: {{tình_trạng_hôn_nhân}}</p><p>Mục đích sử dụng: {{mục_đích_sử_dụng}}</p>'
            },
            {
                'name': 'Giấy xác nhận nơi cư trú',
                'code': 'XNNCT',
                'description': 'Giấy xác nhận nơi cư trú hiện tại của người dân',
                'required_fields': ['họ_tên', 'ngày_sinh', 'CMND_CCCD', 'nơi_cư_trú', 'thời_gian_cư_trú'],
                'approval_required': False,
                'template': '<h1>GIẤY XÁC NHẬN NƠI CƯ TRÚ</h1><p>Họ tên: {{họ_tên}}</p><p>Ngày sinh: {{ngày_sinh}}</p><p>CMND/CCCD: {{CMND_CCCD}}</p><p>Nơi cư trú: {{nơi_cư_trú}}</p><p>Thời gian cư trú: {{thời_gian_cư_trú}}</p>'
            },
            {
                'name': 'Giấy xác nhận tài sản',
                'code': 'XNTS',
                'description': 'Giấy xác nhận quyền sở hữu tài sản',
                'required_fields': ['họ_tên_chủ_sở_hữu', 'CMND_CCCD', 'loại_tài_sản', 'mô_tả_tài_sản', 'địa_chỉ_tài_sản', 'thời_gian_sở_hữu'],
                'approval_required': True,
                'template': '<h1>GIẤY XÁC NHẬN TÀI SẢN</h1><p>Chủ sở hữu: {{họ_tên_chủ_sở_hữu}}</p><p>CMND/CCCD: {{CMND_CCCD}}</p><p>Loại tài sản: {{loại_tài_sản}}</p><p>Mô tả: {{mô_tả_tài_sản}}</p><p>Địa chỉ: {{địa_chỉ_tài_sản}}</p><p>Thời gian sở hữu: {{thời_gian_sở_hữu}}</p>'
            }
        ]
        
        for doc_type_data in document_types:
            doc_type, created = DocumentType.objects.get_or_create(
                code=doc_type_data['code'],
                defaults={
                    'name': doc_type_data['name'],
                    'description': doc_type_data['description'],
                    'required_fields': doc_type_data['required_fields'],
                    'approval_required': doc_type_data['approval_required'],
                    'template': doc_type_data['template']
                }
            )
            
            if created:
                self.stdout.write(f'Đã tạo loại giấy tờ: {doc_type_data["name"]}')
            else:
                self.stdout.write(f'Loại giấy tờ đã tồn tại: {doc_type_data["name"]}')
    
    def create_requests(self):
        self.stdout.write('Tạo các yêu cầu giấy tờ mẫu...')
        
        # Lấy dữ liệu cần thiết
        try:
            citizens = User.objects.filter(roles__name=Role.CITIZEN)
            officers = User.objects.filter(roles__name=Role.OFFICER)
            document_types = DocumentType.objects.all()
            
            if not citizens.exists() or not officers.exists() or not document_types.exists():
                self.stdout.write(self.style.ERROR('Không có đủ dữ liệu người dùng hoặc loại giấy tờ để tạo yêu cầu.'))
                return
            
            # Tạo các yêu cầu
            statuses = ['pending', 'processing', 'completed', 'rejected']
            
            for citizen in citizens:
                # Mỗi công dân tạo 1-3 yêu cầu
                for _ in range(random.randint(1, 3)):
                    doc_type = random.choice(document_types)
                    status = random.choice(statuses)
                    
                    request_data = {
                        'title': f'Yêu cầu {doc_type.name}',
                        'description': fake.text(max_nb_chars=100),
                        'status': status,
                        'user': citizen,
                        'document_type': doc_type,
                        'created_at': fake.date_time_between(start_date='-30d', end_date='now'),
                    }
                    
                    # Nếu đang xử lý hoặc đã hoàn thành, gán cho cán bộ
                    if status in ['processing', 'completed', 'rejected']:
                        request_data['assigned_to'] = random.choice(officers)
                        
                        if status in ['completed', 'rejected']:
                            request_data['completed_at'] = fake.date_time_between(
                                start_date=request_data['created_at'], 
                                end_date='now'
                            )
                    
                    request = AdminRequest.objects.create(**request_data)
                    
                    # Tạo file đính kèm
                    Attachment.objects.create(
                        request=request,
                        name=f'Tài liệu {random.randint(1, 100)}',
                        file_path=f'documents/attachments/mau_{random.randint(1, 10)}.pdf',
                        uploaded_by=citizen
                    )
                    
                    # Nếu đã hoàn thành, tạo giấy tờ
                    if status == 'completed':
                        document = Document.objects.create(
                            title=f'{doc_type.name} cho {citizen.first_name} {citizen.last_name}',
                            content=doc_type.template,
                            document_type=doc_type,
                            user=citizen,
                            created_by=request_data.get('assigned_to'),
                            request=request,
                            status='issued'
                        )
                        
                        # Nếu cần phê duyệt, tạo bản ghi phê duyệt
                        if doc_type.approval_required:
                            chairman = User.objects.filter(roles__name=Role.CHAIRMAN).first()
                            if chairman:
                                Approval.objects.create(
                                    document=document,
                                    approved_by=chairman,
                                    status=random.choice(['pending', 'approved']),
                                    notes=fake.text(max_nb_chars=50) if random.choice([True, False]) else ''
                                )
                    
                    self.stdout.write(f'Đã tạo yêu cầu: {request.title} cho {citizen.email}')
            
            # Tạo một số yêu cầu đăng ký làm cán bộ
            self.create_officer_requests()
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Lỗi khi tạo yêu cầu: {str(e)}'))
    
    def create_officer_requests(self):
        self.stdout.write('Tạo các yêu cầu đăng ký làm cán bộ...')
        
        # Lấy vai trò citizen
        citizen_role = Role.objects.get(name=Role.CITIZEN)
        
        # Tạo 3 công dân muốn trở thành cán bộ
        for i in range(3):
            email = f'officer_applicant{i+1}@example.com'
            
            if not User.objects.filter(email=email).exists():
                citizen = User.objects.create_user(
                    email=email,
                    password='Password@123',
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    phone_number=fake.phone_number(),
                    is_verified=True
                )
                citizen.roles.add(citizen_role)
                
                profile = Profile.objects.create(
                    user=citizen,
                    address=fake.address(),
                    id_number=f'03{i}345678910',
                    date_of_birth=fake.date_of_birth(minimum_age=25, maximum_age=40),
                    gender=random.choice(['M', 'F']),
                    occupation=random.choice(['Giáo viên', 'Kỹ sư', 'Bác sĩ', 'Luật sư']),
                    bio=fake.text(max_nb_chars=100)
                )
                
                # Tạo đơn xin làm cán bộ
                status = random.choice(['pending', 'approved', 'rejected'])
                
                officer_request = OfficerRequest.objects.create(
                    user=citizen,
                    position=random.choice(['Cán bộ tư pháp', 'Cán bộ địa chính', 'Cán bộ văn hóa', 'Cán bộ tài chính']),
                    education=random.choice(['Đại học', 'Cao đẳng', 'Thạc sĩ']),
                    experience=f'{random.randint(1, 10)} năm kinh nghiệm trong lĩnh vực {random.choice(["hành chính", "giáo dục", "y tế", "tư pháp"])}',
                    reason=fake.text(max_nb_chars=150),
                    status=status,
                    created_at=fake.date_time_between(start_date='-60d', end_date='-30d')
                )
                
                # Nếu đã xử lý, tạo bản ghi phê duyệt
                if status in ['approved', 'rejected']:
                    chairman = User.objects.filter(roles__name=Role.CHAIRMAN).first()
                    
                    approval_date = fake.date_time_between(
                        start_date=officer_request.created_at,
                        end_date='-15d'
                    )
                    
                    OfficerApproval.objects.create(
                        officer_request=officer_request,
                        approved_by=chairman,
                        status=status,
                        notes=fake.text(max_nb_chars=100) if random.choice([True, False]) else '',
                        approved_at=approval_date
                    )
                
                self.stdout.write(f'Đã tạo đơn xin làm cán bộ cho: {citizen.email}, trạng thái: {status}') 