"""
Admin configuration for the blockchain application.
"""
from django.contrib import admin
from .models import AdministrativeRequest, RequestStatusUpdate, RequestCategory, RequestDocument, DocumentRequest


class RequestStatusUpdateInline(admin.TabularInline):
    """Inline admin for request status updates."""
    model = RequestStatusUpdate
    extra = 0
    readonly_fields = ['created_at']
    fields = ['old_status', 'new_status', 'comments', 'updated_by', 'tx_hash', 'created_at']


@admin.register(RequestCategory)
class RequestCategoryAdmin(admin.ModelAdmin):
    """Admin for request categories."""
    list_display = ['name', 'code', 'created_at']
    search_fields = ['name', 'code', 'description']
    filter_horizontal = ['assigned_officials']
    fieldsets = [
        ('Category Information', {
            'fields': ['name', 'code', 'description']
        }),
        ('Assigned Officials', {
            'fields': ['assigned_officials']
        }),
        ('Form Processing', {
            'fields': ['required_fields', 'form_template'],
            'classes': ['collapse']
        }),
    ]


@admin.register(AdministrativeRequest)
class AdministrativeRequestAdmin(admin.ModelAdmin):
    """Admin for administrative requests."""
    list_display = ['id', 'full_name', 'request_type', 'category', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'request_type', 'category', 'created_at']
    search_fields = ['full_name', 'phone_number', 'description']
    readonly_fields = ['user_hash', 'tx_hash', 'created_at', 'updated_at']
    fieldsets = [
        ('Request Information', {
            'fields': ['user', 'request_type', 'category', 'description', 'status']
        }),
        ('Form Data', {
            'fields': ['form_data'],
            'classes': ['collapse']
        }),
        ('Personal Information', {
            'fields': ['full_name', 'phone_number', 'address']
        }),
        ('Payment Information', {
            'fields': ['payment_amount', 'payment_status']
        }),
        ('Assignment Information', {
            'fields': ['assigned_to', 'assigned_by', 'assignment_date']
        }),
        ('Blockchain Information', {
            'fields': ['user_hash', 'tx_hash']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at', 'estimated_completion_date', 'pickup_date']
        }),
    ]
    inlines = [RequestStatusUpdateInline]


@admin.register(RequestStatusUpdate)
class RequestStatusUpdateAdmin(admin.ModelAdmin):
    """Admin for request status updates."""
    list_display = ['request', 'old_status', 'new_status', 'updated_by', 'created_at']
    list_filter = ['old_status', 'new_status', 'created_at']
    search_fields = ['request__full_name', 'comments']
    readonly_fields = ['tx_hash', 'created_at']


@admin.register(RequestDocument)
class RequestDocumentAdmin(admin.ModelAdmin):
    """Admin for request documents."""
    list_display = ['title', 'request', 'document_type', 'uploaded_by', 'created_at']
    list_filter = ['document_type', 'is_public', 'created_at']
    search_fields = ['title', 'description', 'request__full_name']


@admin.register(DocumentRequest)
class DocumentRequestAdmin(admin.ModelAdmin):
    """Admin for document requests."""
    list_display = ['title', 'request', 'status', 'requested_by', 'due_date', 'created_at']
    list_filter = ['status', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'request__full_name'] 