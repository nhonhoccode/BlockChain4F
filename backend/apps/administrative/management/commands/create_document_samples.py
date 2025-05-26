from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.administrative.models.document import Document
import uuid
import random

class Command(BaseCommand):
    help = 'Creates sample documents for testing'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10, help='Number of documents to create')

    def handle(self, *args, **options):
        count = options['count']
        
        # Lấy một user có vai trò citizen
        citizens = User.objects.filter(is_staff=False, is_superuser=False)
        officers = User.objects.filter(is_staff=True, is_superuser=False)
        
        if not citizens.exists():
            self.stdout.write(self.style.ERROR('No citizen users found. Please create at least one citizen user.'))
            return
        
        if not officers.exists():
            self.stdout.write(self.style.WARNING('No officer users found. Using the first user as officer.'))
            officers = User.objects.all()
        
        document_types = [
            'birth_certificate',
            'id_card',
            'residence_certificate',
            'marriage_certificate',
            'temporary_residence',
            'death_certificate',
        ]
        
        statuses = ['active', 'active', 'active', 'expired', 'revoked']  # More active documents than others
        
        # Clear existing sample documents
        Document.objects.filter(title__startswith='Sample Document').delete()
        
        # Create sample documents
        created_count = 0
        for i in range(count):
            citizen = random.choice(citizens)
            officer = random.choice(officers)
            doc_type = random.choice(document_types)
            status = random.choice(statuses)
            
            # Generate random dates
            today = timezone.now().date()
            issue_date = today - timezone.timedelta(days=random.randint(10, 500))
            valid_from = issue_date
            
            # For expired documents, set expiry in the past
            if status == 'expired':
                valid_until = today - timezone.timedelta(days=random.randint(1, 30))
            else:
                # Active documents are valid for 1-10 years
                valid_until = today + timezone.timedelta(days=random.randint(365, 3650))
            
            document = Document(
                document_id=f'DOC{uuid.uuid4().hex[:8].upper()}',
                document_type=doc_type,
                title=f'Sample Document {i+1} - {doc_type.replace("_", " ").title()}',
                description=f'This is a sample {doc_type.replace("_", " ")} document for testing purposes.',
                status=status,
                citizen=citizen,
                issued_by=officer,
                issue_date=issue_date,
                valid_from=valid_from,
                valid_until=valid_until,
                blockchain_status=random.choice([True, False]),
                blockchain_tx_id=f'TX{uuid.uuid4().hex[:16]}' if random.choice([True, False]) else None
            )
            
            document.save()
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Created document: {document.document_id} - {document.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} sample documents')) 