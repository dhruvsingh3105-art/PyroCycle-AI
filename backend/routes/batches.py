import uuid
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import db
from models.batch import Batch
from models.buyer import Buyer
from models.user import User

batches_bp = Blueprint('batches', __name__, url_prefix='/api')

def generate_batch_code():
    now = datetime.utcnow()
    suffix = str(uuid.uuid4().hex[:6]).upper()
    return f"PYRO-{now.strftime('%Y%m')}-{suffix}"

@batches_bp.route('/buyers', methods=['GET'])
def get_buyers():
    """List available buyers with optional matching against waste composition"""
    buyers = Buyer.query.filter_by(is_active=True).all()
    
    # If no buyers exist, seed default buyers
    if not buyers:
        seed_buyers = [
            Buyer(
                name="EcoPlast Recyclers",
                location="North Zone (3.2 km)",
                accepts=json.dumps(["HDPE", "PP", "LDPE"]),
                price_per_kg=json.dumps({"HDPE": 48, "PP": 50, "LDPE": 38}),
                pickup_charge=80.0
            ),
            Buyer(
                name="GreenCycle Aggregator",
                location="Central Hub (4.7 km)",
                accepts=json.dumps(["HDPE", "PP", "LDPE", "PS", "PET", "PVC"]),
                price_per_kg=json.dumps({"HDPE": 46, "PP": 48, "LDPE": 36, "PS": 40, "PET": 34, "PVC": 26}),
                pickup_charge=100.0
            ),
            Buyer(
                name="Eco Plastic Recovery",
                location="East Industrial Area (6.1 km)",
                accepts=json.dumps(["PP", "HDPE", "PS", "PET"]),
                price_per_kg=json.dumps({"PP": 52, "HDPE": 50, "PS": 44, "PET": 36}),
                pickup_charge=120.0
            ),
            Buyer(
                name="PyroEnergy Polymers",
                location="South Processing Plant (8.5 km)",
                accepts=json.dumps(["PP", "HDPE", "LDPE", "PS"]),
                price_per_kg=json.dumps({"PP": 51, "HDPE": 49, "LDPE": 39, "PS": 43}),
                pickup_charge=150.0
            ),
        ]
        db.session.add_all(seed_buyers)
        db.session.commit()
        buyers = Buyer.query.filter_by(is_active=True).all()

    # Optional match scoring based on provided query composition
    comp_param = request.args.get('composition')
    target_comp = {}
    if comp_param:
        try:
            target_comp = json.loads(comp_param)
        except Exception:
            pass

    results = []
    for b in buyers:
        b_dict = b.to_dict()
        accepts_list = b.get_accepts()
        
        # Calculate match percentage if composition was supplied
        if target_comp:
            matched_wt = sum(v for k, v in target_comp.items() if k in accepts_list and v > 0)
            total_wt = sum(target_comp.values()) or 100
            b_dict['match_score'] = round((matched_wt / total_wt) * 100)
        else:
            b_dict['match_score'] = 95
            
        results.append(b_dict)

    # Sort by highest match score and lowest pickup charge
    results.sort(key=lambda x: (-x.get('match_score', 0), x.get('pickup_charge', 999)))

    return jsonify({"success": True, "buyers": results}), 200


@batches_bp.route('/batches', methods=['POST'])
@jwt_required()
def create_batch():
    """Worker creates and submits a new plastic waste batch"""
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}

    batch_code = data.get('batch_code') or generate_batch_code()
    composition = data.get('composition') or {}
    est_weight_kg = float(data.get('weight') or data.get('est_weight_kg') or 0.0)
    est_value = float(data.get('worker_amount') or data.get('est_value') or data.get('final_payout') or 0.0)
    gross_value = float(data.get('gross_value') or 0.0)
    final_payout = float(data.get('final_payout') or est_value)
    buyer_id = data.get('buyer_id')
    ai_confidence = str(data.get('ai_confidence') or "86%")
    ai_notes = data.get('ai_notes') or "AI vision visual estimate"

    batch = Batch(
        batch_code=batch_code,
        worker_id=current_user_id,
        buyer_id=buyer_id,
        status="SUBMITTED",
        ai_composition=json.dumps(composition),
        ai_confidence=ai_confidence,
        ai_notes=ai_notes,
        est_weight_kg=est_weight_kg,
        est_value=est_value,
        gross_value=gross_value,
        final_payout=final_payout
    )

    db.session.add(batch)
    db.session.commit()

    return jsonify({
        "success": True,
        "msg": "Batch registered successfully",
        "batch": batch.to_dict()
    }), 201


