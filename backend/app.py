from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

model = joblib.load("pyrolysis_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    plastic_type = data["plastic_type"]
    quantity = float(data["quantity"])
    temperature = float(data["temperature"])

    # Set plastic composition
    plastics = {
        "HDPE": [100, 0, 0, 0, 0, 0],
        "LDPE": [0, 100, 0, 0, 0, 0],
        "PP":   [0, 0, 100, 0, 0, 0],
        "PS":   [0, 0, 0, 100, 0, 0],
        "PVC":  [0, 0, 0, 0, 100, 0],
        "PET":  [0, 0, 0, 0, 0, 100]
    }

    composition = plastics.get(plastic_type, [100, 0, 0, 0, 0, 0])

    input_data = pd.DataFrame([[
        *composition,
        temperature,
        10,          # default heating rate
        3,           # default particle size
        quantity,
        "None",      # catalyst
        "Batch"      # reactor type
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

    oil = model.predict(input_data)[0]

    return jsonify({
        "oil": round(float(oil), 2)
    })


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


if __name__ == "__main__":
    app.run()