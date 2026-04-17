import sys
import os

# Adiciona a pasta /api ao path para que o Python encontre o app.py e models.py
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from app import app

if __name__ == "__main__":
    app.run()
