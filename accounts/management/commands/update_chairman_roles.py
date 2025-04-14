from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile
from django.db import transaction


class Command(BaseCommand):
    help = 'Updates existing profiles to set superusers and staff users as chairmen'

    def handle(self, *args, **options):
        # Find all superusers and staff users
        admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
        
        if not admin_users.exists():
            self.stdout.write(self.style.WARNING('No superusers or staff users found.'))
            return
        
        updated_count = 0
        
        with transaction.atomic():
            for user in admin_users:
                try:
                    profile = user.profile
                    
                    # Update role if not already a chairman
                    if profile.role != 'CHAIRMAN':
                        profile.role = 'CHAIRMAN'
                        profile.approval_status = 'APPROVED'
                        profile.save()
                        
                        self.stdout.write(f'Updated user {user.username} to CHAIRMAN role.')
                        updated_count += 1
                    else:
                        self.stdout.write(f'User {user.username} is already a CHAIRMAN.')
                        
                except UserProfile.DoesNotExist:
                    # Create profile if it doesn't exist
                    profile = UserProfile.objects.create(
                        user=user,
                        role='CHAIRMAN',
                        approval_status='APPROVED'
                    )
                    self.stdout.write(f'Created CHAIRMAN profile for user: {user.username}')
                    updated_count += 1
        
        if updated_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} users to CHAIRMAN role.'))
        else:
            self.stdout.write(self.style.SUCCESS('All superusers and staff users are already chairmen.')) 