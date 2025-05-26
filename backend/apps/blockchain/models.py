class Request(models.Model):
    """
    Model represents a citizen's request for document processing
    """
    REQUEST_TYPES = (
        ('birth_certificate', 'Giấy khai sinh'),
        ('death_certificate', 'Giấy chứng tử'),
        ('marriage_certificate', 'Giấy đăng ký kết hôn'),
        ('residence_certificate', 'Giấy xác nhận cư trú'),
        ('land_use_certificate', 'Giấy chứng nhận quyền sử dụng đất'),
        ('business_registration', 'Đăng ký kinh doanh'),
        ('construction_permit', 'Giấy phép xây dựng')
    )
    
    STATUS_CHOICES = (
        ('submitted', 'Đã nộp'),
        ('pending', 'Chờ xử lý'),
        ('in_review', 'Đang xem xét'),
        ('processing', 'Đang xử lý'),
        ('completed', 'Hoàn thành'),
        ('rejected', 'Từ chối')
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Thấp'),
        ('medium', 'Trung bình'),
        ('high', 'Cao')
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    request_type = models.CharField(max_length=50, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    requestor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    reject_reason = models.TextField(blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}" 