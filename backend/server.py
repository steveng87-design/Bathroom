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
from datetime import datetime, timezone, timedelta
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

class PDFGenerationRequest(BaseModel):
    user_profile: UserProfile
    adjusted_costs: Optional[Dict[str, float]] = None  # Component costs adjusted by user
    adjusted_total: Optional[float] = None  # Total adjusted cost
    include_breakdown: Optional[bool] = True  # Whether to include detailed cost breakdown

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
async def generate_proposal_pdf(quote_id: str, pdf_request: PDFGenerationRequest):
    """Generate a professional scope of works PDF proposal with optional adjusted costs"""
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
        
        # Apply adjusted costs if provided
        if pdf_request.adjusted_costs and 'cost_breakdown' in combined_data:
            adjusted_breakdown = []
            for item in combined_data['cost_breakdown']:
                component_name = item.get('component', '')
                if component_name in pdf_request.adjusted_costs:
                    # Use adjusted cost
                    adjusted_item = {
                        **item,
                        'estimated_cost': pdf_request.adjusted_costs[component_name],
                        'cost_adjusted': True
                    }
                    adjusted_breakdown.append(adjusted_item)
                else:
                    # Use original cost
                    adjusted_breakdown.append({**item, 'cost_adjusted': False})
            
            combined_data['cost_breakdown'] = adjusted_breakdown
        
        # Update total cost if provided (independent of component adjustments)
        if pdf_request.adjusted_total:
            combined_data['total_cost'] = pdf_request.adjusted_total
        
        # Generate PDF
        pdf_generator = BathroomProposalPDF()
        
        user_profile_dict = pdf_request.user_profile.dict()
        include_breakdown = pdf_request.include_breakdown if pdf_request.include_breakdown is not None else True
        pdf_bytes = pdf_generator.create_proposal(combined_data, user_profile_dict, include_breakdown)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Scope_of_Works_{quote_id[:8]}.pdf"
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating proposal PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")

