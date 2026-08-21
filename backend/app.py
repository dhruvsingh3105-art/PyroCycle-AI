from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load trained AI model
model = joblib.load(
    os.path.join(os.path.dirname(__file__), "pyrolysis_model.pkl")
)


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        # Create input DataFrame using the same
        # features used while training the model
        input_data = pd.DataFrame([{
            "HDPE_wt_percent": float(data["HDPE_wt_percent"]),
            "LDPE_wt_percent": float(data["LDPE_wt_percent"]),
            "PP_wt_percent": float(data["PP_wt_percent"]),
            "PS_wt_percent": float(data["PS_wt_percent"]),
            "PVC_wt_percent": float(data["PVC_wt_percent"]),
            "PET_wt_percent": float(data["PET_wt_percent"]),
            "Temperature_C": float(data["Temperature_C"]),
            "Heating_Rate_C_per_min": float(data["Heating_Rate_C_per_min"]),
            "Particle_Size_mm": float(data["Particle_Size_mm"]),
            "Feed_Size_g": float(data["Feed_Size_g"]),
            "Catalyst": data["Catalyst"],
            "Reactor_Type": data["Reactor_Type"]
        }])

        # AI prediction
        oil_prediction = model.predict(input_data)[0]

        return jsonify({
            "oil": round(float(oil_prediction), 2)
        })

    except Exception as e:

        print("Prediction Error:", str(e))

        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)