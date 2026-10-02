from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.pyrolysis_service import predict_yields

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict', methods=['POST'])
@jwt_required(optional=True)
def predict():
    data = request.json or {}
    results = predict_yields(data)
    return jsonify(results), 200