@api_router.post("/quotes/{quote_id}/generate-quote-summary")
async def generate_quote_summary_pdf(quote_id: str, pdf_request: PDFGenerationRequest):
    """Generate a simple quote summary PDF with optional adjusted costs"""
    try:
        # Get the quote data
        quote = await db.quotes.find_one({"id": quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Get the original request data
        request_data = await db.quote_requests.find_one({"id": quote.get("request_id")})
        if not request_data:
            raise HTTPException(status_code=404, detail="Quote request data not found")
        
        # Parse the data
        client_info = parse_from_mongo(request_data).get('client_info', {})
        quote_data = parse_from_mongo(quote)
        
        # Apply adjusted costs if provided
        final_total = quote_data.get('total_cost', 0)
        cost_breakdown = quote_data.get('cost_breakdown', [])
        
        if pdf_request.adjusted_costs and cost_breakdown:
            # Update individual component costs
            for item in cost_breakdown:
                component_name = item.get('component', '')
                if component_name in pdf_request.adjusted_costs:
                    item['estimated_cost'] = pdf_request.adjusted_costs[component_name]
        
        # Use adjusted total if provided (independent of component adjustments)
        if pdf_request.adjusted_total:
            final_total = pdf_request.adjusted_total
        
        # Generate simplified quote summary PDF
        from io import BytesIO
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
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
        
        # Total Cost (Prominent) - Use adjusted total
        total_style = ParagraphStyle(
            'TotalCost',
            parent=styles['Heading1'],
            fontSize=32,
            textColor=colors.HexColor('#16a34a'),
            alignment=1,
            spaceAfter=20
        )
        story.append(Paragraph(f"TOTAL: ${final_total:,.2f}", total_style))
        
        # Cost Breakdown Table (if available) - Use adjusted costs
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
        <b>{pdf_request.user_profile.company_name}</b><br/>
        {pdf_request.user_profile.contact_name} | {pdf_request.user_profile.phone}<br/>
        {pdf_request.user_profile.email}<br/><br/>
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

@api_router.post("/quotes/{quote_id}/learn-adjustment")
async def learn_from_cost_adjustment(quote_id: str, adjustment: CostAdjustment):
    """Learn from user's cost adjustments to improve future quotes"""
    try:
        # Store the adjustment for learning
        adjustment_data = adjustment.dict()
        adjustment_data['id'] = str(uuid.uuid4())
        
        await db.cost_adjustments.insert_one(adjustment_data)
        
        # Get user's learning profile
        learning_profile = await get_or_create_learning_profile(adjustment.user_id)
        
        # Calculate adjustment insights
        insights = await calculate_learning_insights(adjustment.user_id, adjustment.component)
        
        return {
            "status": "success", 
            "message": "Cost adjustment learned successfully",
            "insights": insights,
            "total_adjustments": learning_profile.get("total_adjustments", 0) + 1
        }
        
    except Exception as e:
        logging.error(f"Error learning from adjustment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error learning from adjustment: {str(e)}")

@api_router.get("/user/{user_id}/learning-insights")
async def get_user_learning_insights(user_id: str = "default"):
    """Get personalized learning insights for improved quote accuracy"""
    try:
        # Get all user adjustments
        adjustments = await db.cost_adjustments.find({"user_id": user_id}).to_list(length=None)
        
        if not adjustments:
            return {
                "status": "learning",
                "message": "No adjustments yet. Start adjusting quotes to build your personalized AI!",
                "insights": [],
                "readiness": "needs_more_data"
            }
        
        # Calculate insights by component
        insights = {}
        for adj in adjustments:
            component = adj['component']
            if component not in insights:
                insights[component] = {
                    'adjustments': [],
                    'original_costs': [],
                    'adjusted_costs': [],
                    'ratios': []
                }
            
            insights[component]['adjustments'].append(adj)
            insights[component]['original_costs'].append(adj['original_cost'])
            insights[component]['adjusted_costs'].append(adj['adjusted_cost'])
            insights[component]['ratios'].append(adj['adjustment_ratio'])
        
        # Generate learning insights
        learning_insights = []
        for component, data in insights.items():
            avg_ratio = sum(data['ratios']) / len(data['ratios'])
            confidence = min(len(data['adjustments']) * 0.25, 1.0)  # Confidence grows with data
            
            trend = "accurate"
            if avg_ratio > 1.1:
                trend = "ai_underestimates"
            elif avg_ratio < 0.9:
                trend = "ai_overestimates"
            
            learning_insights.append(LearningInsights(
                component=component,
                average_adjustment_ratio=avg_ratio,
                confidence_level=confidence,
                adjustment_count=len(data['adjustments']),
                cost_trend=trend
            ))
        
        # Determine readiness level
        total_adjustments = len(adjustments)
        readiness = "learning"
        if total_adjustments >= 10:
            readiness = "highly_trained"
        elif total_adjustments >= 5:
            readiness = "well_trained"
        elif total_adjustments >= 2:
            readiness = "training"
        
        return {
            "status": "success",
            "message": f"Found {total_adjustments} adjustments across {len(insights)} components",
            "insights": [insight.dict() for insight in learning_insights],
            "readiness": readiness,
            "total_adjustments": total_adjustments,
            "unique_components": len(insights)
        }
        
    except Exception as e:
        logging.error(f"Error getting learning insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting learning insights: {str(e)}")

@api_router.post("/quotes/generate-with-learning")
async def generate_quote_with_learning(request: RenovationQuoteRequest, user_id: str = "default"):
    """Generate quote with personalized AI learning applied"""
    try:
        # Get user's learning insights
        insights_response = await get_user_learning_insights(user_id)
        insights = insights_response.get("insights", [])
        
        # Generate base quote using existing function
        base_quote = await create_quote_request(request)
        
        # Apply learning adjustments if user has sufficient data
        if insights_response.get("readiness") in ["training", "well_trained", "highly_trained"]:
            # Apply personalized adjustments to the quote
            adjusted_breakdown = []
            
            for item in base_quote.cost_breakdown:
                component = item.component
                original_cost = item.estimated_cost
                
                # Find learning insight for this component
                component_insight = next((i for i in insights if i["component"] == component), None)
                
                if component_insight and component_insight["confidence_level"] > 0.3:
                    # Apply learned adjustment
                    adjustment_ratio = component_insight["average_adjustment_ratio"]
                    learned_cost = original_cost * adjustment_ratio
                    
                    adjusted_breakdown.append(CostBreakdown(
                        component=component,
                        estimated_cost=learned_cost,
                        cost_range_min=item.cost_range_min * adjustment_ratio,
                        cost_range_max=item.cost_range_max * adjustment_ratio,
                        notes=f"{item.notes} (AI-learned adjustment applied: {adjustment_ratio:.2f}x based on {component_insight['adjustment_count']} previous adjustments)"
                    ))
                else:
                    # No learning data, use original estimate
                    adjusted_breakdown.append(item)
            
            # Recalculate total
            new_total = sum(item.estimated_cost for item in adjusted_breakdown)
            
            # Create new quote with learning applied
            learned_quote = RenovationQuote(
                id=base_quote.id,
                request_id=base_quote.request_id,
                total_cost=new_total,
                cost_breakdown=adjusted_breakdown,
                ai_analysis=f"{base_quote.ai_analysis}\n\nLEARNING APPLIED: Quote personalized based on {insights_response.get('total_adjustments', 0)} previous cost adjustments.",
                confidence_level=base_quote.confidence_level,
                created_at=base_quote.created_at
            )
            
            return learned_quote
        else:
            # Not enough data for learning, return base quote
            return base_quote
        
    except Exception as e:
        logging.error(f"Error generating quote with learning: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating quote with learning: {str(e)}")

async def get_or_create_learning_profile(user_id: str):
    """Get or create user learning profile"""
    profile = await db.user_learning_profiles.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "total_adjustments": 0,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        await db.user_learning_profiles.insert_one(profile)
    return profile

async def calculate_learning_insights(user_id: str, component: str):
    """Calculate learning insights for a specific component"""
    adjustments = await db.cost_adjustments.find({
        "user_id": user_id, 
        "component": component
    }).to_list(length=None)
    
    if not adjustments:
        return {"message": "First adjustment for this component"}
    
    ratios = [adj["adjustment_ratio"] for adj in adjustments]
    avg_ratio = sum(ratios) / len(ratios)
    
    return {
        "component": component,
        "adjustment_count": len(adjustments),
        "average_ratio": avg_ratio,
        "trend": "higher" if avg_ratio > 1.1 else "lower" if avg_ratio < 0.9 else "accurate"
    }

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
# ============= CONTRACT MANAGEMENT ENDPOINTS =============

class ContractGenerationRequest(BaseModel):
    quote_id: str
    contractor_signature: Optional[str] = None  # Base64 encoded signature image
    start_date: str  # ISO format date
    completion_days: int = 30
    custom_notes: Optional[str] = None
    contractor_info: Optional[dict] = None  # User profile contractor information
    total_price_override: Optional[float] = None  # Override quote price with user input
    client_info: Optional[dict] = None  # Client information override
    custom_payment_schedule: Optional[list] = None  # Custom payment schedule from user

class ContractSigningRequest(BaseModel):
    contract_id: str
    signer_name: str
    signature_data: str  # Base64 encoded signature
    signer_type: str  # "client" or "contractor"
    ip_address: Optional[str] = None

@api_router.post("/contracts/generate")
async def generate_contract(request: ContractGenerationRequest):
    """Generate a contract from an accepted quote"""
    from contract_generator import ContractGenerator, calculate_payment_schedule
    
    try:
        # Fetch the quote
        quote = await db.quotes.find_one({"id": request.quote_id})
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Fetch contractor profile from request or use defaults
        if request.contractor_info:
            contractor_info = {
                'contractor_name': request.contractor_info.get('contractor_name', 'Bathroom Renovations Pty Ltd'),
                'contractor_abn': request.contractor_info.get('contractor_abn', ''),
                'contractor_license': request.contractor_info.get('contractor_license', ''),
                'contractor_address': request.contractor_info.get('contractor_address', ''),
                'contractor_email': request.contractor_info.get('contractor_email', ''),
                'contractor_phone': request.contractor_info.get('contractor_phone', ''),
                'contractor_contact': request.contractor_info.get('contractor_contact', ''),
                'contractor_signature': request.contractor_signature
            }
        else:
            # Use environment defaults
            contractor_info = {
                'contractor_name': os.environ.get('BUSINESS_NAME', 'Bathroom Renovations Pty Ltd'),
                'contractor_abn': os.environ.get('ABN', 'XX XXX XXX XXX'),
                'contractor_license': os.environ.get('LICENSE_NUMBER', 'XXXXX'),
                'contractor_address': os.environ.get('BUSINESS_ADDRESS', 'Sydney, NSW'),
                'contractor_email': os.environ.get('BUSINESS_EMAIL', 'contact@example.com'),
                'contractor_phone': os.environ.get('BUSINESS_PHONE', '02 XXXX XXXX'),
                'contractor_contact': 'Project Manager',
                'contractor_signature': request.contractor_signature
            }
        
        # Generate sequential contract number
        # Get the count of existing contracts and add 1
        contract_count = await db.contracts.count_documents({})
        contract_number = contract_count + 1
        contract_id = str(uuid.uuid4())  # Keep UUID for internal ID
        
        # Use override price from user input if provided, otherwise use quote total
        total_price = request.total_price_override if request.total_price_override else quote.get('total_cost', 0)
        
        # Use custom payment schedule if provided, otherwise use standard schedule
        if request.custom_payment_schedule:
            payment_schedule = []
            for stage in request.custom_payment_schedule:
                payment_schedule.append({
                    'stage': stage.get('stage', ''),
                    'description': stage.get('description', ''),
                    'percentage': stage.get('percentage', 0),
                    'amount': round(total_price * stage.get('percentage', 0) / 100, 2)
                })
        else:
            payment_schedule = calculate_payment_schedule(total_price)
        
        # Build scope of works from quote breakdown
        scope_of_works = []
        for item in quote.get('cost_breakdown', []):
            scope_of_works.append({
                'category': item.get('component', 'Work Item'),
                'description': item.get('notes', 'As specified'),
                'included': True
            })
        
        contract_data = {
            'contract_id': contract_id,
            'contract_number': contract_number,  # Sequential number for display
            **contractor_info,
            'client_name': request.client_info.get('name') if request.client_info else quote.get('client_info', {}).get('name', ''),
            'client_email': request.client_info.get('email') if request.client_info else quote.get('client_info', {}).get('email', ''),
            'client_phone': request.client_info.get('phone') if request.client_info else quote.get('client_info', {}).get('phone', ''),
            'client_address': request.client_info.get('address') if request.client_info else quote.get('client_info', {}).get('address', ''),
            'project_description': request.custom_notes if request.custom_notes else f"Complete bathroom renovation at {quote.get('client_info', {}).get('address', 'specified location')}",
            'scope_of_works': scope_of_works,
            'total_price': total_price,
            'payment_schedule': payment_schedule,
            'start_date': request.start_date,
            'completion_days': request.completion_days,
            'gst_included': True
        }
        
        # Generate PDF
        generator = ContractGenerator()
        pdf_buffer = generator.generate_contract(contract_data)
        
        # Save contract to database
        contract_record = {
            'id': contract_id,
            'contract_number': contract_number,
            'quote_id': request.quote_id,
            'client_info': request.client_info if request.client_info else quote.get('client_info'),
            'contractor_info': contractor_info,
            'total_price': total_price,
            'payment_schedule': payment_schedule,
            'start_date': request.start_date,
            'completion_days': request.completion_days,
            'scope_of_works': scope_of_works,
            'project_description': request.custom_notes,
            'status': 'generated',  # generated, sent, approved, rejected
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'contractor_signed_at': datetime.now(timezone.utc).isoformat() if request.contractor_signature else None,
            'client_signed_at': None,
            'pdf_generated': True,
            'signing_link': f"/contract/sign/{contract_id}",
            'signatures': {
                'contractor': {
                    'signed': bool(request.contractor_signature),
                    'signature_data': request.contractor_signature,
                    'signed_at': datetime.now(timezone.utc).isoformat() if request.contractor_signature else None
                },
                'client': {
                    'signed': False,
                    'signature_data': None,
                    'signed_at': None
                }
            }
        }
        
        await db.contracts.insert_one(contract_record)
        
        # Return PDF as response
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=contract_{contract_id}.pdf"
            }
        )
    
    except Exception as e:
        logger.error(f"Error generating contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/contracts/list")
