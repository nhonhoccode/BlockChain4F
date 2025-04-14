# Administrative Forms Documentation

This directory contains all the topic-specific forms for various administrative procedures handled by the system. The forms are organized by topic (category) for better clarity and logical structure.

## Directory Structure

Each topic has its own dedicated folder with individual forms for specific administrative procedures:

```
docs/
├── business_licenses/       # Business-related permits and licenses
├── civil_registration/      # Birth, marriage, death certificates
├── community_issues/        # Community-related requests
├── education_services/      # Education-related applications
├── healthcare_services/     # Health-related applications
├── identity_documents/      # ID cards, residence certificates
├── land_and_property/       # Land titles, property transfers
├── other_services/          # Miscellaneous administrative services
├── social_services/         # Social welfare applications
└── tax_and_fees/            # Tax clearances, payment certificates
```

## Usage

These HTML form templates provide a standardized structure for each administrative procedure. They can be:

1. Used directly as static forms for reference
2. Converted to Django templates for dynamic form rendering
3. Used as a basis for form generation in the application

## Form Guidelines

When creating new forms, please follow these guidelines:

1. Use Bootstrap 5 for styling
2. Include all required fields for the specific procedure
3. Group related fields into logical sections
4. Include document upload sections where applicable
5. Ensure forms have proper validation attributes

## Adding New Forms

To add new forms:

1. Identify the appropriate topic folder
2. Create a descriptive HTML file name (e.g., `business_permit_form.html`)
3. Use existing templates as a starting point
4. Update the admin dashboard to include links to the new forms

## Integration with Admin Dashboard

These forms are accessible from the Admin Dashboard under the "Report Forms by Topic" section for quick access by administrative staff. 