import requests
import sys
import json
from datetime import datetime
import time

class PriorityBathroomAPITester:
    def __init__(self, base_url="https://bathquote-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.quote_id = None
        self.project_id = None

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
                except:
                    print(f"   Error text: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_priority_quote_generation_request(self):
        """PRIORITY TEST 1: POST /api/quotes/request endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 1: Quote Generation API - /api/quotes/request")
        print("="*60)
        
        quote_data = {
            "client_info": {
                "name": "Emma Wilson",
                "email": "emma.wilson@example.com",
                "phone": "02-8765-4321",
                "address": "789 Priority Street, Melbourne VIC 3000"
            },
            "room_measurements": {
                "length": 3.8,
                "width": 2.6,
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
            },
            "detailed_components": {
                "demolition": {
                    "enabled": True,
                    "subtasks": {
                        "remove_existing_tiles": True,
                        "remove_fixtures": True,
                        "remove_vanity": True,
                        "remove_toilet": True
                    }
                },
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_install_floor_tiles": True,
                        "supply_install_wall_tiles": True,
                        "waterproof_shower_area": True
                    }
                }
            },
            "task_options": {
                "skip_bin_size": "8m³",
                "build_niches_quantity": 2,
                "plasterboard_grade": "premium_grade",
                "floor_tile_grade": "luxury_grade",
                "vanity_grade": "premium_grade"
            },
            "additional_notes": "Priority test for quote generation with various components"
        }
        
        success, response = self.run_test(
            "POST /api/quotes/request - Priority Test",
            "POST",
            "quotes/request",
            200,
            data=quote_data,
            timeout=60
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.quote_id = response['id']
            print(f"   ✅ Quote ID: {self.quote_id}")
            print(f"   ✅ Total Cost: ${response.get('total_cost', 'N/A')}")
            print(f"   ✅ Confidence: {response.get('confidence_level', 'N/A')}")
            print(f"   ✅ Components in breakdown: {len(response.get('cost_breakdown', []))}")
            
            # Validate response structure
            required_fields = ['id', 'request_id', 'total_cost', 'cost_breakdown', 'ai_analysis', 'confidence_level']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️  Missing fields: {missing_fields}")
                return False
            
            # Validate cost breakdown
            cost_breakdown = response.get('cost_breakdown', [])
            if not cost_breakdown:
                print(f"   ❌ No cost breakdown provided")
                return False
            
            print(f"   ✅ Cost breakdown components:")
            for item in cost_breakdown:
                component = item.get('component', 'Unknown')
                cost = item.get('estimated_cost', 0)
                print(f"     - {component}: ${cost}")
            
            return True
        return False

    def test_priority_quote_generation_with_learning(self):
        """PRIORITY TEST 2: POST /api/quotes/generate-with-learning endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 2: Quote Generation with Learning API")
        print("="*60)
        
        quote_data = {
            "client_info": {
                "name": "David Chen",
                "email": "david.chen@example.com",
                "phone": "02-5555-7890",
                "address": "456 Learning Lane, Brisbane QLD 4000"
            },
            "room_measurements": {
                "length": 4.2,
                "width": 3.1,
                "height": 2.7
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
            },
            "detailed_components": {
                "demolition": {
                    "enabled": True,
                    "subtasks": {
                        "remove_existing_tiles": True,
                        "remove_fixtures": True,
                        "remove_vanity": True,
                        "remove_toilet": True,
                        "remove_shower_screen": True
                    }
                },
                "framing": {
                    "enabled": True,
                    "subtasks": {
                        "build_stud_walls": True,
                        "build_niches": True,
                        "install_door_frame": True
                    }
                },
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_install_floor_tiles": True,
                        "supply_install_wall_tiles": True,
                        "supply_install_feature_tiles": True,
                        "waterproof_shower_area": True
                    }
                }
            },
            "task_options": {
                "skip_bin_size": "10m³",
                "build_niches_quantity": 3,
                "swing_door_size": "820mm",
                "water_feeds_type": "thermostatic",
                "power_points_quantity": 4,
                "plasterboard_grade": "premium_grade",
                "floor_tile_grade": "luxury_grade",
                "wall_tile_grade": "premium_grade",
                "feature_tile_grade": "luxury_grade",
                "vanity_grade": "luxury_grade",
                "toilet_grade": "premium_grade",
                "tapware_grade": "luxury_grade"
            },
            "additional_notes": "Large luxury bathroom with AI learning integration test"
        }
        
        success, response = self.run_test(
            "POST /api/quotes/generate-with-learning - Priority Test",
            "POST",
            "quotes/generate-with-learning?user_id=priority_test_user",
            200,
            data=quote_data,
            timeout=60
        )
        
        if success and isinstance(response, dict):
            print(f"   ✅ Total Cost: ${response.get('total_cost', 'N/A')}")
            print(f"   ✅ Confidence: {response.get('confidence_level', 'N/A')}")
            print(f"   ✅ AI Analysis includes learning: {'LEARNING APPLIED' in response.get('ai_analysis', '')}")
            
            # Store quote ID for later tests
            if 'id' in response:
                self.quote_id = response['id']
                print(f"   ✅ Quote ID stored: {self.quote_id}")
            
            return True
        return False

    def test_priority_project_save(self):
        """PRIORITY TEST 3: POST /api/projects/save endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 3: Project Management - Save Project")
        print("="*60)
        
        if not self.quote_id:
            print("❌ Skipping - No quote ID available from previous tests")
            return False
        
        # Complete request data for proper project loading
        complete_request_data = {
            "client_info": {
                "name": "Priority Test Client",
                "email": "priority@test.com",
                "phone": "0412345678",
                "address": "123 Priority St, Sydney"
            },
            "room_measurements": {
                "length": 4.2,
                "width": 3.1,
                "height": 2.7
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
            },
            "detailed_components": {
                "demolition": {
                    "enabled": True,
                    "subtasks": {
                        "remove_existing_tiles": True,
                        "remove_fixtures": True,
                        "remove_vanity": True,
                        "remove_toilet": True
                    }
                },
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_install_floor_tiles": True,
                        "supply_install_wall_tiles": True,
                        "waterproof_shower_area": True
                    }
                }
            },
            "task_options": {
                "skip_bin_size": "10m³",
                "build_niches_quantity": 3,
                "plasterboard_grade": "premium_grade",
                "floor_tile_grade": "luxury_grade",
                "vanity_grade": "luxury_grade"
            }
        }
        
        project_data = {
            "project_name": "Priority Test Bathroom Project",
            "category": "Priority Testing",
            "quote_id": self.quote_id,
            "client_name": "Priority Test Client",
            "total_cost": 35000,
            "notes": "Priority test project with complete form data for loading verification",
            "request_data": complete_request_data
        }
        
        success, response = self.run_test(
            "POST /api/projects/save - Priority Test",
            "POST",
            "projects/save",
            200,
            data=project_data
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.project_id = response['id']
            print(f"   ✅ Project ID: {self.project_id}")
            print(f"   ✅ Project Name: {response.get('project_name', 'N/A')}")
            print(f"   ✅ Category: {response.get('category', 'N/A')}")
            print(f"   ✅ Client Name: {response.get('client_name', 'N/A')}")
            print(f"   ✅ Total Cost: ${response.get('total_cost', 'N/A')}")
            return True
        return False

    def test_priority_get_projects(self):
        """PRIORITY TEST 4: GET /api/projects endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 4: Project Management - Get All Projects")
        print("="*60)
        
        success, response = self.run_test(
            "GET /api/projects - Priority Test",
            "GET",
            "projects",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Total projects found: {len(response)}")
            
            # Display project details
            for i, project in enumerate(response[:5], 1):  # Show first 5 projects
                print(f"   Project {i}:")
                print(f"     - ID: {project.get('id', 'N/A')}")
                print(f"     - Name: {project.get('project_name', 'N/A')}")
                print(f"     - Client: {project.get('client_name', 'N/A')}")
                print(f"     - Cost: ${project.get('total_cost', 'N/A')}")
                print(f"     - Category: {project.get('category', 'N/A')}")
            
            if len(response) > 5:
                print(f"   ... and {len(response) - 5} more projects")
            
            return True
        elif success and isinstance(response, dict):
            print(f"   ⚠️  Unexpected response format: {response}")
            return False
        return False

    def test_priority_get_project_quote(self):
        """PRIORITY TEST 5: GET /api/projects/{id}/quote endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 5: Project Management - Get Project Quote")
        print("="*60)
        
        if not self.project_id:
            print("❌ Skipping - No project ID available from previous tests")
            return False
        
        success, response = self.run_test(
            f"GET /api/projects/{self.project_id}/quote - Priority Test",
            "GET",
            f"projects/{self.project_id}/quote",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   ✅ Response structure validation:")
            print(f"     - Has project data: {'project' in response}")
            print(f"     - Has quote data: {'quote' in response}")
            print(f"     - Has request data: {'request' in response}")
            
            # Validate project data restoration
            if 'request' in response and response['request']:
                request_data = response['request']
                print(f"   ✅ Request data validation:")
                
                # Check critical fields for form restoration
                required_fields = ['client_info', 'room_measurements', 'components']
                for field in required_fields:
                    if field in request_data:
                        print(f"     - {field}: ✅ Present")
                    else:
                        print(f"     - {field}: ❌ Missing")
                        return False
                
                # Validate room measurements
                if 'room_measurements' in request_data:
                    measurements = request_data['room_measurements']
                    if all(key in measurements for key in ['length', 'width', 'height']):
                        print(f"     - Room dimensions: {measurements['length']}x{measurements['width']}x{measurements['height']}m")
                    else:
                        print(f"     - Room measurements incomplete")
                        return False
                
                # Validate components
                if 'components' in request_data:
                    components = request_data['components']
                    enabled_count = sum(1 for v in components.values() if v)
                    print(f"     - Components: {enabled_count} enabled out of {len(components)}")
                
                # Check detailed components (subtasks)
                if 'detailed_components' in request_data:
                    detailed = request_data['detailed_components']
                    print(f"     - Detailed components: {len(detailed)} components with subtasks")
                
                # Check task options
                if 'task_options' in request_data:
                    options = request_data['task_options']
                    print(f"     - Task options: {len(options)} options configured")
                
                return True
            else:
                print(f"   ❌ No request data available for form restoration")
                return False
        return False

    def test_priority_delete_project(self):
        """PRIORITY TEST 6: DELETE /api/projects/{id} endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 6: Project Management - Delete Project")
        print("="*60)
        
        if not self.project_id:
            print("❌ Skipping - No project ID available from previous tests")
            return False
        
        success, response = self.run_test(
            f"DELETE /api/projects/{self.project_id} - Priority Test",
            "DELETE",
            f"projects/{self.project_id}",
            200
        )
        
        if success:
            print(f"   ✅ Project deleted successfully")
            
            # Verify deletion by trying to access the project
            verify_success, verify_response = self.run_test(
                f"Verify Project Deletion - GET /api/projects/{self.project_id}/quote",
                "GET",
                f"projects/{self.project_id}/quote",
                404  # Should return 404 after deletion
            )
            
            if verify_success:
                print(f"   ✅ Deletion verified - project no longer accessible")
                return True
            else:
                print(f"   ❌ Deletion verification failed - project still accessible")
                return False
        return False

    def test_priority_pdf_generation_proposal(self):
        """PRIORITY TEST 7: POST /api/quotes/{quote_id}/generate-proposal with adjusted costs"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 7: PDF Generation - Proposal with Adjusted Costs")
        print("="*60)
        
        if not self.quote_id:
            print("❌ Skipping - No quote ID available from previous tests")
            return False
        
        # Test with adjusted costs
        pdf_request = {
            "user_profile": {
                "company_name": "Priority Bathroom Renovations",
                "contact_name": "Priority Test Manager",
                "phone": "02-1234-5678",
                "email": "priority@bathroomrenos.com.au",
                "license_number": "PBR-2024-001",
                "years_experience": "15+",
                "projects_completed": "500+"
            },
            "adjusted_costs": {
                "Demolition": 2500.00,
                "Framing": 3200.00,
                "Plumbing Rough In": 5500.00,
                "Electrical Rough In": 3800.00,
                "Plastering": 2800.00,
                "Waterproofing": 2200.00,
                "Tiling": 8500.00,
                "Fit Off": 6200.00
            },
            "adjusted_total": 34700.00,
            "include_breakdown": True
        }
        
        success, response = self.run_test(
            "POST /api/quotes/{quote_id}/generate-proposal - Priority Test",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   ✅ PDF Proposal generated successfully with adjusted costs")
            print(f"   ✅ Adjusted total: ${pdf_request['adjusted_total']}")
            print(f"   ✅ Adjusted components: {len(pdf_request['adjusted_costs'])}")
            print(f"   ✅ Include breakdown: {pdf_request['include_breakdown']}")
            return True
        return False

    def test_priority_pdf_generation_quote_summary(self):
        """PRIORITY TEST 8: POST /api/quotes/{quote_id}/generate-quote-summary with adjusted costs"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 8: PDF Generation - Quote Summary with Adjusted Costs")
        print("="*60)
        
        if not self.quote_id:
            print("❌ Skipping - No quote ID available from previous tests")
            return False
        
        # Test with different adjusted costs
        pdf_request = {
            "user_profile": {
                "company_name": "Priority Bathroom Solutions",
                "contact_name": "Priority Quote Manager",
                "phone": "02-9876-5432",
                "email": "quotes@prioritybathrooms.com.au",
                "license_number": "PBS-2024-002",
                "years_experience": "12+",
                "projects_completed": "300+"
            },
            "adjusted_costs": {
                "Demolition": 2200.00,
                "Plumbing Rough In": 6000.00,
                "Tiling": 9200.00,
                "Fit Off": 5800.00
            },
            "adjusted_total": 32500.00,
            "include_breakdown": False  # Test without breakdown
        }
        
        success, response = self.run_test(
            "POST /api/quotes/{quote_id}/generate-quote-summary - Priority Test",
            "POST",
            f"quotes/{self.quote_id}/generate-quote-summary",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   ✅ Quote Summary PDF generated successfully with adjusted costs")
            print(f"   ✅ Adjusted total: ${pdf_request['adjusted_total']}")
            print(f"   ✅ Partial adjustments: {len(pdf_request['adjusted_costs'])} components")
            print(f"   ✅ Include breakdown: {pdf_request['include_breakdown']}")
            return True
        return False

    def test_priority_cost_adjustment_learning(self):
        """PRIORITY TEST 9: POST /api/quotes/{quote_id}/learn-adjustment endpoint"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 9: Cost Adjustment Learning API")
        print("="*60)
        
        if not self.quote_id:
            print("❌ Skipping - No quote ID available from previous tests")
            return False
        
        # Test multiple cost adjustments for learning
        adjustments = [
            {
                "quote_id": self.quote_id,  # Add quote_id as required field
                "user_id": "priority_test_user",
                "component": "Demolition",
                "original_cost": 2000.00,
                "adjusted_cost": 2500.00,
                "adjustment_ratio": 1.25,
                "project_size": 13.02,  # 4.2 x 3.1
                "location": "Brisbane QLD",
                "notes": "Added extra demolition work for structural changes"
            },
            {
                "quote_id": self.quote_id,  # Add quote_id as required field
                "user_id": "priority_test_user",
                "component": "Tiling",
                "original_cost": 7500.00,
                "adjusted_cost": 9200.00,
                "adjustment_ratio": 1.227,
                "project_size": 13.02,
                "location": "Brisbane QLD",
                "notes": "Upgraded to premium tiles with complex pattern"
            },
            {
                "quote_id": self.quote_id,  # Add quote_id as required field
                "user_id": "priority_test_user",
                "component": "Plumbing Rough In",
                "original_cost": 4500.00,
                "adjusted_cost": 6000.00,
                "adjustment_ratio": 1.333,
                "project_size": 13.02,
                "location": "Brisbane QLD",
                "notes": "Additional plumbing for luxury fixtures"
            }
        ]
        
        all_passed = True
        for i, adjustment in enumerate(adjustments, 1):
            success, response = self.run_test(
                f"POST /api/quotes/{self.quote_id}/learn-adjustment - Test {i}",
                "POST",
                f"quotes/{self.quote_id}/learn-adjustment",
                200,
                data=adjustment
            )
            
            if success and isinstance(response, dict):
                print(f"   ✅ Adjustment {i} learned successfully")
                print(f"     - Component: {adjustment['component']}")
                print(f"     - Ratio: {adjustment['adjustment_ratio']}")
                print(f"     - Status: {response.get('status', 'N/A')}")
                print(f"     - Total adjustments: {response.get('total_adjustments', 'N/A')}")
                
                if 'insights' in response:
                    insights = response['insights']
                    print(f"     - Learning insights: {insights}")
            else:
                print(f"   ❌ Adjustment {i} failed")
                all_passed = False
        
        return all_passed

    def test_priority_validation_scenarios(self):
        """PRIORITY TEST 10: Test various validation scenarios"""
        print("\n" + "="*60)
        print("🎯 PRIORITY TEST 10: Validation Scenarios")
        print("="*60)
        
        # Test 1: Quote generation with various component combinations
        test_scenarios = [
            {
                "name": "Demolition + Tiling Only",
                "components": {
                    "demolition": True,
                    "framing": False,
                    "plumbing_rough_in": False,
                    "electrical_rough_in": False,
                    "plastering": False,
                    "waterproofing": False,
                    "tiling": True,
                    "fit_off": False
                }
            },
            {
                "name": "Full Renovation (All Components)",
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
            },
            {
                "name": "Plumbing + Electrical + Fit Off",
                "components": {
                    "demolition": False,
                    "framing": False,
                    "plumbing_rough_in": True,
                    "electrical_rough_in": True,
                    "plastering": False,
                    "waterproofing": False,
                    "tiling": False,
                    "fit_off": True
                }
            }
        ]
        
        all_passed = True
        for scenario in test_scenarios:
            quote_data = {
                "client_info": {
                    "name": f"Test Client - {scenario['name']}",
                    "email": "validation@test.com",
                    "phone": "02-1111-2222",
                    "address": "123 Validation St, Sydney NSW 2000"
                },
                "room_measurements": {
                    "length": 3.5,
                    "width": 2.5,
                    "height": 2.4
                },
                "components": scenario["components"],
                "additional_notes": f"Validation test for {scenario['name']}"
            }
            
            success, response = self.run_test(
                f"Quote Generation - {scenario['name']}",
                "POST",
                "quotes/request",
                200,
                data=quote_data,
                timeout=60
            )
            
            if success and isinstance(response, dict):
                total_cost = response.get('total_cost', 0)
                breakdown_count = len(response.get('cost_breakdown', []))
                enabled_components = sum(1 for v in scenario['components'].values() if v)
                
                print(f"   ✅ {scenario['name']}: ${total_cost} ({breakdown_count} components)")
                
                # Validate that breakdown matches enabled components
                if breakdown_count != enabled_components:
                    print(f"   ⚠️  Component mismatch: {enabled_components} enabled, {breakdown_count} in breakdown")
            else:
                print(f"   ❌ {scenario['name']}: Failed")
                all_passed = False
        
        return all_passed

    def run_all_priority_tests(self):
        """Run all priority tests as specified in the review request"""
        print("🚀 STARTING PRIORITY BACKEND API TESTING")
        print("=" * 80)
        print("Testing Bathroom Quote Saver.AI backend APIs to verify all core functionality")
        print("Focus: Quote Generation, Project Management, PDF Generation, Cost Learning")
        print("=" * 80)
        
        # Run all priority tests in sequence
        test_results = []
        
        test_results.append(("Quote Generation API - /api/quotes/request", self.test_priority_quote_generation_request()))
        test_results.append(("Quote Generation with Learning API", self.test_priority_quote_generation_with_learning()))
        test_results.append(("Project Save API", self.test_priority_project_save()))
        test_results.append(("Get Projects API", self.test_priority_get_projects()))
        test_results.append(("Get Project Quote API", self.test_priority_get_project_quote()))
        test_results.append(("Delete Project API", self.test_priority_delete_project()))
        test_results.append(("PDF Proposal Generation", self.test_priority_pdf_generation_proposal()))
        test_results.append(("PDF Quote Summary Generation", self.test_priority_pdf_generation_quote_summary()))
        test_results.append(("Cost Adjustment Learning", self.test_priority_cost_adjustment_learning()))
        test_results.append(("Validation Scenarios", self.test_priority_validation_scenarios()))
        
        # Print final results
        print("\n" + "=" * 80)
        print("🎯 PRIORITY BACKEND TESTING RESULTS")
        print("=" * 80)
        
        passed_tests = []
        failed_tests = []
        
        for test_name, result in test_results:
            if result:
                passed_tests.append(test_name)
                print(f"✅ {test_name}: PASSED")
            else:
                failed_tests.append(test_name)
                print(f"❌ {test_name}: FAILED")
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total Tests: {len(test_results)}")
        print(f"   Passed: {len(passed_tests)}")
        print(f"   Failed: {len(failed_tests)}")
        print(f"   Success Rate: {(len(passed_tests) / len(test_results)) * 100:.1f}%")
        
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test}")
        
        if len(passed_tests) == len(test_results):
            print(f"\n🎉 ALL PRIORITY TESTS PASSED!")
            print(f"✅ Backend integration points are solid and ready for frontend")
        else:
            print(f"\n⚠️  SOME TESTS FAILED - ATTENTION REQUIRED")
        
        return len(failed_tests) == 0

if __name__ == "__main__":
    tester = PriorityBathroomAPITester()
    success = tester.run_all_priority_tests()
    sys.exit(0 if success else 1)