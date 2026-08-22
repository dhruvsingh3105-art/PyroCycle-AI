from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# REAL 325-row literature-trained oil-yield model
model = joblib.load("pyrolysis_model.pkl")


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json or {}

    # ---------------------------------------------------------
    # READ FRONTEND INPUTS
    # ---------------------------------------------------------

    hdpe = float(data.get("HDPE_wt_percent", 0))
    ldpe = float(data.get("LDPE_wt_percent", 0))
    pp = float(data.get("PP_wt_percent", 0))
    ps = float(data.get("PS_wt_percent", 0))
    pvc = float(data.get("PVC_wt_percent", 0))
    pet = float(data.get("PET_wt_percent", 0))

    temperature = float(data.get("Temperature_C", 450))
    heating_rate = float(data.get("Heating_Rate_C_per_min", 10))
    particle_size = float(data.get("Particle_Size_mm", 1))
    feed_size = float(data.get("Feed_Size_g", 10))

    catalyst = data.get("Catalyst", "None")
    reactor_type = data.get("Reactor_Type", "Fixed Bed")


    # ---------------------------------------------------------
    # NORMALIZE POLYMER COMPOSITION
    # ---------------------------------------------------------

    total = hdpe + ldpe + pp + ps + pvc + pet

    if total <= 0:
        hdpe = 100
        ldpe = pp = ps = pvc = pet = 0
        total = 100

    hdpe = hdpe / total * 100
    ldpe = ldpe / total * 100
    pp = pp / total * 100
    ps = ps / total * 100
    pvc = pvc / total * 100
    pet = pet / total * 100


    # ---------------------------------------------------------
    # INPUT FOR THE REAL 325-ROW MODEL
    # ---------------------------------------------------------

    input_data = pd.DataFrame([[
        hdpe,
        ldpe,
        pp,
        ps,
        pvc,
        pet,
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


    # ---------------------------------------------------------
    # REAL AI OIL PREDICTION
    # ---------------------------------------------------------

    oil = float(model.predict(input_data)[0])

    oil = max(0, min(oil, 100))


    # ---------------------------------------------------------
    # DETERMINE DOMINANT PLASTIC
    # ---------------------------------------------------------

    plastics = {
        "HDPE": hdpe,
        "LDPE": ldpe,
        "PP": pp,
        "PS": ps,
        "PVC": pvc,
        "PET": pet
    }

    dominant_plastic = max(plastics, key=plastics.get)


    # ---------------------------------------------------------
    # PROTOTYPE ESTIMATION FOR OTHER PRODUCTS
    #
    # These are NOT independently ML-trained predictions.
    # They are demonstration estimates designed to respond
    # to process conditions instead of remaining constant.
    # ---------------------------------------------------------

    base_ratios = {

        "HDPE": {
            "gas": 0.35,
            "wax": 0.45,
            "char": 0.20
        },

        "LDPE": {
            "gas": 0.30,
            "wax": 0.50,
            "char": 0.20
        },

        "PP": {
            "gas": 0.45,
            "wax": 0.40,
            "char": 0.15
        },

        "PS": {
            "gas": 0.20,
            "wax": 0.60,
            "char": 0.20
        },

        "PVC": {
            "gas": 0.40,
            "wax": 0.30,
            "char": 0.30
        },

        "PET": {
            "gas": 0.30,
            "wax": 0.20,
            "char": 0.50
        }
    }


    ratio = base_ratios[dominant_plastic]

    gas_ratio = ratio["gas"]
    wax_ratio = ratio["wax"]
    char_ratio = ratio["char"]


    # ---------------------------------------------------------
    # TEMPERATURE EFFECT
    # Higher temperature → generally more gas,
    # less wax in this prototype estimate.
    # ---------------------------------------------------------

    temp_effect = (temperature - 450) / 500

    gas_ratio += temp_effect * 0.08
    wax_ratio -= temp_effect * 0.06
    char_ratio -= temp_effect * 0.02


    # ---------------------------------------------------------
    # HEATING RATE EFFECT
    # ---------------------------------------------------------

    heating_effect = (heating_rate - 10) / 20

    gas_ratio += heating_effect * 0.04
    wax_ratio -= heating_effect * 0.025
    char_ratio -= heating_effect * 0.015


    # ---------------------------------------------------------
    # PARTICLE SIZE EFFECT
    # ---------------------------------------------------------

    particle_effect = (particle_size - 1) / 5

    char_ratio += particle_effect * 0.02
    gas_ratio -= particle_effect * 0.01
    wax_ratio -= particle_effect * 0.01


    # ---------------------------------------------------------
    # CATALYST EFFECT
    # ---------------------------------------------------------

    if catalyst != "None":
        gas_ratio += 0.04
        wax_ratio -= 0.025
        char_ratio -= 0.015


    # ---------------------------------------------------------
    # REACTOR EFFECT
    # ---------------------------------------------------------

    if reactor_type == "Fluidized Bed":
        gas_ratio += 0.025
        wax_ratio -= 0.015
        char_ratio -= 0.010

    elif reactor_type == "Rotary Kiln":
        wax_ratio += 0.02
        gas_ratio -= 0.01
        char_ratio -= 0.01

    elif reactor_type == "Batch Reactor":
        char_ratio += 0.015
        gas_ratio -= 0.005
        wax_ratio -= 0.010


    # ---------------------------------------------------------
    # PREVENT NEGATIVE RATIOS
    # ---------------------------------------------------------

    gas_ratio = max(0.05, gas_ratio)
    wax_ratio = max(0.05, wax_ratio)
    char_ratio = max(0.05, char_ratio)


    # Normalize ratios so they total exactly 1
    ratio_total = gas_ratio + wax_ratio + char_ratio

    gas_ratio /= ratio_total
    wax_ratio /= ratio_total
    char_ratio /= ratio_total


    # ---------------------------------------------------------
    # CALCULATE REMAINING PRODUCTS
    # ---------------------------------------------------------

    remaining = 100 - oil

    gas = remaining * gas_ratio
    wax = remaining * wax_ratio
    char = remaining * char_ratio


    # ---------------------------------------------------------
    # ROUNDING
    # ---------------------------------------------------------

    oil = round(oil, 2)
    gas = round(gas, 2)
    wax = round(wax, 2)
    char = round(char, 2)


    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return jsonify({

        "oil": oil,
        "gas": gas,
        "wax": wax,
        "char": char,

        "dominant_plastic": dominant_plastic,

        "note": (
            "Oil yield is predicted by the 325-row "
            "literature-trained Random Forest model. "
            "Gas, wax and char are prototype estimates "
            "derived from polymer composition and process "
            "conditions and are not independently ML-trained."
        )
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=10000
    )