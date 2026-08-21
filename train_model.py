import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# Load 325-row literature dataset
data = pd.read_csv("pyrolysis_data.csv", sep="\t")

# Features
X = data[
    [
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
]

# Target: Oil yield
y = data["Oil_Yield_percent"]

# Handle missing numerical values
numeric_columns = [
    "HDPE_wt_percent",
    "LDPE_wt_percent",
    "PP_wt_percent",
    "PS_wt_percent",
    "PVC_wt_percent",
    "PET_wt_percent",
    "Temperature_C",
    "Heating_Rate_C_per_min",
    "Particle_Size_mm",
    "Feed_Size_g"
]

X[numeric_columns] = X[numeric_columns].fillna(
    X[numeric_columns].median()
)

# Handle categorical values
X["Catalyst"] = X["Catalyst"].fillna("None")
X["Reactor_Type"] = X["Reactor_Type"].fillna("Unknown")

categorical_columns = ["Catalyst", "Reactor_Type"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_columns)
    ],
    remainder="passthrough"
)

# Model
model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(
        n_estimators=300,
        random_state=42
    ))
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train
model.fit(X_train, y_train)

# Test
predictions = model.predict(X_test)
score = r2_score(y_test, predictions)

print("AI model trained successfully!")
print("R² Score:", round(score, 3))

# Save
joblib.dump(model, "pyrolysis_model.pkl")

print("Model saved successfully!")