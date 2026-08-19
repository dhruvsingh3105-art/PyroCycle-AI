import joblib
import pandas as pd

# Load model and encoder
model = joblib.load("pyrolysis_model.pkl")
encoder = joblib.load("plastic_encoder.pkl")

# Test input
plastic_type = "HDPE"
quantity = 10
temperature = 450
time = 60

# Convert plastic type to number
plastic_encoded = encoder.transform([plastic_type])[0]

# Create input
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

# Predict
prediction = model.predict(input_data)[0]

print("AI Prediction")
print("----------------")
print("Oil:", round(prediction[0], 2), "%")
print("Gas:", round(prediction[1], 2), "%")
print("Wax:", round(prediction[2], 2), "%")
print("Char:", round(prediction[3], 2), "%")
