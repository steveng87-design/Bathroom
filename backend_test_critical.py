import requests
import sys
import json
from datetime import datetime
import time

class CriticalBathroomAPITester:
    def __init__(self, base_url="https://bathroom-quote-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_issues = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                    self.critical_issues.append(f"{name}: {error_data}")
                except:
                    print(f"   Error text: {response.text}")
                    self.critical_issues.append(f"{name}: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            self.critical_issues.append(f"{name}: Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.critical_issues.append(f"{name}: {str(e)}")
            return False, {}

    def test_critical_quote_generation_issue(self):
        """Test the critical quote generation issue reported by user"""
        print("\n🔥 CRITICAL TEST: Quote Generation Issue")
        
        # Use the exact sample data from the review request
        sample_data = {
            "client_info": {
                "name": "Test Client",
                "email": "test@example.com", 
                "phone": "0412345678",
                "address": "123 Test St, Sydney"
            },
            "room_measurements": {
                "length": 3.0,
                "width": 2.5, 
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "plumbing_rough_in": True,
                "tiling": True,
                "framing": False,
                "electrical_rough_in": False,
                "plastering": False,
                "waterproofing": False,
                "fit_off": False
            },
            "task_options": {},
            "additional_notes": "Critical test for quote generation failure"
        }
        
        print("Testing POST /api/quotes/request endpoint...")
        success_1, response_1 = self.run_test(
            "CRITICAL: Quote Generation (quotes/request)",
            "POST",
            "quotes/request",
            200,
            data=sample_data,
            timeout=60
        )
        
        if success_1 and isinstance(response_1, dict) and 'id' in response_1:
            quote_id = response_1['id']
            print(f"   ✅ Quote generated successfully: {quote_id}")
            print(f"   Total Cost: ${response_1.get('total_cost', 'N/A')}")
            print(f"   Confidence: {response_1.get('confidence_level', 'N/A')}")
            
            # Test the AI learning endpoint
            print("\nTesting POST /api/quotes/generate-with-learning endpoint...")
            success_2, response_2 = self.run_test(
                "CRITICAL: Quote Generation with Learning",
                "POST",
                "quotes/generate-with-learning?user_id=test_user",
                200,
                data=sample_data,
                timeout=60
            )
            
            if success_2:
                print(f"   ✅ AI Learning quote generated successfully")
                print(f"   Total Cost: ${response_2.get('total_cost', 'N/A')}")
                return True, quote_id
            else:
                print(f"   ❌ AI Learning quote generation FAILED")
                return False, quote_id
        else:
            print(f"   ❌ Basic quote generation FAILED")
            return False, None

    def test_critical_saved_projects_issue(self):
        """Test the critical saved projects loading issue reported by user"""
        print("\n🔥 CRITICAL TEST: Saved Projects Loading Issue")
        
        # First create a test project to ensure we have data
        sample_quote_data = {
            "client_info": {
                "name": "Test Client Projects",
                "email": "projects@example.com", 
                "phone": "0412345678",
                "address": "123 Test St, Sydney"
            },
            "room_measurements": {
                "length": 3.0,
                "width": 2.5, 
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "plumbing_rough_in": True,
                "tiling": True,
                "framing": False,
                "electrical_rough_in": False,
                "plastering": False,
                "waterproofing": False,
                "fit_off": False
            }
        }
        
        # Create quote first
        success_quote, response_quote = self.run_test(
            "Create Quote for Project Test",
            "POST",
            "quotes/request",
            200,
            data=sample_quote_data,
            timeout=60
        )
        
        if not success_quote or 'id' not in response_quote:
            print("   ❌ Failed to create quote for project test")
            return False
        
        quote_id = response_quote['id']
        
        # Save the project
        project_data = {
            "project_name": "Critical Test Project",
            "category": "Test",
            "quote_id": quote_id,
            "client_name": "Test Client Projects",
            "total_cost": response_quote.get('total_cost', 25000),
            "notes": "Critical test for saved projects loading",
            "request_data": sample_quote_data  # This is critical for loading
        }
        
        success_save, response_save = self.run_test(
            "Save Test Project",
            "POST",
            "projects/save",
            200,
            data=project_data
        )
        
        if not success_save or 'id' not in response_save:
            print("   ❌ Failed to save test project")
            return False
        
        project_id = response_save['id']
        print(f"   ✅ Test project saved: {project_id}")
        
        # Test GET /api/projects endpoint
        print("\nTesting GET /api/projects endpoint...")
        success_list, response_list = self.run_test(
            "CRITICAL: List Saved Projects",
            "GET",
            "projects",
            200
        )
        
        if not success_list:
            print("   ❌ GET /api/projects FAILED")
            return False
        
        if isinstance(response_list, list) and len(response_list) > 0:
            print(f"   ✅ Found {len(response_list)} saved projects")
            
            # Find our test project
            test_project = None
            for project in response_list:
                if project.get('id') == project_id:
                    test_project = project
                    break
            
            if test_project:
                print(f"   ✅ Test project found in list: {test_project.get('project_name')}")
            else:
                print(f"   ❌ Test project NOT found in list")
                return False
        else:
            print("   ❌ No projects returned or invalid response")
            return False
        
        # Test GET /api/projects/{id}/quote endpoint
        print(f"\nTesting GET /api/projects/{project_id}/quote endpoint...")
        success_load, response_load = self.run_test(
            "CRITICAL: Load Specific Project",
            "GET",
            f"projects/{project_id}/quote",
            200
        )
        
        if not success_load:
            print("   ❌ GET /api/projects/{id}/quote FAILED")
            return False
        
        # Verify the response contains all necessary data for loading
        if not isinstance(response_load, dict):
            print("   ❌ Invalid response format")
            return False
        
        required_keys = ['project', 'quote', 'request']
        missing_keys = [key for key in required_keys if key not in response_load]
        
        if missing_keys:
            print(f"   ❌ Missing required keys: {missing_keys}")
            return False
        
        print("   ✅ All required keys present: project, quote, request")
        
        # Verify request data for form loading
        request_data = response_load.get('request')
        if not request_data:
            print("   ❌ No request data available for form loading")
            return False
        
        # Check critical form data
        form_checks = [
            ('client_info', 'Client information'),
            ('room_measurements', 'Room measurements'),
            ('components', 'Component selections')
        ]
        
        all_form_data_present = True
        for key, description in form_checks:
            if key not in request_data:
                print(f"   ❌ Missing {description} ({key})")
                all_form_data_present = False
            else:
                print(f"   ✅ {description} present")
        
        if all_form_data_present:
            print("   ✅ All critical form data available for loading")
            return True
        else:
            print("   ❌ Some critical form data missing")
            return False

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test("Root API Endpoint", "GET", "", 200)
        return success

def main():
    print("🚀 Starting CRITICAL Backend API Tests")
    print("🔥 Focus: Quote Generation & Saved Projects Issues")
    print("=" * 60)
    
    tester = CriticalBathroomAPITester()
    
    # Test root endpoint first
    print("\n" + "="*60)
    print("🔍 TESTING API CONNECTIVITY")
    print("="*60)
    
    if not tester.test_root_endpoint():
        print("❌ CRITICAL: API is not accessible!")
        return 1
    
    # CRITICAL TESTS - Focus on reported issues
    print("\n" + "="*60)
    print("🔥 RUNNING CRITICAL TESTS")
    print("="*60)
    
    critical_results = {}
    
    # Test 1: Quote Generation
    print(f"\n{'='*20} QUOTE GENERATION TEST {'='*20}")
    try:
        quote_success, quote_id = tester.test_critical_quote_generation_issue()
        critical_results['quote_generation'] = quote_success
        if quote_success:
            print(f"✅ QUOTE GENERATION: WORKING")
        else:
            print(f"❌ QUOTE GENERATION: FAILED")
    except Exception as e:
        print(f"❌ QUOTE GENERATION failed with exception: {str(e)}")
        critical_results['quote_generation'] = False
        tester.critical_issues.append(f"Quote Generation Exception: {str(e)}")
    
    # Test 2: Saved Projects Loading
    print(f"\n{'='*20} SAVED PROJECTS TEST {'='*20}")
    try:
        projects_success = tester.test_critical_saved_projects_issue()
        critical_results['saved_projects'] = projects_success
        if projects_success:
            print(f"✅ SAVED PROJECTS: WORKING")
        else:
            print(f"❌ SAVED PROJECTS: FAILED")
    except Exception as e:
        print(f"❌ SAVED PROJECTS failed with exception: {str(e)}")
        critical_results['saved_projects'] = False
        tester.critical_issues.append(f"Saved Projects Exception: {str(e)}")
    
    # Print final results
    print(f"\n{'='*60}")
    print(f"🔥 CRITICAL ISSUES ANALYSIS")
    print(f"{'='*60}")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    print(f"\n🔍 CRITICAL FUNCTIONALITY STATUS:")
    print(f"   Quote Generation: {'✅ WORKING' if critical_results.get('quote_generation') else '❌ FAILING'}")
    print(f"   Saved Projects:   {'✅ WORKING' if critical_results.get('saved_projects') else '❌ FAILING'}")
    
    if tester.critical_issues:
        print(f"\n🚨 CRITICAL ISSUES FOUND:")
        for i, issue in enumerate(tester.critical_issues, 1):
            print(f"   {i}. {issue}")
    
    # Determine overall status
    critical_failures = sum(1 for success in critical_results.values() if not success)
    
    if critical_failures == 0:
        print(f"\n🎉 ALL CRITICAL FUNCTIONALITY WORKING!")
        return 0
    else:
        print(f"\n⚠️  {critical_failures} CRITICAL ISSUES FOUND!")
        return 1

if __name__ == "__main__":
    sys.exit(main())