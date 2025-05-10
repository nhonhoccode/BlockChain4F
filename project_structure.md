# Commune Blockchain Project Structure

```
BlockChain4F/
├── manage.py                      # Django's command-line utility for administrative tasks
├── .env                           # Environment variables (not checked into version control)
├── .env.example                   # Example environment variables template
├── requirements.txt               # Project dependencies
├── Makefile                       # Commands for common development tasks
├── setup.py                       # Package setup script
├── MANIFEST.in                    # Package manifest
├── README.md                      # Project documentation
├── CONTRIBUTING.md                # Contribution guidelines
├── LICENSE                        # License information
├── .gitignore                     # Git ignore patterns
│
├── .github/                       # GitHub configuration
│   ├── workflows/                 # GitHub Actions workflows
│   │   └── ci.yml                 # Continuous Integration workflow
│   └── ISSUE_TEMPLATE/            # Issue templates
│       ├── bug_report.md          # Bug report template
│       └── feature_request.md     # Feature request template
│
├── accounts/                      # User account management app
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/                # Database migrations
│   ├── models.py                  # Database models
│   ├── forms.py                   # Form definitions  
│   ├── views/                     # View modules
│   │   ├── __init__.py
│   │   ├── admin.py               # Admin-related views
│   │   ├── auth.py                # Authentication views
│   │   └── profile.py             # User profile views
│   ├── urls.py                    # URL patterns
│   ├── tests/                     # Test directory
│   │   ├── unit/                  # Unit tests
│   │   └── integration/           # Integration tests
│   └── templates/                 # App-specific templates
│       └── accounts/
│
├── blockchain/                    # Blockchain integration app
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/                # Database migrations
│   ├── models.py                  # Database models
│   ├── forms.py                   # Form definitions
│   ├── views/                     # View modules
│   │   ├── __init__.py
│   │   ├── admin.py               # Admin views
│   │   ├── api.py                 # API views
│   │   ├── official.py            # Official user views
│   │   ├── public.py              # Public views
│   │   └── request.py             # Request handling views
│   ├── urls.py                    # URL patterns
│   ├── smart_contracts/           # Smart contract files
│   │   ├── AdministrativeRequests.sol  # Smart contract for requests
│   │   └── compiled/              # Compiled contract ABIs
│   ├── templatetags/              # Custom template tags
│   │   └── __init__.py
│   ├── tests/                     # Test directory
│   │   ├── unit/                  # Unit tests
│   │   └── integration/           # Integration tests
│   └── templates/                 # App-specific templates
│       └── blockchain/
│
├── commune_blockchain/            # Main project app
│   ├── __init__.py
│   ├── urls.py                    # Project-wide URL declarations
│   ├── asgi.py                    # ASGI config 
│   └── wsgi.py                    # WSGI config
│
├── config/                        # Configuration directory
│   ├── __init__.py
│   ├── settings.py                # Django settings
│   ├── urls.py                    # Main URL configuration
│   └── wsgi.py                    # WSGI configuration
│
├── deployment/                    # Deployment configuration
│   ├── Dockerfile                 # Docker image definition
│   ├── docker-compose.yml         # Docker Compose services
│   └── nginx/                     # Nginx configuration
│       └── default.conf           # Nginx config file
│
├── docs/                          # Documentation
│   ├── business_licenses/         # Business license documentation
│   ├── civil_registration/        # Civil registration documentation
│   ├── community_issues/          # Community issues documentation
│   ├── education_services/        # Education services documentation
│   ├── healthcare_services/       # Healthcare services documentation
│   ├── identity_documents/        # Identity documents documentation
│   ├── land_and_property/         # Land and property documentation
│   ├── other_services/            # Other services documentation
│   ├── social_services/           # Social services documentation
│   └── tax_and_fees/              # Tax and fees documentation
│
├── locale/                        # Localization files
│   ├── en/                        # English translations
│   │   └── LC_MESSAGES/           # Compiled message files
│   └── vi/                        # Vietnamese translations
│       └── LC_MESSAGES/           # Compiled message files
│
├── media/                         # User-uploaded files
│   ├── blockchain/                # Blockchain-related files
│   │   └── mock_data/             # Mock data for development
│   └── documents/                 # User documents
│
├── scripts/                       # Utility scripts
│   ├── __init__.py                
│   └── compile_translations.py    # Script to compile translation files
│
├── static/                        # Static files (CSS, JavaScript, images)
│   ├── css/                       # CSS stylesheets
│   │   ├── base/                  # Base styles
│   │   ├── components/            # Component styles
│   │   └── pages/                 # Page-specific styles
│   ├── img/                       # Images
│   │   ├── icons/                 # Icon files
│   │   ├── logos/                 # Logo files
│   │   └── ui/                    # UI graphics
│   └── js/                        # JavaScript files
│       ├── api/                   # API interaction
│       ├── components/            # Component scripts
│       ├── pages/                 # Page-specific scripts
│       └── utils/                 # Utility functions
│
└── templates/                     # Project-wide templates
    ├── accounts/                  # Account-related templates
    └── blockchain/                # Blockchain-related templates
        ├── admin/                 # Admin templates
        ├── base/                  # Base templates
        ├── official/              # Official user templates
        ├── public/                # Public templates
        └── requests/              # Request-related templates
``` 