"""
Forms for the blockchain application.
"""
from django import forms
from django.contrib.auth.models import User
from django.forms.widgets import Input
from django.utils.html import format_html
from django.core.exceptions import ValidationError
import json
from .models import AdministrativeRequest, RequestStatusUpdate, RequestDocument, DocumentRequest, RequestCategory, Comment
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class MultipleFileInput(Input):
    """Custom file input widget that supports multiple file uploads."""
    
    input_type = 'file'
    
    def __init__(self, attrs=None):
        if attrs is None:
            attrs = {}
        attrs['multiple'] = True
        super().__init__(attrs)
    
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['attrs']['multiple'] = True
        return context
    
    def value_from_datadict(self, data, files, name):
        if files and name in files:
            if hasattr(files, 'getlist'):
                return files.getlist(name)
            return [files.get(name)]
        return None


class AdministrativeRequestForm(forms.ModelForm):
    """Form for creating administrative requests."""
    
    # Dynamic fields storage
    dynamic_fields = forms.CharField(widget=forms.HiddenInput(), required=False)
    
    class Meta:
        model = AdministrativeRequest
        fields = ['request_type', 'category', 'description', 'full_name', 'phone_number', 'address', 'payment_amount', 'dynamic_fields']
        widgets = {
            'request_type': forms.Select(attrs={'class': 'form-select', 'id': 'id_request_type'}),
            'category': forms.Select(attrs={'class': 'form-select', 'id': 'id_category'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'full_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'payment_amount': forms.NumberInput(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add Bootstrap classes
        for field_name, field in self.fields.items():
            if not isinstance(field.widget, forms.HiddenInput):
                field.widget.attrs['class'] = 'form-control'
                field.widget.attrs['placeholder'] = field.label
        
        # Make category field have a blank option
        self.fields['category'].required = False
        self.fields['category'].empty_label = "Select category (if applicable)"
        
        # Add a div for dynamic fields
        self.dynamic_fields_div = '<div id="dynamic_fields_container"></div>'
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Process dynamic fields data
        dynamic_fields_data = cleaned_data.get('dynamic_fields', '{}')
        try:
            if dynamic_fields_data:
                dynamic_data = json.loads(dynamic_fields_data)
                # Store the parsed data back to be accessible in the view
                cleaned_data['form_data'] = dynamic_data
            else:
                cleaned_data['form_data'] = {}
        except json.JSONDecodeError:
            # If the JSON is invalid, add a form error
            self.add_error('dynamic_fields', 'Invalid form data format')
            cleaned_data['form_data'] = {}
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Set form_data field on the instance
        if 'form_data' in self.cleaned_data:
            instance.form_data = self.cleaned_data['form_data']
        
        if commit:
            instance.save()
        
        return instance


class CategoryAssignmentForm(forms.Form):
    """Form for assigning officials to request categories."""
    
    category = forms.ModelChoiceField(
        queryset=RequestCategory.objects.all(),
        label="Select Category",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    officials = forms.ModelMultipleChoiceField(
        queryset=User.objects.filter(profile__role='OFFICIAL', profile__approval_status='APPROVED'),
        label="Select Officials",
        widget=forms.SelectMultiple(attrs={'class': 'form-select', 'size': '10'}),
        help_text="Choose officials to assign to this category"
    )


class RequestStatusUpdateForm(forms.ModelForm):
    """Form for updating request status."""
    
    class Meta:
        model = RequestStatusUpdate
        fields = ['new_status', 'comments']
        widgets = {
            'new_status': forms.Select(attrs={'class': 'form-select'}),
            'comments': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Add any comments or notes about this status change'}),
        }


class RequestTrackingForm(forms.Form):
    """Form for tracking requests."""
    
    request_id = forms.CharField(
        label="Request ID or Transaction Hash",
        max_length=100,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter request ID or transaction hash',
        })
    )


class RequestAssignmentForm(forms.Form):
    """Form for assigning requests to commune officers."""
    
    officer = forms.ModelChoiceField(
        queryset=User.objects.none(),
        label="Select Officer",
        widget=forms.Select(attrs={'class': 'form-select'}),
        help_text="Choose an officer to handle this request",
        required=True
    )
    
    estimated_completion_date = forms.DateField(
        label="Estimated Completion Date",
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        }),
        required=False
    )
    
    def __init__(self, *args, **kwargs):
        officers = kwargs.pop('officers', None)
        category = kwargs.pop('category', None)
        super(RequestAssignmentForm, self).__init__(*args, **kwargs)
        
        if category and category.assigned_officials.exists():
            # If category has assigned officials, only show those officials
            self.fields['officer'].queryset = category.assigned_officials.all()
            self.fields['officer'].help_text = f"Choose an officer from the {category.name} category"
        elif officers is not None:
            # Otherwise, show all provided officers
            self.fields['officer'].queryset = officers


class DocumentUploadForm(forms.ModelForm):
    """Form for uploading documents."""
    
    class Meta:
        model = RequestDocument
        fields = ['document_type', 'file', 'title', 'description', 'is_public']
        widgets = {
            'document_type': forms.Select(attrs={'class': 'form-select'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'is_public': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class DocumentRequestForm(forms.ModelForm):
    """Form for requesting additional documents."""
    
    class Meta:
        model = DocumentRequest
        fields = ['title', 'description', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'due_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
        }


class MultipleDocumentUploadForm(forms.Form):
    """Form for uploading multiple documents at once."""
    
    document_type = forms.ChoiceField(
        choices=RequestDocument.DOCUMENT_TYPE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    files = forms.FileField(
        widget=MultipleFileInput(attrs={'class': 'form-control'}),
        help_text="You can select multiple files at once"
    )
    
    is_public = forms.BooleanField(
        required=False,
        initial=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        help_text="If checked, the document is visible to all parties involved with this request"
    )


class OfficialRegistrationForm(UserCreationForm):
    """Form for registering new commune officials."""
    ethereum_address = forms.CharField(
        max_length=42,
        required=True,
        help_text="Enter the official's Ethereum address (0x...)"
    )
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', 'ethereum_address')
    
    def clean_ethereum_address(self):
        """Validate Ethereum address format."""
        address = self.cleaned_data['ethereum_address']
        if not address.startswith('0x') or len(address) != 42:
            raise forms.ValidationError("Invalid Ethereum address format. Must start with '0x' and be 42 characters long.")
        return address


class AuthorityDelegationForm(forms.Form):
    """Form for delegating authority to officials."""
    official = forms.ModelChoiceField(
        queryset=User.objects.filter(profile__role='OFFICIAL', profile__approval_status='APPROVED'),
        required=True,
        label="Select Official"
    )
    authority_level = forms.ChoiceField(
        choices=[
            ('LOW', 'Low - Basic document processing'),
            ('MEDIUM', 'Medium - Document verification and approval'),
            ('HIGH', 'High - Full administrative authority')
        ],
        required=True,
        label="Authority Level"
    )


class CommentForm(forms.ModelForm):
    """Form for adding comments to administrative requests."""
    
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Add a comment...'}),
        }
        labels = {
            'content': '',
        } 