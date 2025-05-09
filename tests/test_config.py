"""
Configuration settings for test environment.
"""

# Test database configuration
TEST_DATABASE = {
    'NAME': 'test_db',
    'USER': 'test_user',
    'PASSWORD': 'test_password',
    'HOST': 'localhost',
    'PORT': '5432',
}

# Blockchain testing settings
BLOCKCHAIN_TEST_SETTINGS = {
    'PROVIDER_URL': 'http://localhost:8545',
    'ACCOUNTS': [
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000003',
    ],
    'PRIVATE_KEYS': [
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333333333333333333333333333',
    ],
    'CHAIN_ID': 1337,
    'GAS_LIMIT': 6721975,
}

# Mock data paths
MOCK_DATA_DIR = 'tests/data'

# Test timeouts - critical for performance optimization
DEFAULT_TIMEOUT = 3  # seconds - optimized from 5 for faster tests
BLOCKCHAIN_TIMEOUT = 10  # seconds

# Email testing
EMAIL_TEST_CONFIG = {
    'USE_FILE_BACKEND': True,
    'TEST_RECIPIENTS': ['test@example.com', 'admin@example.com'],
    'IGNORE_EMAILS': ['no-reply@example.com']
}

# Performance testing thresholds
PERFORMANCE_THRESHOLDS = {
    'API_RESPONSE_TIME': 0.5,  # seconds
    'PAGE_LOAD_TIME': 1.0,     # seconds
    'DATABASE_QUERY_TIME': 0.2 # seconds
} 