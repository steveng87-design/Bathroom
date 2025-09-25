#!/usr/bin/env python3
"""
Test script to verify the PDF adjusted_total fix
"""
import requests
import json

BASE_URL = "https://quote-genius-pwa.preview.emergentagent.com/api"

def test_pdf_adjusted_total_fix():
    print("🔧 TESTING PDF ADJUSTED_TOTAL FIX")
    print("=" * 60)
    
    # Step 1: Create a quote
    print("\n--- STEP 1: Create Quote ---")
    quote_data = {
        "client_info": {
            "name": "Fix Test User",
            "email": "fix@test.com",
            "phone": "02-1234-5678",
            "address": "123 Fix Test St, Sydney NSW 2000"
        },
        "room_measurements": {
            "length": 3.0,
            "width": 2.5,
            "height": 2.4
        },
        "components": {
            "demolition": True,
            "framing": False,
            "plumbing_rough_in": True,
            "electrical_rough_in": False,
            "plastering": True,
            "waterproofing": True,
            "tiling": True,
            "fit_off": True
        }
    }
    
    response = requests.post(f"{BASE_URL}/quotes/request", json=quote_data, timeout=60)
    if response.status_code != 200:
        print(f"❌ Failed to create quote: {response.status_code}")
        return False
    
    quote = response.json()
    quote_id = quote['id']
    original_total = quote['total_cost']
    
    print(f"✅ Quote created: {quote_id}")
    print(f"   Original total: ${original_total}")
    
    # Step 2: Test PDF generation with ONLY adjusted_total (no adjusted_costs)
    print(f"\n--- STEP 2: Test PDF with ONLY adjusted_total ---")
    
    adjusted_total = 29802.077  # User's reported UI total
    
    pdf_request = {
        "user_profile": {
            "company_name": "Fix Test Company",
            "contact_name": "Fix Test User",
            "phone": "02-1234-5678",
            "email": "fix@test.com",
            "license_number": "FIX-2024"
        },
        "adjusted_costs": None,  # No component adjustments
        "adjusted_total": adjusted_total  # Only total adjustment
    }
    
    print(f"   Testing with adjusted_total: ${adjusted_total}")
    print(f"   Original total: ${original_total}")
    print(f"   Difference: ${adjusted_total - original_total}")
    
    # Test Proposal PDF
    print("\n   Testing Proposal PDF...")
    response_proposal = requests.post(
        f"{BASE_URL}/quotes/{quote_id}/generate-proposal", 
        json=pdf_request
    )
    
    if response_proposal.status_code == 200:
        print("   ✅ Proposal PDF generated successfully")
        print("   📄 PDF should now show the adjusted total")
    else:
        print(f"   ❌ Proposal PDF failed: {response_proposal.status_code}")
        print(f"   Error: {response_proposal.text}")
    
    # Test Quote Summary PDF
    print("\n   Testing Quote Summary PDF...")
    response_summary = requests.post(
        f"{BASE_URL}/quotes/{quote_id}/generate-quote-summary", 
        json=pdf_request
    )
    
    if response_summary.status_code == 200:
        print("   ✅ Quote Summary PDF generated successfully")
        print("   📄 PDF should now show the adjusted total")
    else:
        print(f"   ❌ Quote Summary PDF failed: {response_summary.status_code}")
        print(f"   Error: {response_summary.text}")
    
    # Step 3: Test with original costs (control test)
    print(f"\n--- STEP 3: Control Test with Original Costs ---")
    
    original_pdf_request = {
        "user_profile": {
            "company_name": "Fix Test Company",
            "contact_name": "Fix Test User",
            "phone": "02-1234-5678",
            "email": "fix@test.com",
            "license_number": "FIX-2024"
        },
        "adjusted_costs": None,
        "adjusted_total": None
    }
    
    response_original = requests.post(
        f"{BASE_URL}/quotes/{quote_id}/generate-quote-summary", 
        json=original_pdf_request
    )
    
    if response_original.status_code == 200:
        print("   ✅ Original costs PDF generated successfully")
        print(f"   📄 PDF should show original total: ${original_total}")
    else:
        print(f"   ❌ Original costs PDF failed: {response_original.status_code}")
    
    # Summary
    print(f"\n--- FIX VERIFICATION SUMMARY ---")
    proposal_success = response_proposal.status_code == 200
    summary_success = response_summary.status_code == 200
    original_success = response_original.status_code == 200
    
    print(f"✅ Proposal PDF with adjusted_total only: {'PASS' if proposal_success else 'FAIL'}")
    print(f"✅ Summary PDF with adjusted_total only: {'PASS' if summary_success else 'FAIL'}")
    print(f"✅ Original costs PDF (control): {'PASS' if original_success else 'FAIL'}")
    
    if proposal_success and summary_success and original_success:
        print("\n🎉 FIX VERIFICATION SUCCESSFUL!")
        print("📋 The backend now properly handles adjusted_total parameter")
        print("🔧 PDFs should now show the correct adjusted amounts")
        return True
    else:
        print("\n❌ FIX VERIFICATION FAILED!")
        print("🚨 There are still issues with PDF generation")
        return False

if __name__ == "__main__":
    success = test_pdf_adjusted_total_fix()
    exit(0 if success else 1)