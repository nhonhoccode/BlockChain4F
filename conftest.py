"""
Pytest configuration file for the blockchain application.
"""
import os
import pytest
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from accounts.models import UserProfile

@pytest.fixture
def api_client():
    """APIClient fixture for testing API endpoints."""
    return APIClient()

@pytest.fixture
def user():
    """Create a regular user for testing."""
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpassword',
        first_name='Test',
        last_name='User'
    )
    
    # Create user profile
    profile = UserProfile.objects.create(
        user=user,
        role='CITIZEN',
        approval_status='APPROVED',
        phone_number='1234567890',
        citizen_id='123456789012',
        address='Test Address'
    )
    
    return user

@pytest.fixture
def official_user():
    """Create an official user for testing."""
    user = User.objects.create_user(
        username='testofficial',
        email='official@example.com',
        password='testpassword',
        first_name='Test',
        last_name='Official'
    )
    
    # Create user profile
    profile = UserProfile.objects.create(
        user=user,
        role='OFFICIAL',
        approval_status='APPROVED',
        phone_number='0987654321',
        citizen_id='098765432109',
        address='Official Address',
        position='Test Position',
        department='Test Department'
    )
    
    return user

@pytest.fixture
def chairman_user():
    """Create a chairman user for testing."""
    user = User.objects.create_user(
        username='testchairman',
        email='chairman@example.com',
        password='testpassword',
        first_name='Test',
        last_name='Chairman'
    )
    
    # Create user profile
    profile = UserProfile.objects.create(
        user=user,
        role='CHAIRMAN',
        approval_status='APPROVED',
        phone_number='5555555555',
        citizen_id='555555555555',
        address='Chairman Address',
        position='Chairman',
        department='Commune Administration'
    )
    
    return user

@pytest.fixture
def auth_client(user):
    """APIClient with user authentication."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def official_client(official_user):
    """APIClient with official authentication."""
    client = APIClient()
    client.force_authenticate(user=official_user)
    return client

@pytest.fixture
def chairman_client(chairman_user):
    """APIClient with chairman authentication."""
    client = APIClient()
    client.force_authenticate(user=chairman_user)
    return client

@pytest.fixture
def mock_blockchain_connection():
    """Mock a connection to the blockchain."""
    # This would be implemented with a proper mock in a real test
    class MockBlockchain:
        def get_transaction(self, tx_hash):
            return {"status": "confirmed", "timestamp": "2023-01-01T00:00:00Z"}
        
        def submit_request(self, data):
            return {"tx_hash": "0x1234567890abcdef", "status": "pending"}
    
    return MockBlockchain() 