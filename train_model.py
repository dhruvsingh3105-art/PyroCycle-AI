import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import joblib

# Load dataset
data = pd.read_csv("pyrolysis_data.csv")

# Convert plastic type into numbers
encoder = LabelEncoder()
data["Plastic_Type"] = encoder.fit_transform(data["Plastic_Type"])

# Inputs
X = data[
    ["Plastic_Type", "Quantity_kg", "Temperature_C", "Time_min"]
]

# Outputs
y = data[
    ["Oil_Yield_percent",
     "Gas_Yield_percent",
     "Wax_Yield_percent",
     "Char_Yield_percent"]
]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train AI model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Test model
predictions = model.predict(X_test)

score = r2_score(y_test, predictions)

print("AI model trained successfully!")
print("R² Score:", round(score, 3))

# Save model
joblib.dump(model, "pyrolysis_model.pkl")
joblib.dump(encoder, "plastic_encoder.pkl")

print("Model saved successfully!")