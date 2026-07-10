"""
ROX Dashboard — ZIP Packager
Creates a deployment-ready .zip file for EasyPanel upload.
Run: python zip_dashboard.py
Output: RoxDashboard.zip (in the parent directory)
"""

import zipfile
import os

# Define the base directory (where this script lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
OUTPUT_ZIP = os.path.join(PARENT_DIR, 'RoxDashboard.zip')

# Files and folders to include
INCLUDE = [
    'index.html',
    'styles.css',
    'app.js',
    'dados.json',
    'assets',
]

def create_zip():
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zf:
        for item in INCLUDE:
            full_path = os.path.join(BASE_DIR, item)
            if os.path.isfile(full_path):
                zf.write(full_path, item)
                print(f'  + {item}')
            elif os.path.isdir(full_path):
                for root, dirs, files in os.walk(full_path):
                    for f in files:
                        file_path = os.path.join(root, f)
                        arcname = os.path.relpath(file_path, BASE_DIR)
                        zf.write(file_path, arcname)
                        print(f'  + {arcname}')

    size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    try:
        print(f'\n[OK] ZIP criado com sucesso: {OUTPUT_ZIP}')
    except UnicodeEncodeError:
        print(f'\n[OK] ZIP criado com sucesso (caminho possui caracteres especiais).')
    print(f'     Tamanho: {size_kb:.1f} KB')
    try:
        print(f'\n[DEPLOY] Arraste o arquivo "{os.path.basename(OUTPUT_ZIP)}" para o EasyPanel!')
    except UnicodeEncodeError:
        print(f'\n[DEPLOY] Arraste o arquivo ZIP criado para o EasyPanel!')

if __name__ == '__main__':
    print('ROX Dashboard -- Criando pacote para deploy...\n')
    create_zip()
