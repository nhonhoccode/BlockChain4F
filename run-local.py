#!/usr/bin/env python
"""
Django local development server runner with SQLite
"""
import os
import sys

if __name__ == '__main__':
    # Set the settings module to use local SQLite settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.local')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
    
    # Default to runserver if no command provided
    if len(sys.argv) == 1:
        sys.argv.append('runserver')
        sys.argv.append('0.0.0.0:8000')
    
    execute_from_command_line(sys.argv) 