# Commune Blockchain Project Structure

```
commune_blockchain/
├── manage.py                      # Django's command-line utility for administrative tasks
├── commune_blockchain/            # Main project directory
│   ├── __init__.py
│   ├── settings.py                # Project settings
│   ├── urls.py                    # URL declarations
│   ├── asgi.py                    # ASGI config
│   └── wsgi.py                    # WSGI config
├── blockchain/                    # Blockchain integration app
│   ├── __init__.py
│   ├── admin.py                   # Admin interface
│   ├── apps.py                    # App configuration
│   ├── migrations/                # Database migrations
│   ├── models.py                  # Database models
│   ├── smart_contracts/           # Smart contract files
│   │   ├── AdministrativeRequests.sol  # Smart contract for requests
│   │   └── compiled/              # Compiled contract ABIs
│   ├── blockchain.py              # Blockchain connection and interaction
│   ├── forms.py                   # Form definitions
│   ├── views.py                   # View functions
│   ├── urls.py                    # URL patterns
│   └── templates/                 # HTML templates
│       └── blockchain/
│           ├── index.html         # Homepage
│           ├── request_form.html  # Request submission form
│           └── track_request.html # Request tracking page
├── accounts/                      # User account management app
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── migrations/
│   ├── models.py
│   ├── forms.py
│   ├── views.py
│   ├── urls.py
│   └── templates/
│       └── accounts/
│           ├── login.html         # Login page
│           ├── register.html      # Registration page
│           └── profile.html       # User profile page
├── static/                        # Static files (CSS, JavaScript, images)
│   ├── css/
│   ├── js/
│   └── img/
├── templates/                     # Project-wide templates
│   ├── base.html                  # Base template with common elements
│   ├── header.html
│   └── footer.html
├── .env                           # Environment variables
└── requirements.txt               # Project dependencies
``` 