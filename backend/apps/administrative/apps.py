from django.apps import AppConfig


class AdministrativeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.administrative'

    def ready(self):
        import apps.administrative.signals
