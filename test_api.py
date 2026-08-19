import requests

data = {
    "plastic_type": "HDPE",
    "quantity": 10,
    "temperature": 450,
    "time": 60
}

response = requests.post(
    "http://127.0.0.1:5000/predict",
    json=data
)

print(response.json())