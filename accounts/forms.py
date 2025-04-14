from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile


class ExtendedUserCreationForm(UserCreationForm):
    """Extended user registration form with profile fields"""
    
    # Personal information
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(max_length=15, required=True)
    citizen_id = forms.CharField(max_length=20, required=True, label="Citizen ID (CCCD)")
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=True)
    
    # Role selection - exclude CHAIRMAN from public registration
    PUBLIC_ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('OFFICIAL', 'Commune Official'),
        ('ORGANIZATION', 'Organization/Enterprise'),
    ]
    
    role = forms.ChoiceField(
        choices=PUBLIC_ROLE_CHOICES,
        required=True,
        widget=forms.RadioSelect,
        initial='CITIZEN'
    )
    
    # Organization fields (optional)
    organization_name = forms.CharField(
        max_length=100, 
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Enter organization name'})
    )
    business_license = forms.CharField(
        max_length=50, 
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Enter business license number'})
    )
    
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make organization fields required only for organizations
        self.fields['organization_name'].widget.attrs.update({
            'class': 'org-field'
        })
        self.fields['business_license'].widget.attrs.update({
            'class': 'org-field'
        })
    
    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        
        # Validate organization fields if role is ORGANIZATION
        if role == 'ORGANIZATION':
            org_name = cleaned_data.get('organization_name')
            business_license = cleaned_data.get('business_license')
            
            if not org_name:
                self.add_error('organization_name', 'Organization name is required for organizations')
            
            if not business_license:
                self.add_error('business_license', 'Business license is required for organizations')
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        
        if commit:
            user.save()
            
            # Update profile
            user.profile.role = self.cleaned_data['role']
            user.profile.phone_number = self.cleaned_data['phone_number']
            user.profile.citizen_id = self.cleaned_data['citizen_id']
            user.profile.address = self.cleaned_data['address']
            
            # Set approval status based on role
            if self.cleaned_data['role'] == 'OFFICIAL':
                user.profile.approval_status = 'PENDING'
            
            # Organization fields
            if self.cleaned_data['role'] == 'ORGANIZATION':
                user.profile.organization_name = self.cleaned_data['organization_name']
                user.profile.business_license = self.cleaned_data['business_license']
            
            user.profile.save()
        
        return user


class UserApprovalForm(forms.ModelForm):
    """Form for approving or rejecting user registration requests"""
    
    class Meta:
        model = UserProfile
        fields = ['approval_status']
        widgets = {
            'approval_status': forms.Select(choices=[
                ('APPROVED', 'Approve'),
                ('REJECTED', 'Reject')
            ])
        }


class EthereumAddressForm(forms.ModelForm):
    """Form for updating Ethereum address."""
    class Meta:
        model = UserProfile
        fields = ['ethereum_address']
        widgets = {
            'ethereum_address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '0x...',
                'pattern': '^0x[a-fA-F0-9]{40}$'
            })
        }
    
    def clean_ethereum_address(self):
        address = self.cleaned_data['ethereum_address']
        if not address:
            raise forms.ValidationError("Ethereum address is required for officials.")
        if not address.startswith('0x'):
            raise forms.ValidationError("Ethereum address must start with '0x'")
        if len(address) != 42:
            raise forms.ValidationError("Ethereum address must be 42 characters long (including '0x')")
        return address 