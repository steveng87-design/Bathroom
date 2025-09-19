import requests
import sys
import json
from datetime import datetime
import time

class BathroomRenovationAPITester:
    def __init__(self, base_url="https://quotemaster-bath.preview.emergentagent.com"):
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

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_create_quote_small_bathroom(self):
        """Test creating a quote for a small bathroom"""
        quote_data = {
            "client_info": {
                "name": "John Smith",
                "email": "john.smith@example.com",
                "phone": "02-1234-5678",
                "address": "123 Test Street, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 2.0,
                "width": 1.5,
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
            },
            "additional_notes": "Small bathroom renovation with basic components"
        }
        
        success, response = self.run_test(
            "Create Quote - Small Bathroom",
            "POST",
            "quotes/request",
            200,
            data=quote_data,
            timeout=60  # AI requests may take longer
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.quote_id = response['id']
            print(f"   Quote ID: {self.quote_id}")
            print(f"   Total Cost: ${response.get('total_cost', 'N/A')}")
            print(f"   Confidence: {response.get('confidence_level', 'N/A')}")
            return True
        return False

    def test_create_quote_large_bathroom(self):
        """Test creating a quote for a large bathroom with all components"""
        quote_data = {
            "client_info": {
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "02-9876-5432",
                "address": "456 Large Ave, Melbourne VIC 3000"
            },
            "room_measurements": {
                "length": 4.0,
                "width": 3.0,
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
            "additional_notes": "Large luxury bathroom renovation with all components"
        }
        
        success, response = self.run_test(
            "Create Quote - Large Bathroom",
            "POST",
            "quotes/request",
            200,
            data=quote_data,
            timeout=60  # AI requests may take longer
        )
        
        if success and isinstance(response, dict):
            print(f"   Total Cost: ${response.get('total_cost', 'N/A')}")
            print(f"   Confidence: {response.get('confidence_level', 'N/A')}")
            return True
        return False

    def test_get_quote(self):
        """Test retrieving a quote by ID"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        return self.run_test(
            "Get Quote by ID",
            "GET",
            f"quotes/{self.quote_id}",
            200
        )[0]

    def test_adjust_quote_cost(self):
        """Test adjusting quote cost"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        adjustment_data = {
            "original_cost": 15000,
            "adjusted_cost": 18000,
            "adjustment_reason": "Added premium materials and extra labor",
            "component_adjustments": {
                "0": 3000,
                "1": 4000,
                "2": 5000
            }
        }
        
        return self.run_test(
            "Adjust Quote Cost",
            "POST",
            f"quotes/{self.quote_id}/adjust",
            200,
            data=adjustment_data
        )[0]

    def test_get_all_quotes(self):
        """Test getting all quotes"""
        return self.run_test(
            "Get All Quotes",
            "GET",
            "quotes",
            200
        )[0]

    def test_suppliers_endpoints(self):
        """Test all supplier endpoints"""
        components = [
            "demolition", "framing", "plumbing_rough_in", "electrical_rough_in",
            "plastering", "waterproofing", "tiling", "fit_off"
        ]
        
        all_passed = True
        for component in components:
            success, response = self.run_test(
                f"Get Suppliers - {component}",
                "GET",
                f"suppliers/{component}",
                200
            )
            if success and isinstance(response, dict):
                suppliers = response.get('suppliers', [])
                print(f"   Found {len(suppliers)} suppliers for {component}")
            else:
                all_passed = False
                
        return all_passed

    def test_invalid_supplier_component(self):
        """Test invalid supplier component"""
        return self.run_test(
            "Invalid Supplier Component",
            "GET",
            "suppliers/invalid_component",
            404
        )[0]

    def test_create_quote_with_detailed_components(self):
        """Test creating a quote with detailed component toggles and task options"""
        quote_data = {
            "client_info": {
                "name": "Sarah Wilson",
                "email": "sarah.wilson@example.com",
                "phone": "02-5555-1234",
                "address": "789 Component St, Brisbane QLD 4000"
            },
            "room_measurements": {
                "length": 4.0,
                "width": 3.0,
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
                        "remove_toilet": False,
                        "remove_shower_screen": True
                    }
                },
                "framing": {
                    "enabled": True,
                    "subtasks": {
                        "build_stud_walls": True,
                        "build_niches": True,
                        "install_door_frame": True,
                        "install_window_frame": False
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
                "skip_bin_size": "6m³",
                "build_niches_quantity": 2,
                "swing_door_size": "720mm",
                "water_feeds_type": "thermostatic",
                "power_points_quantity": 3,
                "plasterboard_grade": "standard_grade",
                "floor_tile_grade": "premium_grade",
                "wall_tile_grade": "standard_grade",
                "feature_tile_grade": "luxury_grade",
                "vanity_grade": "premium_grade",
                "toilet_grade": "standard_grade",
                "tapware_grade": "premium_grade",
                "lighting_grade": "standard_grade"
            },
            "additional_notes": "Test with detailed component toggles and task options"
        }
        
        success, response = self.run_test(
            "Create Quote - Detailed Components",
            "POST",
            "quotes/request",
            200,
            data=quote_data,
            timeout=60
        )
        
        if success and isinstance(response, dict):
            print(f"   Total Cost: ${response.get('total_cost', 'N/A')}")
            print(f"   Confidence: {response.get('confidence_level', 'N/A')}")
            print(f"   Components in breakdown: {len(response.get('cost_breakdown', []))}")
            return True
        return False

    def test_save_project_with_complete_data(self):
        """Test saving a project with complete request data for proper loading"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        # Complete request data that should be saved for proper loading
        complete_request_data = {
            "client_info": {
                "name": "John Smith",
                "email": "john@test.com",
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
                "framing": True,
                "plumbing_rough_in": True,
                "electrical_rough_in": False,
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
                        "remove_vanity": False,
                        "remove_toilet": True,
                        "remove_shower_screen": True
                    }
                },
                "framing": {
                    "enabled": True,
                    "subtasks": {
                        "build_stud_walls": True,
                        "build_niches": True,
                        "install_door_frame": False,
                        "install_window_frame": False
                    }
                },
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_install_floor_tiles": True,
                        "supply_install_wall_tiles": True,
                        "supply_install_feature_tiles": False,
                        "waterproof_shower_area": True
                    }
                }
            },
            "task_options": {
                "skip_bin_size": "6m³",
                "build_niches_quantity": 2,
                "swing_door_size": "720mm",
                "water_feeds_type": "thermostatic",
                "power_points_quantity": 3,
                "plasterboard_grade": "standard_grade",
                "floor_tile_grade": "premium_grade",
                "wall_tile_grade": "standard_grade",
                "vanity_grade": "premium_grade",
                "toilet_grade": "standard_grade",
                "tapware_grade": "premium_grade"
            }
        }
        
        project_data = {
            "project_name": "John Smith Bathroom Renovation",
            "category": "Residential",
            "quote_id": self.quote_id,
            "client_name": "John Smith",
            "total_cost": 25000,
            "notes": "Complete test project with all form data",
            "request_data": complete_request_data  # This is critical for proper loading
        }
        
        success, response = self.run_test(
            "Save Project with Complete Data",
            "POST",
            "projects/save",
            200,
            data=project_data
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.project_id = response['id']
            print(f"   Project ID: {self.project_id}")
            return True
        return False

    def test_get_saved_projects(self):
        """Test getting all saved projects"""
        return self.run_test(
            "Get Saved Projects",
            "GET",
            "projects",
            200
        )[0]

    def test_get_project_categories(self):
        """Test getting project categories"""
        return self.run_test(
            "Get Project Categories",
            "GET",
            "projects/categories",
            200
        )[0]

    def test_get_project_quote_detailed(self):
        """Test getting project quote details and verify complete data restoration"""
        if not hasattr(self, 'project_id') or not self.project_id:
            print("❌ Skipping - No project ID available")
            return False
            
        success, response = self.run_test(
            "Get Project Quote - Detailed Verification",
            "GET",
            f"projects/{self.project_id}/quote",
            200
        )
        
        if success and isinstance(response, dict):
            print(f"   Has project data: {'project' in response}")
            print(f"   Has quote data: {'quote' in response}")
            print(f"   Has request data: {'request' in response}")
            
            # Detailed verification of data restoration
            if 'request' in response and response['request']:
                request_data = response['request']
                print(f"   ✓ Request data available")
                
                # Check room measurements
                if 'room_measurements' in request_data:
                    measurements = request_data['room_measurements']
                    print(f"   ✓ Room measurements: {measurements.get('length')}x{measurements.get('width')}x{measurements.get('height')}mm")
                else:
                    print(f"   ❌ Missing room measurements")
                    return False
                
                # Check components
                if 'components' in request_data:
                    components = request_data['components']
                    enabled_components = [k for k, v in components.items() if v]
                    print(f"   ✓ Components ({len(enabled_components)} enabled): {', '.join(enabled_components)}")
                else:
                    print(f"   ❌ Missing components data")
                    return False
                
                # Check detailed components (subtasks)
                if 'detailed_components' in request_data:
                    detailed = request_data['detailed_components']
                    print(f"   ✓ Detailed components available for: {', '.join(detailed.keys())}")
                    
                    # Verify subtask data
                    for component, details in detailed.items():
                        if 'subtasks' in details:
                            enabled_subtasks = [k for k, v in details['subtasks'].items() if v]
                            print(f"     - {component}: {len(enabled_subtasks)} subtasks enabled")
                        else:
                            print(f"     - {component}: No subtasks data")
                else:
                    print(f"   ❌ Missing detailed components (subtasks)")
                    return False
                
                # Check task options
                if 'task_options' in request_data:
                    options = request_data['task_options']
                    print(f"   ✓ Task options available: {len(options)} options")
                    for key, value in options.items():
                        if value:
                            print(f"     - {key}: {value}")
                else:
                    print(f"   ❌ Missing task options")
                    return False
                
                # Check client info
                if 'client_info' in request_data:
                    client = request_data['client_info']
                    print(f"   ✓ Client info: {client.get('name')} ({client.get('email')})")
                else:
                    print(f"   ❌ Missing client info")
                    return False
                
                return True
            else:
                print(f"   ❌ No request data available for loading")
                return False
        return False

    def test_create_multiple_test_projects(self):
        """Create multiple test projects with different data for checkbox testing"""
        self.test_project_ids = []
        
        # Project 1: John Smith
        quote_data_1 = {
            "client_info": {
                "name": "John Smith",
                "email": "john@test.com",
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
                "framing": True,
                "plumbing_rough_in": True,
                "electrical_rough_in": False,
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
                        "remove_vanity": False,
                        "remove_toilet": True
                    }
                },
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_install_floor_tiles": True,
                        "supply_install_wall_tiles": True,
                        "supply_install_feature_tiles": False
                    }
                }
            },
            "task_options": {
                "skip_bin_size": "6m³",
                "build_niches_quantity": 2,
                "plasterboard_grade": "standard_grade",
                "floor_tile_grade": "premium_grade",
                "vanity_grade": "premium_grade"
            }
        }
        
        # Create quote 1
        success_1, response_1 = self.run_test(
            "Create Quote for Project 1 (John Smith)",
            "POST",
            "quotes/request",
            200,
            data=quote_data_1,
            timeout=60
        )
        
        if success_1 and 'id' in response_1:
            quote_id_1 = response_1['id']
            
            # Save project 1
            project_data_1 = {
                "project_name": "John Smith Bathroom Renovation",
                "category": "Residential",
                "quote_id": quote_id_1,
                "client_name": "John Smith",
                "total_cost": response_1.get('total_cost', 25000),
                "notes": "Standard residential bathroom with premium finishes",
                "request_data": quote_data_1
            }
            
            success_save_1, response_save_1 = self.run_test(
                "Save Project 1 (John Smith)",
                "POST",
                "projects/save",
                200,
                data=project_data_1
            )
            
            if success_save_1 and 'id' in response_save_1:
                self.test_project_ids.append(response_save_1['id'])
                print(f"   ✓ Project 1 saved: {response_save_1['id']}")
        
        # Project 2: Jane Doe
        quote_data_2 = {
            "client_info": {
                "name": "Jane Doe",
                "email": "jane@test.com",
                "phone": "0498765432",
                "address": "456 Demo Ave, Melbourne"
            },
            "room_measurements": {
                "length": 4.0,
                "width": 3.0,
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
                "skip_bin_size": "8m³",
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
            }
        }
        
        # Create quote 2
        success_2, response_2 = self.run_test(
            "Create Quote for Project 2 (Jane Doe)",
            "POST",
            "quotes/request",
            200,
            data=quote_data_2,
            timeout=60
        )
        
        if success_2 and 'id' in response_2:
            quote_id_2 = response_2['id']
            
            # Save project 2
            project_data_2 = {
                "project_name": "Jane Doe Luxury Bathroom",
                "category": "Luxury",
                "quote_id": quote_id_2,
                "client_name": "Jane Doe",
                "total_cost": response_2.get('total_cost', 45000),
                "notes": "Large luxury bathroom with all premium components",
                "request_data": quote_data_2
            }
            
            success_save_2, response_save_2 = self.run_test(
                "Save Project 2 (Jane Doe)",
                "POST",
                "projects/save",
                200,
                data=project_data_2
            )
            
            if success_save_2 and 'id' in response_save_2:
                self.test_project_ids.append(response_save_2['id'])
                print(f"   ✓ Project 2 saved: {response_save_2['id']}")
        
        print(f"   Total test projects created: {len(self.test_project_ids)}")
        return len(self.test_project_ids) >= 2

    def test_project_loading_functionality(self):
        """Test the critical project loading functionality that user reported as broken"""
        if not hasattr(self, 'test_project_ids') or len(self.test_project_ids) == 0:
            print("❌ Skipping - No test projects available")
            return False
        
        all_passed = True
        
        for i, project_id in enumerate(self.test_project_ids, 1):
            print(f"\n   Testing Project {i} Loading (ID: {project_id})")
            
            success, response = self.run_test(
                f"Load Project {i} Data",
                "GET",
                f"projects/{project_id}/quote",
                200
            )
            
            if not success:
                all_passed = False
                continue
            
            # Critical verification: Check if measurements and selected tasks are properly loaded
            if 'request' not in response or not response['request']:
                print(f"   ❌ Project {i}: No request data available for loading")
                all_passed = False
                continue
            
            request_data = response['request']
            
            # Verify room measurements restoration
            if 'room_measurements' not in request_data:
                print(f"   ❌ Project {i}: Room measurements missing")
                all_passed = False
            else:
                measurements = request_data['room_measurements']
                if not all(key in measurements for key in ['length', 'width', 'height']):
                    print(f"   ❌ Project {i}: Incomplete room measurements")
                    all_passed = False
                else:
                    print(f"   ✓ Project {i}: Room measurements restored ({measurements['length']}x{measurements['width']}x{measurements['height']})")
            
            # Verify component selection restoration
            if 'components' not in request_data:
                print(f"   ❌ Project {i}: Components missing")
                all_passed = False
            else:
                components = request_data['components']
                enabled_count = sum(1 for v in components.values() if v)
                print(f"   ✓ Project {i}: Components restored ({enabled_count} enabled)")
            
            # Verify detailed components (subtasks) restoration
            if 'detailed_components' not in request_data:
                print(f"   ❌ Project {i}: Detailed components (subtasks) missing")
                all_passed = False
            else:
                detailed = request_data['detailed_components']
                subtask_count = 0
                for component, details in detailed.items():
                    if 'subtasks' in details:
                        subtask_count += sum(1 for v in details['subtasks'].values() if v)
                print(f"   ✓ Project {i}: Subtasks restored ({subtask_count} enabled)")
            
            # Verify task options restoration
            if 'task_options' not in request_data:
                print(f"   ❌ Project {i}: Task options missing")
                all_passed = False
            else:
                options = request_data['task_options']
                option_count = sum(1 for v in options.values() if v)
                print(f"   ✓ Project {i}: Task options restored ({option_count} options)")
            
            # Verify client info restoration
            if 'client_info' not in request_data:
                print(f"   ❌ Project {i}: Client info missing")
                all_passed = False
            else:
                client = request_data['client_info']
                print(f"   ✓ Project {i}: Client info restored ({client.get('name')})")
        
        return all_passed

    def test_project_deletion(self):
        """Test project deletion functionality for checkbox selection"""
        if not hasattr(self, 'test_project_ids') or len(self.test_project_ids) == 0:
            print("❌ Skipping - No test projects available")
            return False
        
        # Test deleting the first project
        project_to_delete = self.test_project_ids[0]
        
        success, response = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{project_to_delete}",
            200
        )
        
        if success:
            print(f"   ✓ Project deleted successfully: {project_to_delete}")
            
            # Verify project is actually deleted
            success_verify, response_verify = self.run_test(
                "Verify Project Deletion",
                "GET",
                f"projects/{project_to_delete}/quote",
                404  # Should return 404 now
            )
            
            if success_verify:
                print(f"   ✓ Project deletion verified - returns 404")
                return True
            else:
                print(f"   ❌ Project deletion failed - still accessible")
                return False
        
        return False

    def test_generate_pdf_proposal(self):
        """Test PDF proposal generation"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        user_profile = {
            "company_name": "Test Renovations Pty Ltd",
            "contact_name": "Test Manager",
            "phone": "02-1234-5678",
            "email": "test@renovations.com.au",
            "license_number": "TEST-1234",
            "years_experience": "10+",
            "projects_completed": "200+"
        }
        
        success, response = self.run_test(
            "Generate PDF Proposal",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=user_profile
        )
        
        if success:
            print(f"   PDF generated successfully")
            return True
        return False

