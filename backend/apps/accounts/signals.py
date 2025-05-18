from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import transaction
from django.apps import apps

User = get_user_model()

@receiver(post_migrate)
def create_default_roles(sender, **kwargs):
    """
    Create default roles after migration
    """
    # Only run this for the accounts app
    if sender.name != 'apps.accounts':
        return
    
    # Import models here to avoid circular import
    Role = apps.get_model('accounts', 'Role')
    
    # Create default roles
    with transaction.atomic():
        # Chairman role
        Role.objects.get_or_create(
            name=Role.CHAIRMAN,
            defaults={'description': 'Chủ tịch xã (Admin)'}
        )
        
        # Officer role
        Role.objects.get_or_create(
            name=Role.OFFICER,
            defaults={'description': 'Cán bộ xã'}
        )
        
        # Citizen role
        Role.objects.get_or_create(
            name=Role.CITIZEN,
            defaults={'description': 'Công dân'}
        )
        
        print("Default roles created successfully")

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    """
    Create default admin account after migration
    """
    # Only run this for the accounts app
    if sender.name != 'apps.accounts':
        return
    
    # Import models here to avoid circular import
    Role = apps.get_model('accounts', 'Role')
    
    # Default admin credentials
    email = 'admin@gov.com'
    password = 'Admin@123'
    first_name = 'Admin'
    last_name = 'User'
    phone_number = '123456789'
    address = 'TP. HCM'
    
    # Check if admin already exists
    if User.objects.filter(email=email).exists():
        return
    
    try:
        # Get chairman role
        chairman_role = Role.objects.get(name=Role.CHAIRMAN)
        
        # Create admin user
        with transaction.atomic():
            # Create new user
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone_number,
                is_staff=True,
                is_superuser=True,
                is_verified=True
            )
            
            # Assign chairman role
            user.roles.add(chairman_role)
            
            # Update profile if available
            if hasattr(user, 'profile'):
                profile = user.profile
                if hasattr(profile, 'address'):
                    profile.address = address
                    profile.save()
            
            print(f"Default admin account created successfully: {email}")
    
    except Exception as e:
        print(f"Error creating default admin account: {str(e)}")

# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     """
#     Create profile when a new user is created
#     """
#     Profile = apps.get_model('accounts', 'Profile')
#     if created:
#         Profile.objects.create(user=instance)
#     else:
#         if hasattr(instance, 'profile'):
#             instance.profile.save()
#         else:
#             Profile.objects.create(user=instance)

# @receiver(post_save, sender=User)
# def save_user_profile(sender, instance, **kwargs):
#     """
#     Save the user's profile whenever the user is saved
#     """
#     if hasattr(instance, 'profile'):
#         instance.profile.save()
#     else:
#         # Create profile if it doesn't exist
#         Profile = apps.get_model('accounts', 'Profile')
#         Profile.objects.create(
#             user=instance,
#             first_name=instance.first_name,
#             last_name=instance.last_name
#         ) 