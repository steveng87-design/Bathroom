import requests
import json

# Test what the frontend should be sending vs what backend expects
frontend_request = {
    "client_info": {
        "name": "Test User",
        "email": "test@example.com", 
        "phone": "02-1234-5678",
        "address": "123 Test St, Sydney NSW 2000"
    },
    "room_measurements": {
        "length": 3.0,
        "width": 2.0,
        "height": 2.4
    },
    "components": {
        "demolition": True,
        "framing": False,
        "plumbing_rough_in": False,
        "electrical_rough_in": False,
        "plastering": False,
        "waterproofing": False,
        "tiling": True,
        "fit_off": False
    },
    "additional_notes": "Test from debug script"
}

print("Testing frontend-style request...")
print(f"Request data: {json.dumps(frontend_request, indent=2)}")

try:
    response = requests.post(
        "https://bathquote-pro.preview.emergentagent.com/api/quotes/request",
        json=frontend_request,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 422:
        print("422 Error Details:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, indent=2))
        except:
            print(f"Error text: {response.text}")
    elif response.status_code == 200:
        print("Success! Response:")
        try:
            success_data = response.json()
            print(f"Quote ID: {success_data.get('id')}")
            print(f"Total Cost: ${success_data.get('total_cost')}")
        except:
            print(f"Response text: {response.text}")
    else:
        print(f"Unexpected status: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Request failed: {str(e)}")