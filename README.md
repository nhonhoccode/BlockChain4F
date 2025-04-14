# Commune Blockchain Administrative System

A transparent and secure system for managing commune-level administrative requests using blockchain technology.

## Features

- Secure user registration with role-based access control
- Administrative request submission and tracking
- Blockchain integration for transparency and immutability
- Role-based workflows for citizens, officials, and organizations

## User Roles

- **Citizen**: Can submit and track administrative requests
- **Commune Official**: Can process assigned requests (requires chairman approval)
- **Organization/Enterprise**: Can submit and manage requests for the organization
- **Commune Chairman**: Has administrative oversight and approval authority

## Installation

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Apply migrations: `python manage.py migrate`
6. Create a chairman account (see below)
7. Run the development server: `python manage.py runserver`

## Chairman Accounts

### Automatic Chairman Assignment

Accounts created using the following methods are automatically assigned the chairman role:

1. **Django's createsuperuser command**: `python manage.py createsuperuser`
2. **Users with admin access**: Any user with `is_staff=True` or `is_superuser=True`

### Creating a Chairman Account

You can also explicitly create a chairman account using the following management command:

```bash
python manage.py create_chairman username [--email EMAIL] [--first_name FIRST_NAME] [--last_name LAST_NAME]
```

Example:
```bash
python manage.py create_chairman chairman_user --email chairman@example.com --first_name John --last_name Doe
```

You will be prompted to enter:
- Password (if not provided)
- Email, first name, and last name (if not provided as arguments)
- Phone number
- Citizen ID (CCCD)
- Address

**Important**: Chairman accounts have full administrative privileges. Keep the credentials secure.

### Updating Existing Users to Chairman Role

If you have existing superusers or staff users that need to be updated to the chairman role, run:

```bash
python manage.py update_chairman_roles
```

## User Registration Process

1. Users can register as:
   - Citizens
   - Commune Officials (requires chairman approval)
   - Organizations/Enterprises

2. During registration, users must provide:
   - Personal information (name, email, etc.)
   - Phone number
   - Citizen ID (CCCD)
   - Address

3. For privacy, phone numbers and citizen IDs are partially masked, displaying only the last three digits.

4. Commune officials must be approved by the chairman before they can access administrative functions.

## Administrative Request Workflow

1. Citizens or organizations submit administrative requests
2. The chairman reviews and assigns requests to commune officials
3. Officials process the requests and update their status
4. Citizens can track the status of their requests
5. All transactions are recorded on the blockchain for transparency

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
SECRET_KEY=your_secret_key
DEBUG=True
BLOCKCHAIN_PROVIDER_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_private_key
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 