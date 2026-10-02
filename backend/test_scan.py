import requests
from PIL import Image
import io

BASE_URL = "http://localhost:5000"

def test_api():
    print("Testing Auth...")
    # Register a user
    register_data = {
        "email": "testworker@example.com",
        "password": "password123",
        "role": "worker",
        "name": "Test Worker"
    }
    requests.post(f"{BASE_URL}/auth/register", json=register_data)
    
    # Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "testworker@example.com",
        "password": "password123"
    })
    
    if login_res.status_code != 200:
        print("Login failed:", login_res.json())
        return
        
    token = login_res.json().get("access_token")
    print(f"Logged in successfully. Token: {token[:10]}...")

    print("Generating a test image...")
    # Create a simple colored image
    img = Image.new('RGB', (100, 100), color = 'blue')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()

    print("Sending /api/scan request...")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    files = {
        "image": ("test.jpg", img_byte_arr, "image/jpeg")
    }
    
    res = requests.post(f"{BASE_URL}/api/scan", headers=headers, files=files)
    print(f"Response status: {res.status_code}")
    try:
        print(f"Response json: {res.json()}")
    except Exception as e:
        print(f"Response text: {res.text}")

if __name__ == "__main__":
    test_api()
