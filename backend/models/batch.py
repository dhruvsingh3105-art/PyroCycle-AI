import uuid
import json
from datetime import datetime
from . import db

class Batch(db.Model):
    __tablename__ = 'batches'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_code = db.Column(db.String(50), unique=True)
    worker_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    buyer_id = db.Column(db.String(36), db.ForeignKey('buyers.id'))
    status = db.Column(db.String(20), default='SUBMITTED')

    # AI Estimate
    ai_image_url = db.Column(db.String(500))
    ai_composition = db.Column(db.Text) # JSON
    ai_confidence = db.Column(db.String(20))
    ai_notes = db.Column(db.Text)
    est_weight_kg = db.Column(db.Float)
    est_value = db.Column(db.Float)

    # Verification
    actual_weight_kg = db.Column(db.Float)
    actual_composition = db.Column(db.Text) # JSON
    verification_notes = db.Column(db.Text)
    verified_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    verified_at = db.Column(db.DateTime)

    # Process
    pyrolysis_params = db.Column(db.Text) # JSON
    oil_yield = db.Column(db.Float)
    gas_yield = db.Column(db.Float)
    wax_yield = db.Column(db.Float)
    char_yield = db.Column(db.Float)
    processed_at = db.Column(db.DateTime)

    # Settlement
    gross_value = db.Column(db.Float)
    deductions = db.Column(db.Text) # JSON
    final_payout = db.Column(db.Float)
    settlement_status = db.Column(db.String(20))
    settled_at = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        parsed_comp = {}
        if self.ai_composition:
            try:
                parsed_comp = json.loads(self.ai_composition)
            except Exception:
                parsed_comp = {}

        parsed_actual_comp = {}
        if self.actual_composition:
            try:
                parsed_actual_comp = json.loads(self.actual_composition)
            except Exception:
                parsed_actual_comp = {}

        return {
            'id': self.id,
            'batch_code': self.batch_code,
            'worker_id': self.worker_id,
            'buyer_id': self.buyer_id,
            'status': self.status,
            'ai_image_url': self.ai_image_url,
            'composition': parsed_comp,
            'ai_confidence': self.ai_confidence,
            'ai_notes': self.ai_notes,
            'est_weight_kg': self.est_weight_kg,
            'est_value': self.est_value,
            'actual_weight_kg': self.actual_weight_kg,
            'actual_composition': parsed_actual_comp,
            'gross_value': self.gross_value,
            'final_payout': self.final_payout,
            'settlement_status': self.settlement_status,
            'settled_at': self.settled_at.isoformat() if self.settled_at else None,
            'oil_yield': self.oil_yield,
            'gas_yield': self.gas_yield,
            'wax_yield': self.wax_yield,
            'char_yield': self.char_yield,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
