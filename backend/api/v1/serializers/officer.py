from rest_framework import serializers
from apps.administrative.models import AdminRequest as Request, Document
from apps.accounts.models import User
from django.utils import timezone

class RequestorSerializer(serializers.ModelSerializer):
    """
    Serializer for returning basic requestor information
    """
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_picture']
        
    def get_profile_picture(self, obj):
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.profile_picture.url if obj.profile.profile_picture else None
        return None

class OfficerRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for request management by officers
    """
    requestor = RequestorSerializer(read_only=True)
    document_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    days_since_submission = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Request
        fields = [
            'id', 'title', 'description', 'document_type', 'document_type_display',
            'status', 'status_display', 'priority', 'created_at', 'updated_at',
            'requestor', 'assigned_officer', 'rejection_reason', 'days_since_submission',
            'document_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_document_type_display(self, obj):
        # Get the document type name from the related document_type object if it exists
        if obj.document_type and hasattr(obj.document_type, 'name'):
            return obj.document_type.name
        
        # Otherwise use the dictionary for legacy code compatibility
        document_types = {
            'birth_certificate': 'Giấy khai sinh',
            'death_certificate': 'Giấy chứng tử',
            'marriage_certificate': 'Giấy đăng ký kết hôn',
            'residence_certificate': 'Giấy xác nhận cư trú',
            'land_use_certificate': 'Giấy chứng nhận quyền sử dụng đất',
            'business_registration': 'Đăng ký kinh doanh',
            'construction_permit': 'Giấy phép xây dựng'
        }
        
        # Try to get document type code if available
        doc_type_code = getattr(obj.document_type, 'code', None)
        if doc_type_code:
            return document_types.get(doc_type_code, doc_type_code)
        
        return 'Unknown'
    
    def get_status_display(self, obj):
        status_types = {
            'submitted': 'Đã nộp',
            'pending': 'Chờ xử lý',
            'in_review': 'Đang xem xét',
            'processing': 'Đang xử lý',
            'completed': 'Hoàn thành',
            'rejected': 'Từ chối'
        }
        return status_types.get(obj.status, obj.status)
    
    def get_days_since_submission(self, obj):
        if not obj.created_at:
            return None
        
        delta = timezone.now() - obj.created_at
        return delta.days
    
    def get_document_count(self, obj):
        # Count attached documents if any
        return Document.objects.filter(source_request=obj).count()

class OfficerDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for document management by officers
    """
    requestor = RequestorSerializer(read_only=True, source='owner')
    document_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'document_type', 'document_type_display', 
            'document_number', 'status', 'status_display', 
            'issued_date', 'expiry_date', 'requestor', 
            'created_at', 'updated_at', 'file'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_document_type_display(self, obj):
        document_types = {
            'birth_certificate': 'Giấy khai sinh',
            'death_certificate': 'Giấy chứng tử',
            'marriage_certificate': 'Giấy đăng ký kết hôn',
            'residence_certificate': 'Giấy xác nhận cư trú',
            'land_use_certificate': 'Giấy chứng nhận quyền sử dụng đất',
            'business_registration': 'Đăng ký kinh doanh',
            'construction_permit': 'Giấy phép xây dựng',
            'id_card': 'Căn cước công dân',
            'passport': 'Hộ chiếu',
            'driver_license': 'Giấy phép lái xe'
        }
        return document_types.get(obj.document_type, obj.document_type)
    
    def get_status_display(self, obj):
        status_types = {
            'issued': 'Đã cấp',
            'pending': 'Chờ cấp',
            'expired': 'Hết hạn',
            'revoked': 'Thu hồi'
        }
        return status_types.get(obj.status, obj.status)

class OfficerCitizenSerializer(serializers.ModelSerializer):
    """
    Serializer for citizen management by officers
    """
    full_name = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'is_active', 'date_joined', 'profile'
        ]
        read_only_fields = ['id', 'username', 'date_joined']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            if not profile:
                return None
                
            result = {
                'phone_number': profile.phone_number,
                'date_of_birth': profile.date_of_birth,
                'gender': profile.gender,
                'address': profile.address,
                'ward': profile.ward.name if profile.ward else None,
                'district': profile.district.name if profile.district else None,
                'province': profile.province.name if profile.province else None,
                'id_card_number': profile.id_card_number,
                'id_card_issue_date': profile.id_card_issue_date,
                'id_card_issue_place': profile.id_card_issue_place,
            }
            
            if profile.profile_picture:
                result['profile_picture'] = profile.profile_picture.url
                
            return result
        except Exception as e:
            return None 