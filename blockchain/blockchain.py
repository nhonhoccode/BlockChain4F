"""
Mock blockchain integration module for development.
"""
import json
import os
from pathlib import Path
from django.conf import settings
from decimal import Decimal
import hashlib
import time
import pickle
from typing import Dict, List, Any, Optional
from django.utils import timezone

# File path for storing mock blockchain data
try:
    # Use MEDIA_ROOT if available for better file storage
    if hasattr(settings, 'MEDIA_ROOT'):
        MOCK_DATA_DIR = os.path.join(settings.MEDIA_ROOT, 'blockchain', 'mock_data')
        os.makedirs(MOCK_DATA_DIR, exist_ok=True)
        MOCK_DATA_FILE = os.path.join(MOCK_DATA_DIR, 'mock_blockchain_data.pkl')
        print(f"DEBUG - Using MEDIA_ROOT for blockchain data: {MOCK_DATA_FILE}")
    else:
        MOCK_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock_blockchain_data.pkl')
        print(f"DEBUG - Using default path for blockchain data: {MOCK_DATA_FILE}")
except Exception as e:
    print(f"DEBUG - Error setting up MOCK_DATA_FILE path: {str(e)}")
    MOCK_DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock_blockchain_data.pkl')

# Initialize empty mock requests dictionary
_mock_requests = {}

# Initialize transaction counter
_mock_transaction_counter = 0

# Initialize mock officers dictionary (not set)
_mock_officers = {}

def _load_mock_data():
    """Load mock blockchain data from file if it exists"""
    global _mock_requests, _mock_transaction_counter, _mock_officers
    try:
        if os.path.exists(MOCK_DATA_FILE):
            with open(MOCK_DATA_FILE, 'rb') as f:
                data = pickle.load(f)
                _mock_requests = data.get('requests', {})
                _mock_transaction_counter = data.get('transaction_counter', 0)
                _mock_officers = data.get('officers', {})
            print(f"Loaded {len(_mock_requests)} requests from mock blockchain data")
        else:
            print("No existing mock blockchain data file found")
            _mock_requests = {}
            _mock_transaction_counter = 0
            _mock_officers = {}
    except Exception as e:
        print(f"Error loading mock blockchain data: {e}")
        _mock_requests = {}
        _mock_transaction_counter = 0
        _mock_officers = {}

def _save_mock_data():
    """Save mock blockchain data to file"""
    try:
        print(f"DEBUG - _save_mock_data called")
        data = {
            'requests': _mock_requests,
            'transaction_counter': _mock_transaction_counter,
            'officers': _mock_officers
        }
        print(f"DEBUG - Preparing to save {len(_mock_requests)} requests to {MOCK_DATA_FILE}")
        
        # Check if parent directory exists and create if needed
        dir_path = os.path.dirname(MOCK_DATA_FILE)
        if not os.path.exists(dir_path):
            print(f"DEBUG - Creating directory: {dir_path}")
            os.makedirs(dir_path, exist_ok=True)
        
        # Ensure we have permission to write to the file
        print(f"DEBUG - Opening file for writing: {MOCK_DATA_FILE}")
        with open(MOCK_DATA_FILE, 'wb') as f:
            print(f"DEBUG - Pickling data")
            pickle.dump(data, f)
        print(f"DEBUG - Saved {len(_mock_requests)} requests to mock blockchain data")
        return True
    except Exception as e:
        import traceback
        print(f"DEBUG - Error saving mock blockchain data: {str(e)}")
        print(f"DEBUG - Traceback: {traceback.format_exc()}")
        return False  # Return False instead of raising exception

# Load mock data when module is imported
_load_mock_data()

def _generate_tx_hash():
    """Generate a mock transaction hash."""
    global _mock_transaction_counter
    try:
        print(f"DEBUG - _generate_tx_hash called, current counter: {_mock_transaction_counter}")
        _mock_transaction_counter += 1
        print(f"DEBUG - Incremented counter to: {_mock_transaction_counter}")
        
        # Try to save but don't fail if it doesn't work
        save_result = _save_mock_data()
        if not save_result:
            print(f"DEBUG - Failed to save counter change, but continuing with hash generation")
        
        tx_hash = hashlib.sha256(str(_mock_transaction_counter).encode()).hexdigest()
        print(f"DEBUG - Generated hash: {tx_hash}")
        return tx_hash
    except Exception as e:
        print(f"DEBUG - Error generating tx hash: {str(e)}")
        # Generate a fallback hash if there's an error
        import random
        fallback_hash = hashlib.sha256(str(random.randint(1, 1000000)).encode()).hexdigest()
        print(f"DEBUG - Using fallback hash: {fallback_hash}")
        return fallback_hash

