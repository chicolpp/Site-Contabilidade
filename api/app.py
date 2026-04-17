from flask import Flask, request, send_from_directory
from flask_cors import CORS
from database import db
from models import User
from werkzeug.utils import secure_filename
import jwt
import datetime
import os
import base64

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

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
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

with app.app_context():
    db.create_all()
    seed_admin()

@app.route("/login", methods=["POST"])
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

@app.route("/register", methods=["POST"])
def register():
    try:
        nome = request.form.get("nome", "")
        sobrenome = request.form.get("sobrenome", "")
        email = request.form.get("email")
        password = request.form.get("password")
        cargo = request.form.get("cargo", "contabilidade")
        is_admin = request.form.get("is_admin", "false").lower() == "true"
        documento = request.form.get("documento", "")

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
        )

        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {"message": "Usuário criado", "user": user.to_dict()}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": f"Erro interno: {str(e)}"}, 500

@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        usuarios = User.query.order_by(User.data_criacao.desc()).all()
        return {"usuarios": [u.to_dict() for u in usuarios]}
    except Exception as e:
        return {"error": f"Erro ao listar usuários: {str(e)}"}, 500

@app.route("/usuarios/<int:id>", methods=["PUT"])
def editar_usuario(id):
    user = User.query.get_or_404(id)
    
    if request.content_type and 'multipart/form-data' in request.content_type:
        user.nome = request.form.get("nome", user.nome)
        user.sobrenome = request.form.get("sobrenome", user.sobrenome)
        user.email = request.form.get("email", user.email)
        user.cargo = request.form.get("cargo", user.cargo)
        user.is_admin = request.form.get("is_admin", "false").lower() == "true"
        user.ativo = request.form.get("ativo", "true").lower() == "true"
        user.documento = request.form.get("documento", user.documento)
        
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
        if data.get("password"):
            user.set_password(data["password"])

    db.session.commit()
    return {"message": "Usuário atualizado", "user": user.to_dict()}, 200

@app.route("/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return {"message": "Usuário deletado"}, 200

@app.route("/usuarios/<int:id>/toggle-status", methods=["POST"])
def toggle_status_usuario(id):
    user = User.query.get_or_404(id)
    user.ativo = not user.ativo
    db.session.commit()
    return {"message": "Status alterado", "user": user.to_dict()}, 200

# Servir frontend React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if not path or path == '/':
        return send_from_directory(app.static_folder, 'index.html')
    
    # Se o arquivo existir fisicamente na pasta dist, serve ele (logo.png, icons/...)
    full_path = os.path.join(app.static_folder, path)
    if os.path.isfile(full_path):
        return send_from_directory(app.static_folder, path)
    
    # Se o caminho parece um arquivo (tem extensão) mas não existe, 404
    if '.' in path:
        return "Arquivo não encontrado", 404
        
    # Qualquer outra coisa (rotas do React como /dashboard), devolve o index do React
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(port=5000, debug=True)
