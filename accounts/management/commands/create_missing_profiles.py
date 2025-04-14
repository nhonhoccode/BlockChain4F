from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile
from django.db import transaction


class Command(BaseCommand):
    help = 'Creates missing user profiles for existing users'

    def handle(self, *args, **options):
        users_without_profiles = []
        
        # Find users without profiles
        for user in User.objects.all():
            try:
                # Try to access the profile
                profile = user.profile
            except UserProfile.DoesNotExist:
                users_without_profiles.append(user)
        
        if not users_without_profiles:
            self.stdout.write(self.style.SUCCESS('All users have profiles. No action needed.'))
            return
        
        self.stdout.write(f'Found {len(users_without_profiles)} users without profiles.')
        
        # Create profiles for users that don't have them
        with transaction.atomic():
            for user in users_without_profiles:
                # Create a profile based on user type
                if user.is_superuser or user.is_staff:
                    # Superusers and staff are automatically chairmen
                    profile = UserProfile.objects.create(
                        user=user,
                        role='CHAIRMAN',
                        approval_status='APPROVED'
                    )
                    self.stdout.write(f'Created CHAIRMAN profile for user: {user.username}')
                else:
                    # Regular users get citizen profiles
                    profile = UserProfile.objects.create(
                        user=user,
                        role='CITIZEN',
                        approval_status='APPROVED'
                    )
                    self.stdout.write(f'Created CITIZEN profile for user: {user.username}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(users_without_profiles)} missing profiles.')) 