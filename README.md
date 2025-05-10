# Commune Blockchain Administrative System

A transparent and secure system for managing commune-level administrative requests using blockchain technology.

## Features

- Secure user registration with role-based access control
- Administrative request submission and tracking
- Blockchain integration for transparency and immutability
- Role-based workflows for citizens, officials, and organizations
- Multi-language support (English and Vietnamese)

## User Roles

- **Citizen**: Can submit and track administrative requests
- **Commune Official**: Can process assigned requests (requires chairman approval)
- **Organization/Enterprise**: Can submit and manage requests for the organization
- **Commune Chairman**: Has administrative oversight and approval authority

## Project Structure

The project follows a modular architecture for better organization and maintainability. See [project_structure.md](project_structure.md) for a detailed view of the project's structure.

## Quick Start with Make

The project includes a Makefile with common development tasks:

```bash
# Install dependencies
make install

# Run development server
make dev

# Run tests
make test

# Apply database migrations
make migrate

# Compile translation messages
make compile-messages

# Start Docker environment
make docker-build
make docker-up
```

Run `make help` to see all available commands.

## Installation

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables (see [Environment Variables](#environment-variables) section)
6. Apply migrations: `python manage.py migrate`
7. Create a chairman account (see below)
8. Run the development server: `python manage.py runserver`

## Docker Installation

To run the application with Docker:

1. Ensure Docker and Docker Compose are installed
2. Configure environment variables in `.env` file
3. Run: `make docker-build` and `make docker-up`
4. Access the application at http://localhost

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

Environment variables are crucial for configuring the application:

1. **Create your environment file**:
   - Copy the example file: `cp .env.example .env`
   - Or use the Makefile command: `make setup` (which will create a .env file if one doesn't exist)

2. **Edit your .env file**:
   - Replace placeholder values with your actual configuration
   - At minimum, set the following variables:
   
   ```
   SECRET_KEY=your_unique_secret_key
   DEBUG=True  # Set to False in production
   BLOCKCHAIN_PROVIDER_URL=http://127.0.0.1:8545
   CONTRACT_ADDRESS=your_contract_address
   PRIVATE_KEY=your_private_key
   ```

3. **Additional environment variables**:
   - The `.env.example` file contains more options with comments explaining each setting
   - For production, uncomment and configure the security settings

## Development

### Code Style

The project follows PEP 8 guidelines. We use:
- `black` for code formatting
- `flake8` for linting
- `isort` for import sorting

Run `make format` to automatically format your code.

### Testing

Run tests with `make test` or `python -m pytest`.

## Deployment

For production deployment:

1. Set `DEBUG=False` in your `.env` file
2. Configure a production-ready database (PostgreSQL recommended)
3. Enable security settings in `.env`
4. Set up proper email configuration
5. Use gunicorn or uwsgi for serving the application
6. Use Nginx as a reverse proxy

Alternatively, use Docker with `make docker-build` and `make docker-up`.

## Language Support

The system supports both English and Vietnamese languages. Users can switch languages using the language selector in the navigation bar.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 