def main():
    print("🚀 Starting Bathroom Renovation API Tests")
    print("=" * 50)
    
    tester = BathroomRenovationAPITester()
    
    # Test sequence - Focus on project management functionality
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Small Bathroom Quote", tester.test_create_quote_small_bathroom),
        ("Save Project with Complete Data", tester.test_save_project_with_complete_data),
        ("Get Project Quote - Detailed", tester.test_get_project_quote_detailed),
        ("Create Multiple Test Projects", tester.test_create_multiple_test_projects),
        ("Project Loading Functionality", tester.test_project_loading_functionality),
        ("Get Saved Projects", tester.test_get_saved_projects),
        ("Get Project Categories", tester.test_get_project_categories),
        ("Project Deletion", tester.test_project_deletion),
        ("Large Bathroom Quote", tester.test_create_quote_large_bathroom),
        ("Detailed Components Quote", tester.test_create_quote_with_detailed_components),
        ("Get Quote by ID", tester.test_get_quote),
        ("Adjust Quote Cost", tester.test_adjust_quote_cost),
        ("Get All Quotes", tester.test_get_all_quotes),
        ("Generate PDF Proposal", tester.test_generate_pdf_proposal),
        ("Supplier Endpoints", tester.test_suppliers_endpoints),
        ("Invalid Supplier", tester.test_invalid_supplier_component),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print(f"\n{'='*50}")
    print(f"📊 FINAL RESULTS")
    print(f"{'='*50}")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())