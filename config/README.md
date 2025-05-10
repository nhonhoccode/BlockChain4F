# Configuration Directory

This directory contains configuration files for the Commune Blockchain project.

## Files

- `__init__.py`: Package initialization file
- `settings.py`: Main Django settings file
- `urls.py`: Main URL configuration for the project
- `wsgi.py`: WSGI configuration for production deployment

## Usage

The settings are loaded from environment variables defined in the `.env` file at the project root. These configurations control various aspects of the application including:

- Django core settings
- Database configuration
- Authentication and security settings
- Blockchain connectivity settings
- Static and media files handling
- Internationalization and localization
- Email configuration
- Admin interface customization

## Environment Variables

All settings that need to be configured per environment are stored in the `.env` file and loaded using the python-decouple package. See `.env.example` at the project root for a template of available settings 