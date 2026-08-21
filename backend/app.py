from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# -----------------------------------------
# LOAD TRAINED AI MODEL
# -----------------------------------------

model = joblib.load("pyrolysis_model.pkl")

FEATURES = [
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
]


# -----------------------------------------
# HOME
# -----------------------------------------

@app.route("/", methods=["GET"])
def home():
    return "PyroCycle AI Backend is running!"


# -----------------------------------------
# AI PREDICTION
# -----------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400


        # ---------------------------------
        # CHECK REQUIRED FIELDS
        # ---------------------------------

        missing = [
            feature
            for feature in FEATURES
            if feature not in data
        ]

        if missing:

            return jsonify({
                "success": False,
                "error": "Missing input fields",
                "missing": missing
            }), 400


        # ---------------------------------
        # CREATE MODEL INPUT
        # ---------------------------------

        input_data = pd.DataFrame([{

            "HDPE_wt_percent":
                float(data["HDPE_wt_percent"]),

            "LDPE_wt_percent":
                float(data["LDPE_wt_percent"]),

            "PP_wt_percent":
                float(data["PP_wt_percent"]),

            "PS_wt_percent":
                float(data["PS_wt_percent"]),

            "PVC_wt_percent":
                float(data["PVC_wt_percent"]),

            "PET_wt_percent":
                float(data["PET_wt_percent"]),

            "Temperature_C":
                float(data["Temperature_C"]),

            "Heating_Rate_C_per_min":
                float(data["Heating_Rate_C_per_min"]),

            "Particle_Size_mm":
                float(data["Particle_Size_mm"]),

            "Feed_Size_g":
                float(data["Feed_Size_g"]),

            "Catalyst":
                str(data["Catalyst"]),

            "Reactor_Type":
                str(data["Reactor_Type"])

        }], columns=FEATURES)


        # ---------------------------------
        # AI PREDICTION
        # ---------------------------------

        oil_prediction = model.predict(input_data)[0]

        oil_prediction = float(oil_prediction)


        # Keep percentage within valid range
        oil_prediction = max(
            0,
            min(100, oil_prediction)
        )


        # ---------------------------------
        # RETURN RESULT
        # ---------------------------------

        return jsonify({

            "success": True,

            "oil": round(
                oil_prediction,
                2
            )

        })


    except Exception as e:

        print(
            "Prediction error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                "Prediction failed",

            "details":
                str(e)

        }), 500


# -----------------------------------------
# RUN SERVER
# -----------------------------------------

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(
        host="0.0.0.0",
        port=port
    )