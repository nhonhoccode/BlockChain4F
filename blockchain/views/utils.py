"""
Utility functions for blockchain views.
This module contains common utility functions used across multiple view modules.
"""
from django.http import HttpRequest
import logging

logger = logging.getLogger(__name__)

def get_client_ip(request: HttpRequest) -> str:
    """
    Get the client IP address from request object.
    
    Args:
        request: The HTTP request object
        
    Returns:
        The client's IP address as a string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip 