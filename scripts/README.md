# Scripts Directory

This directory contains utility scripts for the Commune Blockchain project.

## Available Scripts

### `compile_translations.py`

Compiles translation files (.po) to their binary format (.mo) for use in the application.

```bash
python scripts/compile_translations.py
```

Or, using the Makefile:

```bash
make compile-messages
```

### Requirements

Some scripts may require additional dependencies:
- For translation compilation: GNU gettext tools must be installed on your system
- All Python dependencies are listed in the project's requirements.txt

## Adding New Scripts

When adding new scripts to this directory:

1. Make sure to document their purpose and usage in this README
2. Add an entry in the Makefile if the script should be part of a common workflow
3. Follow Python best practices (docstrings, error handling, etc.)
4. Include the script in the `__init__.py` if it provides importable functions

## Available Scripts

- `create_categories.py`: Creates default request categories in the database

## Running Scripts

Scripts can be run directly from the project root directory:

```bash
# Compile translations
python scripts/compile_translations.py

# Create default categories
python scripts/create_categories.py
```

Some scripts are also available through the Makefile:

```bash
# Compile translations
make translations
```

## Creating New Scripts

When adding new utility scripts to this directory:

1. Follow the existing pattern of script organization
2. Include docstrings and comments for clarity
3. Add appropriate error handling and logging
4. Update this README with information about the new script
5. Consider adding a Makefile command for frequently used scripts

## Guidelines

- Scripts should be self-contained and have clear, single responsibilities
- Include a descriptive docstring at the top explaining the purpose
- Add command-line arguments for flexibility using `argparse` when appropriate
- Handle errors gracefully with informative messages
- Log important actions and results 