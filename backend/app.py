from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("pyrolysis_model.pkl")


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        input_data = pd.DataFrame([[
            float(data["HDPE_wt_percent"]),
            float(data["LDPE_wt_percent"]),
            float(data["PP_wt_percent"]),
            float(data["PS_wt_percent"]),
            float(data["PVC_wt_percent"]),
            float(data["PET_wt_percent"]),
            float(data["Temperature_C"]),
            float(data["Heating_Rate_C_per_min"]),
            float(data["Particle_Size_mm"]),
            float(data["Feed_Size_g"]),
            data["Catalyst"],
            data["Reactor_Type"]
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

        prediction = model.predict(input_data)[0]

        return jsonify({
            "oil": round(float(prediction), 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )