from django.core.management.base import BaseCommand
from apps.administrative.models import DocumentType
from api.v1.serializers.document_type_serializers import DocumentTypeProcedureSerializer
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.authtoken.models import Token
import json
from api.v1.views.citizen import CitizenDocumentTypeViewSet
from api.v1.views.officer import OfficerDocumentTypeViewSet
from django.contrib.auth.models import Group

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the document types API'

    def handle(self, *args, **options):
        self.stdout.write('Testing the document types API...')
        
        # Test the serializer directly
        self.stdout.write('\nTesting the serializer directly:')
        document_types = DocumentType.objects.all()
        
        # Pretty print the first document type
        if document_types.exists():
            self.stdout.write(f"Found {document_types.count()} document types")
            first_doc = document_types.first()
            self.stdout.write(f"\nFirst document type: {first_doc.name}")
            self.stdout.write(f"Code: {first_doc.code}")
            self.stdout.write(f"Description: {first_doc.description}")
            self.stdout.write(f"Required fields: {first_doc.required_fields}")
            self.stdout.write(f"Fee: {first_doc.fee}")
            self.stdout.write(f"Store on blockchain: {first_doc.store_on_blockchain}")
            
            # Serialize just the first document type
            serializer = DocumentTypeProcedureSerializer(first_doc)
            
            # Print serialized data
            serialized_data = serializer.data
            self.stdout.write("\nSerialized data for first document type:")
            self.stdout.write(json.dumps(serialized_data, indent=2, ensure_ascii=False))
        else:
            self.stdout.write("No document types found. Please run update_document_types first.")
            return
            
        # Test the API views directly
        self.stdout.write('\nTesting the API views directly:')
        
        # Create a test user
        try:
            # Create test user
            test_user, created = User.objects.get_or_create(
                username='test_citizen',
                defaults={
                    'email': 'test_citizen@example.com',
                    'first_name': 'Test',
                    'last_name': 'Citizen',
                    'is_active': True
                }
            )
            
            if created:
                test_user.set_password('testpassword')
                test_user.save()
                self.stdout.write(f"Created test user: {test_user.username}")
            else:
                self.stdout.write(f"Using existing test user: {test_user.username}")
            
            # Make sure user has correct roles
            # Check if roles model exists
            try:
                from apps.accounts.models import Role
                
                # Add citizen role
                citizen_role, created = Role.objects.get_or_create(name='citizen')
                if citizen_role not in test_user.roles.all():
                    test_user.roles.add(citizen_role)
                    self.stdout.write(f"Added citizen role to test user")
                
                # Add officer role for testing officer endpoints
                officer_role, created = Role.objects.get_or_create(name='officer')
                if officer_role not in test_user.roles.all():
                    test_user.roles.add(officer_role)
                    self.stdout.write(f"Added officer role to test user")
                
                # Save user
                test_user.save()
                
            except ImportError:
                # Fall back to using Groups if Role model doesn't exist
                self.stdout.write("Role model not found, using Groups instead")
                
                # Add citizen group
                citizen_group, created = Group.objects.get_or_create(name='citizen')
                if citizen_group not in test_user.groups.all():
                    test_user.groups.add(citizen_group)
                    self.stdout.write(f"Added citizen group to test user")
                
                # Add officer group for testing officer endpoints
                officer_group, created = Group.objects.get_or_create(name='officer')
                if officer_group not in test_user.groups.all():
                    test_user.groups.add(officer_group)
                    self.stdout.write(f"Added officer group to test user")
                
                # Save user
                test_user.save()
                
            # Add is_citizen and is_officer attributes
            if not hasattr(test_user, 'is_citizen') or not test_user.is_citizen:
                test_user.is_citizen = True
                test_user.save()
                self.stdout.write(f"Set is_citizen=True")
                
            if not hasattr(test_user, 'is_officer') or not test_user.is_officer:
                test_user.is_officer = True
                test_user.save()
                self.stdout.write(f"Set is_officer=True")
                
            # Use APIRequestFactory to test views directly
            factory = APIRequestFactory()
            
            # Test citizen endpoint
            self.stdout.write('\nTesting CitizenDocumentTypeViewSet:')
            citizen_view = CitizenDocumentTypeViewSet.as_view({'get': 'list'})
            request = factory.get('/api/v1/citizen/document-types/')
            force_authenticate(request, user=test_user)
            response = citizen_view(request)
            
            self.stdout.write(f"Status code: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                self.stdout.write(f"Received {len(data)} document types")
                if len(data) > 0:
                    self.stdout.write(json.dumps(data[0], indent=2, ensure_ascii=False))
                else:
                    self.stdout.write("No data returned from the API")
            else:
                self.stdout.write(f"Error response: {response.data}")
            
            # Test officer endpoint
            self.stdout.write('\nTesting OfficerDocumentTypeViewSet:')
            officer_view = OfficerDocumentTypeViewSet.as_view({'get': 'list'})
            request = factory.get('/api/v1/officer/document-types/')
            force_authenticate(request, user=test_user)
            response = officer_view(request)
            
            self.stdout.write(f"Status code: {response.status_code}")
            if response.status_code == 200:
                data = response.data
                self.stdout.write(f"Received {len(data)} document types")
                if len(data) > 0:
                    self.stdout.write(json.dumps(data[0], indent=2, ensure_ascii=False))
                else:
                    self.stdout.write("No data returned from the API")
            else:
                self.stdout.write(f"Error response: {response.data}")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error testing API: {e}"))
            import traceback
            self.stdout.write(traceback.format_exc())
            
        self.stdout.write(self.style.SUCCESS('Document types API test completed')) 