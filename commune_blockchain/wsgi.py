"""
WSGI config for commune_blockchain project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'commune_blockchain.settings')

application = get_wsgi_application() 