@batches_bp.route('/batches', methods=['GET'])
@jwt_required(optional=True)
def get_batches():
    """List batches. If worker, lists their batches. If industry/admin, lists all batches."""
    current_user_id = get_jwt_identity()
    
    query = Batch.query
    
    # If user is worker, show their own batches
    if current_user_id:
        user = User.query.get(current_user_id)
        if user and user.role == 'worker':
            query = query.filter_by(worker_id=current_user_id)

    # Status filter if passed
    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter_by(status=status_filter.upper())

    batches = query.order_by(Batch.created_at.desc()).all()

    # Enrich with worker and buyer info
    enriched = []
    for b in batches:
        b_dict = b.to_dict()
        worker = User.query.get(b.worker_id) if b.worker_id else None
        buyer = Buyer.query.get(b.buyer_id) if b.buyer_id else None

        b_dict['worker_name'] = worker.name if worker else "Independent Worker"
        b_dict['worker_location'] = worker.location if worker else "Local Collection Area"
        b_dict['buyer_name'] = buyer.name if buyer else "Direct Recycler"
        enriched.append(b_dict)

    return jsonify({"success": True, "batches": enriched}), 200


@batches_bp.route('/batches/<batch_id>', methods=['GET'])
def get_batch_detail(batch_id):
    """Retrieve full details of a specific batch"""
    batch = Batch.query.get(batch_id)
    if not batch:
        batch = Batch.query.filter_by(batch_code=batch_id).first()
    if not batch:
        return jsonify({"msg": "Batch not found"}), 404

    b_dict = batch.to_dict()
    worker = User.query.get(batch.worker_id) if batch.worker_id else None
    buyer = Buyer.query.get(batch.buyer_id) if batch.buyer_id else None

    b_dict['worker_name'] = worker.name if worker else "Independent Worker"
    b_dict['worker_location'] = worker.location if worker else "Local Collection Area"
    b_dict['buyer_name'] = buyer.name if buyer else "Direct Recycler"

    return jsonify({"success": True, "batch": b_dict}), 200


@batches_bp.route('/batches/<batch_id>', methods=['PATCH'])
@jwt_required(optional=True)
def update_batch(batch_id):
    """Update status, verification, or pyrolysis results for a batch"""
    batch = Batch.query.get(batch_id)
    if not batch:
        batch = Batch.query.filter_by(batch_code=batch_id).first()
    if not batch:
        return jsonify({"msg": "Batch not found"}), 404

    data = request.get_json() or {}

    if 'status' in data:
        batch.status = str(data['status']).upper()
    if 'actual_weight_kg' in data:
        batch.actual_weight_kg = float(data['actual_weight_kg'])
    if 'actual_composition' in data:
        batch.actual_composition = json.dumps(data['actual_composition'])
    if 'verification_notes' in data:
        batch.verification_notes = str(data['verification_notes'])
    if 'oil_yield' in data:
        batch.oil_yield = float(data['oil_yield'])
    if 'gas_yield' in data:
        batch.gas_yield = float(data['gas_yield'])
    if 'wax_yield' in data:
        batch.wax_yield = float(data['wax_yield'])
    if 'char_yield' in data:
        batch.char_yield = float(data['char_yield'])
    if 'final_payout' in data:
        batch.final_payout = float(data['final_payout'])
    if 'settlement_status' in data:
        batch.settlement_status = str(data['settlement_status'])
        if batch.settlement_status.upper() == 'SETTLED':
            batch.settled_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"success": True, "batch": batch.to_dict()}), 200
