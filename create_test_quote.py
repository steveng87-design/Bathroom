import requests
import json

# Create a test quote that we can use to test supplier functionality
quote_data = {
    "client_info": {
        "name": "Supplier Test User",
        "email": "supplier@test.com",
        "phone": "02-7777-7777",
        "address": "999 Supplier Test St, Perth WA 6000"
    },
    "room_measurements": {
        "length": 4.5,
        "width": 3.2,
        "height": 2.6
    },
    "components": {
        "demolition": True,
        "framing": True,
        "plumbing_rough_in": True,
        "electrical_rough_in": False,
        "plastering": True,
        "waterproofing": True,
        "tiling": True,
        "fit_off": True
    },
    "additional_notes": "Test quote for supplier functionality testing"
}

print("Creating test quote for supplier testing...")

try:
    response = requests.post(
        "https://renovationai.preview.emergentagent.com/api/quotes/request",
        json=quote_data,
        headers={'Content-Type': 'application/json'},
        timeout=60
    )
    
    if response.status_code == 200:
        quote = response.json()
        print(f"✅ Quote created successfully!")
        print(f"Quote ID: {quote['id']}")
        print(f"Total Cost: ${quote['total_cost']}")
        print(f"Components in breakdown: {len(quote['cost_breakdown'])}")
        
        # Save quote ID for testing
        with open('/app/test_quote_id.txt', 'w') as f:
            f.write(quote['id'])
        
        print(f"Quote ID saved to test_quote_id.txt")
        
        # Print breakdown for reference
        print("\nCost Breakdown:")
        for item in quote['cost_breakdown']:
            print(f"- {item['component']}: ${item['estimated_cost']}")
            
    else:
        print(f"❌ Failed to create quote: {response.status_code}")
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"❌ Error creating quote: {str(e)}")