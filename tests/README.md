# Tests Directory

This directory contains the test suite for the Commune Blockchain application.

## Structure

- `unit/`: Unit tests for individual components
- `integration/`: Integration tests for component interactions
- `test_config.py`: Configuration for test environment
- `conftest.py`: Pytest fixtures and configuration (in the project root)

## Running Tests

You can run the tests using:

```bash
# Run all tests
python -m pytest

# Run only unit tests
python -m pytest tests/unit/

# Run only integration tests
python -m pytest tests/integration/

# Run with coverage report
python -m pytest --cov=./ --cov-report=html
```

## Mock Data

Test fixtures and mock data can be found in the `tests/data` directory.

## Writing Tests

When writing new tests:

1. Organize them according to the component or feature being tested
2. Use the fixtures defined in `conftest.py`
3. Follow the naming convention `test_*.py` for test files
4. Document the purpose of each test class and function
5. Keep tests isolated and idempotent 