from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False) # Nome ou Razão Social
    sobrenome = db.Column(db.String(100), nullable=False)
    nome_fantasia = db.Column(db.String(150), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    cargo = db.Column(db.String(50), nullable=False, default="contador")
    foto = db.Column(db.Text, nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    ativo = db.Column(db.Boolean, default=True)
    documento = db.Column(db.String(20), nullable=True)
    
    # Novos campos para cargo 'cliente'
    tipo_pessoa = db.Column(db.String(2), nullable=True) # PF ou PJ
    ie = db.Column(db.String(20), nullable=True)
    im = db.Column(db.String(20), nullable=True)
    data_abertura = db.Column(db.String(20), nullable=True)
    telefone = db.Column(db.String(20), nullable=True)
    regime_tributario = db.Column(db.String(50), nullable=True)

    data_criacao = db.Column(db.DateTime, default=db.func.now())
    ultimo_acesso = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "sobrenome": self.sobrenome,
            "nome_fantasia": self.nome_fantasia or "",
            "email": self.email,
            "cargo": self.cargo,
            "foto": self.foto or "",
            "is_admin": self.is_admin,
            "ativo": self.ativo,
            "documento": self.documento or "",
            "tipo_pessoa": self.tipo_pessoa or "",
            "ie": self.ie or "",
            "im": self.im or "",
            "data_abertura": self.data_abertura or "",
            "telefone": self.telefone or "",
            "regime_tributario": self.regime_tributario or "",
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else "",
            "ultimo_acesso": self.ultimo_acesso.isoformat() if self.ultimo_acesso else "",
        }

class Documento(db.Model):
    __tablename__ = "documentos"

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    setor = db.Column(db.String(50), nullable=False)
    tipo_documento = db.Column(db.String(100), nullable=False)
    competencia = db.Column(db.String(20), nullable=False) # Formato YYYY-MM
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    arquivo = db.Column(db.Text, nullable=False) # Armazenado como Base64
    extensao = db.Column(db.String(10), nullable=True) # pdf, docx, png, etc
    data_upload = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "setor": self.setor,
            "tipo_documento": self.tipo_documento,
            "competencia": self.competencia,
            "titulo": self.titulo,
            "descricao": self.descricao or "",
            "arquivo": self.arquivo,
            "extensao": self.extensao,
            "data_upload": self.data_upload.isoformat() if self.data_upload else ""
        }
