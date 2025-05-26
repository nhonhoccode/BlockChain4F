from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Case, When, IntegerField
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.administrative.models import AdminRequest, Document, DocumentType, Attachment
from apps.administrative.serializers import (
    RequestSerializer, RequestDetailSerializer, DocumentSerializer, 
    DocumentCreateSerializer, DocumentTypeSerializer
)
from utils.permissions import IsOfficer, IsOwnerOrAdmin
import csv
from django.http import HttpResponse
from apps.officer_management.models import Officer
from ..serializers.officer import (
    OfficerRequestSerializer, 
    OfficerDocumentSerializer,
    OfficerCitizenSerializer,
)
from api.v1.serializers.document_type_serializers import DocumentTypeProcedureSerializer


class OfficerRequestViewSet(viewsets.ModelViewSet):
    """
    Viewset for officers to manage citizen requests
    """
    serializer_class = OfficerRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'request_type', 'id']

    def get_queryset(self):
        queryset = AdminRequest.objects.all().order_by('-created_at')
        
        # Apply status filter
        status = self.request.query_params.get('status')
        if status and status != 'all':
            queryset = queryset.filter(status=status)
            
        # Apply request type filter
        request_type = self.request.query_params.get('request_type')
        if request_type and request_type != 'all':
            queryset = queryset.filter(request_type=request_type)
            
        # Apply priority filter
        priority = self.request.query_params.get('priority')
        if priority and priority != 'all':
            queryset = queryset.filter(priority=priority)
            
        # Apply search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(id__icontains=search) |
                Q(requestor__first_name__icontains=search) |
                Q(requestor__last_name__icontains=search)
            )
            
        # Apply sorting
        sort_by = self.request.query_params.get('sort_by', 'created_at')
        sort_direction = self.request.query_params.get('sort_direction', 'desc')
        
        if sort_direction == 'asc':
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by(f'-{sort_by}')
            
        return queryset
    
    @action(detail=False, methods=['get'], url_path='pending')
    def pending_requests(self, request):
        """
        Get pending requests with advanced filtering and statistics
        """
        # Get the filtered queryset
        queryset = self.get_queryset()
        
        # Get statistics
        all_requests = AdminRequest.objects.all()
        stats = {
            'totalRequests': all_requests.count(),
            'pending': all_requests.filter(status='pending').count(),
            'submitted': all_requests.filter(status='submitted').count(),
            'processing': all_requests.filter(status='processing').count(),
            'completed': all_requests.filter(status='completed').count(),
            'rejected': all_requests.filter(status='rejected').count(),
        }
        
        # Serialize the queryset
        serializer = self.get_serializer(queryset, many=True)
        
        # Return with statistics
        return Response({
            'results': serializer.data,
            'stats': stats
        })
        
    @action(detail=True, methods=['post'], url_path='assign')
    def assign_to_self(self, request, pk=None):
        """
        Assign a request to the current officer
        """
        try:
            # Print debug info
            print(f"===== assign_to_self =====")
            print(f"Request user: {request.user.id} - {request.user.email}")
            print(f"Request data: {request.data}")
            print(f"Request headers: {request.headers}")
            print(f"Request pk: {pk}")
            print(f"Request method: {request.method}")
            
            # Get the AdminRequest object
            try:
                request_obj = AdminRequest.objects.get(pk=pk)
                print(f"Found request: {request_obj.id} - {request_obj.title} - {request_obj.status}")
                
                # Print current assigned officer
                if request_obj.assigned_officer:
                    print(f"Currently assigned to: {request_obj.assigned_officer.id} - {request_obj.assigned_officer.email}")
                else:
                    print("Not assigned to any officer")
                
            except AdminRequest.DoesNotExist:
                print(f"Request with ID {pk} not found")
                return Response(
                    {'detail': f'Request with ID {pk} not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if request is already assigned
            if request_obj.assigned_officer:
                print(f"Request already assigned to: {request_obj.assigned_officer.email}")
                return Response(
                    {'detail': f'Request is already assigned to officer {request_obj.assigned_officer.email}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Super simplified - just assign to current user
            print(f"Assigning request to current user: {request.user.email}")
            try:
                request_obj.assigned_officer = request.user
                request_obj.status = 'processing'
                request_obj.save()
                print(f"Request assigned successfully to {request.user.email}")
            except Exception as save_error:
                print(f"Error saving request: {str(save_error)}")
                return Response(
                    {'detail': f'Error saving request: {str(save_error)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            try:
                serializer = self.get_serializer(request_obj)
                result = serializer.data
                print(f"Serialized data: {result}")
                return Response(result)
            except Exception as serializer_error:
                print(f"Error serializing request: {str(serializer_error)}")
                return Response(
                    {'detail': f'Error serializing request: {str(serializer_error)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        except Exception as e:
            print(f"Unexpected error in assign_to_self: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Error assigning request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete_request(self, request, pk=None):
        """
        Mark a request as completed
        """
        try:
            # Print debug info
            print(f"===== complete_request =====")
            print(f"Request user: {request.user.id} - {request.user.email}")
            print(f"Request data: {request.data}")
            
            # Get the AdminRequest object
            request_obj = AdminRequest.objects.get(pk=pk)
            print(f"Found request: {request_obj.id} - {request_obj.title}")
            
            # Check if request is assigned to current user
            if request_obj.assigned_officer != request.user:
                print(f"Request is assigned to {request_obj.assigned_officer}, not current user {request.user.email}")
                return Response(
                    {'detail': 'You are not assigned to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Update request status
            print(f"Marking request as completed")
            request_obj.status = 'completed'
            request_obj.completed_date = timezone.now().date()
            request_obj.approver = request.user
            request_obj.save()
            
            # Document will be automatically created by the signal
            print(f"Request completed successfully. Document will be automatically created.")
            serializer = self.get_serializer(request_obj)
            return Response(serializer.data)
            
        except AdminRequest.DoesNotExist:
            print(f"Request with ID {pk} not found")
            return Response(
                {'detail': f'Request with ID {pk} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in complete_request: {str(e)}")
            return Response(
                {'detail': f'Error completing request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_request(self, request, pk=None):
        """
        Reject a request with reason
        """
        try:
            # Print debug info
            print(f"===== reject_request =====")
            print(f"Request user: {request.user.id} - {request.user.email}")
            print(f"Request data: {request.data}")
            
            # Get the AdminRequest object
            request_obj = AdminRequest.objects.get(pk=pk)
            print(f"Found request: {request_obj.id} - {request_obj.title}")
            
            # Check if request is assigned to current user
            if request_obj.assigned_officer != request.user:
                print(f"Request is assigned to {request_obj.assigned_officer}, not current user {request.user.email}")
                return Response(
                    {'detail': 'You are not assigned to this request.'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Get reject reason from request data
            reject_reason = request.data.get('reject_reason')
            if not reject_reason:
                print(f"No reject reason provided")
                return Response(
                    {'detail': 'Reject reason is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Update request status and reason
            print(f"Rejecting request with reason: {reject_reason}")
            request_obj.status = 'rejected'
            request_obj.reject_reason = reject_reason
            request_obj.save()
            
            print(f"Request rejected successfully")
            serializer = self.get_serializer(request_obj)
            return Response(serializer.data)
            
        except AdminRequest.DoesNotExist:
            print(f"Request with ID {pk} not found")
            return Response(
                {'detail': f'Request with ID {pk} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in reject_request: {str(e)}")
            return Response(
                {'detail': f'Error rejecting request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OfficerDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoints cho quản lý giấy tờ dành cho cán bộ xã
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get_queryset(self):
        return Document.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)


class OfficerDocumentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem các loại giấy tờ
    """
    queryset = DocumentType.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentTypeProcedureSerializer
        return DocumentTypeSerializer
    
    def list(self, request, *args, **kwargs):
        """
        List document types with special formatting for frontend
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Return data in a format that matches the frontend's expectations
        return Response(serializer.data)


class OfficerCitizenViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints cho xem thông tin công dân
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Trả về danh sách công dân với các bộ lọc
        """
        # Check if user has officer role
        has_officer_role = False
        if hasattr(self.request.user, 'roles'):
            roles = [role.name.lower() for role in self.request.user.roles.all()]
            has_officer_role = 'officer' in roles
        
        if not has_officer_role and hasattr(self.request.user, 'role') and self.request.user.role.lower() != 'officer':
            # Return empty queryset if user doesn't have officer role
            return User.objects.none()
            
        queryset = User.objects.filter(roles__name='citizen').select_related('profile')
        
        # Lấy các tham số filter từ query string
        gender = self.request.query_params.get('gender', None)
        id_card_status = self.request.query_params.get('id_card_status', None)
        district = self.request.query_params.get('district', None)
        is_active = self.request.query_params.get('is_active', None)
        search = self.request.query_params.get('search', None)
        
        # Áp dụng các bộ lọc
        if gender and gender != 'all':
            queryset = queryset.filter(profile__gender=gender)
        
        if id_card_status:
            if id_card_status == 'verified':
                queryset = queryset.filter(profile__id_card_number__isnull=False, is_verified=True)
            elif id_card_status == 'unverified':
                queryset = queryset.filter(
                    Q(profile__id_card_number__isnull=True) | 
                    Q(profile__id_card_number__isnull=False, is_verified=False)
                )



        
        if district and district != 'all':
            queryset = queryset.filter(profile__district=district)
        
        if is_active == 'true':
            queryset = queryset.filter(is_active=True)
        elif is_active == 'false':
            queryset = queryset.filter(is_active=False)
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(profile__id_card_number__icontains=search) |
                Q(profile__address__icontains=search)
            )
        
        return queryset.order_by('last_name', 'first_name')
    
    @action(detail=True, methods=['get'], url_path='documents')
    def get_citizen_documents(self, request, pk=None):
        """
        Lấy danh sách giấy tờ của công dân với thông tin chi tiết hơn
        """
        try:
            citizen = self.get_object()
            documents = Document.objects.filter(issued_to=citizen).order_by('-created_at')
            
            documents_data = []
            for doc in documents:
                # Lấy các file đính kèm nếu có
                attachments = Attachment.objects.filter(document=doc)
                attachment_urls = [attachment.file.url for attachment in attachments if attachment.file]
                
                # Lấy thông tin người tạo
                creator_name = ''
                if doc.issued_by:
                    creator_name = f"{doc.issued_by.first_name} {doc.issued_by.last_name}".strip() or doc.issued_by.email
                
                # Lấy loại giấy tờ
                document_type_name = ''
                try:
                    doc_type = DocumentType.objects.get(code=doc.document_type)
                    document_type_name = doc_type.name
                except:
                    document_type_name = doc.document_type
                
                # Chuẩn bị thông tin giấy tờ
                doc_data = {
                    'id': doc.id,
                    'title': doc.title,
                    'document_type': doc.document_type,
                    'document_type_name': document_type_name,
                    'document_number': doc.document_number,
                    'issued_date': doc.issued_date,
                    'expiry_date': doc.expiry_date,
                    'status': doc.status,
                    'description': doc.description,
                    'content': doc.content,
                    'created_at': doc.created_at,
                    'updated_at': doc.updated_at,
                    'issued_by': creator_name,
                    'file': doc.file.url if doc.file else None,
                    'attachments': attachment_urls,
                    'can_view': True,
                    'can_download': True,
                    'preview_url': doc.file.url if doc.file else None
                }
                
                documents_data.append(doc_data)
            
            return Response(documents_data)
            
        except Exception as e:
            return Response({
                'error': f'Không thể lấy danh sách giấy tờ: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'], url_path='requests')
    def get_citizen_requests(self, request, pk=None):
        """
        Lấy danh sách yêu cầu của công dân
        """
        citizen = self.get_object()
        requests = AdminRequest.objects.filter(requestor=citizen).order_by('-created_at')
        serializer = RequestSerializer(requests, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='export')
    def export_citizens(self, request):
        """
        Xuất danh sách công dân ra file CSV
        """
        import csv
        from django.http import HttpResponse
        
        # Lấy các tham số filter
        gender = request.query_params.get('gender', None)
        id_card_status = request.query_params.get('id_card_status', None)
        district = request.query_params.get('district', None)
        is_active = request.query_params.get('is_active', None)
        search = request.query_params.get('search', None)
        
        # Bắt đầu với base queryset
        queryset = self.get_queryset()
        
        # Áp dụng các bộ lọc
        if gender and gender != 'all':
            queryset = queryset.filter(profile__gender=gender)
        
        if id_card_status:
            if id_card_status == 'verified':
                queryset = queryset.filter(profile__id_card_number__isnull=False, is_verified=True)
            elif id_card_status == 'unverified':
                queryset = queryset.filter(
                    Q(profile__id_card_number__isnull=True) | 
                    Q(profile__id_card_number__isnull=False, is_verified=False)
                )
        
        if district and district != 'all':
            queryset = queryset.filter(profile__district=district)
        
        if is_active == 'true':
            queryset = queryset.filter(is_active=True)
        elif is_active == 'false':
            queryset = queryset.filter(is_active=False)
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(profile__id_card_number__icontains=search) |
                Q(profile__address__icontains=search)
            )
        
        # Tạo response với Content-Disposition header để báo với trình duyệt đây là file để tải xuống
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="danh_sach_cong_dan.csv"'
        response.write(u'\ufeff'.encode('utf-8'))  # BOM (Byte Order Mark) để Excel nhận dạng UTF-8
        
        # Tạo CSV writer có hỗ trợ Unicode
        writer = csv.writer(response)
        
        # Viết header
        headers = [
            'STT', 
            'Họ', 
            'Tên', 
            'Email', 
            'Giới tính', 
            'Số điện thoại', 
            'CCCD/CMND', 
            'Ngày cấp', 
            'Nơi cấp', 
            'Địa chỉ', 
            'Phường/Xã', 
            'Quận/Huyện', 
            'Tỉnh/TP', 
            'Ngày sinh', 
            'Trạng thái', 
            'Xác thực', 
            'Ngày đăng ký'
        ]
        writer.writerow(headers)
        
        # Dùng để chuẩn hóa các giá trị None thành chuỗi rỗng
        def safe_value(value):
            if value is None:
                return ''
            return str(value)
        
        # Viết dữ liệu
        for index, citizen in enumerate(queryset, 1):
            # Lấy profile một cách an toàn
            profile = getattr(citizen, 'profile', None)
            
            # Format date 
            date_of_birth = ''
            if profile and hasattr(profile, 'date_of_birth') and profile.date_of_birth:
                date_of_birth = profile.date_of_birth.strftime('%d/%m/%Y')
                
            id_card_issue_date = ''
            if profile and hasattr(profile, 'id_card_issue_date') and profile.id_card_issue_date:
                id_card_issue_date = profile.id_card_issue_date.strftime('%d/%m/%Y')
                
            date_joined = ''
            if hasattr(citizen, 'date_joined') and citizen.date_joined:
                date_joined = citizen.date_joined.strftime('%d/%m/%Y')
            
            # Format gender
            gender_display = ''
            if profile and hasattr(profile, 'gender') and profile.gender:
                gender_map = {'male': 'Nam', 'female': 'Nữ', 'other': 'Khác'}
                gender_display = gender_map.get(profile.gender, '')
            
            # Format status
            status_display = 'Hoạt động' if citizen.is_active else 'Không hoạt động'
            verified_display = 'Đã xác thực' if citizen.is_verified else 'Chưa xác thực'
            
            # Lấy số điện thoại từ user hoặc profile
            phone = getattr(citizen, 'phone_number', None) or getattr(citizen, 'phone', None)
            
            # Lấy các thuộc tính địa chỉ một cách an toàn
            address = safe_value(getattr(profile, 'address', None)) if profile else ''
            ward = safe_value(getattr(profile, 'ward', None)) if profile else ''
            district = safe_value(getattr(profile, 'district', None)) if profile else ''
            city = safe_value(getattr(profile, 'city', None)) if profile else ''
            
            # Lấy thông tin CCCD một cách an toàn
            id_card_number = safe_value(getattr(profile, 'id_card_number', None)) if profile else ''
            id_card_issue_place = safe_value(getattr(profile, 'id_card_issue_place', None)) if profile else ''
            
            # Chuẩn bị dữ liệu hàng
            row_data = [
                index,
                safe_value(citizen.last_name),
                safe_value(citizen.first_name),
                safe_value(citizen.email),
                gender_display,
                safe_value(phone),
                id_card_number,
                id_card_issue_date,
                id_card_issue_place,
                address,
                ward,
                district,
                city,
                date_of_birth,
                status_display,
                verified_display,
                date_joined
            ]
            
            writer.writerow(row_data)
        
        return response
    
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_citizen(self, request, pk=None):
        """
        Xóa một công dân khỏi hệ thống
        """
        try:
            citizen = self.get_object()
            
            # Kiểm tra xem có phải công dân không
            if not citizen.roles.filter(name='citizen').exists():
                return Response({
                    'error': 'Chỉ được phép xóa tài khoản công dân'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Lưu thông tin để trả về khi xóa thành công
            citizen_info = {
                'id': citizen.id,
                'name': f"{citizen.first_name} {citizen.last_name}".strip(),
                'email': citizen.email
            }
            
            # Xóa người dùng
            citizen.delete()
            
            return Response({
                'message': f'Đã xóa công dân {citizen_info["name"]} thành công',
                'deleted_user': citizen_info
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Không thể xóa công dân: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['put'], url_path='update')
    def update_citizen(self, request, pk=None):
        """
        Cập nhật thông tin công dân
        """
        try:
            citizen = self.get_object()
            
            # Kiểm tra xem có phải công dân không
            if not citizen.roles.filter(name='citizen').exists():
                return Response({
                    'error': 'Chỉ được phép cập nhật tài khoản công dân'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Lấy profile hoặc tạo mới nếu chưa có
            try:
                profile = citizen.profile
            except:
                # Nếu profile không tồn tại, tạo mới
                from apps.accounts.models import Profile
                profile = Profile.objects.create(user=citizen)
            
            # Cập nhật thông tin user
            if 'first_name' in request.data:
                citizen.first_name = request.data.get('first_name', '')
            if 'last_name' in request.data:
                citizen.last_name = request.data.get('last_name', '')
            if 'email' in request.data:
                citizen.email = request.data.get('email', '')
            if 'phone_number' in request.data or 'phone' in request.data:
                citizen.phone_number = request.data.get('phone_number', request.data.get('phone', ''))
            if 'is_active' in request.data:
                citizen.is_active = request.data.get('is_active')
            if 'is_verified' in request.data:
                citizen.is_verified = request.data.get('is_verified')
                
            # Cập nhật thông tin profile
            if 'gender' in request.data:
                profile.gender = request.data.get('gender')
            if 'date_of_birth' in request.data:
                profile.date_of_birth = request.data.get('date_of_birth')
            if 'address' in request.data:
                profile.address = request.data.get('address', '')
            if 'ward' in request.data:
                profile.ward = request.data.get('ward', '')
            if 'district' in request.data:
                profile.district = request.data.get('district', '')
            if 'city' in request.data or 'province' in request.data:
                profile.city = request.data.get('city', request.data.get('province', ''))
            if 'id_card_number' in request.data:
                profile.id_card_number = request.data.get('id_card_number', '')
            if 'id_card_issue_date' in request.data:
                profile.id_card_issue_date = request.data.get('id_card_issue_date')
            if 'id_card_issue_place' in request.data:
                profile.id_card_issue_place = request.data.get('id_card_issue_place', '')
                
            # Lưu thông tin
            citizen.save()
            profile.save()
            
            # Trả về thông tin đã cập nhật
            serializer = self.get_serializer(citizen)
            return Response(serializer.data)
                
        except Exception as e:
            return Response({
                'error': f'Không thể cập nhật thông tin công dân: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='documents/(?P<document_id>[^/.]+)')
    def get_document_detail(self, request, document_id=None):
        """
        Xem chi tiết giấy tờ dành cho cán bộ
        """
        try:
            document = get_object_or_404(Document, id=document_id)
            
            # Lấy các file đính kèm
            attachments = Attachment.objects.filter(document=document)
            attachment_data = []
            
            for attachment in attachments:
                attachment_data.append({
                    'id': attachment.id,
                    'name': attachment.name,
                    'file': attachment.file.url if attachment.file else None,
                    'description': attachment.description,
                    'created_at': attachment.created_at
                })
            
            # Lấy thông tin người tạo
            creator_name = ''
            if document.issued_by:
                creator_name = f"{document.issued_by.first_name} {document.issued_by.last_name}".strip() or document.issued_by.email
            
            # Lấy thông tin chủ sở hữu
            owner_name = ''
            owner_id = None
            if document.issued_to:
                owner_name = f"{document.issued_to.first_name} {document.issued_to.last_name}".strip() or document.issued_to.email
                owner_id = document.issued_to.id
            
            # Lấy loại giấy tờ
            document_type_name = ''
            try:
                doc_type = DocumentType.objects.get(code=document.document_type)
                document_type_name = doc_type.name
            except:
                document_type_name = document.document_type
            
            # Chuẩn bị dữ liệu response
            document_data = {
                'id': document.id,
                'title': document.title,
                'document_type': document.document_type,
                'document_type_name': document_type_name,
                'document_number': document.document_number,
                'issued_date': document.issued_date,
                'expiry_date': document.expiry_date,
                'status': document.status,
                'description': document.description,
                'content': document.content,
                'created_at': document.created_at,
                'updated_at': document.updated_at,
                'issued_by': creator_name,
                'owner': {
                    'id': owner_id,
                    'name': owner_name
                },
                'file': document.file.url if document.file else None,
                'attachments': attachment_data,
                'can_view': True,
                'can_download': True,
                'blockchain_verified': False,  # To be implemented with actual blockchain verification
                'blockchain_hash': document.blockchain_hash if hasattr(document, 'blockchain_hash') else None,
                'blockchain_timestamp': document.blockchain_timestamp if hasattr(document, 'blockchain_timestamp') else None
            }
            
            return Response(document_data)
            
        except Exception as e:
            return Response({
                'error': f'Không thể lấy chi tiết giấy tờ: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OfficerDashboardStatsView(viewsets.ViewSet):
    """
    API endpoint cho lấy thống kê dashboard của cán bộ xã
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """
        Lấy thống kê tổng quan cho dashboard cán bộ xã
        """
        try:
            user = request.user
            print(f"Fetching dashboard stats for officer: {user.email}")
            
            # Check if user has officer role
            has_officer_role = False
            if hasattr(user, 'roles'):
                roles = [role.name.lower() for role in user.roles.all()]
                has_officer_role = 'officer' in roles
            
            if not has_officer_role and hasattr(user, 'role') and user.role.lower() != 'officer':
                return Response({
                    'error': 'Bạn không có quyền truy cập vào trang này'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Lấy số lượng yêu cầu theo trạng thái
            pending_requests = AdminRequest.objects.filter(
                Q(assigned_officer=user) | Q(assigned_officer=None),
                status__in=['submitted', 'in_review', 'processing']
            ).count()
            
            completed_requests = AdminRequest.objects.filter(
                assigned_officer=user,
                status__in=['completed', 'approved']
            ).count()
            
            # Lấy tổng số công dân đã đăng ký
            total_citizens = User.objects.filter(roles__name='citizen').count()
            
            # Lấy tổng số giấy tờ đã cấp
            total_documents = Document.objects.filter(issued_by=user).count()
            
            # Lấy danh sách yêu cầu đang chờ xử lý
            pending_request_list = AdminRequest.objects.filter(
                Q(assigned_officer=user) | Q(assigned_officer=None),
                status__in=['submitted', 'in_review', 'processing']
            ).order_by('-created_at')[:5]
            
            # Lấy danh sách yêu cầu đã hoàn thành gần đây
            completed_request_list = AdminRequest.objects.filter(
                assigned_officer=user,
                status__in=['completed', 'approved']
            ).order_by('-updated_at')[:5]
            
            # Lấy danh sách công dân gần đây
            recent_citizens = User.objects.filter(
                roles__name='citizen'
            ).order_by('-date_joined')[:5]
            
            # Chuyển đổi pending requests thành định dạng phù hợp
            pending_requests_data = []
            for req in pending_request_list:
                pending_requests_data.append({
                    'id': str(req.id),
                    'type': req.request_type,
                    'status': req.status,
                    'title': req.title,
                    'submittedDate': req.created_at.isoformat(),
                    'deadline': (req.created_at + timedelta(days=7)).isoformat(),  # Giả định deadline 7 ngày
                    'priority': 'high' if 'urgent' in req.notes.lower() else 'normal',
                    'citizen': {
                        'id': str(req.requestor.id),
                        'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip(),
                        'phone': getattr(req.requestor.profile, 'phone_number', 'N/A')
                    }
                })
            
            # Chuyển đổi completed requests thành định dạng phù hợp
            completed_requests_data = []
            for req in completed_request_list:
                completed_requests_data.append({
                    'id': str(req.id),
                    'type': req.request_type,
                    'status': req.status,
                    'title': req.title,
                    'submittedDate': req.created_at.isoformat(),
                    'completedDate': req.updated_at.isoformat(),
                    'priority': 'high' if 'urgent' in req.notes.lower() else 'normal',
                    'citizen': {
                        'id': str(req.requestor.id),
                        'name': f"{req.requestor.first_name} {req.requestor.last_name}".strip()
                    },
                    'rejectReason': req.rejection_reason if req.status == 'rejected' else None
                })
            
            # Chuyển đổi recent citizens thành định dạng phù hợp
            recent_citizens_data = []
            for citizen in recent_citizens:
                # Lấy yêu cầu gần nhất của công dân
                latest_request = AdminRequest.objects.filter(requestor=citizen).order_by('-created_at').first()
                
                # Đếm tổng số yêu cầu của công dân
                total_requests = AdminRequest.objects.filter(requestor=citizen).count()
                
                recent_citizens_data.append({
                    'id': str(citizen.id),
                    'name': f"{citizen.first_name} {citizen.last_name}".strip(),
                    'email': citizen.email,
                    'phone': getattr(citizen.profile, 'phone_number', 'N/A') if hasattr(citizen, 'profile') else 'N/A',
                    'status': 'active',  # Giả định tất cả công dân đều active
                    'lastRequest': latest_request.created_at.isoformat() if latest_request else None,
                    'totalRequests': total_requests
                })
            
            # Tạo response
            response_data = {
                'stats': {
                    'total_requests': pending_requests + completed_requests,
                    'pending_requests': pending_requests,
                    'completed_requests': completed_requests,
                    'total_citizens': total_citizens,
                    'total_documents': total_documents
                },
                'pending_requests': pending_requests_data,
                'completed_requests': completed_requests_data,
                'recent_citizens': recent_citizens_data
            }
            
            print(f"Response data prepared: {response_data}")
            return Response(response_data)
            
        except Exception as e:
            print(f"Error in officer dashboard stats: {str(e)}")
            return Response({
                'error': f'Lỗi khi lấy thống kê: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OfficerPendingRequestsView(generics.ListAPIView):
    """
    API endpoint for retrieving pending requests for officers
    """
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user has officer role
        has_officer_role = False
        if hasattr(self.request.user, 'roles'):
            roles = [role.name.lower() for role in self.request.user.roles.all()]
            has_officer_role = 'officer' in roles
        
        if not has_officer_role and hasattr(self.request.user, 'role') and self.request.user.role.lower() != 'officer':
            # Return empty queryset if user doesn't have officer role
            return AdminRequest.objects.none()
            
        # Get filter parameters from query string
        status_filter = self.request.query_params.get('status', 'pending')
        request_type = self.request.query_params.get('type')
        search_term = self.request.query_params.get('search')
        
        # Start with base queryset
        queryset = AdminRequest.objects.all()
        
        # Apply status filter
        if status_filter != 'all':
            if status_filter == 'pending':
                queryset = queryset.filter(status__in=['submitted', 'in_review'])
            else:
                queryset = queryset.filter(status=status_filter)
        
        # Apply type filter
        if request_type and request_type != 'all':
            queryset = queryset.filter(request_type=request_type)
        
        # Apply search filter
        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(requestor__first_name__icontains=search_term) |
                Q(requestor__last_name__icontains=search_term) |
                Q(notes__icontains=search_term)
            )
        
        # Order by created date (newest first)
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Calculate statistics for various request statuses
            all_requests = AdminRequest.objects.all()
            stats = {
                'totalRequests': all_requests.count(),
                'pending': all_requests.filter(status='pending').count(),
                'submitted': all_requests.filter(status='submitted').count(),
                'processing': all_requests.filter(status='processing').count(),
                'completed': all_requests.filter(status='completed').count(),
                'rejected': all_requests.filter(status='rejected').count(),
            }
            
            # Paginate results if needed
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return Response({
                    'results': serializer.data,
                    'stats': stats,
                    'count': queryset.count()
                })
                
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'results': serializer.data,
                'stats': stats,
                'count': queryset.count()
            })
        except Exception as e:
            print(f"Error in pending requests view: {str(e)}")
            return Response({
                'error': f'Error fetching pending requests: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OfficerStatisticsView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving statistics for officers
    """
    permission_classes = [permissions.IsAuthenticated, IsOfficer]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get time range filter from query string
            time_range = request.query_params.get('timeRange', 'month')
            
            # Calculate date range based on time_range
            today = timezone.now()
            if time_range == 'week':
                start_date = today - timedelta(days=7)
            elif time_range == 'month':
                start_date = today - timedelta(days=30)
            elif time_range == 'quarter':
                start_date = today - timedelta(days=90)
            elif time_range == 'year':
                start_date = today - timedelta(days=365)
            else:  # 'all' or any other value
                start_date = None
            
            # Base queryset with date filter if applicable
            base_query = AdminRequest.objects
            if start_date:
                base_query = base_query.filter(created_at__gte=start_date)
            
            # Overview statistics
            total_requests = base_query.count()
            approved_requests = base_query.filter(status='completed').count()
            rejected_requests = base_query.filter(status='rejected').count()
            pending_requests = base_query.filter(status__in=['submitted', 'in_review', 'processing']).count()
            
            # Calculate average processing days
            completed_requests = base_query.filter(status='completed')
            average_days = 0
            if completed_requests.exists():
                total_days = 0
                for req in completed_requests:
                    if req.updated_at and req.created_at:
                        total_days += (req.updated_at - req.created_at).days
                average_days = round(total_days / completed_requests.count(), 1) if completed_requests.count() > 0 else 0
            
            # Get requests by type
            request_types = DocumentType.objects.all()
            requests_by_type = []
            
            for doc_type in request_types:
                type_requests = base_query.filter(request_type=doc_type.code)
                total = type_requests.count()
                
                if total > 0:
                    approved = type_requests.filter(status='completed').count()
                    rejected = type_requests.filter(status='rejected').count()
                    pending = type_requests.filter(status__in=['submitted', 'in_review', 'processing']).count()
                    approval_rate = round((approved / total) * 100, 1) if total > 0 else 0
                    
                    requests_by_type.append({
                        'type': doc_type.name,
                        'total': total,
                        'approved': approved,
                        'rejected': rejected,
                        'pending': pending,
                        'approvalRate': approval_rate
                    })
            
            # Processing time by type
            processing_time_by_type = []
            
            for doc_type in request_types:
                completed = base_query.filter(request_type=doc_type.code, status='completed')
                
                if completed.exists():
                    processing_times = []
                    for req in completed:
                        if req.updated_at and req.created_at:
                            processing_times.append((req.updated_at - req.created_at).days)
                    
                    if processing_times:
                        avg_time = round(sum(processing_times) / len(processing_times), 1)
                        min_time = min(processing_times)
                        max_time = max(processing_times)
                        
                        processing_time_by_type.append({
                            'type': doc_type.name,
                            'average': avg_time,
                            'min': min_time,
                            'max': max_time
                        })
            
            # Monthly statistics
            monthly_stats = []
            
            # Only calculate if we're looking at more than a month of data
            if time_range in ['quarter', 'year', 'all']:
                # Get the last 6 months
                for i in range(5, -1, -1):
                    month_start = today.replace(day=1) - timedelta(days=30*i)
                    month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
                    
                    month_requests = base_query.filter(created_at__gte=month_start, created_at__lte=month_end)
                    total = month_requests.count()
                    
                    if total > 0:
                        approved = month_requests.filter(status='completed').count()
                        rejected = month_requests.filter(status='rejected').count()
                        
                        # Calculate average processing time
                        completed = month_requests.filter(status='completed')
                        avg_time = 0
                        if completed.exists():
                            processing_times = []
                            for req in completed:
                                if req.updated_at and req.created_at:
                                    processing_times.append((req.updated_at - req.created_at).days)
                            
                            if processing_times:
                                avg_time = round(sum(processing_times) / len(processing_times), 1)
                        
                        monthly_stats.append({
                            'month': month_start.strftime('%m/%Y'),
                            'total': total,
                            'approved': approved,
                            'rejected': rejected,
                            'averageTime': avg_time
                        })
            
            # Prepare response data
            data = {
                'overview': {
                    'totalRequests': total_requests,
                    'approvedRequests': approved_requests,
                    'rejectedRequests': rejected_requests,
                    'pendingRequests': pending_requests,
                    'averageProcessingDays': average_days,
                    'totalCitizens': User.objects.filter(roles__name='citizen').count(),
                    'totalDocuments': Document.objects.count()
                },
                'requestsByType': requests_by_type,
                'processingTimeByType': processing_time_by_type,
                'monthlyStats': monthly_stats
            }
            
            return Response(data)
            
        except Exception as e:
            print(f"Error in statistics view: {str(e)}")
            return Response({
                'error': f'Error fetching statistics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
