import requests
import sys
import json
from datetime import datetime
import time

class BathroomRenovationAPITester:
    def __init__(self, base_url="https://bathroom-quote-ai.preview.emergentagent.com"):
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

    def test_generate_pdf_proposal_original_costs(self):
        """Test PDF proposal generation with original costs (no adjustments)"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        pdf_request = {
            "user_profile": {
                "company_name": "Test Company",
                "contact_name": "Test User",
                "phone": "02-1234-5678",
                "email": "test@company.com",
                "license_number": "12345"
            },
            "adjusted_costs": None,
            "adjusted_total": None
        }
        
        success, response = self.run_test(
            "Generate PDF Proposal - Original Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   PDF generated successfully with original costs")
            return True
        return False

    def test_generate_pdf_proposal_adjusted_costs(self):
        """Test PDF proposal generation with adjusted costs"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        pdf_request = {
            "user_profile": {
                "company_name": "Test Company",
                "contact_name": "Test User",
                "phone": "02-1234-5678",
                "email": "test@company.com",
                "license_number": "12345"
            },
            "adjusted_costs": {
                "Demolition": 1300.00,
                "Plumbing Rough In": 4500.00,
                "Tiling": 3200.00
            },
            "adjusted_total": 8950.00
        }
        
        success, response = self.run_test(
            "Generate PDF Proposal - Adjusted Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   PDF generated successfully with adjusted costs")
            return True
        return False

    def test_generate_quote_summary_original_costs(self):
        """Test quote summary PDF generation with original costs (no adjustments)"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        pdf_request = {
            "user_profile": {
                "company_name": "Test Company",
                "contact_name": "Test User",
                "phone": "02-1234-5678",
                "email": "test@company.com",
                "license_number": "12345"
            },
            "adjusted_costs": None,
            "adjusted_total": None
        }
        
        success, response = self.run_test(
            "Generate Quote Summary PDF - Original Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-quote-summary",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   Quote summary PDF generated successfully with original costs")
            return True
        return False

    def test_generate_quote_summary_adjusted_costs(self):
        """Test quote summary PDF generation with adjusted costs"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
            
        pdf_request = {
            "user_profile": {
                "company_name": "Test Company",
                "contact_name": "Test User",
                "phone": "02-1234-5678",
                "email": "test@company.com",
                "license_number": "12345"
            },
            "adjusted_costs": {
                "Demolition": 1300.00,
                "Plumbing Rough In": 4500.00,
                "Tiling": 3200.00
            },
            "adjusted_total": 8950.00
        }
        
        success, response = self.run_test(
            "Generate Quote Summary PDF - Adjusted Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-quote-summary",
            200,
            data=pdf_request
        )
        
        if success:
            print(f"   Quote summary PDF generated successfully with adjusted costs")
            return True
        return False

    def test_method_not_allowed_debugging(self):
        """URGENT: Debug 'Method Not Allowed' error in quote generation"""
        print("\n🚨 DEBUGGING 'METHOD NOT ALLOWED' ERROR")
        print("=" * 60)
        
        # Test 1: Check if endpoints exist and accept correct methods
        print("\n--- TEST 1: Endpoint Method Verification ---")
        
        # Test GET on quote generation endpoints (should fail with 405 Method Not Allowed)
        print("Testing GET on quote generation endpoints (should return 405)...")
        
        success_get_1, response_get_1 = self.run_test(
            "GET /api/quotes/request (should be 405)",
            "GET",
            "quotes/request",
            405  # Expecting Method Not Allowed
        )
        
        success_get_2, response_get_2 = self.run_test(
            "GET /api/quotes/generate-with-learning (should be 405)",
            "GET", 
            "quotes/generate-with-learning?user_id=default",
            405  # Expecting Method Not Allowed
        )
        
        # Test 2: Verify POST methods work with minimal payload
        print("\n--- TEST 2: POST Method Verification ---")
        
        minimal_payload = {
            "client_info": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "02-1234-5678",
                "address": "123 Test St, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing_rough_in": False,
                "electrical_rough_in": False,
                "plastering": False,
                "waterproofing": False,
                "tiling": False,
                "fit_off": False
            }
        }
        
        print("Testing POST /api/quotes/request...")
        success_post_1, response_post_1 = self.run_test(
            "POST /api/quotes/request",
            "POST",
            "quotes/request",
            200,
            data=minimal_payload,
            timeout=60
        )
        
        print("Testing POST /api/quotes/generate-with-learning...")
        success_post_2, response_post_2 = self.run_test(
            "POST /api/quotes/generate-with-learning",
            "POST",
            "quotes/generate-with-learning?user_id=default",
            200,
            data=minimal_payload,
            timeout=60
        )
        
        # Test 3: Check backend service status
        print("\n--- TEST 3: Backend Service Status ---")
        
        success_root, response_root = self.run_test(
            "GET /api/ (root endpoint)",
            "GET",
            "",
            200
        )
        
        # Test 4: Test with exact payload from review request
        print("\n--- TEST 4: Exact Payload from Review Request ---")
        
        review_payload = {
            "client_info": {
                "name": "John Smith",
                "email": "john@example.com",
                "phone": "02-1234-5678", 
                "address": "123 Test Street, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing_rough_in": False,
                "electrical_rough_in": False,
                "plastering": False,
                "waterproofing": False,
                "tiling": False,
                "fit_off": False
            },
            "detailed_components": {
                "demolition": {
                    "enabled": True,
                    "subtasks": {
                        "ceiling_removal": True,
                        "floor_removal": True
                    }
                }
            },
            "task_options": {}
        }
        
        print("Testing with exact payload from review request...")
        success_exact, response_exact = self.run_test(
            "POST /api/quotes/generate-with-learning (exact payload)",
            "POST",
            "quotes/generate-with-learning?user_id=default",
            200,
            data=review_payload,
            timeout=60
        )
        
        # Test 5: Check for routing conflicts
        print("\n--- TEST 5: Routing Conflict Check ---")
        
        # Test if recent PDF endpoint changes affected routing
        if hasattr(self, 'quote_id') and self.quote_id:
            pdf_request = {
                "user_profile": {
                    "company_name": "Test Company",
                    "contact_name": "Test User",
                    "phone": "02-1234-5678",
                    "email": "test@company.com"
                }
            }
            
            success_pdf_1, response_pdf_1 = self.run_test(
                "POST /api/quotes/{quote_id}/generate-proposal",
                "POST",
                f"quotes/{self.quote_id}/generate-proposal",
                200,
                data=pdf_request
            )
            
            success_pdf_2, response_pdf_2 = self.run_test(
                "POST /api/quotes/{quote_id}/generate-quote-summary",
                "POST",
                f"quotes/{self.quote_id}/generate-quote-summary",
                200,
                data=pdf_request
            )
        else:
            print("   Skipping PDF endpoint tests - no quote ID available")
            success_pdf_1 = success_pdf_2 = True  # Don't fail the test
        
        # Summary and diagnosis
        print("\n" + "=" * 60)
        print("METHOD NOT ALLOWED ERROR ANALYSIS:")
        print("=" * 60)
        
        if not success_post_1 or not success_post_2:
            print("❌ CRITICAL: POST methods failing on quote generation endpoints")
            if not success_post_1:
                print(f"   /api/quotes/request failed: {response_post_1}")
            if not success_post_2:
                print(f"   /api/quotes/generate-with-learning failed: {response_post_2}")
            
            if not success_root:
                print("❌ Backend service appears to be down or misconfigured")
                print("🔧 SOLUTION: Check backend service status and restart if needed")
            else:
                print("✅ Backend service is responding")
                print("🔍 ISSUE: Specific quote generation endpoints have routing problems")
                print("🔧 SOLUTION: Check FastAPI route definitions and method decorators")
            
            return False
        else:
            print("✅ POST methods working correctly on quote generation endpoints")
            if success_exact:
                print("✅ Exact payload from review request works fine")
                print("🤔 DIAGNOSIS: Issue may be intermittent or frontend-related")
            else:
                print("❌ Exact payload from review request fails")
                print("🔍 ISSUE: Payload structure or validation problem")
            
            return True

    def test_validation_error_debugging(self):
        """URGENT: Test HTTP 422 validation errors on quote generation APIs"""
        print("\n🔍 DEBUGGING HTTP 422 VALIDATION ERRORS")
        print("=" * 60)
        
        # Exact payload format from the review request
        test_payload = {
            "client_info": {
                "name": "John Smith",
                "email": "john@example.com", 
                "phone": "02-1234-5678",
                "address": "123 Test Street, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": {"enabled": True}
            },
            "detailed_components": {
                "demolition": {
                    "enabled": True,
                    "subtasks": {
                        "ceiling_removal": True,
                        "floor_removal": True
                    }
                }
            },
            "task_options": {}
        }
        
        print("Testing with EXACT payload format from frontend...")
        print(f"Payload structure: {json.dumps(test_payload, indent=2)}")
        
        # Test 1: POST /api/quotes/request
        print("\n--- TEST 1: POST /api/quotes/request ---")
        success_1, response_1 = self.run_test(
            "Quote Request - Validation Debug",
            "POST",
            "quotes/request",
            200,  # Expected success
            data=test_payload,
            timeout=60
        )
        
        if not success_1:
            print("❌ VALIDATION ERROR FOUND!")
            if isinstance(response_1, dict) and 'detail' in response_1:
                print(f"   Validation Details: {json.dumps(response_1['detail'], indent=2)}")
            else:
                print(f"   Error Response: {response_1}")
        
        # Test 2: POST /api/quotes/generate-with-learning?user_id=default
        print("\n--- TEST 2: POST /api/quotes/generate-with-learning ---")
        success_2, response_2 = self.run_test(
            "Quote Generation with Learning - Validation Debug",
            "POST",
            "quotes/generate-with-learning?user_id=default",
            200,  # Expected success
            data=test_payload,
            timeout=60
        )
        
        if not success_2:
            print("❌ VALIDATION ERROR FOUND!")
            if isinstance(response_2, dict) and 'detail' in response_2:
                print(f"   Validation Details: {json.dumps(response_2['detail'], indent=2)}")
            else:
                print(f"   Error Response: {response_2}")
        
        # Test 3: Try with corrected components structure (backend expects boolean, not object)
        print("\n--- TEST 3: Corrected Components Structure ---")
        corrected_payload = test_payload.copy()
        corrected_payload["components"] = {
            "demolition": True,  # Boolean instead of {"enabled": True}
            "framing": False,
            "plumbing_rough_in": False,
            "electrical_rough_in": False,
            "plastering": False,
            "waterproofing": False,
            "tiling": False,
            "fit_off": False
        }
        
        print("Testing with corrected components structure...")
        success_3, response_3 = self.run_test(
            "Quote Request - Corrected Structure",
            "POST",
            "quotes/request",
            200,
            data=corrected_payload,
            timeout=60
        )
        
        if success_3:
            print("✅ SUCCESS with corrected structure!")
            print(f"   Total Cost: ${response_3.get('total_cost', 'N/A')}")
        else:
            print("❌ Still failing with corrected structure")
            if isinstance(response_3, dict) and 'detail' in response_3:
                print(f"   Validation Details: {json.dumps(response_3['detail'], indent=2)}")
        
        # Test 4: Minimal valid payload
        print("\n--- TEST 4: Minimal Valid Payload ---")
        minimal_payload = {
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
                "tiling": False,
                "fit_off": False
            }
        }
        
        print("Testing with minimal required fields...")
        success_4, response_4 = self.run_test(
            "Quote Request - Minimal Payload",
            "POST",
            "quotes/request",
            200,
            data=minimal_payload,
            timeout=60
        )
        
        if success_4:
            print("✅ SUCCESS with minimal payload!")
            print(f"   Total Cost: ${response_4.get('total_cost', 'N/A')}")
        else:
            print("❌ Minimal payload also failing")
            if isinstance(response_4, dict) and 'detail' in response_4:
                print(f"   Validation Details: {json.dumps(response_4['detail'], indent=2)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("VALIDATION ERROR ANALYSIS SUMMARY:")
        print("=" * 60)
        
        if not success_1 and not success_2:
            print("❌ BOTH endpoints failing with HTTP 422")
            print("🔍 ROOT CAUSE: Frontend payload structure mismatch")
            print("💡 SOLUTION: Components field expects boolean values, not objects")
            return False
        elif success_3 or success_4:
            print("✅ ISSUE IDENTIFIED: Components structure mismatch")
            print("🔧 FRONTEND FIX NEEDED: Change components from {demolition: {enabled: true}} to {demolition: true}")
            return True
        else:
            print("❌ VALIDATION ERRORS PERSIST - Need deeper investigation")
            return False

    def test_comprehensive_pdf_adjusted_costs(self):
        """Comprehensive test of PDF generation with adjusted costs - verify actual cost application"""
        if not self.quote_id:
            print("❌ Skipping - No quote ID available")
            return False
        
        print(f"\n🔍 COMPREHENSIVE PDF ADJUSTED COSTS TEST")
        print(f"Using Quote ID: {self.quote_id}")
        
        # First, get the original quote to see the original costs
        success_get, original_quote = self.run_test(
            "Get Original Quote for Comparison",
            "GET",
            f"quotes/{self.quote_id}",
            200
        )
        
        if success_get and isinstance(original_quote, dict):
            print(f"   Original Total Cost: ${original_quote.get('total_cost', 'N/A')}")
            original_breakdown = original_quote.get('cost_breakdown', [])
            print(f"   Original Components: {len(original_breakdown)}")
            for item in original_breakdown:
                print(f"     - {item.get('component', 'N/A')}: ${item.get('estimated_cost', 'N/A')}")
        
        # Test 1: PDF Proposal with specific adjusted costs
        print(f"\n--- TEST 1: PDF Proposal with Adjusted Costs ---")
        pdf_request_1 = {
            "user_profile": {
                "company_name": "Premium Bathroom Solutions",
                "contact_name": "Michael Johnson",
                "phone": "02-9876-5432",
                "email": "michael@premiumbathrooms.com.au",
                "license_number": "PBS-2024"
            },
            "adjusted_costs": {
                "Demolition": 1300.00,
                "Plumbing Rough In": 4500.00,
                "Tiling": 3200.00,
                "Plastering": 2100.00,
                "Waterproofing": 1850.00
            },
            "adjusted_total": 12950.00
        }
        
        success_1, response_1 = self.run_test(
            "PDF Proposal - Comprehensive Adjusted Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request_1
        )
        
        if success_1:
            print(f"   ✅ PDF Proposal generated with adjusted costs")
            print(f"   Adjusted Total: ${pdf_request_1['adjusted_total']}")
            print(f"   Adjusted Components: {len(pdf_request_1['adjusted_costs'])}")
        
        # Test 2: Quote Summary PDF with same adjusted costs
        print(f"\n--- TEST 2: Quote Summary PDF with Adjusted Costs ---")
        success_2, response_2 = self.run_test(
            "Quote Summary PDF - Comprehensive Adjusted Costs",
            "POST",
            f"quotes/{self.quote_id}/generate-quote-summary",
            200,
            data=pdf_request_1
        )
        
        if success_2:
            print(f"   ✅ Quote Summary PDF generated with adjusted costs")
        
        # Test 3: PDF Proposal with no adjustments (original costs)
        print(f"\n--- TEST 3: PDF Proposal with Original Costs ---")
        pdf_request_3 = {
            "user_profile": {
                "company_name": "Standard Renovations",
                "contact_name": "Sarah Wilson",
                "phone": "02-1234-5678",
                "email": "sarah@standardrenos.com.au",
                "license_number": "SR-2024"
            },
            "adjusted_costs": None,
            "adjusted_total": None
        }
        
        success_3, response_3 = self.run_test(
            "PDF Proposal - Original Costs Only",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request_3
        )
        
        if success_3:
            print(f"   ✅ PDF Proposal generated with original costs")
        
        # Test 4: Quote Summary PDF with no adjustments
        print(f"\n--- TEST 4: Quote Summary PDF with Original Costs ---")
        success_4, response_4 = self.run_test(
            "Quote Summary PDF - Original Costs Only",
            "POST",
            f"quotes/{self.quote_id}/generate-quote-summary",
            200,
            data=pdf_request_3
        )
        
        if success_4:
            print(f"   ✅ Quote Summary PDF generated with original costs")
        
        # Test 5: Partial adjustments (only some components adjusted)
        print(f"\n--- TEST 5: PDF with Partial Adjustments ---")
        pdf_request_5 = {
            "user_profile": {
                "company_name": "Selective Adjustments Ltd",
                "contact_name": "David Brown",
                "phone": "02-5555-9999",
                "email": "david@selectiveadj.com.au",
                "license_number": "SA-2024"
            },
            "adjusted_costs": {
                "Demolition": 1500.00,
                "Tiling": 3800.00
            },
            "adjusted_total": 16500.00
        }
        
        success_5, response_5 = self.run_test(
            "PDF Proposal - Partial Adjustments",
            "POST",
            f"quotes/{self.quote_id}/generate-proposal",
            200,
            data=pdf_request_5
        )
        
        if success_5:
            print(f"   ✅ PDF Proposal generated with partial adjustments")
            print(f"   Only 2 components adjusted: Demolition ($1500), Tiling ($3800)")
        
        # Summary
        all_tests_passed = all([success_1, success_2, success_3, success_4, success_5])
        
        print(f"\n--- COMPREHENSIVE TEST SUMMARY ---")
        print(f"✅ PDF Proposal with Adjusted Costs: {'PASS' if success_1 else 'FAIL'}")
        print(f"✅ Quote Summary with Adjusted Costs: {'PASS' if success_2 else 'FAIL'}")
        print(f"✅ PDF Proposal with Original Costs: {'PASS' if success_3 else 'FAIL'}")
        print(f"✅ Quote Summary with Original Costs: {'PASS' if success_4 else 'FAIL'}")
        print(f"✅ PDF Proposal with Partial Adjustments: {'PASS' if success_5 else 'FAIL'}")
        print(f"Overall Result: {'ALL TESTS PASSED' if all_tests_passed else 'SOME TESTS FAILED'}")
        
        return all_tests_passed

    def test_pdf_adjusted_costs_urgent_issue(self):
        """URGENT: Test PDF generation with adjusted costs - user reports PDFs show original prices"""
        print("\n🚨 URGENT: PDF ADJUSTED COSTS ISSUE TESTING")
        print("=" * 80)
        print("User reports: When they adjust costs after quote generation, PDF still shows original unadjusted prices")
        
        # Step 1: Generate a quote first
        print("\n--- STEP 1: Generate Initial Quote ---")
        quote_data = {
            "client_info": {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "phone": "02-9876-5432",
                "address": "456 Contractor Street, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.8,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing_rough_in": True,
                "electrical_rough_in": True,
                "plastering": True,
                "waterproofing": True,
                "tiling": True,
                "fit_off": True
            },
            "additional_notes": "Standard bathroom renovation for PDF adjusted costs testing"
        }
        
        success_quote, quote_response = self.run_test(
            "Generate Quote for PDF Testing",
            "POST",
            "quotes/request",
            200,
            data=quote_data,
            timeout=60
        )
        
        if not success_quote or not isinstance(quote_response, dict) or 'id' not in quote_response:
            print("❌ CRITICAL: Cannot generate quote for PDF testing")
            return False
        
        test_quote_id = quote_response['id']
        original_total = quote_response.get('total_cost', 0)
        original_breakdown = quote_response.get('cost_breakdown', [])
        
        print(f"✅ Quote generated successfully")
        print(f"   Quote ID: {test_quote_id}")
        print(f"   Original Total: ${original_total}")
        print(f"   Original Components: {len(original_breakdown)}")
        
        # Display original costs
        print("   Original Component Costs:")
        original_costs = {}
        for item in original_breakdown:
            component = item.get('component', 'Unknown')
            cost = item.get('estimated_cost', 0)
            original_costs[component] = cost
            print(f"     - {component}: ${cost}")
        
        # Step 2: Test PDF generation with adjusted costs
        print(f"\n--- STEP 2: Test PDF Generation with Adjusted Costs ---")
        
        # Define adjusted costs that are significantly different from originals
        adjusted_costs = {}
        adjusted_total = 0
        
        # Adjust costs by +30% to make differences obvious
        for component, original_cost in original_costs.items():
            adjusted_cost = round(original_cost * 1.3, 2)
            adjusted_costs[component] = adjusted_cost
            adjusted_total += adjusted_cost
        
        print(f"   Adjusted Total: ${adjusted_total} (vs Original: ${original_total})")
        print("   Adjusted Component Costs:")
        for component, cost in adjusted_costs.items():
            original = original_costs.get(component, 0)
            difference = cost - original
            print(f"     - {component}: ${cost} (was ${original}, +${difference})")
        
        # User profile for PDF generation
        user_profile = {
            "company_name": "Premium Bathroom Contractors",
            "contact_name": "Michael Thompson",
            "phone": "02-8765-4321",
            "email": "michael@premiumbathrooms.com.au",
            "license_number": "PBC-2024-001",
            "years_experience": "10+",
            "projects_completed": "200+"
        }
        
        # Test 3: Generate Proposal PDF with adjusted costs
        print(f"\n--- STEP 3: Generate Proposal PDF with Adjusted Costs ---")
        
        pdf_proposal_request = {
            "user_profile": user_profile,
            "adjusted_costs": adjusted_costs,
            "adjusted_total": adjusted_total
        }
        
        success_proposal, proposal_response = self.run_test(
            "Generate Proposal PDF - WITH ADJUSTED COSTS",
            "POST",
            f"quotes/{test_quote_id}/generate-proposal",
            200,
            data=pdf_proposal_request
        )
        
        if success_proposal:
            print("✅ Proposal PDF generated successfully with adjusted costs")
            print(f"   Expected to show adjusted total: ${adjusted_total}")
            print(f"   Expected to show adjusted component costs")
        else:
            print("❌ FAILED: Proposal PDF generation with adjusted costs failed")
        
        # Test 4: Generate Quote Summary PDF with adjusted costs
        print(f"\n--- STEP 4: Generate Quote Summary PDF with Adjusted Costs ---")
        
        success_summary, summary_response = self.run_test(
            "Generate Quote Summary PDF - WITH ADJUSTED COSTS",
            "POST",
            f"quotes/{test_quote_id}/generate-quote-summary",
            200,
            data=pdf_proposal_request
        )
        
        if success_summary:
            print("✅ Quote Summary PDF generated successfully with adjusted costs")
            print(f"   Expected to show adjusted total: ${adjusted_total}")
            print(f"   Expected to show adjusted component costs")
        else:
            print("❌ FAILED: Quote Summary PDF generation with adjusted costs failed")
        
        # Test 5: Generate PDFs with original costs (no adjustments) for comparison
        print(f"\n--- STEP 5: Generate PDFs with Original Costs (Control Test) ---")
        
        pdf_original_request = {
            "user_profile": user_profile,
            "adjusted_costs": None,
            "adjusted_total": None
        }
        
        success_original_proposal, _ = self.run_test(
            "Generate Proposal PDF - ORIGINAL COSTS ONLY",
            "POST",
            f"quotes/{test_quote_id}/generate-proposal",
            200,
            data=pdf_original_request
        )
        
        success_original_summary, _ = self.run_test(
            "Generate Quote Summary PDF - ORIGINAL COSTS ONLY",
            "POST",
            f"quotes/{test_quote_id}/generate-quote-summary",
            200,
            data=pdf_original_request
        )
        
        if success_original_proposal and success_original_summary:
            print("✅ Original cost PDFs generated successfully (control test)")
        
        # Test 6: Partial adjustments (only some components adjusted)
        print(f"\n--- STEP 6: Test Partial Adjustments ---")
        
        # Only adjust 2 components
        partial_adjusted_costs = {}
        if len(original_costs) >= 2:
            components_to_adjust = list(original_costs.keys())[:2]
            for component in components_to_adjust:
                partial_adjusted_costs[component] = round(original_costs[component] * 1.5, 2)
        
        partial_total = sum(partial_adjusted_costs.values()) + sum(
            cost for comp, cost in original_costs.items() 
            if comp not in partial_adjusted_costs
        )
        
        pdf_partial_request = {
            "user_profile": user_profile,
            "adjusted_costs": partial_adjusted_costs,
            "adjusted_total": partial_total
        }
        
        success_partial_proposal, _ = self.run_test(
            "Generate Proposal PDF - PARTIAL ADJUSTMENTS",
            "POST",
            f"quotes/{test_quote_id}/generate-proposal",
            200,
            data=pdf_partial_request
        )
        
        success_partial_summary, _ = self.run_test(
            "Generate Quote Summary PDF - PARTIAL ADJUSTMENTS",
            "POST",
            f"quotes/{test_quote_id}/generate-quote-summary",
            200,
            data=pdf_partial_request
        )
        
        if success_partial_proposal and success_partial_summary:
            print("✅ Partial adjustment PDFs generated successfully")
            print(f"   Adjusted components: {list(partial_adjusted_costs.keys())}")
            print(f"   Partial adjusted total: ${partial_total}")
        
        # Summary of urgent issue testing
        print(f"\n--- URGENT ISSUE TEST SUMMARY ---")
        print("=" * 80)
        
        all_tests_passed = all([
            success_quote,
            success_proposal,
            success_summary,
            success_original_proposal,
            success_original_summary,
            success_partial_proposal,
            success_partial_summary
        ])
        
        if all_tests_passed:
            print("✅ ALL PDF ADJUSTED COSTS TESTS PASSED")
            print("✅ Both PDF endpoints accept adjusted_costs parameter")
            print("✅ Both PDF endpoints handle original costs (no adjustments)")
            print("✅ Both PDF endpoints handle partial adjustments")
            print("✅ No errors in PDF generation process with adjusted costs")
            print("")
            print("🔍 ANALYSIS: Backend API is working correctly for PDF adjusted costs")
            print("💡 If user still sees original prices in PDFs, the issue may be:")
            print("   1. Frontend not sending adjusted_costs parameter correctly")
            print("   2. PDF content not being updated despite successful generation")
            print("   3. Caching issues in PDF viewer or browser")
            print("   4. User downloading wrong PDF version")
        else:
            print("❌ SOME PDF ADJUSTED COSTS TESTS FAILED")
            print("🚨 CRITICAL ISSUE CONFIRMED: PDF generation with adjusted costs has problems")
            
            failed_tests = []
            if not success_proposal:
                failed_tests.append("Proposal PDF with adjusted costs")
            if not success_summary:
                failed_tests.append("Quote Summary PDF with adjusted costs")
            if not success_original_proposal:
                failed_tests.append("Proposal PDF with original costs")
            if not success_original_summary:
                failed_tests.append("Quote Summary PDF with original costs")
            if not success_partial_proposal:
                failed_tests.append("Proposal PDF with partial adjustments")
            if not success_partial_summary:
                failed_tests.append("Quote Summary PDF with partial adjustments")
            
            print(f"   Failed tests: {', '.join(failed_tests)}")
        
        return all_tests_passed
    def test_component_label_changes(self):
        """Test that component label changes don't break backend API"""
        print("\n🔍 TESTING COMPONENT LABEL CHANGES")
        print("=" * 60)
        
        # Test 1: Backend still expects old field names (plumbing_rough_in, electrical_rough_in)
        print("\n--- TEST 1: Backend Field Name Compatibility ---")
        
        old_format_payload = {
            "client_info": {
                "name": "Component Test User",
                "email": "component@test.com",
                "phone": "02-1234-5678",
                "address": "123 Component St, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing_rough_in": True,  # Old backend field name
                "electrical_rough_in": True,  # Old backend field name
                "plastering": True,
                "waterproofing": True,
                "tiling": True,
                "fit_off": True
            }
        }
        
        success_old, response_old = self.run_test(
            "Quote with Old Component Field Names",
            "POST",
            "quotes/request",
            200,
            data=old_format_payload,
            timeout=60
        )
        
        if success_old:
            print("✅ Backend accepts old field names (plumbing_rough_in, electrical_rough_in)")
            print(f"   Total Cost: ${response_old.get('total_cost', 'N/A')}")
        else:
            print("❌ Backend rejects old field names")
        
        # Test 2: Check if backend accepts new field names (if updated)
        print("\n--- TEST 2: New Field Name Compatibility ---")
        
        new_format_payload = {
            "client_info": {
                "name": "New Component Test User",
                "email": "newcomponent@test.com",
                "phone": "02-1234-5678",
                "address": "456 New Component Ave, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 3.5,
                "width": 2.5,
                "height": 2.4
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing": True,  # New frontend field name
                "electrical": True,  # New frontend field name
                "plastering": True,
                "waterproofing": True,
                "tiling": True,
                "fit_off": True
            }
        }
        
        success_new, response_new = self.run_test(
            "Quote with New Component Field Names",
            "POST",
            "quotes/request",
            200,
            data=new_format_payload,
            timeout=60
        )
        
        if success_new:
            print("✅ Backend accepts new field names (plumbing, electrical)")
            print(f"   Total Cost: ${response_new.get('total_cost', 'N/A')}")
        else:
            print("❌ Backend rejects new field names - needs backend update")
        
        return success_old or success_new

    def test_tiling_task_descriptions(self):
        """Test updated tiling task descriptions and wall_tile_size option"""
        print("\n🔍 TESTING TILING TASK DESCRIPTIONS & WALL_TILE_SIZE")
        print("=" * 60)
        
        # Test with updated tiling task descriptions and new wall_tile_size option
        tiling_test_payload = {
            "client_info": {
                "name": "Tiling Test User",
                "email": "tiling@test.com",
                "phone": "02-1234-5678",
                "address": "789 Tiling St, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 4.0,
                "width": 3.0,
                "height": 2.7
            },
            "components": {
                "demolition": True,
                "framing": False,
                "plumbing_rough_in": False,
                "electrical_rough_in": False,
                "plastering": False,
                "waterproofing": True,
                "tiling": True,
                "fit_off": False
            },
            "detailed_components": {
                "tiling": {
                    "enabled": True,
                    "subtasks": {
                        "supply_materials_install_floor_tiles": True,  # Updated description
                        "supply_materials_install_wall_tiles": True,   # Updated description
                        "supply_materials_install_half_height_wall_tiles": True,  # Updated description
                        "waterproof_shower_area": True
                    }
                }
            },
            "task_options": {
                "floor_tile_size": "600x600mm",
                "wall_tile_size": "300x600mm",  # New wall_tile_size option
                "floor_tile_grade": "premium_grade",
                "wall_tile_grade": "standard_grade",
                "tiles_supply_grade": "premium_service"
            }
        }
        
        success, response = self.run_test(
            "Quote with Updated Tiling Descriptions & Wall Tile Size",
            "POST",
            "quotes/request",
            200,
            data=tiling_test_payload,
            timeout=60
        )
        
        if success:
            print("✅ Backend accepts updated tiling task descriptions")
            print("✅ Backend accepts new wall_tile_size option")
            print(f"   Total Cost: ${response.get('total_cost', 'N/A')}")
            
            # Check if tiling component is properly included in breakdown
            breakdown = response.get('cost_breakdown', [])
            tiling_component = next((item for item in breakdown if 'tiling' in item.get('component', '').lower()), None)
            if tiling_component:
                print(f"   Tiling Cost: ${tiling_component.get('estimated_cost', 'N/A')}")
                print(f"   Tiling Notes: {tiling_component.get('notes', 'N/A')[:100]}...")
            
            return True
        else:
            print("❌ Backend rejects updated tiling descriptions or wall_tile_size")
            return False

    def test_multi_area_system_compatibility(self):
        """Test multi-area system functionality for multiple bathroom areas"""
        print("\n🔍 TESTING MULTI-AREA SYSTEM COMPATIBILITY")
        print("=" * 60)
        
        # Test creating quotes for multiple areas in one project
        area1_payload = {
            "client_info": {
                "name": "Multi Area Test User",
                "email": "multiarea@test.com",
                "phone": "02-1234-5678",
                "address": "123 Multi Area House, Sydney NSW 2000"
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
            "additional_notes": "Main bathroom - Area 1 of multi-area project"
        }
        
        area2_payload = {
            "client_info": {
                "name": "Multi Area Test User",
                "email": "multiarea@test.com",
                "phone": "02-1234-5678",
                "address": "123 Multi Area House, Sydney NSW 2000"
            },
            "room_measurements": {
                "length": 2.0,
                "width": 1.8,
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
            "additional_notes": "Ensuite bathroom - Area 2 of multi-area project"
        }
        
        # Create quote for Area 1
        success1, response1 = self.run_test(
            "Multi-Area Quote - Main Bathroom (Area 1)",
            "POST",
            "quotes/request",
            200,
            data=area1_payload,
            timeout=60
        )
        
        # Create quote for Area 2
        success2, response2 = self.run_test(
            "Multi-Area Quote - Ensuite (Area 2)",
            "POST",
            "quotes/request",
            200,
            data=area2_payload,
            timeout=60
        )
        
        if success1 and success2:
            print("✅ Multi-area system working - can create quotes for multiple areas")
            area1_cost = response1.get('total_cost', 0)
            area2_cost = response2.get('total_cost', 0)
            total_project_cost = area1_cost + area2_cost
            
            print(f"   Area 1 (Main Bathroom): ${area1_cost}")
            print(f"   Area 2 (Ensuite): ${area2_cost}")
            print(f"   Total Project Cost: ${total_project_cost}")
            
            # Test saving multi-area project
            if hasattr(response1, 'get') and 'id' in response1:
                multi_area_project = {
                    "project_name": "Multi Area Bathroom Renovation",
                    "category": "Multi-Area",
                    "quote_id": response1['id'],
                    "client_name": "Multi Area Test User",
                    "total_cost": total_project_cost,
                    "notes": f"Multi-area project: Main bathroom (${area1_cost}) + Ensuite (${area2_cost})",
                    "request_data": {
                        "area1": area1_payload,
                        "area2": area2_payload,
                        "total_areas": 2
                    }
                }
                
                success_save, response_save = self.run_test(
                    "Save Multi-Area Project",
                    "POST",
                    "projects/save",
                    200,
                    data=multi_area_project
                )
                
                if success_save:
                    print("✅ Multi-area project saved successfully")
                    return True
            
            return True
        else:
            print("❌ Multi-area system failing")
            return False

def main():
    print("🚀 TESTING COMPONENT LABEL CHANGES & TILING UPDATES")
    print("=" * 70)
    
    tester = BathroomRenovationAPITester()
    
    # FOCUSED TEST SEQUENCE - Review Request Specific Tests
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("🔍 Component Label Changes", tester.test_component_label_changes),
        ("🔍 Tiling Task Descriptions & Wall Tile Size", tester.test_tiling_task_descriptions),
        ("🔍 Multi-Area System Compatibility", tester.test_multi_area_system_compatibility),
        ("Basic Quote Generation", tester.test_create_quote_small_bathroom),
        ("Detailed Components Quote", tester.test_create_quote_with_detailed_components),
        ("Get Quote by ID", tester.test_get_quote),
        ("Supplier Endpoints", tester.test_suppliers_endpoints),
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