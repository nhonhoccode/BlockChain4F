from django import template
import locale
import os
import json

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Get an item from a dictionary using its key."""
    return dictionary.get(key, 0)

@register.filter
def mask_name(name):
    """Mask a name for privacy, showing only first letter and last 2 characters."""
    if not name or len(name) <= 3:
        return name
    
    first_char = name[0]
    last_chars = name[-2:]
    masked_middle = '*' * (len(name) - 3)
    
    return f"{first_char}{masked_middle}{last_chars}"

@register.filter
def format_field_name(name):
    """Format a field name by replacing underscores with spaces and capitalizing each word."""
    if not name:
        return name
    
    # Replace underscores with spaces
    formatted = name.replace('_', ' ')
    
    # Capitalize each word
    formatted = ' '.join(word.capitalize() for word in formatted.split())
    
    return formatted 

@register.filter
def is_sensitive_field(field_name):
    """Check if field is sensitive and should be handled specially."""
    sensitive_fields = [
        'csrf', 'password', 'token', 'secret', 'key', 'private',
        'ssn', 'social_security', 'credit_card', 'card_number'
    ]
    
    field_lower = field_name.lower()
    for sensitive in sensitive_fields:
        if sensitive in field_lower:
            return True
    
    return False

@register.filter
def format_field_value(field_name, value):
    """Format field value based on field name."""
    if is_sensitive_field(field_name):
        if value and len(str(value)) > 4:
            # Show only last 4 characters for sensitive fields
            return f"{'*' * (len(str(value)) - 4)}{str(value)[-4:]}"
        return "********"
    
    return value 

@register.filter
def get_meta(obj):
    """Safely get _meta field from a dictionary."""
    if isinstance(obj, dict):
        return obj.get('_meta', {})
    return {}

@register.filter
def get_files(obj):
    """Safely get _files field from a dictionary."""
    if isinstance(obj, dict):
        return obj.get('_files', {})
    return {}

@register.simple_tag
def has_meta(dictionary):
    """Check if a dictionary has _meta field."""
    if not dictionary:
        return False
    return '_meta' in dictionary and dictionary['_meta']

@register.filter
def startswith(text, starts):
    """Check if text starts with the specified string."""
    if text is None:
        return False
    return str(text).startswith(starts)

@register.filter
def contains(text, substring):
    """Check if text contains the specified string."""
    if text is None:
        return False
    return substring in str(text)

@register.filter
def filesizeformat(bytes):
    """Format file size in bytes to human-readable format."""
    try:
        bytes = float(bytes)
        if bytes < 1024:
            return f"{bytes:.0f} bytes"
        elif bytes < 1024 * 1024:
            return f"{bytes/1024:.1f} KB"
        elif bytes < 1024 * 1024 * 1024:
            return f"{bytes/(1024*1024):.1f} MB"
        else:
            return f"{bytes/(1024*1024*1024):.1f} GB"
    except:
        return "0 bytes"

@register.filter
def contains(queryset, user):
    """Check if a queryset contains the specified user."""
    if not queryset or not user or not user.is_authenticated:
        return False
    return queryset.filter(id=user.id).exists()

@register.filter
def currency(value):
    """Format a value as currency."""
    try:
        # Try to set locale for proper currency formatting (may not work in all environments)
        locale.setlocale(locale.LC_ALL, '')
    except:
        pass
    
    try:
        # Convert to float if it's not
        value = float(value)
        return f"${value:,.2f}"
    except (ValueError, TypeError):
        return "$0.00"

@register.filter
def file_extension(filename):
    """Extract the file extension from a filename."""
    try:
        filename = str(filename)
        return os.path.splitext(filename)[1].lstrip('.').upper()
    except:
        return ""

@register.filter
def pprint(value):
    """Pretty print JSON or dictionary data."""
    try:
        if isinstance(value, str):
            # Try to parse as JSON string
            value = json.loads(value)
        
        # Format with indentation
        return json.dumps(value, indent=2, sort_keys=True)
    except:
        # Return as is if it's not valid JSON
        return str(value)

@register.filter
def split(value, delimiter=','):
    """Split a string into a list based on a delimiter."""
    if value is None:
        return []
    return value.split(delimiter) 