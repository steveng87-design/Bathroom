"""
Backend Tests for Bathroom Quote Saver.AI
Testing the three bug fixes:
1. Contract PDF generation - no raw HTML tags (bold_style fix)
2. PDF measurement formatting - proper formatting (mm to m conversion)
3. Email service - professional content without emojis
"""

import pytest
import requests
import os
import sys
import re
from io import BytesIO
from datetime import datetime, timedelta

# Add backend to path for direct imports
sys.path.insert(0, '/app/backend')

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============= API Health Tests =============
class TestAPIHealth:
    """Basic API health and connectivity tests"""
    
    def test_api_root_endpoint(self):
        """Test that API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Bathroom Renovation Quoting API" in data["message"]
        print(f"✓ API root endpoint accessible: {data['message']}")


# ============= Quote Generation Tests =============
class TestQuoteGeneration:
    """Test quote generation endpoint"""
    
    @pytest.fixture
    def sample_quote_request(self):
        """Sample quote request data"""
        return {
            "client_info": {
                "name": "Test Client",
                "email": "test@example.com",
                "phone": "0412345678",
                "address": "123 Test Street, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.6,
                "width": 2.4,
                "height": 2.7
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
            "additional_notes": "Test quote for backend testing"
        }
    
    def test_create_quote_request(self, sample_quote_request):
        """Test creating a quote request"""
        response = requests.post(
            f"{BASE_URL}/api/quotes/request",
            json=sample_quote_request,
            timeout=60  # AI generation may take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "request_id" in data
        assert "total_cost" in data
        assert "cost_breakdown" in data
        assert "ai_analysis" in data
        assert "confidence_level" in data
        
        # Verify cost breakdown structure
        assert isinstance(data["cost_breakdown"], list)
        assert len(data["cost_breakdown"]) > 0
        
        for item in data["cost_breakdown"]:
            assert "component" in item
            assert "estimated_cost" in item
            assert "cost_range_min" in item
            assert "cost_range_max" in item
            assert "notes" in item
        
        print(f"✓ Quote created successfully with ID: {data['id']}")
        print(f"  Total cost: ${data['total_cost']:,.2f}")
        return data


# ============= Contract Generation Tests (Fix #1: HTML Tags) =============
class TestContractGeneration:
    """Test contract generation - verifying HTML tag fix"""
    
    @pytest.fixture
    def quote_id(self):
        """Create a quote and return its ID for contract testing"""
        quote_request = {
            "client_info": {
                "name": "Contract Test Client",
                "email": "contract@test.com",
                "phone": "0412345678",
                "address": "456 Contract Ave, Melbourne VIC 3000"
            },
            "room_measurements": {
                "length": 3.0,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": True,
                "plumbing_rough_in": True,
                "electrical_rough_in": True,
                "plastering": True,
                "waterproofing": True,
                "tiling": True,
                "fit_off": True
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/request",
            json=quote_request,
            timeout=60
        )
        
        if response.status_code != 200:
            pytest.skip(f"Could not create quote for contract test: {response.text}")
        
        return response.json()["id"]
    
    def test_contract_generation_endpoint(self, quote_id):
        """Test contract generation endpoint returns PDF"""
        contract_request = {
            "quote_id": quote_id,
            "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "completion_days": 30,
            "contractor_info": {
                "contractor_name": "Test Renovations Pty Ltd",
                "contractor_abn": "12 345 678 901",
                "contractor_license": "LIC123456",
                "contractor_address": "789 Builder St, Sydney NSW 2000",
                "contractor_email": "contractor@test.com",
                "contractor_phone": "02 1234 5678"
            },
            "client_info": {
                "name": "Contract Test Client",
                "email": "contract@test.com",
                "phone": "0412345678",
                "address": "456 Contract Ave, Melbourne VIC 3000"
            },
            "total_price_override": 25000.00
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contracts/generate",
            json=contract_request,
            timeout=30
        )
        
        assert response.status_code == 200, f"Contract generation failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf"
        
        # Verify PDF content
        pdf_content = response.content
        assert len(pdf_content) > 0
        assert pdf_content[:4] == b'%PDF', "Response is not a valid PDF"
        
        print(f"✓ Contract PDF generated successfully ({len(pdf_content)} bytes)")
        return pdf_content
    
    def test_contract_pdf_no_html_tags(self, quote_id):
        """
        FIX #1 VERIFICATION: Contract PDF should not contain raw HTML tags
        The fix replaced HTML <b> tags with proper ReportLab ParagraphStyle
        """
        contract_request = {
            "quote_id": quote_id,
            "start_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "completion_days": 30,
            "total_price_override": 30000.00
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contracts/generate",
            json=contract_request,
            timeout=30
        )
        
        assert response.status_code == 200
        pdf_content = response.content
        
        # Convert PDF bytes to string for text search
        # Note: This is a basic check - PDF text extraction would be more thorough
        pdf_text = pdf_content.decode('latin-1', errors='ignore')
        
        # Check for raw HTML tags that should NOT appear
        html_tags_to_check = ['<b>', '</b>', '<strong>', '</strong>', '<i>', '</i>']
        found_tags = []
        
        for tag in html_tags_to_check:
            if tag in pdf_text:
                found_tags.append(tag)
        
        if found_tags:
            print(f"✗ Found raw HTML tags in PDF: {found_tags}")
        else:
            print("✓ No raw HTML tags found in contract PDF (Fix #1 verified)")
        
        # This assertion verifies the fix is working
        assert len(found_tags) == 0, f"Raw HTML tags found in PDF: {found_tags}"


# ============= PDF Measurement Formatting Tests (Fix #2) =============
class TestPDFMeasurementFormatting:
    """Test PDF measurement formatting - verifying mm to m conversion fix"""
    
    @pytest.fixture
    def quote_with_measurements(self):
        """Create a quote with specific measurements for testing"""
        quote_request = {
            "client_info": {
                "name": "Measurement Test Client",
                "email": "measure@test.com",
                "phone": "0412345678",
                "address": "789 Measure Lane, Brisbane QLD 4000"
            },
            "room_measurements": {
                "length": 3.6,  # 3.6 meters
                "width": 2.4,   # 2.4 meters
                "height": 2.7   # 2.7 meters
            },
            "components": {
                "demolition": True,
                "tiling": True,
                "fit_off": True
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/request",
            json=quote_request,
            timeout=60
        )
        
        if response.status_code != 200:
            pytest.skip(f"Could not create quote: {response.text}")
        
        return response.json()
    
    def test_proposal_pdf_measurement_formatting(self, quote_with_measurements):
        """
        FIX #2 VERIFICATION: PDF measurements should display properly formatted
        The fix converts mm to m and uses .2f formatting
        """
        quote_id = quote_with_measurements["id"]
        
        pdf_request = {
            "user_profile": {
                "company_name": "Test Renovations",
                "contact_name": "Test Manager",
                "phone": "0412345678",
                "email": "test@renovations.com",
                "license_number": "LIC123"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/{quote_id}/generate-proposal",
            json=pdf_request,
            timeout=30
        )
        
        assert response.status_code == 200, f"Proposal generation failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf"
        
        pdf_content = response.content
        pdf_text = pdf_content.decode('latin-1', errors='ignore')
        
        # Check for excessive decimal values that indicate the bug
        # The bug showed values like "3600000.0" instead of "3.60"
        excessive_decimal_pattern = r'\d{6,}\.\d'  # 6+ digits before decimal
        excessive_matches = re.findall(excessive_decimal_pattern, pdf_text)
        
        if excessive_matches:
            print(f"✗ Found excessive decimal values in PDF: {excessive_matches[:5]}")
        else:
            print("✓ No excessive decimal values found in PDF (Fix #2 verified)")
        
        # Verify the fix - should not have values like 3600000.0
        assert len(excessive_matches) == 0, f"Excessive decimal values found: {excessive_matches[:5]}"
        
        print(f"✓ Proposal PDF generated with proper measurement formatting ({len(pdf_content)} bytes)")


# ============= Email Service Tests (Fix #3: Professional Content) =============
class TestEmailService:
    """Test email service - verifying professional content without emojis"""
    
    def test_email_content_generation(self):
        """
        FIX #3 VERIFICATION: Email content should be professional without emojis
        Testing the _generate_email_content method directly
        """
        # Import the email service module
        from email_service import EmailService
        
        email_service = EmailService()
        
        # Test data
        client_name = "Test Client"
        quote_data = {
            "total_cost": 25000.00,
            "project_name": "Bathroom Renovation",
            "created_at": datetime.now().isoformat(),
            "components": {
                "demolition": 3000.00,
                "tiling": 8000.00,
                "fit_off": 5000.00
            }
        }
        options = {
            "include_breakdown": True,
            "include_pdf": False
        }
        
        # Generate email content
        html_content = email_service._generate_email_content(client_name, quote_data, options)
        
        # Check for emojis - common emoji unicode ranges
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"  # dingbats
            "\U000024C2-\U0001F251"  # enclosed characters
            "]+", 
            flags=re.UNICODE
        )
        
        emojis_found = emoji_pattern.findall(html_content)
        
        if emojis_found:
            print(f"✗ Found emojis in email content: {emojis_found}")
        else:
            print("✓ No emojis found in email content (Fix #3 verified)")
        
        # Verify professional language
        assert "Dear" in html_content, "Email should start with professional greeting"
        assert "Kind regards" in html_content or "Best regards" in html_content or "regards" in html_content.lower(), \
            "Email should have professional closing"
        
        # Check for informal language that was in the original bug
        informal_phrases = ["Hey!", "Awesome!", "Super excited", "Can't wait"]
        found_informal = [phrase for phrase in informal_phrases if phrase.lower() in html_content.lower()]
        
        if found_informal:
            print(f"✗ Found informal phrases: {found_informal}")
        else:
            print("✓ Email content is professional (no informal phrases)")
        
        assert len(emojis_found) == 0, f"Emojis found in email: {emojis_found}"
        assert len(found_informal) == 0, f"Informal phrases found: {found_informal}"
        
        print("✓ Email content is professional without emojis (Fix #3 verified)")
    
    def test_email_html_structure(self):
        """Test that email HTML is properly structured"""
        from email_service import EmailService
        
        email_service = EmailService()
        
        quote_data = {
            "total_cost": 15000.00,
            "project_name": "Small Bathroom Renovation",
            "created_at": datetime.now().isoformat(),
            "components": {}
        }
        
        html_content = email_service._generate_email_content(
            "John Smith",
            quote_data,
            {"include_breakdown": False}
        )
        
        # Verify HTML structure
        assert "<!DOCTYPE html>" in html_content
        assert "<html>" in html_content
        assert "</html>" in html_content
        assert "<body>" in html_content
        assert "</body>" in html_content
        
        # Verify key content sections
        assert "John Smith" in html_content
        assert "$15,000.00" in html_content
        assert "30 days" in html_content  # Quote validity
        
        print("✓ Email HTML structure is valid")


# ============= Quote Summary PDF Tests =============
class TestQuoteSummaryPDF:
    """Test quote summary PDF generation"""
    
    @pytest.fixture
    def existing_quote(self):
        """Create a quote for PDF testing"""
        quote_request = {
            "client_info": {
                "name": "PDF Test Client",
                "email": "pdf@test.com",
                "phone": "0412345678",
                "address": "321 PDF Street, Perth WA 6000"
            },
            "room_measurements": {
                "length": 4.0,
                "width": 3.0,
                "height": 2.5
            },
            "components": {
                "demolition": True,
                "framing": True,
                "plumbing_rough_in": True,
                "tiling": True,
                "fit_off": True
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/request",
            json=quote_request,
            timeout=60
        )
        
        if response.status_code != 200:
            pytest.skip(f"Could not create quote: {response.text}")
        
        return response.json()
    
    def test_quote_summary_pdf_generation(self, existing_quote):
        """Test quote summary PDF generation endpoint"""
        quote_id = existing_quote["id"]
        
        pdf_request = {
            "user_profile": {
                "company_name": "Test Renovations Pty Ltd",
                "contact_name": "Test Manager",
                "phone": "0412345678",
                "email": "test@renovations.com",
                "license_number": "LIC123456"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/{quote_id}/generate-quote-summary",
            json=pdf_request,
            timeout=30
        )
        
        assert response.status_code == 200, f"Quote summary generation failed: {response.text}"
        assert response.headers.get("content-type") == "application/pdf"
        
        pdf_content = response.content
        assert len(pdf_content) > 0
        assert pdf_content[:4] == b'%PDF'
        
        print(f"✓ Quote summary PDF generated successfully ({len(pdf_content)} bytes)")


# ============= Get Quote Tests =============
class TestGetQuote:
    """Test retrieving quotes"""
    
    def test_get_all_quotes(self):
        """Test getting all quotes"""
        response = requests.get(f"{BASE_URL}/api/quotes")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        print(f"✓ Retrieved {len(data)} quotes")
    
    def test_get_quote_by_id(self):
        """Test getting a specific quote by ID"""
        # First create a quote
        quote_request = {
            "client_info": {
                "name": "Get Test Client",
                "email": "get@test.com",
                "phone": "0412345678",
                "address": "999 Get Street, Adelaide SA 5000"
            },
            "room_measurements": {
                "length": 2.5,
                "width": 2.0,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "tiling": True
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/quotes/request",
            json=quote_request,
            timeout=60
        )
        
        if create_response.status_code != 200:
            pytest.skip("Could not create quote for get test")
        
        quote_id = create_response.json()["id"]
        
        # Now get the quote
        get_response = requests.get(f"{BASE_URL}/api/quotes/{quote_id}")
        
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["id"] == quote_id
        
        print(f"✓ Retrieved quote by ID: {quote_id}")
    
    def test_get_nonexistent_quote(self):
        """Test getting a quote that doesn't exist"""
        response = requests.get(f"{BASE_URL}/api/quotes/nonexistent-id-12345")
        
        assert response.status_code == 404
        print("✓ Correctly returns 404 for nonexistent quote")


# ============= Suppliers Tests =============
class TestSuppliers:
    """Test material suppliers endpoint"""
    
    def test_get_suppliers_for_component(self):
        """Test getting suppliers for a valid component"""
        components = ["demolition", "framing", "plumbing_rough_in", "tiling"]
        
        for component in components:
            response = requests.get(f"{BASE_URL}/api/suppliers/{component}")
            
            assert response.status_code == 200, f"Failed for component: {component}"
            data = response.json()
            assert "component" in data
            assert "suppliers" in data
            assert isinstance(data["suppliers"], list)
            assert len(data["suppliers"]) > 0
        
        print(f"✓ Retrieved suppliers for {len(components)} components")
    
    def test_get_suppliers_invalid_component(self):
        """Test getting suppliers for invalid component"""
        response = requests.get(f"{BASE_URL}/api/suppliers/invalid_component")
        
        assert response.status_code == 404
        print("✓ Correctly returns 404 for invalid component")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