def create_request(user_id: str, request_type: str, description: str, payment_amount: float) -> Dict[str, Any]:
    """Create a new request on the blockchain"""
    try:
        print(f"DEBUG - blockchain.create_request called with: user_id={user_id}, type={request_type}, payment={payment_amount}")
        
        # Validate inputs
        if not user_id:
            return {'error': 'user_id is required'}
        
        if not request_type:
            return {'error': 'request_type is required'}
        
        # Handle payment amount
        try:
            payment_amount = float(payment_amount)
            if payment_amount < 0:
                return {'error': 'payment_amount must be a positive number'}
        except (ValueError, TypeError):
            return {'error': f'Invalid payment_amount: {payment_amount}. Must be a valid number.'}
        
        # Generate a unique request ID based on timestamp
        request_id = int(time.time())
        print(f"DEBUG - Generated request_id: {request_id}")
        
        # Hash the user ID for privacy
        hashed_user_id = hashlib.sha256(str(user_id).encode()).hexdigest()
        print(f"DEBUG - Hashed user_id: {hashed_user_id}")
        
        # Create request data
        request_data = {
            'id': request_id,
            'user_id_hash': hashed_user_id,
            'request_type': request_type,
            'description': description,
            'payment_amount': payment_amount,
            'status': 'PENDING',
            'created_at': int(time.time()),
            'updated_at': int(time.time()),
            'status_history': [{'status': 'PENDING', 'timestamp': int(time.time())}]
        }
        print(f"DEBUG - Created request_data object")
        
        # Store in mock requests dictionary
        _mock_requests[request_id] = request_data
        print(f"DEBUG - Stored request in _mock_requests")
        
        try:
            _save_mock_data()
            print(f"DEBUG - Saved mock data successfully")
        except Exception as save_error:
            print(f"DEBUG - Error saving mock data: {str(save_error)}")
            return {
                'error': f"Failed to save blockchain data: {str(save_error)}"
            }
        
        print(f"DEBUG - Returning success response with tx_hash")
        return {
            'request': request_data,
            'tx_hash': _generate_tx_hash()
        }
    except Exception as e:
        print(f"DEBUG - Error in create_request: {str(e)}")
        import traceback
        print(f"DEBUG - Traceback: {traceback.format_exc()}")
        return {
            'error': str(e)
        }

def create_request_with_id(request_id: int, user_id: str, request_type: str, description: str, payment_amount: float) -> Dict[str, Any]:
    """Create a new request on the blockchain with a specific ID"""
    try:
        # Hash the user ID for privacy
        hashed_user_id = hashlib.sha256(str(user_id).encode()).hexdigest()
        
        # Create request data
        request_data = {
            'id': request_id,
            'user_id_hash': hashed_user_id,
            'request_type': request_type,
            'description': description,
            'payment_amount': payment_amount,
            'status': 'PENDING',
            'created_at': int(time.time()),
            'updated_at': int(time.time()),
            'status_history': [{'status': 'PENDING', 'timestamp': int(time.time())}]
        }
        
        # Store in mock requests dictionary
        _mock_requests[request_id] = request_data
        _save_mock_data()
        
        return {
            'request': request_data,
            'tx_hash': _generate_tx_hash()
        }
    except Exception as e:
        return {
            'error': str(e)
        }

def get_request_details(request_id: int) -> Optional[Dict[str, Any]]:
    """Get details of a specific request from the blockchain"""
    # Load the latest data before retrieving
    _load_mock_data()
    
    # Return request data if exists, None otherwise
    return _mock_requests.get(request_id)

def update_request_status(request_id: int, new_status: str, comment: str = "") -> Dict[str, Any]:
    """Update the status of a request on the blockchain"""
    try:
        # Load the latest data before updating
        _load_mock_data()
        
        if request_id not in _mock_requests:
            return {
                'error': f"Request with ID {request_id} not found in the blockchain"
            }
        
        # Get request data
        request_data = _mock_requests[request_id]
        
        # Update status
        old_status = request_data['status']
        request_data['status'] = new_status
        request_data['updated_at'] = int(time.time())
        
        # Add to status history
        status_update = {
            'status': new_status, 
            'timestamp': int(time.time()),
            'comment': comment
        }
        
        if 'status_history' not in request_data:
            request_data['status_history'] = []
        
        request_data['status_history'].append(status_update)
        
        # Update in mock requests dictionary
        _mock_requests[request_id] = request_data
        _save_mock_data()
        
        return {
            'request': request_data,
            'tx_hash': _generate_tx_hash()
        }
    except Exception as e:
        return {
            'error': str(e)
        }

