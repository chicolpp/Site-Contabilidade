from flask import Flask, request, send_from_directory
from flask_cors import CORS
from database import db
from models import User, Documento
from sqlalchemy import text
from werkzeug.utils import secure_filename
import jwt
import datetime
import os
import base64
import mimetypes

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def file_to_base64(file):
    if not file:
        return ""
    try:
        file_content = file.read()
        if not file_content:
            return ""
        base64_string = base64.b64encode(file_content).decode('utf-8')
        mime_type = file.content_type or 'image/png'
        return f"data:{mime_type};base64,{base64_string}"
    except Exception as e:
        print(f"Erro ao converter arquivo para Base64: {e}")
        return ""
from flask_cors import CORS
from database import db
from models import User
import jwt
import datetime
import os

# Busca o dist em um lugar absoluto relativo ao executável (root do projeto)
# Como app.py está em '/api', '..' sobe para a raiz
STATIC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
STATIC_FOLDER = os.path.join(STATIC_ROOT, 'dist')

app = Flask(__name__)
CORS(app)

# Configuração de Banco de Dados (Suporte ao Render/Postgres)
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = db_url or "postgresql+psycopg2://postgres:postgres@localhost:5432/contabilidade"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "super-secret-key-contabilidade")

db.init_app(app)

def seed_admin():
    admin = User.query.filter_by(email="admin@contabilidade.com").first()
    if not admin:
        admin = User(
            nome="Admin",
            sobrenome="Sistema",
            email="admin@contabilidade.com",
            cargo="admin",
            is_admin=True,
            ativo=True
        )
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("Conta admin criada: admin@contabilidade.com / admin123")

def apply_migrations():
    """Tenta adicionar as colunas novas caso elas não existam (Migration Manual)"""
    try:
        with db.engine.connect() as conn:
            # PostgreSQL suporta 'ADD COLUMN IF NOT EXISTS'
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_pessoa VARCHAR(2)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS ie VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS im VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS data_abertura VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone VARCHAR(20)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS regime_tributario VARCHAR(50)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(150)"))
            conn.commit()
            print("Migrações de colunas aplicadas com sucesso.")
    except Exception as e:
        print(f"Erro ao aplicar migrações: {e}")

