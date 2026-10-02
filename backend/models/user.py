import uuid
from datetime import datetime
from . import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'worker' or 'industry'
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(200)) # worker's area
    company_name = db.Column(db.String(100)) # industry only
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'name': self.name,
            'phone': self.phone,
            'location': self.location,
            'company_name': self.company_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
