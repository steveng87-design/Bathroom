from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from pdf_generator import BathroomProposalPDF
from fastapi.responses import Response
from email_service import email_service, EmailDeliveryError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM Chat
llm_chat = LlmChat(
    api_key=os.environ.get('EMERGENT_LLM_KEY'),
    session_id="renovation-pricing",
    system_message="""You are an expert bathroom renovation cost estimator with extensive knowledge of construction costs, labor rates, and material pricing. 

Your role is to provide accurate cost estimates for bathroom renovations based on:
- Room dimensions and square footage
- Selected renovation components (demolition, framing, plumbing, electrical, plastering, waterproofing, tiling, fit off)
- Regional pricing variations
- Current market rates for materials and labor

Provide detailed breakdowns with cost ranges and explain your reasoning. Always consider:
- Complexity factors that might affect pricing
- Quality levels of materials and finishes
- Labor intensity of each component
- Potential complications or additional work needed

Format your response as JSON with detailed cost breakdowns."""
).with_model("openai", "gpt-4o")

# Models
class RenovationComponent(BaseModel):
    demolition: bool = False
    framing: bool = False
    plumbing_rough_in: bool = False
    electrical_rough_in: bool = False
    plastering: bool = False
    waterproofing: bool = False
    tiling: bool = False
    fit_off: bool = False

