import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db
from models.user import User
from models.buyer import Buyer
from models.batch import Batch
from routes.auth import auth_bp
from routes.predict import predict_bp
from routes.scan import scan_bp
from routes.batches import batches_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    
    db.init_app(app)
    jwt = JWTManager(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(scan_bp)
    app.register_blueprint(batches_bp)

    @app.route("/")
    def home():
        return jsonify({"msg": "PyroCycle AI Backend is running!", "status": "ok"})

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # Ensure we have some buyers seeded
        if Buyer.query.count() == 0:
            b1 = Buyer(name="EcoPlast Recyclers", location="North Zone", accepts='["HDPE", "PP"]', price_per_kg='{"HDPE": 45, "PP": 50}', pickup_charge=100)
            b2 = Buyer(name="Global Polymers", location="South Zone", accepts='["PET", "LDPE"]', price_per_kg='{"PET": 35, "LDPE": 40}', pickup_charge=150)
            b3 = Buyer(name="PyroEnergy Inc", location="East Zone", accepts='["PVC", "PS"]', price_per_kg='{"PVC": 30, "PS": 42}', pickup_charge=200)
            db.session.add_all([b1, b2, b3])
            db.session.commit()
            print("Seeded database with initial buyers.")
            
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))