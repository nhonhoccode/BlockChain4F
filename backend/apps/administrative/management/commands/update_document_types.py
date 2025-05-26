from django.core.management.base import BaseCommand
from apps.administrative.models import DocumentType
from decimal import Decimal

class Command(BaseCommand):
    help = 'Update document types with more detailed information'

    def handle(self, *args, **options):
        self.stdout.write('Updating document types with more detailed information...')
        
        document_types = [
            {
                'name': 'Giấy khai sinh',
                'code': 'GKS',
                'description': 'Giấy tờ chính thức xác nhận việc sinh ra và danh tính của một người. Giấy khai sinh là căn cước pháp lý đầu tiên của mỗi công dân.',
                'required_fields': [
                    'tên_người_được_khai_sinh', 
                    'ngày_sinh', 
                    'nơi_sinh', 
                    'giới_tính', 
                    'dân_tộc',
                    'quốc_tịch',
                    'tên_cha', 
                    'quốc_tịch_cha',
                    'năm_sinh_cha',
                    'tên_mẹ',
                    'quốc_tịch_mẹ',
                    'năm_sinh_mẹ'
                ],
                'optional_fields': [
                    'địa_chỉ_đăng_ký_thường_trú',
                    'số_điện_thoại_liên_hệ'
                ],
                'required_attachments': [
                    'Giấy chứng sinh do cơ sở y tế cấp',
                    'CMND/CCCD của người đi khai sinh',
                    'Sổ hộ khẩu hoặc giấy tờ chứng minh nơi cư trú'
                ],
                'complexity': 'simple',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 3,
                'fee': 0,
                'notes': 'Thủ tục này phải được thực hiện trong vòng 60 ngày kể từ ngày sinh của trẻ.'
            },
            {
                'name': 'Căn cước công dân',
                'code': 'CCCD',
                'description': 'Thẻ căn cước công dân là giấy tờ tùy thân quan trọng chứng minh danh tính, nhân thân của công dân Việt Nam, thay thế cho Chứng minh nhân dân.',
                'required_fields': [
                    'họ_tên', 
                    'ngày_sinh', 
                    'nơi_sinh', 
                    'giới_tính', 
                    'quốc_tịch', 
                    'dân_tộc',
                    'tôn_giáo',
                    'nơi_thường_trú',
                    'đặc_điểm_nhận_dạng',
                    'họ_tên_cha',
                    'họ_tên_mẹ'
                ],
                'optional_fields': [
                    'số_điện_thoại',
                    'email'
                ],
                'required_attachments': [
                    'Sổ hộ khẩu hoặc giấy chứng nhận cư trú',
                    'Giấy khai sinh hoặc giấy tờ hợp lệ về nơi sinh',
                    'CMND cũ (nếu có)'
                ],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 7,
                'fee': 30000,
                'notes': 'Công dân từ đủ 14 tuổi trở lên bắt buộc phải đăng ký làm thẻ căn cước công dân.'
            },
            {
                'name': 'Đăng ký thường trú',
                'code': 'DKTT',
                'description': 'Thủ tục đăng ký nơi thường trú cho công dân, xác định địa chỉ chính thức của công dân với chính quyền địa phương.',
                'required_fields': [
                    'họ_tên', 
                    'ngày_sinh', 
                    'số_CMND_CCCD', 
                    'địa_chỉ_thường_trú_cũ', 
                    'địa_chỉ_thường_trú_mới', 
                    'lý_do_chuyển',
                    'quan_hệ_với_chủ_hộ'
                ],
                'optional_fields': [
                    'số_điện_thoại',
                    'email'
                ],
                'required_attachments': [
                    'Sổ hộ khẩu cũ hoặc giấy chứng nhận nhân khẩu tập thể',
                    'CMND/CCCD',
                    'Giấy tờ chứng minh chỗ ở hợp pháp',
                    'Giấy khai sinh (đối với trẻ em)'
                ],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 7,
                'fee': 20000,
                'notes': 'Công dân phải đăng ký thường trú trong vòng 30 ngày kể từ ngày chuyển đến nơi ở mới.'
            },
            {
                'name': 'Giấy đăng ký kết hôn',
                'code': 'DKKH',
                'description': 'Giấy tờ chính thức xác nhận quan hệ hôn nhân giữa hai người, công nhận họ là vợ chồng hợp pháp trước pháp luật.',
                'required_fields': [
                    'tên_chồng', 
                    'ngày_sinh_chồng', 
                    'số_CMND_CCCD_chồng',
                    'nơi_cư_trú_chồng',
                    'tên_vợ', 
                    'ngày_sinh_vợ', 
                    'số_CMND_CCCD_vợ',
                    'nơi_cư_trú_vợ',
                    'ngày_đăng_ký'
                ],
                'optional_fields': [
                    'số_điện_thoại_liên_hệ',
                    'email'
                ],
                'required_attachments': [
                    'CMND/CCCD của cả hai bên',
                    'Giấy xác nhận tình trạng hôn nhân của cả hai bên',
                    'Giấy khám sức khỏe',
                    'Hộ khẩu hoặc giấy tờ chứng minh nơi cư trú'
                ],
                'complexity': 'complex',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 10,
                'fee': 50000,
                'notes': 'Nam từ đủ 20 tuổi, nữ từ đủ 18 tuổi mới đủ điều kiện đăng ký kết hôn.'
            },
            {
                'name': 'Xác nhận tạm trú',
                'code': 'XNTT',
                'description': 'Xác nhận việc tạm trú của công dân tại một địa điểm ngoài nơi thường trú trong một khoảng thời gian nhất định.',
                'required_fields': [
                    'họ_tên', 
                    'ngày_sinh', 
                    'số_CMND_CCCD', 
                    'địa_chỉ_thường_trú',
                    'địa_chỉ_tạm_trú', 
                    'thời_hạn_tạm_trú', 
                    'lý_do_tạm_trú'
                ],
                'optional_fields': [
                    'nghề_nghiệp',
                    'nơi_làm_việc',
                    'số_điện_thoại'
                ],
                'required_attachments': [
                    'CMND/CCCD',
                    'Giấy tờ chứng minh chỗ ở hợp pháp tại nơi tạm trú',
                    'Sổ hộ khẩu (bản sao)'
                ],
                'complexity': 'simple',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 5,
                'fee': 15000,
                'notes': 'Công dân phải đăng ký tạm trú khi lưu trú ngoài nơi thường trú từ 30 ngày trở lên.'
            },
            {
                'name': 'Giấy chứng tử',
                'code': 'GCT',
                'description': 'Giấy tờ chính thức xác nhận việc một người đã qua đời, là cơ sở pháp lý để giải quyết các vấn đề liên quan đến người đã mất.',
                'required_fields': [
                    'họ_tên_người_mất', 
                    'ngày_sinh',
                    'giới_tính',
                    'số_CMND_CCCD',
                    'ngày_mất', 
                    'giờ_mất',
                    'nơi_mất', 
                    'nguyên_nhân', 
                    'họ_tên_người_khai',
                    'quan_hệ_với_người_mất',
                    'số_CMND_CCCD_người_khai'
                ],
                'optional_fields': [
                    'địa_chỉ_liên_hệ',
                    'số_điện_thoại'
                ],
                'required_attachments': [
                    'Giấy báo tử hoặc giấy tờ thay thế giấy báo tử',
                    'CMND/CCCD của người đi khai tử',
                    'Giấy tờ chứng minh quan hệ với người mất'
                ],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 5,
                'fee': 0,
                'notes': 'Việc khai tử phải được thực hiện trong vòng 15 ngày kể từ ngày người đó chết.'
            },
            {
                'name': 'Chuyển nhượng đất',
                'code': 'CND',
                'description': 'Thủ tục chuyển quyền sử dụng đất từ người này sang người khác thông qua hình thức mua bán, tặng cho hoặc thừa kế.',
                'required_fields': [
                    'người_chuyển_nhượng', 
                    'số_CMND_người_chuyển', 
                    'địa_chỉ_người_chuyển',
                    'người_nhận', 
                    'số_CMND_người_nhận', 
                    'địa_chỉ_người_nhận',
                    'thửa_đất_số', 
                    'tờ_bản_đồ_số', 
                    'địa_chỉ_thửa_đất', 
                    'diện_tích', 
                    'mục_đích_sử_dụng',
                    'hình_thức_chuyển_nhượng',
                    'giá_trị_chuyển_nhượng'
                ],
                'optional_fields': [
                    'thời_hạn_sử_dụng',
                    'nguồn_gốc_sử_dụng',
                    'tài_sản_gắn_liền_với_đất'
                ],
                'required_attachments': [
                    'Giấy chứng nhận quyền sử dụng đất',
                    'CMND/CCCD của các bên',
                    'Hợp đồng chuyển nhượng quyền sử dụng đất',
                    'Hóa đơn nộp lệ phí trước bạ',
                    'Giấy tờ chứng minh đã hoàn thành nghĩa vụ tài chính'
                ],
                'complexity': 'complex',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 15,
                'fee': 100000,
                'notes': 'Việc chuyển nhượng đất phải tuân thủ quy định về quy hoạch và không thuộc diện cấm chuyển nhượng.'
            },
            {
                'name': 'Xác nhận độc thân',
                'code': 'XNDT',
                'description': 'Giấy xác nhận tình trạng hôn nhân của một người, chứng minh người đó chưa đăng ký kết hôn với ai.',
                'required_fields': [
                    'họ_tên', 
                    'ngày_sinh', 
                    'giới_tính',
                    'số_CMND_CCCD',
                    'nơi_cư_trú', 
                    'tình_trạng_hôn_nhân', 
                    'mục_đích_sử_dụng',
                    'thời_gian_xác_nhận'
                ],
                'optional_fields': [
                    'số_điện_thoại',
                    'email'
                ],
                'required_attachments': [
                    'CMND/CCCD',
                    'Sổ hộ khẩu hoặc giấy chứng nhận cư trú'
                ],
                'complexity': 'simple',
                'requires_officer_approval': True,
                'requires_chairman_approval': False,
                'estimated_processing_days': 3,
                'fee': 10000,
                'notes': 'Giấy xác nhận độc thân có giá trị trong vòng 6 tháng kể từ ngày cấp.'
            },
            {
                'name': 'Giấy phép xây dựng',
                'code': 'GPXD',
                'description': 'Văn bản pháp lý do cơ quan nhà nước có thẩm quyền cấp cho chủ đầu tư để xây dựng mới, sửa chữa, cải tạo, di dời công trình.',
                'required_fields': [
                    'họ_tên_chủ_đầu_tư', 
                    'số_CMND_CCCD',
                    'địa_chỉ_liên_hệ',
                    'địa_điểm_xây_dựng', 
                    'thửa_đất_số',
                    'tờ_bản_đồ_số',
                    'diện_tích_xây_dựng', 
                    'tổng_diện_tích_sàn', 
                    'chiều_cao_công_trình',
                    'số_tầng',
                    'mục_đích_sử_dụng'
                ],
                'optional_fields': [
                    'đơn_vị_thiết_kế',
                    'đơn_vị_thi_công',
                    'thời_gian_thi_công'
                ],
                'required_attachments': [
                    'Đơn đề nghị cấp giấy phép xây dựng',
                    'Giấy tờ chứng minh quyền sử dụng đất',
                    'Bản vẽ thiết kế công trình',
                    'Bản kê khai năng lực của tổ chức thiết kế'
                ],
                'complexity': 'complex',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 20,
                'fee': 75000,
                'notes': 'Giấy phép xây dựng có thời hạn 12 tháng. Nếu quá thời hạn mà chưa khởi công, phải xin gia hạn.'
            },
            {
                'name': 'Đăng ký kinh doanh hộ cá thể',
                'code': 'DKKD',
                'description': 'Thủ tục đăng ký hoạt động kinh doanh cho hộ kinh doanh cá thể, là cơ sở pháp lý để hộ kinh doanh hoạt động hợp pháp.',
                'required_fields': [
                    'tên_hộ_kinh_doanh', 
                    'họ_tên_chủ_hộ', 
                    'số_CMND_CCCD_chủ_hộ',
                    'địa_chỉ_trụ_sở', 
                    'ngành_nghề_kinh_doanh', 
                    'vốn_kinh_doanh',
                    'số_lao_động',
                    'ngày_bắt_đầu_kinh_doanh'
                ],
                'optional_fields': [
                    'số_điện_thoại',
                    'email'
                ],
                'required_attachments': [
                    'Giấy đề nghị đăng ký hộ kinh doanh',
                    'CMND/CCCD của chủ hộ kinh doanh',
                    'Giấy tờ chứng minh quyền sử dụng địa điểm kinh doanh',
                    'Giấy khám sức khỏe (đối với ngành nghề có điều kiện)'
                ],
                'complexity': 'medium',
                'requires_officer_approval': True,
                'requires_chairman_approval': True,
                'estimated_processing_days': 10,
                'fee': 100000,
                'notes': 'Hộ kinh doanh phải đăng ký nếu có sử dụng từ 10 lao động trở lên hoặc kinh doanh ngành nghề có điều kiện.'
            }
        ]
        
        # Update or create each document type
        for doc_type_data in document_types:
            try:
                # Try to get existing document type by code
                try:
                    doc_type = DocumentType.objects.get(code=doc_type_data['code'])
                    # Update existing document type
                    doc_type.name = doc_type_data['name']
                    doc_type.description = doc_type_data['description']
                    doc_type.required_fields = doc_type_data['required_fields']
                    doc_type.optional_fields = doc_type_data.get('optional_fields', [])
                    doc_type.required_attachments = doc_type_data.get('required_attachments', [])
                    doc_type.optional_attachments = doc_type_data.get('optional_attachments', [])
                    doc_type.complexity = doc_type_data['complexity']
                    doc_type.requires_officer_approval = doc_type_data['requires_officer_approval']
                    doc_type.requires_chairman_approval = doc_type_data['requires_chairman_approval']
                    doc_type.estimated_processing_days = doc_type_data['estimated_processing_days']
                    doc_type.fee = Decimal(str(doc_type_data['fee']))
                    doc_type.store_on_blockchain = True
                    doc_type.save()
                    self.stdout.write(self.style.SUCCESS(f'Updated document type: {doc_type.name}'))
                except DocumentType.DoesNotExist:
                    # Create new document type
                    doc_type = DocumentType.objects.create(
                        code=doc_type_data['code'],
                        name=doc_type_data['name'],
                        description=doc_type_data['description'],
                        required_fields=doc_type_data['required_fields'],
                        optional_fields=doc_type_data.get('optional_fields', []),
                        required_attachments=doc_type_data.get('required_attachments', []),
                        optional_attachments=doc_type_data.get('optional_attachments', []),
                        complexity=doc_type_data['complexity'],
                        requires_officer_approval=doc_type_data['requires_officer_approval'],
                        requires_chairman_approval=doc_type_data['requires_chairman_approval'],
                        estimated_processing_days=doc_type_data['estimated_processing_days'],
                        fee=Decimal(str(doc_type_data['fee'])),
                        store_on_blockchain=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created document type: {doc_type.name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error updating document type {doc_type_data["name"]}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('Document types updated successfully with more detailed information')) 