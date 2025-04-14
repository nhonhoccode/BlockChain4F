from django.core.management.base import BaseCommand
from blockchain.models import RequestCategory

class Command(BaseCommand):
    help = 'Create categories for administrative procedures'

    def handle(self, *args, **options):
        # Define categories with their codes and descriptions
        categories = [
            {
                'name': 'Civil Registration',
                'code': 'CIVIL_REG',
                'description': 'Birth, marriage, death, and other civil registration procedures'
            },
            {
                'name': 'Business Licenses',
                'code': 'BUS_LIC',
                'description': 'Procedures for business licenses, permits, and registrations'
            },
            {
                'name': 'Land and Property',
                'code': 'LAND_PROP',
                'description': 'Land titles, property transfers, and construction permits'
            },
            {
                'name': 'Identity Documents',
                'code': 'ID_DOCS',
                'description': 'ID cards, passports, and residence certificates'
            },
            {
                'name': 'Social Services',
                'code': 'SOC_SERV',
                'description': 'Social welfare, assistance programs, and subsidies'
            },
            {
                'name': 'Education Services',
                'code': 'EDU_SERV',
                'description': 'School registrations, scholarships, and education-related applications'
            },
            {
                'name': 'Healthcare Services',
                'code': 'HEALTH',
                'description': 'Healthcare registrations, health insurance, and medical support'
            },
            {
                'name': 'Community Issues',
                'code': 'COMMUNITY',
                'description': 'Neighborhood disputes, public space usage, and community events'
            },
            {
                'name': 'Tax and Fees',
                'code': 'TAX_FEES',
                'description': 'Local taxes, fee payments, and financial obligations'
            },
            {
                'name': 'Other Services',
                'code': 'OTHER',
                'description': 'Other administrative procedures not categorized elsewhere'
            },
        ]

        # Create categories if they don't exist
        created_count = 0
        for category_data in categories:
            category, created = RequestCategory.objects.get_or_create(
                code=category_data['code'],
                defaults={
                    'name': category_data['name'],
                    'description': category_data['description']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(f'Category already exists: {category.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} new categories. Total categories: {RequestCategory.objects.count()}')) 