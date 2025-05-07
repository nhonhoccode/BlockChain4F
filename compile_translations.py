import os
import sys
import polib

def compile_po_to_mo(po_file, mo_file):
    """Compile a .po file to .mo format"""
    try:
        po = polib.pofile(po_file)
        po.save_as_mofile(mo_file)
        print(f"Compiled {po_file} to {mo_file}")
        return True
    except Exception as e:
        print(f"Error compiling {po_file}: {e}")
        return False

def main():
    """Compile all .po files to .mo files"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    locale_dir = os.path.join(base_dir, 'locale')
    
    if not os.path.exists(locale_dir):
        print(f"Locale directory not found: {locale_dir}")
        return False
    
    success = True
    
    # Walk through all locale directories
    for root, dirs, files in os.walk(locale_dir):
        for file in files:
            if file.endswith('.po'):
                po_file = os.path.join(root, file)
                mo_file = os.path.join(root, file[:-3] + '.mo')
                if not compile_po_to_mo(po_file, mo_file):
                    success = False
    
    return success

if __name__ == '__main__':
    try:
        import polib
    except ImportError:
        print("polib module not found. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "polib"])
        import polib
    
    if main():
        print("All translation files compiled successfully.")
    else:
        print("Some translation files failed to compile.")
        sys.exit(1) 