from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Role
from django.db import transaction
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Tạo tài khoản mặc định cho chủ tịch xã (admin)'

    def handle(self, *args, **options):
        email = 'admin@gov.com'
        username = 'admin'
        password = 'Admin@123'
        first_name = 'Admin'
        last_name = 'User'
        phone_number = '123456789'
        address = 'TP. HCM'

        # Kiểm tra xem email đã tồn tại chưa
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Tài khoản với email {email} đã tồn tại! Không cần tạo lại.'))
            return

        try:
            # Đảm bảo vai trò chủ tịch xã đã tồn tại
            chairman_role, created = Role.objects.get_or_create(
                name=Role.CHAIRMAN,
                defaults={'description': 'Chủ tịch xã (Admin)'}
            )
            
            # Tạo tài khoản chủ tịch xã
            with transaction.atomic():
                # Tạo người dùng mới
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=phone_number,
                    is_staff=True,  # Cấp quyền truy cập admin site
                    is_superuser=True,  # Cấp quyền admin toàn hệ thống
                    is_verified=True  # Tự động xác thực tài khoản
                )
                
                # Gán vai trò chủ tịch xã
                user.roles.add(chairman_role)
                
                # Cập nhật profile
                profile = user.profile
                if hasattr(profile, 'address'):
                    profile.address = address
                    profile.save()
                
                self.stdout.write(self.style.SUCCESS(f'Đã tạo tài khoản chủ tịch xã mặc định thành công:'))
                self.stdout.write(self.style.SUCCESS(f'- Email: {email}'))
                self.stdout.write(self.style.SUCCESS(f'- Mật khẩu: {password}'))
                self.stdout.write(self.style.SUCCESS(f'- Địa chỉ: {address}'))
                self.stdout.write(self.style.SUCCESS(f'- Số điện thoại: {phone_number}'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Lỗi khi tạo tài khoản chủ tịch xã: {str(e)}')) 