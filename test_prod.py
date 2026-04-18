import urllib.request
import urllib.error
from urllib.request import Request, urlopen

try:
    print("Testando Register completo...")
    
    # Boundary definitions
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    
    # Fields to send mimicking the user's screenshot
    fields = {
        'nome': 'Garratas LDA',
        'email': 'garrafa_test@hotmail.com',
        'password': '123',
        'cargo': 'cliente',
        'is_admin': 'false',
        'documento': '00.000.000/0000-00',
        'veiculos': '[]',
        'tipo_pessoa': 'PJ',
        'ie': '0000000000000',
        'im': '0000000000000',
        'telefone': '(75) 99999-9999',
        'regime_tributario': 'Simples Nacional',
        'nome_fantasia': 'Garratas LDA'
    }
    
    body = bytearray()
    for key, value in fields.items():
        body.extend(f'--{boundary}\r\n'.encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{key}"\r\n\r\n'.encode('utf-8'))
        body.extend(f'{value}\r\n'.encode('utf-8'))
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))
    
    req = Request('https://contabilidade-erp.onrender.com/api/register', data=bytes(body), headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}'
    })
    
    resp = urlopen(req)
    print("REGISTER SUCCESS:", resp.read().decode())
    
except urllib.error.HTTPError as e:
    print("REGISTER HTTPERROR:", e.code)
    print("RESPONSE:", e.read().decode())
except Exception as e:
    print("REGISTER ERROR:", e)