with app.app_context():
    db.create_all()
    apply_migrations() # Garante que colunas novas entrem em tabelas existentes
    seed_admin()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    print(f"Tentativa de login: {data.get('email')}")

    user = User.query.filter_by(email=data.get("email")).first()

    if not user or not user.check_password(data.get("password")):
        return {"error": "Credenciais inválidas"}, 401

    if not user.ativo:
        return {"error": "Usuário desativado. Contate o administrador."}, 403

    user.ultimo_acesso = datetime.datetime.now()
    db.session.commit()

    token = jwt.encode(
        {
            "user_id": user.id,
            "is_admin": user.is_admin,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": user.to_dict()
    }

@app.route("/api/register", methods=["POST"])
def register():
    try:
        nome = request.form.get("nome", "")
        sobrenome = request.form.get("sobrenome", "")
        email = request.form.get("email")
        password = request.form.get("password")
        cargo = request.form.get("cargo", "contabilidade")
        is_admin = request.form.get("is_admin", "false").lower() == "true"
        documento = request.form.get("documento", "")
        
        # Novos campos cliente
        tipo_pessoa = request.form.get("tipo_pessoa", "")
        ie = request.form.get("ie", "")
        im = request.form.get("im", "")
        data_abertura = request.form.get("data_abertura", "")
        telefone = request.form.get("telefone", "")
        regime_tributario = request.form.get("regime_tributario", "")
        nome_fantasia = request.form.get("nome_fantasia", "")

        if not email or not password:
            return {"error": "Email e senha são obrigatórios"}, 400

        if User.query.filter_by(email=email).first():
            return {"error": "Email já cadastrado"}, 400

        foto_base64 = request.form.get("foto", "")
        if not foto_base64.startswith("data:image"):
            if 'foto' in request.files:
                file = request.files['foto']
                if file and file.filename and allowed_file(file.filename):
                    foto_base64 = file_to_base64(file)

        user = User(
            nome=nome,
            sobrenome=sobrenome,
            email=email,
            cargo=cargo,
            foto=foto_base64,
            is_admin=is_admin,
            documento=documento,
            tipo_pessoa=tipo_pessoa,
            ie=ie,
            im=im,
            data_abertura=data_abertura,
            telefone=telefone,
            regime_tributario=regime_tributario,
            nome_fantasia=nome_fantasia,
        )

        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {"message": "Usuário criado", "user": user.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Erro interno: {str(e)}"}, 500

@app.route("/api/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        usuarios = User.query.order_by(User.data_criacao.desc()).all()
        return {"usuarios": [u.to_dict() for u in usuarios]}
    except Exception as e:
        return {"error": f"Erro ao listar usuários: {str(e)}"}, 500

@app.route("/api/usuarios/<int:id>", methods=["PUT"])
def editar_usuario(id):
    user = User.query.get_or_404(id)
    
    if request.content_type and 'multipart/form-data' in request.content_type:
        user.nome = request.form.get("nome", user.nome)
        user.sobrenome = request.form.get("sobrenome", user.sobrenome)
        user.email = request.form.get("email", user.email)
        user.cargo = request.form.get("cargo", user.cargo)
        user.is_admin = request.form.get("is_admin", str(user.is_admin)).lower() == "true"
        user.ativo = request.form.get("ativo", str(user.ativo)).lower() == "true"
        user.documento = request.form.get("documento", user.documento)
        
        user.tipo_pessoa = request.form.get("tipo_pessoa", user.tipo_pessoa)
        user.ie = request.form.get("ie", user.ie)
        user.im = request.form.get("im", user.im)
        user.data_abertura = request.form.get("data_abertura", user.data_abertura)
        user.telefone = request.form.get("telefone", user.telefone)
        user.regime_tributario = request.form.get("regime_tributario", user.regime_tributario)
        user.nome_fantasia = request.form.get("nome_fantasia", user.nome_fantasia)
        
        if request.form.get("password"):
            user.set_password(request.form.get("password"))
        
        nova_foto = request.form.get("foto")
        if nova_foto and nova_foto.startswith("data:image"):
            user.foto = nova_foto
        elif 'foto' in request.files:
            file = request.files['foto']
            if file and file.filename and allowed_file(file.filename):
                user.foto = file_to_base64(file)
    else:
        data = request.json or {}
        user.nome = data.get("nome", user.nome)
        user.sobrenome = data.get("sobrenome", user.sobrenome)
        user.email = data.get("email", user.email)
        user.cargo = data.get("cargo", user.cargo)
        user.is_admin = data.get("is_admin", user.is_admin)
        user.ativo = data.get("ativo", user.ativo)
        user.documento = data.get("documento", user.documento)
        user.nome_fantasia = data.get("nome_fantasia", user.nome_fantasia)
        if data.get("password"):
            user.set_password(data["password"])

    db.session.commit()
    return {"message": "Usuário atualizado", "user": user.to_dict()}, 200

@app.route("/api/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return {"message": "Usuário deletado"}, 200

@app.route("/api/usuarios/<int:id>/toggle-status", methods=["POST"])
def toggle_status_usuario(id):
    user = User.query.get_or_404(id)
    user.ativo = not user.ativo
    db.session.commit()
    return {"message": "Status alterado", "user": user.to_dict()}, 200

@app.route("/api/usuarios/clientes", methods=["GET"])
def listar_clientes():
    try:
        clientes = User.query.filter_by(cargo="cliente").all()
        return {"clientes": [{"id": c.id, "nome": c.nome, "sobrenome": c.sobrenome, "nome_fantasia": c.nome_fantasia} for c in clientes]}
    except Exception as e:
        return {"error": f"Erro ao listar clientes: {str(e)}"}, 500

@app.route("/api/documentos", methods=["POST"])
def upload_documento():
    try:
        data = request.json
        if not data:
            return {"error": "Dados não fornecidos"}, 400
            
        required = ["cliente_id", "setor", "tipo_documento", "competencia", "titulo", "arquivo"]
        for field in required:
            if not data.get(field):
                return {"error": f"Campo {field} é obrigatório"}, 400
                
        doc = Documento(
            cliente_id=data["cliente_id"],
            setor=data["setor"],
            tipo_documento=data["tipo_documento"],
            competencia=data["competencia"],
            titulo=data["titulo"],
            descricao=data.get("descricao", ""),
            arquivo=data["arquivo"],
            extensao=data.get("extensao", "pdf")
        )
        
        db.session.add(doc)
        db.session.commit()
        
        return {"message": "Documento enviado com sucesso", "documento": doc.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Erro ao enviar documento: {str(e)}"}, 500

# Servir frontend React de forma manual e robusta
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # API endpoints começam com /api/, não devem cair aqui se as rotas acima estiverem corretas
    # Mas por segurança, se o Flask chegou aqui, tentamos servir o arquivo físico ou o index.html
    
    if not path or path == '/':
        filename = 'index.html'
    else:
        filename = path
        
    full_path = os.path.join(STATIC_FOLDER, filename)
    
    # Se o arquivo não existir ou for uma pasta, servimos o index.html (SPA Fallback)
    if not os.path.exists(full_path) or os.path.isdir(full_path):
        full_path = os.path.join(STATIC_FOLDER, 'index.html')
        filename = 'index.html'

    try:
        if not os.path.exists(full_path):
            return "Página não encontrada", 404
            
        size = os.path.getsize(full_path)
        mime_type, _ = mimetypes.guess_type(full_path)
        
        # Log de diagnóstico para o painel do Render
        print(f"[MANUAL SERVE] Arquivo: {filename} | Tamanho: {size} bytes | MIME: {mime_type}")
        
        # Leitura binária direta para evitar qualquer bug de streaming/sendfile do SO
        with open(full_path, 'rb') as f:
            content = f.read()
            
        return content, 200, {
            'Content-Type': mime_type or 'application/octet-stream',
            'Content-Length': str(len(content))
        }
    except Exception as e:
        print(f"[ERR] Falha ao servir {filename}: {str(e)}")
        return "Erro interno do servidor ao carregar arquivo estático", 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
