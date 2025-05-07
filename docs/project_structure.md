# Project Structure Organization Guide

This document outlines the recommended structure for organizing code in the Commune Blockchain project.

## Directory Organization

```
BlockChain4F/
├── accounts/                  # User accounts app
│   ├── management/            # Management commands
│   ├── migrations/            # Database migrations
│   ├── templates/             # Templates specific to the accounts app
│   ├── views/                 # Modular views
│   │   ├── admin.py           # Admin-related views
│   │   ├── auth.py            # Authentication-related views
│   │   ├── profile.py         # Profile-related views
│   │   └── __init__.py        # Package initializer
│   ├── forms.py               # Forms definitions
│   ├── models.py              # Database models
│   └── urls.py                # URL routing
│
├── blockchain/                # Blockchain app
│   ├── management/            # Management commands
│   ├── migrations/            # Database migrations
│   ├── smart_contracts/       # Solidity contracts
│   │   └── compiled/          # Compiled contract ABIs
│   ├── templatetags/          # Custom template tags
│   ├── views/                 # Modular views
│   │   ├── admin.py           # Administrative views
│   │   ├── api.py             # API endpoints
│   │   ├── official.py        # Official-related views
│   │   ├── public.py          # Public-facing views
│   │   ├── request.py         # Request-related views
│   │   ├── utils.py           # Utility functions
│   │   └── __init__.py        # Package initializer
│   ├── forms.py               # Forms definitions
│   ├── models.py              # Database models
│   └── urls.py                # URL routing
│
├── commune_blockchain/        # Project configuration
│   ├── settings.py            # Project settings
│   ├── urls.py                # Main URL routing
│   └── wsgi.py                # WSGI configuration
│
├── docs/                      # Documentation
│   ├── business_licenses/     # Business license templates
│   ├── civil_registration/    # Civil registration templates
│   └── ...                    # Other document templates
│
├── locale/                    # Translations
│   ├── en/                    # English translations
│   └── vi/                    # Vietnamese translations
│
├── media/                     # User-uploaded files
│   ├── blockchain/            # Blockchain-related files
│   └── documents/             # User documents
│
├── static/                    # Static files
│   ├── css/                   # Stylesheets
│   │   ├── base/              # Base stylesheets
│   │   ├── components/        # Component-specific styles
│   │   └── pages/             # Page-specific styles
│   ├── js/                    # JavaScript files
│   │   ├── api/               # API interaction scripts
│   │   ├── components/        # Component-specific scripts
│   │   ├── utils/             # Utility functions
│   │   └── pages/             # Page-specific scripts
│   └── img/                   # Images
│       ├── icons/             # Icons
│       ├── logos/             # Logo variations
│       └── ui/                # UI images
│
├── templates/                 # Global templates
│   ├── accounts/              # Account-related templates
│   └── blockchain/            # Blockchain-related templates
│       ├── admin/             # Admin interface templates
│       ├── base/              # Base templates
│       ├── official/          # Official interface templates
│       ├── public/            # Public-facing templates
│       └── requests/          # Request-related templates
│
├── .env                       # Environment variables
├── db.sqlite3                 # SQLite database
├── manage.py                  # Django management script
└── requirements.txt           # Python dependencies
```

## Code Organization Guidelines

### 1. Views Organization

Views should be organized based on functionality:

- **Public Views**: Views accessible without authentication
- **Request Views**: Views for creating and managing requests
- **Admin Views**: Views for commune administration
- **Official Views**: Views for commune officials
- **API Views**: REST API endpoints

### 2. Templates Organization

Templates should follow a consistent structure:

- **Base Templates**: Main layout templates
- **Component Templates**: Reusable template components
- **Feature-specific Templates**: Templates for specific features

### 3. Static Files Organization

Static files should be organized for clarity:

- **CSS**: Organized by scope (base, components, pages)
- **JavaScript**: Organized by purpose (api, components, utils, pages)
- **Images**: Organized by type (icons, logos, ui elements)

### 4. Translation Files

- Keep translations up-to-date in both English and Vietnamese
- Use translation keys consistently across the application

## Migration Path

The project is currently transitioning to this more organized structure. Follow these steps when working on the codebase:

1. Place new code in the appropriate modular location
2. When modifying existing code, consider migrating it to the new structure
3. Always maintain backward compatibility during the transition

## Benefits

This organization provides several benefits:

- **Maintainability**: Smaller, focused files are easier to maintain
- **Scalability**: Clear structure supports project growth
- **Collaboration**: Enables multiple developers to work simultaneously
- **Reusability**: Encourages reuse of components and code
- **Readability**: Makes it easier to understand the codebase 