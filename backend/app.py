from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Your REAL 325-row oil-yield model
model = joblib.load("pyrolysis_model.pkl")


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    # Inputs from frontend
    plastic_type = data.get("plastic_type", "HDPE")
    temperature = float(data.get("temperature", 450))
    heating_rate = float(data.get("heating_rate", 10))
    particle_size = float(data.get("particle_size", 1))
    feed_size = float(data.get("feed_size", 10))
    catalyst = data.get("catalyst", "None")
    reactor_type = data.get("reactor_type", "Fixed Bed")

    # Plastic composition
    composition = {
        "HDPE": [100, 0, 0, 0, 0, 0],
        "LDPE": [0, 100, 0, 0, 0, 0],
        "PP":   [0, 0, 100, 0, 0, 0],
        "PS":   [0, 0, 0, 100, 0, 0],
        "PVC":  [0, 0, 0, 0, 100, 0],
        "PET":  [0, 0, 0, 0, 0, 100]
    }

    if plastic_type not in composition:
        plastic_type = "HDPE"

    comp = composition[plastic_type]

    # Create input matching the 325-row model
    input_data = pd.DataFrame([[
        comp[0],
        comp[1],
        comp[2],
        comp[3],
        comp[4],
        comp[5],
        temperature,
        heating_rate,
        particle_size,
        feed_size,
        catalyst,
        reactor_type
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

    # REAL AI prediction from 325-row literature model
    oil = float(model.predict(input_data)[0])

    # Keep within physical percentage range
    oil = max(0, min(oil, 100))

    # Remaining product fraction
    remaining = 100 - oil

    # Demonstration estimates based on plastic type.
    # These are NOT independently trained predictions.
    ratios = {
        "HDPE": {"gas": 0.35, "wax": 0.45, "char": 0.20},
        "LDPE": {"gas": 0.30, "wax": 0.50, "char": 0.20},
        "PP":   {"gas": 0.45, "wax": 0.40, "char": 0.15},
        "PS":   {"gas": 0.20, "wax": 0.60, "char": 0.20},
        "PVC":  {"gas": 0.40, "wax": 0.30, "char": 0.30},
        "PET":  {"gas": 0.30, "wax": 0.20, "char": 0.50}
    }

    ratio = ratios[plastic_type]

    gas = remaining * ratio["gas"]
    wax = remaining * ratio["wax"]
    char = remaining * ratio["char"]

    return jsonify({
        "oil": round(oil, 2),
        "gas": round(gas, 2),
        "wax": round(wax, 2),
        "char": round(char, 2),
        "note": "Oil is predicted by the 325-row literature-trained AI model. Gas, wax and char are prototype estimates."
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )