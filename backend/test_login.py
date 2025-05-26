#!/usr/bin/env python
"""
Simple test script to validate login functionality.
Run this directly from the command line: python test_login.py
"""

import os
import sys
import json
import requests

# URL to test
URL = "http://localhost:8000/api/simple-login/"
TEST_USER = "nhon1@gmail.com"
TEST_PASSWORD = "Nhon@123"

def test_login():
    """Test the login endpoint with a direct HTTP request"""
    print(f"Testing login at: {URL}")
    
    # Prepare data
    data = {
        "username": TEST_USER,
        "password": TEST_PASSWORD,
        "role": "citizen"
    }
    
    # Make the request
    print(f"Sending request with data: {json.dumps(data)}")
    try:
        response = requests.post(
            URL, 
            json=data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        
        # Print results
        print(f"Status code: {response.status_code}")
        print(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
        
        if response.status_code == 200:
            print(f"Success! Response data: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"Failed! Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Set up Django environment
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.development")
    
    # Run the test
    result = test_login()
    sys.exit(0 if result else 1) 