class ClientInfo(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class RoomMeasurements(BaseModel):
    length: float
    width: float
    height: float
    
    @property
    def square_meters(self) -> float:
        return self.length * self.width
    
    @property
    def cubic_meters(self) -> float:
        return self.length * self.width * self.height

class RenovationQuoteRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_info: ClientInfo
    room_measurements: RoomMeasurements
    components: RenovationComponent
    detailed_components: Optional[Dict[str, Any]] = None  # For enhanced AI analysis
    task_options: Optional[Dict[str, Any]] = None  # Quantity/size selections
    additional_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CostBreakdown(BaseModel):
    component: str
    estimated_cost: float
    cost_range_min: float
    cost_range_max: float
    notes: str

class RenovationQuote(BaseModel):
    id: str
    request_id: str
    total_cost: float
    cost_breakdown: List[CostBreakdown]
    ai_analysis: str
    confidence_level: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CostAdjustment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_id: Optional[str] = None  # This will be set from URL parameter
    original_cost: float
    adjusted_cost: float
    adjustment_reason: str
    component_adjustments: Optional[Dict[str, float]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfile(BaseModel):
    company_name: str = "Professional Bathroom Renovations"
    contact_name: str = "Project Manager"
    phone: str = "Contact for details"
    email: str = "info@bathroomquotesaver.ai"
    license_number: str = "XXXX-XXXX"
    years_experience: str = "5+"
    projects_completed: str = "100+"

class SavedProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_name: str
    category: str = "General"
    quote_id: str
    client_name: str
    total_cost: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    request_data: Optional[Dict[str, Any]] = None  # Store complete form data for proper loading

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class MaterialSupplier(BaseModel):
    name: str
    address: str
    phone: str
    specialties: List[str]
    estimated_distance: str

# Cost Adjustment Learning Models
class CostAdjustment(BaseModel):
    quote_id: str = Field(..., description="Quote ID this adjustment belongs to")
    user_id: str = Field(default="default", description="User identifier for personalized learning")
    component: str = Field(..., description="Component name that was adjusted")
    original_cost: float = Field(..., description="AI's original estimated cost")
    adjusted_cost: float = Field(..., description="User's adjusted cost")
    adjustment_ratio: float = Field(..., description="Ratio of adjusted/original cost")
    project_size: Optional[float] = Field(None, description="Project area in sqm for context")
    location: Optional[str] = Field(None, description="Project location for regional learning")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notes: Optional[str] = Field(None, description="User notes about the adjustment")

class LearningInsights(BaseModel):
    component: str
    average_adjustment_ratio: float
    confidence_level: float
    adjustment_count: int
    cost_trend: str  # "higher", "lower", "accurate"
class EmailOptions(BaseModel):
    include_breakdown: bool = True
    include_pdf: bool = False

class SendQuoteEmailRequest(BaseModel):
    recipient_email: EmailStr
    client_name: str
    quote_id: str
    options: EmailOptions = EmailOptions()
    
class EmailResponse(BaseModel):
    status: str
    message: str

# Static material suppliers data (MVP approach)
MATERIAL_SUPPLIERS = {
    "demolition": [
        MaterialSupplier(name="Demo Pro Supplies", address="123 Industrial Ave", phone="02-1234-5678", specialties=["Demolition tools", "Waste disposal"], estimated_distance="2.5km"),
        MaterialSupplier(name="Construction Depot", address="456 Trade St", phone="02-2345-6789", specialties=["Tools", "Safety equipment"], estimated_distance="4.1km")
    ],
    "framing": [
        MaterialSupplier(name="Timber Masters", address="789 Lumber Rd", phone="02-3456-7890", specialties=["Timber framing", "Steel frames"], estimated_distance="3.2km"),
        MaterialSupplier(name="Frame & Build", address="321 Builder Ave", phone="02-4567-8901", specialties=["Framing materials", "Insulation"], estimated_distance="5.8km")
    ],
    "plumbing_rough_in": [
        MaterialSupplier(name="Plumb Perfect", address="654 Pipe Lane", phone="02-5678-9012", specialties=["Pipes", "Fittings", "Fixtures"], estimated_distance="1.9km"),
        MaterialSupplier(name="Water Works Supply", address="987 Flow St", phone="02-6789-0123", specialties=["Plumbing supplies", "Drainage"], estimated_distance="3.7km")
    ],
    "electrical_rough_in": [
        MaterialSupplier(name="Sparky Supplies", address="159 Electric Blvd", phone="02-7890-1234", specialties=["Wiring", "Switches", "Outlets"], estimated_distance="2.8km"),
        MaterialSupplier(name="Current Solutions", address="753 Voltage Ave", phone="02-8901-2345", specialties=["Electrical components", "Safety switches"], estimated_distance="4.5km")
    ],
    "plastering": [
        MaterialSupplier(name="Smooth Finish Supplies", address="852 Render Rd", phone="02-9012-3456", specialties=["Plaster", "Render", "Tools"], estimated_distance="3.1km"),
        MaterialSupplier(name="Wall Perfect", address="741 Surface St", phone="02-0123-4567", specialties=["Plastering materials", "Finishing supplies"], estimated_distance="6.2km")
    ],
    "waterproofing": [
        MaterialSupplier(name="Seal Tight", address="963 Barrier Blvd", phone="02-1357-9246", specialties=["Waterproof membranes", "Sealants"], estimated_distance="2.3km"),
        MaterialSupplier(name="Dry Solutions", address="258 Protect Ave", phone="02-2468-0135", specialties=["Waterproofing", "Moisture control"], estimated_distance="4.9km")
    ],
    "tiling": [
        MaterialSupplier(name="Tile World", address="147 Ceramic St", phone="02-3691-4725", specialties=["Tiles", "Adhesives", "Grout"], estimated_distance="1.5km"),
        MaterialSupplier(name="Surface Specialists", address="369 Mosaic Rd", phone="02-4714-5826", specialties=["Premium tiles", "Natural stone"], estimated_distance="3.8km")
    ],
    "fit_off": [
        MaterialSupplier(name="Finish Line", address="582 Complete Ave", phone="02-5825-9637", specialties=["Fixtures", "Fittings", "Accessories"], estimated_distance="2.7km"),
        MaterialSupplier(name="Final Touch", address="714 Detail St", phone="02-6936-7418", specialties=["Bathroom accessories", "Hardware"], estimated_distance="5.1km")
    ]
}

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        # Remove MongoDB's _id field if present
        if '_id' in item:
            del item['_id']
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value and value.endswith('Z'):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(subitem) if isinstance(subitem, dict) else subitem for subitem in value]
    return item

# Routes
@api_router.post("/quotes/request", response_model=RenovationQuote)
async def create_quote_request(request: RenovationQuoteRequest):
    try:
        # Store the request
        request_dict = prepare_for_mongo(request.dict())
        await db.quote_requests.insert_one(request_dict)
        
        # Generate AI-powered cost estimate with detailed subtask analysis
        components_list = [k.replace('_', ' ').title() for k, v in request.components.dict().items() if v]
        
        # Extract detailed subtasks for enhanced analysis
        detailed_tasks = {}
        if request.detailed_components:
            for component, details in request.detailed_components.items():
                if details.get('enabled'):
                    selected_subtasks = [k for k, v in details.get('subtasks', {}).items() if v]
                    if selected_subtasks:
                        detailed_tasks[component] = selected_subtasks
        
        detailed_task_text = ""
        if detailed_tasks:
            detailed_task_text = "\nDetailed Sub-tasks Selected:\n"
            for component, subtasks in detailed_tasks.items():
                detailed_task_text += f"- {component.replace('_', ' ').title()}: {', '.join([s.replace('_', ' ').title() for s in subtasks])}\n"
        
        # Add task options for enhanced pricing
        task_options_text = ""
        if request.task_options:
            task_options_text = "\nSpecific Task Options:\n"
            options = request.task_options
            if options.get('skip_bin_size'):
                task_options_text += f"- Skip Bin Size: {options['skip_bin_size']}\n"
            if options.get('build_niches_quantity', 0) > 0:
                task_options_text += f"- Niches Quantity: {options['build_niches_quantity']}\n"
            if options.get('swing_door_size'):
                task_options_text += f"- Swing Door Size: {options['swing_door_size']}\n"
            if options.get('cavity_sliding_size'):
                task_options_text += f"- Cavity Sliding Size: {options['cavity_sliding_size']}\n"
            if options.get('minor_costs_amount', 0) > 0:
                task_options_text += f"- Additional Costs Allowance: ${options['minor_costs_amount']}\n"
            if options.get('water_feeds_type'):
                task_options_text += f"- Water Feeds Type: {options['water_feeds_type']} mixer\n"
            if options.get('power_points_quantity', 0) > 0:
                task_options_text += f"- Power Points Quantity: {options['power_points_quantity']}\n"
            if options.get('plasterboard_grade'):
                task_options_text += f"- Plasterboard Grade: {options['plasterboard_grade'].replace('_', ' ').title()}\n"
            if options.get('cornice_type'):
                task_options_text += f"- Cornice Type: {options['cornice_type'].replace('_', ' ').title()}\n"
            if options.get('floor_tile_grade'):
                task_options_text += f"- Floor Tile Grade: {options['floor_tile_grade'].replace('_', ' ').title()}\n"
            if options.get('wall_tile_grade'):
                task_options_text += f"- Wall Tile Grade: {options['wall_tile_grade'].replace('_', ' ').title()}\n"
            if options.get('tile_size'):
                task_options_text += f"- Tile Size: {options['tile_size']}\n"
            if options.get('feature_tile_grade'):
                task_options_text += f"- Feature Tile Grade: {options['feature_tile_grade'].replace('_', ' ').title()}\n"
            if options.get('vanity_grade'):
                task_options_text += f"- Vanity Grade: {options['vanity_grade'].replace('_', ' ').title()}\n"
            if options.get('toilet_grade'):
                task_options_text += f"- Toilet Grade: {options['toilet_grade'].replace('_', ' ').title()}\n"
            if options.get('shower_screen_grade'):
                task_options_text += f"- Shower Screen Type: {options['shower_screen_grade'].replace('_', ' ').title()}\n"
            if options.get('tapware_grade'):
                task_options_text += f"- Tapware Grade: {options['tapware_grade'].replace('_', ' ').title()}\n"
            if options.get('lighting_grade'):
                task_options_text += f"- Lighting Grade: {options['lighting_grade'].replace('_', ' ').title()}\n"
            if options.get('mirror_grade'):
                task_options_text += f"- Mirror/Cabinet Type: {options['mirror_grade'].replace('_', ' ').title()}\n"
            if options.get('tiles_supply_grade'):
                task_options_text += f"- Tiles Supply Service: {options['tiles_supply_grade'].replace('_', ' ').title()}\n"
        
        prompt = f"""
        Analyze this bathroom renovation project and provide a detailed cost estimate using the specific sub-tasks selected:
        
        Room Details:
        - Dimensions: {request.room_measurements.length}m x {request.room_measurements.width}m x {request.room_measurements.height}m
        - Floor Area: {request.room_measurements.square_meters:.2f} square meters
        - Volume: {request.room_measurements.cubic_meters:.2f} cubic meters
        
        Selected Main Components: {', '.join(components_list) if components_list else 'None selected'}
        {detailed_task_text}
        {task_options_text}
        
        Client Location: {request.client_info.address}
        Additional Notes: {request.additional_notes or 'None'}
        
        IMPORTANT: Use the detailed sub-tasks to provide more accurate pricing. Each selected sub-task should influence the cost estimate for that component. Consider:
        - Complexity of selected sub-tasks
        - Labor time for specific tasks
        - Material requirements for each sub-task (INCLUDE SUPPLY COSTS - materials + delivery + labor)
        - Regional pricing variations
        
        CRITICAL PRICING NOTE: Tasks marked "Supply & Install" should include BOTH material costs AND installation labor. 
        For example, "Supply & Install Wall Sheets" should include: sheet materials + screws + compounds + delivery + labor.
        Base your pricing on total project cost, not just labor rates.
        
        Please provide:
        1. Total estimated cost based on selected sub-tasks
        2. Cost breakdown for each selected component (considering specific sub-tasks)
        3. Cost range (min-max) for each component
        4. Analysis notes explaining cost factors and how sub-tasks influence pricing
        5. Confidence level of the estimate
        
        Return the response in this JSON format:
        {{
            "total_cost": 0,
            "breakdown": [
                {{
                    "component": "component_name",
                    "estimated_cost": 0,
                    "cost_range_min": 0,
                    "cost_range_max": 0,
                    "notes": "explanation including sub-task analysis"
                }}
            ],
            "analysis": "detailed analysis text mentioning specific sub-tasks and their impact on pricing",
            "confidence": "High/Medium/Low"
        }}
        """
        
        ai_message = UserMessage(text=prompt)
        ai_response = await llm_chat.send_message(ai_message)
        
        # Parse AI response
        import json
        import re
        try:
            # Try to extract JSON from the AI response
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                ai_data = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
            
            # Validate required fields
            if not all(key in ai_data for key in ['total_cost', 'breakdown', 'analysis', 'confidence']):
                raise ValueError("Missing required fields in AI response")
                
        except Exception as e:
            print(f"AI JSON parsing error: {e}")
            print(f"AI Response: {ai_response}")
            
            # Fallback with more intelligent pricing based on components
            base_cost_per_sqm = 1200  # Base cost per square meter
            area = request.room_measurements.square_meters
            base_total = base_cost_per_sqm * area
            
            # Component-specific cost multipliers
            component_costs = {
                "Demolition": base_total * 0.15,
                "Framing": base_total * 0.20,
                "Plumbing Rough In": base_total * 0.25,
                "Electrical Rough In": base_total * 0.15,
                "Plastering": base_total * 0.18,
                "Waterproofing": base_total * 0.12,
                "Tiling": base_total * 0.30,
                "Fit Off": base_total * 0.20
            }
            
            breakdown_items = []
            total_fallback_cost = 0
            
            for comp in components_list:
                cost = component_costs.get(comp, base_total * 0.15)
                total_fallback_cost += cost
                breakdown_items.append({
                    "component": comp,
                    "estimated_cost": round(cost),
                    "cost_range_min": round(cost * 0.8),
                    "cost_range_max": round(cost * 1.3),
                    "notes": f"Standard pricing for {comp.lower()} based on {area:.1f}m² area"
                })
            
            ai_data = {
                "total_cost": round(total_fallback_cost),
                "breakdown": breakdown_items,
                "analysis": f"Cost estimate based on {area:.1f}m² bathroom with {len(components_list)} selected components. Pricing includes materials and labor at standard market rates.",
                "confidence": "Medium"
            }
        
        # Create quote
        cost_breakdown = [
            CostBreakdown(
                component=item["component"],
                estimated_cost=item["estimated_cost"],
                cost_range_min=item["cost_range_min"],
                cost_range_max=item["cost_range_max"],
                notes=item["notes"]
            ) for item in ai_data["breakdown"]
        ]
        
        quote = RenovationQuote(
            id=str(uuid.uuid4()),
            request_id=request.id,
            total_cost=ai_data["total_cost"],
            cost_breakdown=cost_breakdown,
            ai_analysis=ai_data["analysis"],
            confidence_level=ai_data["confidence"]
        )
        
        # Store the quote
        quote_dict = prepare_for_mongo(quote.dict())
        await db.quotes.insert_one(quote_dict)
        
        return quote
        
    except Exception as e:
        logging.error(f"Error creating quote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating quote: {str(e)}")

@api_router.get("/quotes/{quote_id}", response_model=RenovationQuote)
async def get_quote(quote_id: str):
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote = parse_from_mongo(quote)
    return RenovationQuote(**quote)

@api_router.post("/quotes/{quote_id}/adjust")
async def adjust_quote_cost(quote_id: str, adjustment: CostAdjustment):
    # Store the adjustment for learning (remove quote_id from model, use path parameter)
    adjustment.quote_id = quote_id
    adjustment_dict = prepare_for_mongo(adjustment.dict())
    await db.cost_adjustments.insert_one(adjustment_dict)
    
    # Update the quote with adjusted cost
    await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {"total_cost": adjustment.adjusted_cost, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Quote adjusted successfully", "new_total": adjustment.adjusted_cost}

@api_router.get("/suppliers/{component}")
async def get_suppliers_for_component(component: str):
    if component not in MATERIAL_SUPPLIERS:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return {"component": component, "suppliers": MATERIAL_SUPPLIERS[component]}

@api_router.get("/quotes", response_model=List[RenovationQuote])
async def get_all_quotes():
    quotes = await db.quotes.find().to_list(1000)
    return [RenovationQuote(**parse_from_mongo(quote)) for quote in quotes]

# Project Management Endpoints
@api_router.post("/projects/save", response_model=SavedProject)
async def save_project(project: SavedProject):
    """Save a project for future reference"""
    try:
        project_dict = prepare_for_mongo(project.dict())
        await db.saved_projects.insert_one(project_dict)
        return project
    except Exception as e:
        logging.error(f"Error saving project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving project: {str(e)}")

@api_router.get("/projects", response_model=List[SavedProject])
async def get_saved_projects(category: Optional[str] = None):
    """Get all saved projects, optionally filtered by category"""
    try:
        query = {}
        if category and category != "All":
            query["category"] = category
        
        projects = await db.saved_projects.find(query).sort("updated_at", -1).to_list(1000)
        return [SavedProject(**parse_from_mongo(project)) for project in projects]
    except Exception as e:
        logging.error(f"Error fetching projects: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, update: ProjectUpdate):
    """Update project name, category, or notes"""
    try:
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.saved_projects.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"message": "Project updated successfully"}
    except Exception as e:
        logging.error(f"Error updating project: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating project: {str(e)}")

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a saved project"""
    try:
        logging.info(f"Attempting to delete project: {project_id}")
        result = await db.saved_projects.delete_one({"id": project_id})
        
        if result.deleted_count == 0:
            logging.warning(f"Project not found for deletion: {project_id}")
            raise HTTPException(status_code=404, detail="Project not found")
        
        logging.info(f"Successfully deleted project: {project_id}")
        return {"message": "Project deleted successfully"}
    except HTTPException:
        # Re-raise HTTP exceptions (like 404) without modification
        raise
    except Exception as e:
        logging.error(f"Error deleting project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")

@api_router.get("/projects/categories")
async def get_project_categories():
    """Get all unique project categories"""
    try:
        categories = await db.saved_projects.distinct("category")
        return {"categories": ["All"] + sorted(categories)}
    except Exception as e:
        logging.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@api_router.get("/projects/{project_id}/quote")
async def get_project_quote(project_id: str):
    """Get the full quote data for a saved project"""
    try:
        project = await db.saved_projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        quote = await db.quotes.find_one({"id": project["quote_id"]})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Use stored request_data from project if available, otherwise fallback to quote_requests
        request_data = project.get("request_data")
        if not request_data:
            # Fallback for legacy projects
            request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
            request_data = parse_from_mongo(request_data) if request_data else None
        
        return {
            "project": SavedProject(**parse_from_mongo(project)),
            "quote": RenovationQuote(**parse_from_mongo(quote)),
            "request": request_data
        }
    except Exception as e:
        logging.error(f"Error fetching project quote: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching project quote: {str(e)}")

@api_router.post("/quotes/save-draft")
async def save_draft_quote(draft_data: Dict[str, Any]):
    """Save a draft quote and request for incomplete projects"""
    try:
        quote_dict = prepare_for_mongo(draft_data["quote"])
        request_dict = prepare_for_mongo(draft_data["request"])
        
        # Store both draft quote and request
        await db.quotes.insert_one(quote_dict)
        await db.quote_requests.insert_one(request_dict)
        
        return {"message": "Draft saved successfully"}
        
    except Exception as e:
        logging.error(f"Error saving draft: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving draft: {str(e)}")

@api_router.post("/quotes/{quote_id}/generate-proposal")
async def generate_proposal_pdf(quote_id: str, user_profile: UserProfile):
    """Generate a professional scope of works PDF proposal"""
    try:
        # Get the quote data
        quote = await db.quotes.find_one({"id": quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Get the original request data
        request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
        if not request_data:
            raise HTTPException(status_code=404, detail="Quote request data not found")
        
        # Combine quote and request data
        combined_data = {
            **parse_from_mongo(quote),
            **parse_from_mongo(request_data)
        }
        
        # Debug: Log the combined data structure
        logging.info(f"Combined data keys: {list(combined_data.keys())}")
        logging.info(f"Has detailed_components: {'detailed_components' in combined_data}")
        if 'detailed_components' in combined_data:
            logging.info(f"detailed_components type: {type(combined_data['detailed_components'])}")
        
        # Generate PDF
        pdf_generator = BathroomProposalPDF()
        
        # Debug: Check if user_profile is valid
        if user_profile is None:
            raise HTTPException(status_code=400, detail="User profile is required")
        
        user_profile_dict = user_profile.dict()
        if user_profile_dict is None:
            raise HTTPException(status_code=400, detail="User profile data is invalid")
        
        logging.info(f"User profile keys: {list(user_profile_dict.keys())}")
        
        pdf_bytes = pdf_generator.create_proposal(combined_data, user_profile_dict)
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Bathroom_Proposal_{quote_id[:8]}.pdf"
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating proposal PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")

@api_router.post("/quotes/{quote_id}/generate-quote-summary")
async def generate_quote_summary_pdf(quote_id: str, user_profile: UserProfile):
    """Generate a simple quote summary PDF (separate from detailed scope of works)"""
    try:
        # Get the quote data
        quote = await db.quotes.find_one({"id": quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Get the original request data
        request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
        if not request_data:
            raise HTTPException(status_code=404, detail="Quote request data not found")
        
        # Generate simplified quote summary PDF
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.units import inch
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#2563eb'),
            alignment=1
        )
        story.append(Paragraph("BATHROOM RENOVATION QUOTE", title_style))
        
        # Client Info
        client_info = parse_from_mongo(request_data).get('client_info', {})
        quote_data = parse_from_mongo(quote)
        
        client_table_data = [
            ['Client Name:', client_info.get('name', 'N/A')],
            ['Email:', client_info.get('email', 'N/A')],
            ['Phone:', client_info.get('phone', 'N/A')],
            ['Address:', client_info.get('address', 'N/A')],
            ['Quote Date:', quote_data.get('created_at', '').split('T')[0] if quote_data.get('created_at') else 'N/A']
        ]
        
        client_table = Table(client_table_data, colWidths=[2*inch, 4*inch])
        client_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
        ]))
        
        story.append(client_table)
        story.append(Spacer(1, 20))
        
        # Total Cost (Prominent)
        total_cost = quote_data.get('total_cost', 0)
        total_style = ParagraphStyle(
            'TotalCost',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#16a34a'),
            alignment=1,
            spaceAfter=20
        )
        story.append(Paragraph(f"TOTAL: ${total_cost:,.2f}", total_style))
        
        # Cost Breakdown Table (if available)
        cost_breakdown = quote_data.get('cost_breakdown', [])
        if cost_breakdown:
            story.append(Paragraph("Cost Breakdown:", styles['Heading2']))
            
            breakdown_data = [['Component', 'Estimated Cost', 'Range']]
            for item in cost_breakdown:
                breakdown_data.append([
                    item.get('component', 'N/A'),
                    f"${item.get('estimated_cost', 0):,.2f}",
                    f"${item.get('cost_range_min', 0):,.2f} - ${item.get('cost_range_max', 0):,.2f}"
                ])
            
            breakdown_table = Table(breakdown_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
            breakdown_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
            ]))
            
            story.append(breakdown_table)
            story.append(Spacer(1, 20))
        
        # Footer
        footer_text = f"""
        <para align="center">
        <b>{user_profile.company_name}</b><br/>
        {user_profile.contact_name} | {user_profile.phone}<br/>
        {user_profile.email}<br/><br/>
        <i>Quote valid for 30 days. Generated by Bathroom Quote Saver.AI</i>
        </para>
        """
        story.append(Paragraph(footer_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Quote_Summary_{quote_id[:8]}.pdf"
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating quote summary PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating quote summary: {str(e)}")

@api_router.post("/quotes/{quote_id}/generate-combined-pdf")
async def generate_combined_pdf(quote_id: str, user_profile: UserProfile):
    """Generate a combined PDF with both quote summary and scope of works"""
    try:
        # Get the quote and request data
        quote = await db.quotes.find_one({"id": quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
        if not request_data:
            raise HTTPException(status_code=404, detail="Quote request data not found")
        
        # Generate the combined PDF using the existing PDF generator
        combined_data = {
            **parse_from_mongo(quote),
            **parse_from_mongo(request_data)
        }
        
        # Create a combined document with both quote summary and detailed scope
        pdf_generator = BathroomProposalPDF()
        pdf_bytes = pdf_generator.create_combined_proposal(combined_data, user_profile.dict())
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Complete_Quote_Package_{quote_id[:8]}.pdf"
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating combined PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating combined PDF: {str(e)}")

@api_router.get("/")
async def root():
    return {"message": "Bathroom Renovation Quoting API"}

@api_router.post("/quotes/{quote_id}/send-email", response_model=EmailResponse)
async def send_quote_email(quote_id: str, email_request: SendQuoteEmailRequest):
    """Send a quote via email with optional PDF attachment"""
    try:
        # Get the quote data
        quote = await db.quotes.find_one({"id": quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Get the original request data
        request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
        if not request_data:
            raise HTTPException(status_code=404, detail="Quote request data not found")
        
        # Prepare quote data for email
        quote_data = {
            "total_cost": quote.get("total_cost", 0),
            "project_name": f"{email_request.client_name} Bathroom Renovation",
            "created_at": quote.get("created_at", datetime.now().isoformat()),
            "components": {}
        }
        
        # Add component costs if breakdown is requested
        if email_request.options.include_breakdown:
            cost_breakdown = quote.get("cost_breakdown", [])
            for item in cost_breakdown:
                quote_data["components"][item["component"]] = item["estimated_cost"]
        
        # Generate PDF if requested
        pdf_content = None
        pdf_filename = None
        
        if email_request.options.include_pdf:
            try:
                # Generate PDF using the existing PDF generator
                combined_data = {
                    **parse_from_mongo(quote),
                    **parse_from_mongo(request_data)
                }
                
                # Use a default user profile for email PDFs (can be made configurable)
                default_profile = UserProfile()
                
                pdf_generator = BathroomProposalPDF()
                pdf_content = pdf_generator.create_proposal(combined_data, default_profile.dict())
                pdf_filename = f"Bathroom_Quote_{email_request.client_name.replace(' ', '_')}_{quote_id[:8]}.pdf"
                
            except Exception as pdf_error:
                logging.warning(f"PDF generation failed: {pdf_error}. Sending email without PDF.")
                # Continue without PDF if generation fails
                email_request.options.include_pdf = False
        
        # Send the email
        success = email_service.send_quote_email(
            recipient_email=email_request.recipient_email,
            client_name=email_request.client_name,
            quote_data=quote_data,
            options=email_request.options.dict(),
            pdf_content=pdf_content,
            pdf_filename=pdf_filename
        )
        
        if success:
            return EmailResponse(
                status="success",
                message=f"Quote email sent successfully to {email_request.recipient_email}"
            )
        else:
            raise EmailDeliveryError("Email delivery failed")
            
    except EmailDeliveryError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logging.error(f"Error sending quote email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending quote email: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()