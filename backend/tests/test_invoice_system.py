"""
Test suite for Invoice System - Bathroom Quote Saver.AI
Tests invoice creation, PDF generation, listing, status updates, and contract integration
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

# Get the backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bathquote-1.preview.emergentagent.com').rstrip('/')

class TestInvoiceEndpoints:
    """Test invoice API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.test_contract_id = None
        self.test_invoice_id = None
    
    # ============= Invoice Listing Tests =============
    
    def test_list_invoices_endpoint(self):
        """Test GET /api/invoices/list returns list of invoices"""
        response = self.session.get(f"{BASE_URL}/api/invoices/list")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Invoice list endpoint works - Found {len(data)} invoices")
        
        # Verify invoice structure if any exist
        if len(data) > 0:
            invoice = data[0]
            assert 'id' in invoice, "Invoice should have 'id'"
            assert 'invoice_number' in invoice, "Invoice should have 'invoice_number'"
            assert 'status' in invoice, "Invoice should have 'status'"
            assert 'total_amount' in invoice, "Invoice should have 'total_amount'"
            print(f"✅ Invoice structure verified: {invoice.get('invoice_number')}")
    
    def test_list_invoices_filter_by_status(self):
        """Test filtering invoices by status"""
        response = self.session.get(f"{BASE_URL}/api/invoices/list?status=draft")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify all returned invoices have draft status
        for invoice in data:
            assert invoice.get('status') == 'draft', f"Expected draft status, got {invoice.get('status')}"
        
        print(f"✅ Invoice status filter works - Found {len(data)} draft invoices")
    
    # ============= Invoice Number Generation Tests =============
    
    def test_get_next_invoice_number(self):
        """Test GET /api/invoices/next-number returns next sequential number"""
        response = self.session.get(f"{BASE_URL}/api/invoices/next-number")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'next_number' in data, "Response should have 'next_number'"
        
        # Verify format: INV-YYYY-NNN
        next_number = data['next_number']
        assert next_number.startswith('INV-'), f"Invoice number should start with 'INV-', got {next_number}"
        parts = next_number.split('-')
        assert len(parts) == 3, f"Invoice number should have 3 parts, got {parts}"
        assert parts[1].isdigit() and len(parts[1]) == 4, f"Year should be 4 digits, got {parts[1]}"
        assert parts[2].isdigit(), f"Sequence should be numeric, got {parts[2]}"
        
        print(f"✅ Next invoice number: {next_number}")
    
    # ============= Contract Integration Tests =============
    
    def test_get_contracts_list(self):
        """Test GET /api/contracts/list to find contracts for invoice testing"""
        response = self.session.get(f"{BASE_URL}/api/contracts/list")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        print(f"✅ Found {len(data)} contracts")
        
        # Store first contract ID for later tests
        if len(data) > 0:
            self.test_contract_id = data[0].get('id')
            print(f"✅ Using contract ID: {self.test_contract_id}")
            return data[0]
        return None
    
    def test_get_contract_invoice_status(self):
        """Test GET /api/contracts/{id}/invoice-status"""
        # First get a contract
        contracts_response = self.session.get(f"{BASE_URL}/api/contracts/list")
        contracts = contracts_response.json()
        
        if len(contracts) == 0:
            pytest.skip("No contracts available for testing")
        
        contract_id = contracts[0].get('id')
        response = self.session.get(f"{BASE_URL}/api/contracts/{contract_id}/invoice-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert 'contract_id' in data, "Response should have 'contract_id'"
        assert 'stages' in data, "Response should have 'stages'"
        assert isinstance(data['stages'], list), "'stages' should be a list"
        
        print(f"✅ Contract invoice status retrieved for contract {contract_id}")
        print(f"   - Total price: ${data.get('total_price', 0):,.2f}")
        print(f"   - Number of stages: {len(data['stages'])}")
        
        # Verify stage structure
        for stage in data['stages']:
            assert 'stage_index' in stage, "Stage should have 'stage_index'"
            assert 'description' in stage, "Stage should have 'description'"
            assert 'amount' in stage, "Stage should have 'amount'"
            
            if stage.get('invoice'):
                print(f"   - Stage {stage['stage_index']}: Invoice {stage['invoice'].get('invoice_number')} ({stage['invoice'].get('status')})")
            else:
                print(f"   - Stage {stage['stage_index']}: No invoice yet")
    
    # ============= Invoice Creation Tests =============
    
    def test_create_invoice_from_stage(self):
        """Test POST /api/invoices/create-from-stage"""
        # First get a contract with payment schedule
        contracts_response = self.session.get(f"{BASE_URL}/api/contracts/list")
        contracts = contracts_response.json()
        
        if len(contracts) == 0:
            pytest.skip("No contracts available for testing")
        
        # Find a contract with payment schedule
        contract = None
        for c in contracts:
            if c.get('payment_schedule') and len(c.get('payment_schedule', [])) > 0:
                contract = c
                break
        
        if not contract:
            pytest.skip("No contracts with payment schedule available")
        
        contract_id = contract.get('id')
        
        # Check which stages don't have invoices yet
        status_response = self.session.get(f"{BASE_URL}/api/contracts/{contract_id}/invoice-status")
        status_data = status_response.json()
        
        available_stage = None
        for stage in status_data.get('stages', []):
            if not stage.get('invoice'):
                available_stage = stage['stage_index']
                break
        
        if available_stage is None:
            # All stages have invoices - test that duplicate creation fails
            response = self.session.post(f"{BASE_URL}/api/invoices/create-from-stage", json={
                "contract_id": contract_id,
                "stage_index": 0
            })
            
            assert response.status_code == 400, f"Expected 400 for duplicate invoice, got {response.status_code}"
            assert "already exists" in response.json().get('detail', '').lower(), "Should indicate invoice already exists"
            print(f"✅ Duplicate invoice creation correctly rejected")
            return
        
        # Create invoice for available stage
        response = self.session.post(f"{BASE_URL}/api/invoices/create-from-stage", json={
            "contract_id": contract_id,
            "stage_index": available_stage,
            "due_days": 14,
            "notes": "Test invoice created by automated testing"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify invoice structure
        assert 'id' in data, "Invoice should have 'id'"
        assert 'invoice_number' in data, "Invoice should have 'invoice_number'"
        assert 'total_amount' in data, "Invoice should have 'total_amount'"
        assert 'subtotal' in data, "Invoice should have 'subtotal'"
        assert 'gst_amount' in data, "Invoice should have 'gst_amount'"
        assert data.get('status') == 'draft', f"New invoice should be draft, got {data.get('status')}"
        
        self.test_invoice_id = data['id']
        print(f"✅ Invoice created: {data['invoice_number']}")
        print(f"   - Total: ${data['total_amount']:,.2f}")
        print(f"   - GST: ${data['gst_amount']:,.2f}")
        print(f"   - Status: {data['status']}")
        
        return data
    
    def test_create_invoice_invalid_contract(self):
        """Test invoice creation with invalid contract ID"""
        response = self.session.post(f"{BASE_URL}/api/invoices/create-from-stage", json={
            "contract_id": "invalid-contract-id-12345",
            "stage_index": 0
        })
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✅ Invalid contract correctly returns 404")
    
    def test_create_invoice_invalid_stage(self):
        """Test invoice creation with invalid stage index"""
        contracts_response = self.session.get(f"{BASE_URL}/api/contracts/list")
        contracts = contracts_response.json()
        
        if len(contracts) == 0:
            pytest.skip("No contracts available for testing")
        
        contract_id = contracts[0].get('id')
        
        response = self.session.post(f"{BASE_URL}/api/invoices/create-from-stage", json={
            "contract_id": contract_id,
            "stage_index": 999  # Invalid stage index
        })
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print(f"✅ Invalid stage index correctly returns 400")
    
    # ============= Invoice PDF Generation Tests =============
    
    def test_generate_invoice_pdf(self):
        """Test GET /api/invoices/{id}/pdf generates PDF"""
        # Get list of invoices
        invoices_response = self.session.get(f"{BASE_URL}/api/invoices/list")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No invoices available for PDF testing")
        
        invoice_id = invoices[0].get('id')
        invoice_number = invoices[0].get('invoice_number')
        
        response = self.session.get(f"{BASE_URL}/api/invoices/{invoice_id}/pdf")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get('content-type') == 'application/pdf', "Response should be PDF"
        assert len(response.content) > 0, "PDF content should not be empty"
        
        # Check content disposition header
        content_disposition = response.headers.get('content-disposition', '')
        assert 'attachment' in content_disposition, "Should be attachment"
        assert 'Invoice_' in content_disposition, "Filename should contain 'Invoice_'"
        
        print(f"✅ Invoice PDF generated for {invoice_number}")
        print(f"   - PDF size: {len(response.content)} bytes")
    
    def test_generate_pdf_invalid_invoice(self):
        """Test PDF generation with invalid invoice ID"""
        response = self.session.get(f"{BASE_URL}/api/invoices/invalid-id-12345/pdf")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✅ Invalid invoice PDF request correctly returns 404")
    
    # ============= Invoice Status Update Tests =============
    
    def test_update_invoice_status_to_sent(self):
        """Test PUT /api/invoices/{id}/status to mark as sent"""
        # Get a draft invoice
        invoices_response = self.session.get(f"{BASE_URL}/api/invoices/list?status=draft")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No draft invoices available for status update testing")
        
        invoice_id = invoices[0].get('id')
        
        response = self.session.put(f"{BASE_URL}/api/invoices/{invoice_id}/status", json={
            "status": "sent"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('status') == 'sent', f"Status should be 'sent', got {data.get('status')}"
        assert data.get('sent_at') is not None, "sent_at should be set"
        
        print(f"✅ Invoice {data.get('invoice_number')} marked as sent")
    
    def test_update_invoice_status_to_paid(self):
        """Test PUT /api/invoices/{id}/status to mark as paid"""
        # Get a sent invoice
        invoices_response = self.session.get(f"{BASE_URL}/api/invoices/list?status=sent")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No sent invoices available for paid status testing")
        
        invoice_id = invoices[0].get('id')
        total_amount = invoices[0].get('total_amount', 0)
        
        response = self.session.put(f"{BASE_URL}/api/invoices/{invoice_id}/status", json={
            "status": "paid",
            "paid_amount": total_amount,
            "payment_reference": "TEST-REF-001"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('status') == 'paid', f"Status should be 'paid', got {data.get('status')}"
        assert data.get('paid_at') is not None, "paid_at should be set"
        assert data.get('paid_amount') == total_amount, f"paid_amount should be {total_amount}"
        
        print(f"✅ Invoice {data.get('invoice_number')} marked as paid")
        print(f"   - Paid amount: ${data.get('paid_amount'):,.2f}")
    
    def test_update_status_invalid_invoice(self):
        """Test status update with invalid invoice ID"""
        response = self.session.put(f"{BASE_URL}/api/invoices/invalid-id-12345/status", json={
            "status": "sent"
        })
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✅ Invalid invoice status update correctly returns 404")
    
    # ============= Invoice Retrieval Tests =============
    
    def test_get_single_invoice(self):
        """Test GET /api/invoices/{id} retrieves single invoice"""
        # Get list of invoices
        invoices_response = self.session.get(f"{BASE_URL}/api/invoices/list")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No invoices available for retrieval testing")
        
        invoice_id = invoices[0].get('id')
        
        response = self.session.get(f"{BASE_URL}/api/invoices/{invoice_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get('id') == invoice_id, "Invoice ID should match"
        assert 'invoice_number' in data, "Should have invoice_number"
        assert 'client_info' in data, "Should have client_info"
        assert 'line_items' in data, "Should have line_items"
        assert 'bank_details' in data, "Should have bank_details"
        
        print(f"✅ Retrieved invoice: {data.get('invoice_number')}")
        print(f"   - Client: {data.get('client_info', {}).get('name', 'N/A')}")
        print(f"   - Total: ${data.get('total_amount', 0):,.2f}")
    
    def test_get_invoices_by_contract(self):
        """Test GET /api/invoices/by-contract/{contract_id}"""
        # Get a contract
        contracts_response = self.session.get(f"{BASE_URL}/api/contracts/list")
        contracts = contracts_response.json()
        
        if len(contracts) == 0:
            pytest.skip("No contracts available for testing")
        
        contract_id = contracts[0].get('id')
        
        response = self.session.get(f"{BASE_URL}/api/invoices/by-contract/{contract_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify all invoices belong to this contract
        for invoice in data:
            assert invoice.get('contract_id') == contract_id, f"Invoice should belong to contract {contract_id}"
        
        print(f"✅ Found {len(data)} invoices for contract {contract_id}")
    
    # ============= Invoice Amount Calculation Tests =============
    
    def test_invoice_gst_calculation(self):
        """Test that invoice GST is calculated correctly (10%)"""
        invoices_response = self.session.get(f"{BASE_URL}/api/invoices/list")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No invoices available for GST testing")
        
        for invoice in invoices[:5]:  # Test first 5 invoices
            subtotal = invoice.get('subtotal', 0)
            gst_amount = invoice.get('gst_amount', 0)
            total_amount = invoice.get('total_amount', 0)
            
            # GST should be 10% of subtotal
            expected_gst = round(subtotal * 0.1, 2)
            expected_total = round(subtotal + expected_gst, 2)
            
            # Allow small rounding differences
            assert abs(gst_amount - expected_gst) < 0.02, f"GST calculation error: expected {expected_gst}, got {gst_amount}"
            assert abs(total_amount - expected_total) < 0.02, f"Total calculation error: expected {expected_total}, got {total_amount}"
        
        print(f"✅ GST calculations verified for {min(len(invoices), 5)} invoices")


class TestInvoiceSendEndpoint:
    """Test invoice send endpoint (email functionality)"""
    
    def test_send_invoice_endpoint_exists(self):
        """Test that send invoice endpoint exists"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Get an invoice
        invoices_response = session.get(f"{BASE_URL}/api/invoices/list")
        invoices = invoices_response.json()
        
        if len(invoices) == 0:
            pytest.skip("No invoices available for send testing")
        
        invoice_id = invoices[0].get('id')
        
        # Try to send - may fail if SendGrid not configured, but endpoint should exist
        response = session.post(f"{BASE_URL}/api/invoices/{invoice_id}/send")
        
        # Should not be 404 (endpoint exists)
        assert response.status_code != 404, "Send endpoint should exist"
        
        # If SendGrid not configured, might get 500 or success with mock
        if response.status_code == 200:
            print(f"✅ Invoice send endpoint works (possibly mocked)")
        else:
            print(f"✅ Invoice send endpoint exists (status: {response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
