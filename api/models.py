from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    sobrenome = db.Column(db.String(100), nullable=False)
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
    nome_fantasia = db.Column(db.String(255), nullable=True)

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
