from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

model = joblib.load("pyrolysis_model.pkl")
encoder = joblib.load("plastic_encoder.pkl")


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    plastic_type = data["plastic_type"]
    quantity = float(data["quantity"])
    temperature = float(data["temperature"])
    time = float(data["time"])

    plastic_encoded = encoder.transform([plastic_type])[0]

    input_data = pd.DataFrame([[
        plastic_encoded,
        quantity,
        temperature,
        time
    ]], columns=[
        "Plastic_Type",
        "Quantity_kg",
        "Temperature_C",
        "Time_min"
    ])

    prediction = model.predict(input_data)[0]

    return jsonify({
        "oil": round(float(prediction[0]), 2),
        "gas": round(float(prediction[1]), 2),
        "wax": round(float(prediction[2]), 2),
        "char": round(float(prediction[3]), 2)
    })


@app.route("/")
def home():
    return "PyroCycle AI Backend is running!"


if __name__ == "__main__":
    app.run(debug=True)