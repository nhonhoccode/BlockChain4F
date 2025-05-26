from django.core.management.base import BaseCommand
from apps.administrative.models import DocumentType

class Command(BaseCommand):
    help = 'Create document types for the application'

    def handle(self, *args, **options):
        self.stdout.write('Creating document types...')
        
        document_types = [
            {
                'name': 'Giấy khai sinh',
                'code': 'GKS',
                'description': 'Giấy chứng nhận khai sinh cho trẻ em',
                'required_fields': ['tên_người_được_khai_sinh', 'ngày_sinh', 'nơi_sinh', 'giới_tính', 'tên_cha', 'tên_mẹ'],
                'complexity': 'simple',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 2,
                'fee': 0
            },
            {
                'name': 'Chứng minh nhân dân',
                'code': 'CMND',
                'description': 'Chứng minh nhân dân cho công dân',
                'required_fields': ['họ_tên', 'ngày_sinh', 'nơi_sinh', 'giới_tính', 'quốc_tịch', 'nơi_thường_trú'],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 7,
                'fee': 30000
            },
            {
                'name': 'Đăng ký thường trú',
                'code': 'DKTT',
                'description': 'Đăng ký thường trú cho công dân',
                'required_fields': ['họ_tên', 'ngày_sinh', 'CMND_CCCD', 'địa_chỉ_thường_trú', 'lý_do'],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 5,
                'fee': 20000
            },
            {
                'name': 'Giấy đăng ký kết hôn',
                'code': 'DKKH',
                'description': 'Giấy chứng nhận kết hôn giữa hai người',
                'required_fields': ['tên_chồng', 'ngày_sinh_chồng', 'hộ_khẩu_thường_trú_chồng', 'tên_vợ', 'ngày_sinh_vợ', 'hộ_khẩu_thường_trú_vợ', 'ngày_đăng_ký'],
                'complexity': 'complex',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 10,
                'fee': 50000
            },
            {
                'name': 'Xác nhận tạm trú',
                'code': 'XNTT',
                'description': 'Xác nhận tạm trú cho công dân',
                'required_fields': ['họ_tên', 'ngày_sinh', 'CMND_CCCD', 'địa_chỉ_tạm_trú', 'thời_hạn', 'lý_do'],
                'complexity': 'simple',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 3,
                'fee': 15000
            },
            {
                'name': 'Giấy chứng tử',
                'code': 'GCT',
                'description': 'Giấy chứng tử cho người đã mất',
                'required_fields': ['họ_tên_người_mất', 'ngày_sinh', 'ngày_mất', 'nơi_mất', 'nguyên_nhân', 'người_khai'],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 5,
                'fee': 0
            },
            {
                'name': 'Chuyển nhượng đất',
                'code': 'CND',
                'description': 'Giấy xác nhận chuyển nhượng đất',
                'required_fields': ['người_chuyển_nhượng', 'CMND_người_chuyển', 'người_nhận', 'CMND_người_nhận', 'thửa_đất_số', 'tờ_bản_đồ_số', 'địa_chỉ', 'diện_tích', 'giá_trị'],
                'complexity': 'complex',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 15,
                'fee': 100000
            }
        ]
        
        for doc_type_data in document_types:
            try:
                doc_type, created = DocumentType.objects.get_or_create(
                    code=doc_type_data['code'],
                    defaults={
                        'name': doc_type_data['name'],
                        'description': doc_type_data['description'],
                        'required_fields': doc_type_data['required_fields'],
                        'complexity': doc_type_data['complexity'],
                        'requires_officer_approval': doc_type_data['requires_officer_approval'],
                        'requires_chairman_approval': doc_type_data['requires_chairman_approval'],
                        'estimated_processing_days': doc_type_data['estimated_processing_days'],
                        'fee': doc_type_data['fee']
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created document type: {doc_type.name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Document type already exists: {doc_type.name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating document type {doc_type_data["name"]}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('Document types created successfully')) 