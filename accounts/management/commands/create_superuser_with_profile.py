from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile
from django.db import transaction
import getpass


class Command(BaseCommand):
    help = 'Creates a superuser with a profile'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username for the superuser')
        parser.add_argument('--email', type=str, help='Email address for the superuser')
        parser.add_argument('--first_name', type=str, help='First name of the superuser')
        parser.add_argument('--last_name', type=str, help='Last name of the superuser')

    def handle(self, *args, **options):
        username = options['username']
        email = options.get('email')
        first_name = options.get('first_name')
        last_name = options.get('last_name')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'Username "{username}" is already taken.'))
            return

        # Prompt for password securely
        password = getpass.getpass('Enter password for superuser: ')
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
                    is_staff=True,
                    is_superuser=True
                )

                # Update profile
                profile = user.profile
                profile.role = 'CHAIRMAN'  # Set as chairman
                profile.phone_number = phone_number
                profile.citizen_id = citizen_id
                profile.address = address
                profile.save()

                self.stdout.write(self.style.SUCCESS(
                    f'Superuser created successfully: {username}'
                ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating superuser: {str(e)}')) 