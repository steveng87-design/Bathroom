from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

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

class MaterialSupplier(BaseModel):
    name: str
    address: str
    phone: str
    specialties: List[str]
    estimated_distance: str

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
        
        prompt = f"""
        Analyze this bathroom renovation project and provide a detailed cost estimate using the specific sub-tasks selected:
        
        Room Details:
        - Dimensions: {request.room_measurements.length}m x {request.room_measurements.width}m x {request.room_measurements.height}m
        - Floor Area: {request.room_measurements.square_meters:.2f} square meters
        - Volume: {request.room_measurements.cubic_meters:.2f} cubic meters
        
        Selected Main Components: {', '.join(components_list) if components_list else 'None selected'}
        {detailed_task_text}
        
        Client Location: {request.client_info.address}
        Additional Notes: {request.additional_notes or 'None'}
        
        IMPORTANT: Use the detailed sub-tasks to provide more accurate pricing. Each selected sub-task should influence the cost estimate for that component. Consider:
        - Complexity of selected sub-tasks
        - Labor time for specific tasks
        - Material requirements for each sub-task
        - Regional pricing variations
        
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

@api_router.get("/")
async def root():
    return {"message": "Bathroom Renovation Quoting API"}

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