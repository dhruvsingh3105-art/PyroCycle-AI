from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the new 325-row AI model
model = joblib.load("pyrolysis_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    plastic_type = data["plastic_type"]
    quantity = float(data["quantity"])
    temperature = float(data["temperature"])

    # Create plastic composition
    composition = {
        "HDPE": [100, 0, 0, 0, 0, 0],
        "LDPE": [0, 100, 0, 0, 0, 0],
        "PP":   [0, 0, 100, 0, 0, 0],
        "PS":   [0, 0, 0, 100, 0, 0],
        "PVC":  [0, 0, 0, 0, 100, 0],
        "PET":  [0, 0, 0, 0, 0, 100]
    }

    if plastic_type not in composition:
        return jsonify({"error": "Unsupported plastic type"}), 400

    values = composition[plastic_type]

    # Model input
    input_data = pd.DataFrame([[
        values[0],              # HDPE
        values[1],              # LDPE
        values[2],              # PP
        values[3],              # PS
        values[4],              # PVC
        values[5],              # PET
        temperature,            # Temperature
        10,                     # Heating rate
        3,                      # Particle size
        quantity * 1000,        # Feed size (kg -> g)
        "None",                 # Catalyst
        "Unknown"               # Reactor type
    ]], columns=[
        "HDPE_wt_percent",
        "LDPE_wt_percent",
        "PP_wt_percent",
        "PS_wt_percent",
        "PVC_wt_percent",
        "PET_wt_percent",
        "Temperature_C",
        "Heating_Rate_C_per_min",
        "Particle_Size_mm",
        "Feed_Size_g",
        "Catalyst",
        "Reactor_Type"
    ])

    # AI prediction
    oil_prediction = model.predict(input_data)[0]

    return jsonify({
        "oil": round(float(oil_prediction), 2)
    })


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


if __name__ == "__main__":
    app.run(debug=True)