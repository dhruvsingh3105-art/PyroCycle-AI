import uuid
import json
from . import db

class Buyer(db.Model):
    __tablename__ = 'buyers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    industry_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    accepts = db.Column(db.Text) # JSON string
    price_per_kg = db.Column(db.Text) # JSON string {PP: 50, HDPE: 48}
    pickup_charge = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)

    def set_accepts(self, accepts_list):
        self.accepts = json.dumps(accepts_list)
        
    def get_accepts(self):
        return json.loads(self.accepts) if self.accepts else []

    def set_price_per_kg(self, price_dict):
        self.price_per_kg = json.dumps(price_dict)
        
    def get_price_per_kg(self):
        return json.loads(self.price_per_kg) if self.price_per_kg else {}

    def to_dict(self):
        return {
            'id': self.id,
            'industry_id': self.industry_id,
            'name': self.name,
            'location': self.location,
            'accepts': self.get_accepts(),
            'price_per_kg': self.get_price_per_kg(),
            'pickup_charge': self.pickup_charge,
            'is_active': self.is_active
        }