async def list_contracts(status: Optional[str] = None):
    """List all contracts, optionally filtered by status"""
    query = {}
    if status:
        query['status'] = status
    
    contracts = await db.contracts.find(query).sort("created_at", -1).to_list(length=100)
    
    for contract in contracts:
        contract.pop('_id', None)
    
    return contracts

@api_router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str):
    """Get contract details"""
    contract = await db.contracts.find_one({"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Remove MongoDB _id
    contract.pop('_id', None)
    return contract

@api_router.get("/contracts/by-quote/{quote_id}")
async def get_contracts_by_quote(quote_id: str):
    """Get all contracts for a specific quote"""
    contracts = await db.contracts.find({"quote_id": quote_id}).to_list(length=None)
    
    for contract in contracts:
        contract.pop('_id', None)
    
    return contracts

@api_router.post("/contracts/{contract_id}/send-to-client")
async def send_contract_to_client(contract_id: str):
    """Send contract to client for signing"""
    try:
        contract = await db.contracts.find_one({"id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        client_email = contract.get('client_info', {}).get('email')
        client_name = contract.get('client_info', {}).get('name')
        
        if not client_email:
            raise HTTPException(status_code=400, detail="Client email not found")
        
        # Create signing link
        signing_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/contract/sign/{contract_id}"
        
        # Send email
        email_body = f"""
        <h2>Contract Ready for Your Signature</h2>
        <p>Dear {client_name},</p>
        <p>Your bathroom renovation contract is ready for review and signature.</p>
        <p><strong>Contract Details:</strong></p>
        <ul>
            <li>Total Contract Price: ${contract.get('total_price', 0):,.2f}</li>
            <li>Estimated Completion: {contract.get('completion_days', 0)} days</li>
        </ul>
        <p>Please click the link below to review and sign your contract:</p>
        <p><a href="{signing_link}" style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review & Sign Contract</a></p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        """
        
        email_service.send_email(
            to_email=client_email,
            subject=f"Contract Ready for Signature - {client_name}",
            body=email_body
        )
        
        # Update contract status
        await db.contracts.update_one(
            {"id": contract_id},
            {
                "$set": {
                    "status": "sent",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"success": True, "message": "Contract sent to client", "signing_link": signing_link}
    
    except EmailDeliveryError as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    except Exception as e:
        logger.error(f"Error sending contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/contracts/{contract_id}/sign")
async def sign_contract(contract_id: str, request: ContractSigningRequest):
    """Record a signature on the contract"""
    try:
        contract = await db.contracts.find_one({"id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        signer_type = request.signer_type.lower()
        if signer_type not in ['client', 'contractor']:
            raise HTTPException(status_code=400, detail="Invalid signer type")
        
        # Update signature
        update_data = {
            f"signatures.{signer_type}.signed": True,
            f"signatures.{signer_type}.signature_data": request.signature_data,
            f"signatures.{signer_type}.signed_at": datetime.now(timezone.utc).isoformat(),
            f"signatures.{signer_type}.signer_name": request.signer_name,
            f"signatures.{signer_type}.ip_address": request.ip_address,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Update status based on signatures
        if signer_type == 'client':
            update_data['client_signed_at'] = datetime.now(timezone.utc).isoformat()
            # Check if contractor already signed
            if contract.get('signatures', {}).get('contractor', {}).get('signed'):
                update_data['status'] = 'fully_executed'
            else:
                update_data['status'] = 'client_signed'
        
        await db.contracts.update_one(
            {"id": contract_id},
            {"$set": update_data}
        )
        
        # If client just signed, send notification to contractor
        if signer_type == 'client':
            # TODO: Send in-app notification or email to contractor
            logger.info(f"Client signed contract {contract_id}")
        
        return {
            "success": True,
            "message": f"Contract signed by {signer_type}",
            "status": update_data.get('status', contract.get('status'))
        }
    
    except Exception as e:
        logger.error(f"Error signing contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/contracts/{contract_id}/download")
async def download_contract(contract_id: str):
    """Download the contract PDF with signatures"""
    from contract_generator import ContractGenerator
    
    try:
        contract = await db.contracts.find_one({"id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Regenerate PDF with current signature status
        contract_data = {
            'contract_id': contract['id'],
            'contractor_name': contract.get('contractor_info', {}).get('contractor_name', ''),
            'contractor_abn': contract.get('contractor_info', {}).get('contractor_abn', ''),
            'contractor_license': contract.get('contractor_info', {}).get('contractor_license', ''),
            'contractor_address': contract.get('contractor_info', {}).get('contractor_address', ''),
            'contractor_email': contract.get('contractor_info', {}).get('contractor_email', ''),
            'contractor_phone': contract.get('contractor_info', {}).get('contractor_phone', ''),
            'contractor_signature': contract.get('signatures', {}).get('contractor', {}).get('signature_data'),
            'client_name': contract.get('client_info', {}).get('name', ''),
            'client_email': contract.get('client_info', {}).get('email', ''),
            'client_phone': contract.get('client_info', {}).get('phone', ''),
            'client_address': contract.get('client_info', {}).get('address', ''),
            'client_signature': contract.get('signatures', {}).get('client', {}).get('signature_data'),
            'project_description': "Complete bathroom renovation",
            'scope_of_works': contract.get('scope_of_works', []),
            'total_price': contract.get('total_price', 0),
            'payment_schedule': contract.get('payment_schedule', []),
            'start_date': contract.get('start_date'),
            'completion_days': contract.get('completion_days', 30),
            'gst_included': True
        }
        
        generator = ContractGenerator()
        pdf_buffer = generator.generate_contract(contract_data)
        
        filename = f"contract_{contract_id}_signed.pdf" if contract.get('status') == 'fully_executed' else f"contract_{contract_id}.pdf"
        
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        logger.error(f"Error downloading contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@api_router.patch("/contracts/{contract_id}/status")
async def update_contract_status(contract_id: str, status_update: dict):
    """Update contract status (approved, rejected, sent, etc.)"""
    try:
        allowed_statuses = ['generated', 'sent', 'approved', 'rejected']
        new_status = status_update.get('status')
        
        if new_status not in allowed_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {allowed_statuses}")
        
        result = await db.contracts.update_one(
            {"id": contract_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "approval_notes": status_update.get('notes', '')
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        return {"success": True, "message": f"Contract status updated to {new_status}"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating contract status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str):
    """Delete a contract"""
    try:
        result = await db.contracts.delete_one({"id": contract_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        return {"success": True, "message": "Contract deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= INVOICE MANAGEMENT ENDPOINTS =============

from invoice_generator import InvoiceGenerator, calculate_invoice_amounts, generate_invoice_number

class BankDetails(BaseModel):
    bank_name: str = "Commonwealth Bank"
    account_name: str = ""
    bsb: str = ""
    account_number: str = ""

class InvoiceLineItem(BaseModel):
    description: str
    amount: float

class InvoiceCreateRequest(BaseModel):
    """Request model for creating an invoice from a contract payment stage"""
    contract_id: str
    stage_index: int  # Index of the payment stage (0-3 typically)
    custom_description: Optional[str] = None
    custom_line_items: Optional[List[InvoiceLineItem]] = None
    due_days: int = 14
    notes: Optional[str] = None
    bank_details: Optional[Dict[str, str]] = None  # Bank details from user profile

class ManualInvoiceRequest(BaseModel):
    """Request model for creating a manual invoice"""
    client_info: Dict[str, str]
    contractor_info: Optional[Dict[str, str]] = None
    bank_details: Optional[Dict[str, str]] = None
    project_address: str
    description: str
    line_items: List[InvoiceLineItem]
    amount_includes_gst: bool = True
    due_days: int = 14
    notes: Optional[str] = None
    contract_id: Optional[str] = None
    quote_id: Optional[str] = None

class InvoiceUpdateRequest(BaseModel):
    """Request model for updating invoice status"""
    status: str  # draft, sent, paid, overdue, cancelled
    paid_amount: Optional[float] = None
    paid_date: Optional[str] = None
    payment_reference: Optional[str] = None
    notes: Optional[str] = None


async def get_next_invoice_number() -> str:
    """Get the next sequential invoice number for the current year"""
    current_year = datetime.now().year
    
    # Find or create the counter for this year
    counter = await db.invoice_counters.find_one_and_update(
        {"year": current_year},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=True
    )
    
    # Handle case where document was just created
    if counter is None or 'sequence' not in counter:
        counter = await db.invoice_counters.find_one({"year": current_year})
    
    sequence = counter.get('sequence', 1)
    return generate_invoice_number(current_year, sequence)


@api_router.post("/invoices/create-from-stage")
async def create_invoice_from_stage(request: InvoiceCreateRequest):
    """
    Create an invoice from a contract payment stage (progress claim)
    This is the main flow - click on a stage to generate invoice
    """
    try:
        # Get the contract
        contract = await db.contracts.find_one({"id": request.contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        payment_schedule = contract.get('payment_schedule', [])
        if request.stage_index < 0 or request.stage_index >= len(payment_schedule):
            raise HTTPException(status_code=400, detail="Invalid stage index")
        
        stage = payment_schedule[request.stage_index]
        
        # Check if invoice already exists for this stage
        existing_invoice = await db.invoices.find_one({
            "contract_id": request.contract_id,
            "stage_index": request.stage_index,
            "status": {"$ne": "cancelled"}
        })
        if existing_invoice:
            raise HTTPException(
                status_code=400, 
                detail=f"Invoice already exists for this stage (Invoice #{existing_invoice.get('invoice_number')})"
            )
        
        # Generate invoice number
        invoice_number = await get_next_invoice_number()
        
        # Get contractor info from contract or environment
        contractor_info = contract.get('contractor_info', {})
        
        # Get bank details from request (user profile) or fall back to environment/defaults
        if request.bank_details and any(request.bank_details.values()):
            bank_details = {
                'bank_name': request.bank_details.get('bank_name', ''),
                'account_name': request.bank_details.get('account_name', ''),
                'bsb': request.bank_details.get('bsb', ''),
                'account_number': request.bank_details.get('account_number', '')
            }
        else:
            # Fall back to environment variables or defaults
            bank_details = {
                'bank_name': os.environ.get('BANK_NAME', 'Bank Name'),
                'account_name': os.environ.get('BANK_ACCOUNT_NAME', contractor_info.get('contractor_name', '')),
                'bsb': os.environ.get('BANK_BSB', 'XXX-XXX'),
                'account_number': os.environ.get('BANK_ACCOUNT_NUMBER', 'XXXXXXXX')
            }
        
        # Build line items and calculate amounts
        if request.custom_line_items:
            # Custom line items provided (with variations)
            line_items = [item.dict() for item in request.custom_line_items]
            # Calculate totals from custom line items (amounts are subtotals excl GST)
            subtotal = sum(item.amount for item in request.custom_line_items)
            gst_amount = round(subtotal * 0.1, 2)
            total_amount = round(subtotal + gst_amount, 2)
            amounts = {
                'subtotal': subtotal,
                'gst_amount': gst_amount,
                'total_amount': total_amount
            }
        else:
            # Default: single line item for the stage
            stage_amount = stage.get('amount', 0)
            amounts = calculate_invoice_amounts(stage_amount, include_gst=True)
            stage_desc = stage.get('description', f"Stage {stage.get('stage', '')} Payment")
            line_items = [{
                'description': request.custom_description or f"{stage_desc} - {stage.get('percentage', 0)}% of contract value",
                'amount': amounts['subtotal']
            }]
        
        # Create invoice document
        invoice_date = datetime.now(timezone.utc)
        due_date = invoice_date + timedelta(days=request.due_days)
        
        invoice_data = {
            'id': str(uuid.uuid4()),
            'invoice_number': invoice_number,
            'invoice_date': invoice_date.strftime('%d/%m/%Y'),
            'due_date': due_date.strftime('%d/%m/%Y'),
            'due_date_iso': due_date.isoformat(),
            'contractor_info': contractor_info,
            'bank_details': bank_details,
            'client_info': contract.get('client_info', {}),
            'contract_id': request.contract_id,
            'contract_number': contract.get('contract_number'),
            'quote_id': contract.get('quote_id'),
            'project_address': contract.get('client_info', {}).get('address', ''),
            'payment_stage': stage.get('description', f"Stage {stage.get('stage', '')}"),
            'stage_index': request.stage_index,
            'stage_percentage': stage.get('percentage', 0),
            'line_items': line_items,
            'subtotal': amounts['subtotal'],
            'gst_amount': amounts['gst_amount'],
            'total_amount': amounts['total_amount'],
            'notes': request.notes or '',
            'status': 'draft',
            'payment_terms': request.due_days,
            'created_at': invoice_date.isoformat(),
            'updated_at': invoice_date.isoformat(),
            'sent_at': None,
            'paid_at': None,
            'paid_amount': 0,
            'payments': []
        }
        
        # Save to database
        await db.invoices.insert_one(invoice_data)
        
        # Remove MongoDB _id before returning
        invoice_data.pop('_id', None)
        
        return invoice_data
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating invoice from stage: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/invoices/create-manual")
async def create_manual_invoice(request: ManualInvoiceRequest):
    """Create a manual invoice (not tied to a specific contract stage)"""
    try:
        # Generate invoice number
        invoice_number = await get_next_invoice_number()
        
        # Calculate total from line items
        total_line_items = sum(item.amount for item in request.line_items)
        amounts = calculate_invoice_amounts(total_line_items, include_gst=request.amount_includes_gst)
        
        # Get contractor info
        contractor_info = request.contractor_info or {
            'contractor_name': os.environ.get('BUSINESS_NAME', 'Business Name'),
            'contractor_abn': os.environ.get('ABN', ''),
            'contractor_license': os.environ.get('LICENSE_NUMBER', ''),
            'contractor_address': os.environ.get('BUSINESS_ADDRESS', ''),
            'contractor_email': os.environ.get('BUSINESS_EMAIL', ''),
            'contractor_phone': os.environ.get('BUSINESS_PHONE', '')
        }
        
        # Get bank details
        bank_details = request.bank_details or {
            'bank_name': os.environ.get('BANK_NAME', 'Commonwealth Bank'),
            'account_name': os.environ.get('BANK_ACCOUNT_NAME', ''),
            'bsb': os.environ.get('BANK_BSB', ''),
            'account_number': os.environ.get('BANK_ACCOUNT_NUMBER', '')
        }
        
        # Create invoice
        invoice_date = datetime.now(timezone.utc)
        due_date = invoice_date + timedelta(days=request.due_days)
        
        invoice_data = {
            'id': str(uuid.uuid4()),
            'invoice_number': invoice_number,
            'invoice_date': invoice_date.strftime('%d/%m/%Y'),
            'due_date': due_date.strftime('%d/%m/%Y'),
            'due_date_iso': due_date.isoformat(),
            'contractor_info': contractor_info,
            'bank_details': bank_details,
            'client_info': request.client_info,
            'contract_id': request.contract_id,
            'quote_id': request.quote_id,
            'project_address': request.project_address,
            'payment_stage': request.description,
            'stage_index': None,
            'stage_percentage': None,
            'line_items': [item.dict() for item in request.line_items],
            'subtotal': amounts['subtotal'],
            'gst_amount': amounts['gst_amount'],
            'total_amount': amounts['total_amount'],
            'notes': request.notes or '',
            'status': 'draft',
            'payment_terms': request.due_days,
            'created_at': invoice_date.isoformat(),
            'updated_at': invoice_date.isoformat(),
            'sent_at': None,
            'paid_at': None,
            'paid_amount': 0,
            'payments': []
        }
        
        await db.invoices.insert_one(invoice_data)
        invoice_data.pop('_id', None)
        
        return invoice_data
        
    except Exception as e:
        logging.error(f"Error creating manual invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/invoices/list")
async def list_invoices(status: Optional[str] = None, contract_id: Optional[str] = None):
    """List all invoices, optionally filtered by status or contract"""
    try:
        query = {}
        if status:
            query['status'] = status
        if contract_id:
            query['contract_id'] = contract_id
        
        invoices = await db.invoices.find(query).sort("created_at", -1).to_list(length=100)
        
        for invoice in invoices:
            invoice.pop('_id', None)
        
        return invoices
        
    except Exception as e:
        logging.error(f"Error listing invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/invoices/next-number")
async def get_next_invoice_number_endpoint():
    """Get the next invoice number (for preview purposes)"""
    try:
        current_year = datetime.now().year
        counter = await db.invoice_counters.find_one({"year": current_year})
        next_seq = (counter.get('sequence', 0) if counter else 0) + 1
        return {"next_number": generate_invoice_number(current_year, next_seq)}
    except Exception:
        return {"next_number": generate_invoice_number(datetime.now().year, 1)}


@api_router.get("/invoices/by-contract/{contract_id}")
async def get_invoices_by_contract(contract_id: str):
    """Get all invoices for a specific contract"""
    try:
        invoices = await db.invoices.find({"contract_id": contract_id}).sort("created_at", -1).to_list(length=100)
        
        for invoice in invoices:
            invoice.pop('_id', None)
        
        return invoices
        
    except Exception as e:
        logging.error(f"Error getting invoices by contract: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: str):
    """Get a specific invoice by ID"""
    invoice = await db.invoices.find_one({"id": invoice_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.pop('_id', None)
    return invoice


@api_router.get("/invoices/{invoice_id}/pdf")
async def generate_invoice_pdf(invoice_id: str):
    """Generate and download invoice PDF"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Generate PDF
        generator = InvoiceGenerator()
        pdf_buffer = generator.generate_invoice(invoice)
        
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Invoice_{invoice.get('invoice_number', 'INV')}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error generating invoice PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, request: InvoiceUpdateRequest):
    """Update invoice status (mark as sent, paid, etc.)"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        update_data = {
            "status": request.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if request.status == 'sent' and not invoice.get('sent_at'):
            update_data['sent_at'] = datetime.now(timezone.utc).isoformat()
        
        if request.status == 'paid':
            update_data['paid_at'] = request.paid_date or datetime.now(timezone.utc).isoformat()
            update_data['paid_amount'] = request.paid_amount or invoice.get('total_amount', 0)
            
            if request.payment_reference:
                payment_record = {
                    'amount': request.paid_amount or invoice.get('total_amount', 0),
                    'date': request.paid_date or datetime.now(timezone.utc).isoformat(),
                    'reference': request.payment_reference,
                    'notes': request.notes
                }
                update_data['payments'] = invoice.get('payments', []) + [payment_record]
        
        if request.notes:
            update_data['notes'] = request.notes
        
        await db.invoices.update_one(
            {"id": invoice_id},
            {"$set": update_data}
        )
        
        # Return updated invoice
        updated_invoice = await db.invoices.find_one({"id": invoice_id})
        updated_invoice.pop('_id', None)
        
        return updated_invoice
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating invoice status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/invoices/{invoice_id}/record-payment")
async def record_partial_payment(invoice_id: str, amount: float, reference: Optional[str] = None, notes: Optional[str] = None):
    """Record a partial payment against an invoice"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        current_paid = invoice.get('paid_amount', 0)
        total_amount = invoice.get('total_amount', 0)
        new_paid_total = current_paid + amount
        
        # Create payment record
        payment_record = {
            'id': str(uuid.uuid4()),
            'amount': amount,
            'date': datetime.now(timezone.utc).isoformat(),
            'reference': reference,
            'notes': notes
        }
        
        # Update status based on payment
        new_status = invoice.get('status', 'draft')
        if new_paid_total >= total_amount:
            new_status = 'paid'
        elif new_paid_total > 0:
            new_status = 'partial'
        
        update_data = {
            'paid_amount': new_paid_total,
            'status': new_status,
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'payments': invoice.get('payments', []) + [payment_record]
        }
        
        if new_status == 'paid':
            update_data['paid_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.invoices.update_one(
            {"id": invoice_id},
            {"$set": update_data}
        )
        
        updated_invoice = await db.invoices.find_one({"id": invoice_id})
        updated_invoice.pop('_id', None)
        
        return {
            "success": True,
            "message": f"Payment of ${amount:,.2f} recorded",
            "invoice": updated_invoice
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error recording payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/invoices/{invoice_id}/send")
async def send_invoice_email(invoice_id: str):
    """Send invoice to client via email"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        client_email = invoice.get('client_info', {}).get('email')
        client_name = invoice.get('client_info', {}).get('name', 'Client')
        
        if not client_email:
            raise HTTPException(status_code=400, detail="Client email not found")
        
        # Generate PDF
        generator = InvoiceGenerator()
        pdf_buffer = generator.generate_invoice(invoice)
        pdf_content = pdf_buffer.getvalue()
        
        # Prepare email content
        invoice_number = invoice.get('invoice_number', 'INV')
        total_amount = invoice.get('total_amount', 0)
        due_date = invoice.get('due_date', '')
        contractor_name = invoice.get('contractor_info', {}).get('contractor_name', 'Your Contractor')
        
        email_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e40af;">Tax Invoice {invoice_number}</h2>
                
                <p>Dear {client_name},</p>
                
                <p>Please find attached your tax invoice for bathroom renovation works.</p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Invoice Number:</strong> {invoice_number}</p>
                    <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${total_amount:,.2f}</p>
                    <p style="margin: 5px 0;"><strong>Due Date:</strong> {due_date}</p>
                </div>
                
                <p>Payment details are included in the attached invoice. Please use the invoice number as your payment reference.</p>
                
                <p>If you have any questions regarding this invoice, please do not hesitate to contact us.</p>
                
                <p>Kind regards,<br/>
                <strong>{contractor_name}</strong></p>
            </div>
        </body>
        </html>
        """
        
        # Send email with PDF attachment
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
        import base64
        
        api_key = os.getenv('SENDGRID_API_KEY')
        sender_email = os.getenv('SENDER_EMAIL')
        
        if not api_key or not sender_email:
            # If email not configured, just update status and return success
            await db.invoices.update_one(
                {"id": invoice_id},
                {"$set": {
                    "status": "sent",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            return {
                "success": True,
                "message": "Invoice marked as sent (email service not configured)",
                "pdf_generated": True
            }
        
        message = Mail(
            from_email=sender_email,
            to_emails=client_email,
            subject=f"Tax Invoice {invoice_number} - {contractor_name}",
            html_content=email_body
        )
        
        # Add PDF attachment
        encoded_pdf = base64.b64encode(pdf_content).decode()
        attachment = Attachment(
            FileContent(encoded_pdf),
            FileName(f"Invoice_{invoice_number}.pdf"),
            FileType("application/pdf"),
            Disposition("attachment")
        )
        message.attachment = attachment
        
        # Send email
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        if response.status_code == 202:
            # Update invoice status
            await db.invoices.update_one(
                {"id": invoice_id},
                {"$set": {
                    "status": "sent",
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            return {
                "success": True,
                "message": f"Invoice sent successfully to {client_email}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error sending invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    """Delete an invoice (only if draft or cancelled)"""
    try:
        invoice = await db.invoices.find_one({"id": invoice_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        if invoice.get('status') not in ['draft', 'cancelled']:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete invoice that has been sent or paid. Cancel it first."
            )
        
        await db.invoices.delete_one({"id": invoice_id})
        
        return {"success": True, "message": "Invoice deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/contracts/{contract_id}/invoice-status")
async def get_contract_invoice_status(contract_id: str):
    """Get invoice status for each payment stage of a contract"""
    try:
        contract = await db.contracts.find_one({"id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        payment_schedule = contract.get('payment_schedule', [])
        invoices = await db.invoices.find({
            "contract_id": contract_id,
            "status": {"$ne": "cancelled"}
        }).to_list(length=100)
        
        # Map invoices to stages
        invoice_map = {}
        for inv in invoices:
            if inv.get('stage_index') is not None:
                invoice_map[inv['stage_index']] = {
                    'invoice_id': inv['id'],
                    'invoice_number': inv.get('invoice_number'),
                    'status': inv.get('status'),
                    'total_amount': inv.get('total_amount'),
                    'paid_amount': inv.get('paid_amount', 0),
                    'sent_at': inv.get('sent_at'),
                    'paid_at': inv.get('paid_at')
                }
        
        # Build response with stage info
        stages = []
        for i, stage in enumerate(payment_schedule):
            stage_info = {
                'stage_index': i,
                'stage': stage.get('stage'),
                'description': stage.get('description'),
                'percentage': stage.get('percentage'),
                'amount': stage.get('amount'),
                'invoice': invoice_map.get(i)
            }
            stages.append(stage_info)
        
        return {
            'contract_id': contract_id,
            'contract_number': contract.get('contract_number'),
            'total_price': contract.get('total_price'),
            'stages': stages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting contract invoice status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()