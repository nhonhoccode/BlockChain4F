#!/usr/bin/env python
"""
Script to compile translation files (.po to .mo) for the Commune Blockchain project.
"""
import os
import subprocess
import sys
from pathlib import Path

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

def compile_translations():
    """Compile all translation files in the locale directory."""
    locale_dir = BASE_DIR / 'locale'
    
    if not locale_dir.exists():
        print(f"Error: Locale directory not found at {locale_dir}")
        return False
    
    print(f"Compiling translation files in {locale_dir}...")
    
    # Find all .po files
    po_files = list(locale_dir.glob('**/LC_MESSAGES/django.po'))
    
    if not po_files:
        print("No .po files found to compile!")
        return False
    
    success_count = 0
    error_count = 0
    
    for po_file in po_files:
        lang = po_file.parent.parent.name
        print(f"Processing {lang} translations...")
        
        try:
            # Run msgfmt to compile the .po file to .mo
            result = subprocess.run(
                ['msgfmt', '--check', '-o', str(po_file.with_suffix('.mo')), str(po_file)],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print(f"✅ Successfully compiled {lang} translations")
                success_count += 1
            else:
                print(f"❌ Error compiling {lang} translations: {result.stderr}")
                error_count += 1
                
        except FileNotFoundError:
            print("❌ Error: msgfmt command not found. Make sure gettext is installed.")
            print("   On Ubuntu/Debian: apt-get install gettext")
            print("   On macOS: brew install gettext")
            print("   On Windows: Install gettext from http://gnuwin32.sourceforge.net/packages/gettext.htm")
            return False
        except Exception as e:
            print(f"❌ Error compiling {lang} translations: {str(e)}")
            error_count += 1
    
    print(f"\nCompilation complete: {success_count} succeeded, {error_count} failed")
    return error_count == 0

if __name__ == '__main__':
    success = compile_translations()
    sys.exit(0 if success else 1) 