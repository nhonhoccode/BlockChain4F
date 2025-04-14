from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from accounts.models import UserProfile
from django.db import transaction
import getpass


class Command(BaseCommand):
    help = 'Creates a chairman account (limited to one per system)'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username for the chairman account')
        parser.add_argument('--email', type=str, help='Email address for the chairman account')
        parser.add_argument('--first_name', type=str, help='First name of the chairman')
        parser.add_argument('--last_name', type=str, help='Last name of the chairman')

    def handle(self, *args, **options):
        # Check if a chairman account already exists
        existing_chairman = UserProfile.objects.filter(role='CHAIRMAN').first()
        if existing_chairman:
            self.stdout.write(self.style.ERROR(
                f'A chairman account already exists (username: {existing_chairman.user.username}). '
                f'Only one chairman account is allowed in the system.'
            ))
            return

        # Note about superusers and staff users
        self.stdout.write(self.style.WARNING(
            'Note: Accounts created using createsuperuser or those with access to the admin page '
            'are automatically considered chairman accounts.'
        ))

        username = options['username']
        email = options.get('email')
        first_name = options.get('first_name')
        last_name = options.get('last_name')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'Username "{username}" is already taken.'))
            return

        # Prompt for password securely
        password = getpass.getpass('Enter password for chairman account: ')
        password_confirm = getpass.getpass('Confirm password: ')

        if password != password_confirm:
            self.stdout.write(self.style.ERROR('Passwords do not match.'))
            return

        if len(password) < 8:
            self.stdout.write(self.style.ERROR('Password must be at least 8 characters long.'))
            return

        # Prompt for additional information if not provided
        if not email:
            email = input('Email address: ')
        
        if not first_name:
            first_name = input('First name: ')
        
        if not last_name:
            last_name = input('Last name: ')

        # Prompt for personal information
        phone_number = input('Phone number: ')
        citizen_id = input('Citizen ID (CCCD): ')
        address = input('Address: ')

        try:
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=True,  # Give admin access
                    is_superuser=True  # Give superuser access
                )

                # Update profile
                profile = user.profile
                profile.role = 'CHAIRMAN'
                profile.phone_number = phone_number
                profile.citizen_id = citizen_id
                profile.address = address
                profile.save()

                self.stdout.write(self.style.SUCCESS(
                    f'Chairman account created successfully: {username}'
                ))
                self.stdout.write(self.style.WARNING(
                    'This account has full administrative privileges. Keep the credentials secure.'
                ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating chairman account: {str(e)}')) 