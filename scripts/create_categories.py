"""Script to create the required categories for the blockchain system."""
from blockchain.models import RequestCategory

# Define the essential categories
categories = [
    ('Civil Registration', 'CIVIL_REG', 'Birth, marriage, and death certificates'),
    ('Identity Documents', 'ID_DOCS', 'ID cards, residence certificates, and passports'),
    ('Business Licenses', 'BUS_LIC', 'Business permits and licenses'),
    ('Land and Property', 'LAND_PROP', 'Land titles, property certificates, and building permits'),
    ('Other Services', 'OTHER', 'Other administrative services')
]

# Create the categories if they don't exist
for name, code, desc in categories:
    category, created = RequestCategory.objects.get_or_create(
        code=code,
        defaults={
            'name': name,
            'description': desc
        }
    )
    if created:
        print(f"Created category: {name} ({code})")
    else:
        print(f"Category already exists: {name} ({code})")

print(f"\nTotal categories: {RequestCategory.objects.count()}") 