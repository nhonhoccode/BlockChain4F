"""
ASGI config for commune_blockchain project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'commune_blockchain.settings')

application = get_asgi_application() 