def get_all_requests() -> List[Dict[str, Any]]:
    """Get all requests from the blockchain"""
    # Load the latest data before retrieving
    _load_mock_data()
    
    # Return all requests
    return list(_mock_requests.values())

def get_user_requests(user_id: str) -> List[Dict[str, Any]]:
    """Get all requests for a specific user from the blockchain"""
    # Load the latest data before retrieving
    _load_mock_data()
    
    # Hash the user ID for comparison
    hashed_user_id = hashlib.sha256(str(user_id).encode()).hexdigest()
    
    # Filter requests by user ID hash
    return [
        request for request in _mock_requests.values()
        if request.get('user_id_hash') == hashed_user_id
    ]

def is_admin(address):
    """Check if an address is an admin on the mock blockchain."""
    return True  # For development, always return True

def is_officer(address):
    """Check if an address belongs to a registered officer."""
    try:
        _load_mock_data()
        return address in _mock_officers and _mock_officers[address].get('active', False)
    except Exception as e:
        raise Exception(f"Failed to verify officer status: {str(e)}")

def get_officer_authority(address):
    """Get the authority level of an officer."""
    try:
        _load_mock_data()
        if address in _mock_officers and _mock_officers[address].get('active', False):
            return _mock_officers[address].get('authority_level', 'LOW')
        return None
    except Exception as e:
        raise Exception(f"Failed to get officer authority: {str(e)}")

def delegate_authority(address, authority_level):
    """Delegate authority to an officer."""
    try:
        _load_mock_data()
        
        # Verify the authority level is valid
        valid_levels = ['LOW', 'MEDIUM', 'HIGH']
        if authority_level not in valid_levels:
            return {'success': False, 'error': f'Invalid authority level. Must be one of: {", ".join(valid_levels)}'}
        
        # Check if officer exists
        if address not in _mock_officers:
            return {'success': False, 'error': 'Officer not found in blockchain'}
        
        # Update officer's authority
        _mock_officers[address].update({
            'active': True,
            'authority_level': authority_level,
            'delegation_date': str(timezone.now())
        })
        
        _save_mock_data()
        return {'success': True, 'message': f'Authority level {authority_level} delegated successfully'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def assign_request(request_id, officer_address):
    """Assign a request to an officer."""
    try:
        # Load mock data
        _load_mock_data()
        
        # Check if request exists
        if request_id not in _mock_requests:
            return {'success': False, 'error': 'Request not found'}
            
        # Check if officer is authorized
        if not is_officer(officer_address):
            return {'success': False, 'error': 'Officer not authorized'}
            
        # Get officer's authority level
        officer_data = _mock_officers.get(officer_address, {})
        officer_authority = officer_data.get('authority_level', 'LOW')
        
        # Check if officer has sufficient authority for the request type
        request_type = _mock_requests[request_id].get('type', 'BASIC')
        required_authority = {
            'BASIC': 'LOW',
            'VERIFICATION': 'MEDIUM',
            'COMPLEX': 'HIGH'
        }.get(request_type, 'LOW')
        
        authority_levels = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2}
        if authority_levels.get(officer_authority, -1) < authority_levels.get(required_authority, 0):
            return {
                'success': False, 
                'error': f'Officer does not have sufficient authority level for this request type. Required: {required_authority}, Current: {officer_authority}'
            }
            
        # Update request with officer assignment
        _mock_requests[request_id]['assigned_to'] = officer_address
        _mock_requests[request_id]['status'] = 'ASSIGNED'
        _mock_requests[request_id]['assigned_authority'] = officer_authority
        
        # Add officer to mock officers dictionary if not already there
        if officer_address not in _mock_officers:
            _mock_officers[officer_address] = {
                'active': True,
                'authority_level': officer_authority,
                'delegation_date': str(timezone.now())
            }
        
        # Save updated data
        _save_mock_data()
        
        # Generate transaction hash
        tx_hash = _generate_tx_hash()
        
        return {
            'success': True,
            'request': _mock_requests[request_id],
            'tx_hash': tx_hash
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def add_officer(address):
    """Add a new officer to the blockchain."""
    try:
        _load_mock_data()
        if address not in _mock_officers:
            _mock_officers[address] = {
                'active': True,
                'authority_level': 'LOW',  # Default to lowest authority
                'delegation_date': str(timezone.now())
            }
            _save_mock_data()
            return True
        return False
    except Exception as e:
        raise Exception(f"Failed to add officer: {str(e)}") 