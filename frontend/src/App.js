import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { AlertCircle, Calculator, MapPin, Phone, Mail, Ruler, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RenovationQuotingApp = () => {
  const [formData, setFormData] = useState({
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    roomMeasurements: {
      length: '',
      width: '',
      height: ''
    },
    components: {
      demolition: {
        enabled: false,
        subtasks: {
          removal_internal_ware: false,
          removal_wall_linings: false,
          removal_ceiling_linings: false,
          removal_ground_tiles_screed: false,
          removal_old_substrate: false,
          supply_skip_bin: false,
          asbestos_removal: false
        }
      },
      framing: {
        enabled: false,
        subtasks: {
          internal_wall_rectification: false,
          build_niches: false,
          recessed_mirror_cabinet: false,
          swing_door_materials: false,
          cavity_sliding_unit: false,
          new_window_framing: false,
          subfloor_replacement: false,
          additional_costs_allowance: false
        }
      },
      plumbing_rough_in: {
        enabled: false,
        subtasks: {
          make_good_existing_feeds: false,
          new_inlet_feed_toilet: false,
          water_feeds_quantity: false,
          bath_inwall_mixer_outlet: false,
          basin_mixer_inwall: false,
          shower_outlet: false,
          floor_waste: false,
          new_stack_work: false,
          concrete_cutting_slab: false,
          rain_head_shower: false,
          inwall_cistern: false,
          wall_hung_toilet: false,
          vanity_install: false
        }
      },
      electrical_rough_in: {
        enabled: false,
        subtasks: {
          make_safe_old_wiring: false,
          four_in_one_combo: false,
          power_points_quantity: false,
          led_strip_lighting: false,
          wall_lights: false,
          downlight: false,
          separate_extraction_fan: false,
          underfloor_heating: false,
          lighting_switching: false
        }
      },
      plastering: {
        enabled: false,
        subtasks: {
          supply_install_ceiling_sheets: false,
          supply_install_wall_sheets: false,
          supply_compounds_finishing: false,
          top_coat_ceilings: false,
          supply_install_cornice: false
        }
      },
      waterproofing: {
        enabled: false,
        subtasks: {
          shower_waterproofing: false,
          floor_waterproofing: false,
          wall_waterproofing: false,
          membrane_application: false,
          corner_sealing: false,
          penetration_sealing: false,
          compliance_certification: false
        }
      },
      tiling: {
        enabled: false,
        subtasks: {
          supply_install_sand_cement_bed: false,
          supply_install_floor_tiles: false,
          supply_install_wall_tiles: false,
          supply_install_shower_niche: false,
          supply_install_bath_niche: false,
          supply_install_floor_ceiling: false,
          supply_install_half_height: false,
          supply_install_nib_walls: false,
          supply_grout_silicone: false,
          supply_install_shower_hob: false,
          supply_install_bath_hob: false,
          supply_install_feature_wall: false
        }
      },
      shower_screens: {
        enabled: false,
        subtasks: {
          fixed_panel_install: false,
          frameless_shower_enclosure: false,
          semi_frameless_shower_enclosure: false,
          shower_curtain: false
        }
      },
      pc_items_tile_supply: {
        enabled: false,
        subtasks: {
          pc_items_vanity_basin: false,
          pc_items_toilet_cistern: false,
          pc_items_shower_screen: false,
          pc_items_tapware: false,
          pc_items_lighting: false,
          pc_items_mirror_cabinet: false,
          pc_items_accessories: false,
          tiles_supply_coordination: false
        }
      },
      fit_off: {
        enabled: false,
        subtasks: {
          accessories_install: false,
          site_clean: false,
          builders_clean: false,
          painting: false
        }
      }
    },
    additionalNotes: ''
  });

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState({});
  const [adjustmentMode, setAdjustmentMode] = useState(false);
  const [adjustedCosts, setAdjustedCosts] = useState({});
  const [expandedComponents, setExpandedComponents] = useState({});
  const [taskOptions, setTaskOptions] = useState({
    // Demolition options
    skip_bin_size: '6 meter bin',
    // Framing options
    build_niches_quantity: 1,
    swing_door_size: '720mm',
    cavity_sliding_size: '720mm',
    minor_costs_amount: 0,
    // Plumbing options
    water_feeds_type: 'single',
    // Electrical options
    power_points_quantity: 1,
    // Plastering options
    plasterboard_grade: 'standard',
    cornice_type: 'standard',
    // Tiling options
    floor_tile_grade: 'standard_ceramic',
    wall_tile_grade: 'standard_ceramic',
    tile_size: '300x300mm',
    feature_tile_grade: 'premium',
    // PC Items options
    vanity_grade: 'standard',
    toilet_grade: 'standard', 
    shower_screen_grade: 'standard',
    tapware_grade: 'standard',
    lighting_grade: 'standard',
    mirror_grade: 'standard',
    tiles_supply_grade: 'standard'
  });

  const componentLabels = {
    demolition: 'Demolition',
    framing: 'Framing',
    plumbing_rough_in: 'Plumbing Rough In',
    electrical_rough_in: 'Electrical Rough In',
    plastering: 'Plastering',
    waterproofing: 'Waterproofing',
    tiling: 'Tiling',
    shower_screens: 'Shower Screens',
    pc_items_tile_supply: 'PC Items & Tile Supply',
    fit_off: 'Fit Off'
  };

  const subtaskLabels = {
    demolition: {
      removal_internal_ware: 'Removal of All Internal Bathroom Ware',
      removal_wall_linings: 'Removal of All Wall Linings',
      removal_ceiling_linings: 'Removal of All Ceiling Linings',
      removal_ground_tiles_screed: 'Removal of All Ground Tiles Including Old Screed',
      removal_old_substrate: 'Removal of Old Substrate',
      supply_skip_bin: 'Supply Skip Bin (Trade Waste Removal)',
      asbestos_removal: 'Asbestos Removal (if required)'
    },
    framing: {
      internal_wall_rectification: 'Internal Wall Frame Rectification',
      build_niches: 'Build Niches (Soap Dish) - Specify Quantity',
      recessed_mirror_cabinet: 'Building of Recessed Mirror Cabinet',
      swing_door_materials: 'Build New Swing Door & Supply All Materials (Door Jamb, Hinges, Door) - Sizes: 720mm/770mm/820mm',
      cavity_sliding_unit: 'Cavity Sliding Unit with Nib Wall - Sizes: 720mm/770mm/820mm',
      new_window_framing: 'New Window Framing (Including Structural Framing and/or Exterior Cladding/Brick Work Rectification)',
      subfloor_replacement: 'Replacement of Subfloor to Compressed Fibro or Ceramic Tile Underlay',
      additional_costs_allowance: 'Additional Costs Allowance (User Specified)'
    },
    plumbing_rough_in: {
      make_good_existing_feeds: 'Make Good on All Existing Water Feeds',
      new_inlet_feed_toilet: 'New Inlet Feed for Toilet',
      water_feeds_quantity: 'Water Feeds - Specify Quantity (Single/Double Shower Mixers)',
      bath_inwall_mixer_outlet: 'Bath In-Wall Mixer and Outlet',
      basin_mixer_inwall: 'Basin Mixer In Wall',
      shower_outlet: 'Shower Outlet',
      floor_waste: 'Floor Waste',
      new_stack_work: 'New Stack Work',
      concrete_cutting_slab: 'Concrete Quick Cutting for Slab on Ground',
      rain_head_shower: 'Rain Head Shower',
      inwall_cistern: 'In Wall Cistern',
      wall_hung_toilet: 'Wall Hung Toilet',
      vanity_install: 'Vanity Install'
    },
    electrical_rough_in: {
      make_safe_old_wiring: 'Make Safe on All Old Wiring',
      four_in_one_combo: '4 in 1 (Heat, Light and Fan Combo in Ceiling)',
      power_points_quantity: 'Power Points - Specify Quantity',
      led_strip_lighting: 'LED Strip Lighting',
      wall_lights: 'Wall Lights',
      downlight: 'Downlight',
      separate_extraction_fan: 'Separate Extraction Fan',
      underfloor_heating: 'Underfloor Heating',
      lighting_switching: 'Lighting Switching'
    },
    plastering: {
      supply_install_ceiling_sheets: 'Supply & Install New Ceiling Sheets (including screws, fixings)',
      supply_install_wall_sheets: 'Supply & Install All Wall Sheets (including screws, fixings)',
      supply_compounds_finishing: 'Supply & Apply Compounds, Jointing & Finishing Materials',
      top_coat_ceilings: 'Top Coat Ceilings (including primer, paint materials)',
      supply_install_cornice: 'Supply & Install Cornice (including adhesives, fixings)'
    },
    waterproofing: {
      shower_waterproofing: 'Shower Recess Waterproofing',
      floor_waterproofing: 'Full Floor Waterproofing',
      wall_waterproofing: 'Wet Area Wall Waterproofing',
      membrane_application: 'Waterproof Membrane Application',
      corner_sealing: 'Internal Corner Sealing',
      penetration_sealing: 'Pipe Penetration Sealing',
      compliance_certification: 'Waterproofing Certification'
    },
    tiling: {
      supply_install_sand_cement_bed: 'Supply & Install Sand and Cement Bed (including materials, mesh)',
      supply_install_floor_tiles: 'Supply & Install Floor Tiles (including tiles, adhesive, spacers, trim)',
      supply_install_wall_tiles: 'Supply & Install Wall Tiles (including tiles, adhesive, spacers, trim)',
      supply_install_shower_niche: 'Supply & Install Shower Niche (including tiles, waterproof niche, trim)',
      supply_install_bath_niche: 'Supply & Install Bath Niche (including tiles, niche box, trim)',
      supply_install_floor_ceiling: 'Supply & Install Floor to Ceiling Tiling (including tiles, adhesive, trim)',
      supply_install_half_height: 'Supply & Install Half Height Wall Tiles (including tiles, adhesive, trim)',
      supply_install_nib_walls: 'Supply & Install Nib Wall Tilings (including tiles, adhesive, corner trim)',
      supply_grout_silicone: 'Supply & Apply Grout and Silicone (including grout, silicone, sealers)',
      supply_install_shower_hob: 'Supply & Install Shower Hob Tiling (including tiles, waterproof membrane)',
      supply_install_bath_hob: 'Supply & Install Bath Hob Tiling (including tiles, waterproof membrane)',  
      supply_install_feature_wall: 'Supply & Install Feature Wall (including premium tiles, adhesive, trim)'
    },
    shower_screens: {
      fixed_panel_install: 'Fixed Panel Install',
      frameless_shower_enclosure: 'Frameless Shower Enclosure',
      semi_frameless_shower_enclosure: 'Semi Frameless Shower Enclosure',
      shower_curtain: 'Shower Curtain'
    },
    pc_items_tile_supply: {
      pc_items_vanity_basin: 'PC Items - Supply Vanity & Basin',
      pc_items_toilet_cistern: 'PC Items - Supply Toilet & Cistern',
      pc_items_shower_screen: 'PC Items - Supply Shower Screen',
      pc_items_tapware: 'PC Items - Supply Tapware (Mixers, Taps)',
      pc_items_lighting: 'PC Items - Supply Light Fixtures',
      pc_items_mirror_cabinet: 'PC Items - Supply Mirror & Cabinet',
      pc_items_accessories: 'PC Items - Supply Towel Rails & Accessories',
      tiles_supply_coordination: 'Tiles Supply & Coordination (Builder Markup + Delivery)'
    },
    fit_off: {
      accessories_install: 'Accessories Install',
      site_clean: 'Site Clean',
      builders_clean: 'Builders Clean',
      painting: 'Painting'
    }
  };

  const calculateSquareMeters = () => {
    const { length, width } = formData.roomMeasurements;
    if (length && width) {
      // Convert from millimetres to meters first, then calculate square meters
      const lengthInMeters = parseFloat(length) / 1000;
      const widthInMeters = parseFloat(width) / 1000;
      return (lengthInMeters * widthInMeters).toFixed(2);
    }
    return '0';
  };

  const calculateWallArea = () => {
    const { length, width, height } = formData.roomMeasurements;
    if (length && width && height) {
      // Convert from millimetres to meters first
      const lengthInMeters = parseFloat(length) / 1000;
      const widthInMeters = parseFloat(width) / 1000;
      const heightInMeters = parseFloat(height) / 1000;
      
      // Calculate wall area: (2 × length × height) + (2 × width × height)
      const wallArea = (2 * lengthInMeters * heightInMeters) + (2 * widthInMeters * heightInMeters);
      return wallArea.toFixed(2);
    }
    return '0';
  };

  const handleInputChange = (section, field, value, isCheckbox = false) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: isCheckbox ? value : value
      }
    }));
  };

  const handleComponentToggle = (component, enabled) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          enabled: enabled,
          // If disabling main component, disable all subtasks
          subtasks: enabled ? prev.components[component].subtasks : 
            Object.keys(prev.components[component].subtasks).reduce((acc, key) => {
              acc[key] = false;
              return acc;
            }, {})
        }
      }
    }));
  };

  const handleSubtaskToggle = (component, subtask, enabled) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          subtasks: {
            ...prev.components[component].subtasks,
            [subtask]: enabled
          }
        }
      }
    }));
  };

  const getSelectedSubtasks = (component) => {
    return Object.entries(formData.components[component].subtasks)
      .filter(([key, value]) => value)
      .map(([key, value]) => key);
  };

  const handleTaskOptionChange = (optionKey, value) => {
    setTaskOptions(prev => ({
      ...prev,
      [optionKey]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform the new detailed components structure for backend compatibility
      const transformedComponents = {};
      Object.entries(formData.components).forEach(([key, component]) => {
        transformedComponents[key] = component.enabled;
      });

      const requestData = {
        client_info: formData.clientInfo,
        room_measurements: {
          length: parseFloat(formData.roomMeasurements.length) / 1000, // Convert mm to meters
          width: parseFloat(formData.roomMeasurements.width) / 1000,   // Convert mm to meters  
          height: parseFloat(formData.roomMeasurements.height) / 1000  // Convert mm to meters
        },
        components: transformedComponents,
        detailed_components: formData.components, // Send detailed structure for enhanced AI analysis
        task_options: taskOptions, // Include quantity/size selections
        additional_notes: formData.additionalNotes
      };

      const response = await axios.post(`${API}/quotes/request`, requestData);
      setQuote(response.data);
      toast.success('Quote generated successfully!');
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async (component) => {
    try {
      const response = await axios.get(`${API}/suppliers/${component}`);
      setSelectedSuppliers(prev => ({
        ...prev,
        [component]: response.data.suppliers
      }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
    }
  };

  const handleAdjustCost = async (componentIndex, newCost) => {
    setAdjustedCosts(prev => ({
      ...prev,
      [componentIndex]: newCost
    }));
  };

  const submitAdjustments = async () => {
    if (!quote) return;

    try {
      const totalAdjusted = Object.values(adjustedCosts).reduce((sum, cost) => sum + parseFloat(cost), 0);
      
      const adjustmentData = {
        original_cost: quote.total_cost,
        adjusted_cost: totalAdjusted,
        adjustment_reason: 'Manual adjustment based on project specifics',
        component_adjustments: adjustedCosts
      };

      await axios.post(`${API}/quotes/${quote.id}/adjust`, adjustmentData);
      
      setQuote(prev => ({
        ...prev,
        total_cost: totalAdjusted
      }));
      
      setAdjustmentMode(false);
      setAdjustedCosts({});
      toast.success('Quote adjusted successfully! The system has learned from your changes.');
    } catch (error) {
      console.error('Error adjusting quote:', error);
      toast.error('Failed to adjust quote');
    }
  };

  const SupplierDialog = ({ component, componentLabel }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchSuppliers(component)}
          className="ml-2"
        >
          <MapPin className="w-4 h-4 mr-1" />
          Suppliers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {componentLabel} Suppliers
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {selectedSuppliers[component]?.map((supplier, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {supplier.address} ({supplier.estimated_distance})
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    {supplier.phone}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplier.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Professional Header with Premium Branding */}
        <div className="text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-3xl opacity-10 rounded-full"></div>
            <div className="relative">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl mr-4">
                  <Calculator className="w-12 h-12 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bathroom Quote Saver.AI
                  </h1>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-sm font-semibold">
                      AI-Powered Precision
                    </Badge>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold ml-2">
                      Learning Algorithm
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-600 font-medium">
                Revolutionary AI-driven bathroom renovation cost estimates that learn from your business
              </p>
              <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  71 Professional Tasks
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  10 Specialized Categories  
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Personalized Learning AI
                </div>
              </div>
            </div>
          </div>
        </div>

        {!quote ? (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12"></div>
              <CardTitle className="text-3xl font-bold relative z-10 flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Mail className="w-6 h-6" />
                </div>
                Professional Project Details
              </CardTitle>
              <p className="text-blue-100 text-sm relative z-10 mt-2">Complete the form below for your personalized AI-generated quote</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Client Information */}
                <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      Client Information
                    </h3>
                    <Badge variant="outline" className="bg-white/80">Required</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientInfo.name}
                        onChange={(e) => handleInputChange('clientInfo', 'name', e.target.value)}
                        placeholder="John Smith"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientInfo.email}
                        onChange={(e) => handleInputChange('clientInfo', 'email', e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone *</Label>
                      <Input
                        id="clientPhone"
                        value={formData.clientInfo.phone}
                        onChange={(e) => handleInputChange('clientInfo', 'phone', e.target.value)}
                        placeholder="02-1234-5678"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectAddress">Project Address *</Label>
                      <Input
                        id="projectAddress"
                        value={formData.clientInfo.address}
                        onChange={(e) => handleInputChange('clientInfo', 'address', e.target.value)}
                        placeholder="123 Main St, Sydney NSW 2000"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Room Measurements */}
                <div className="space-y-6 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-lg mr-3">
                        <Ruler className="w-5 h-5 text-white" />
                      </div>
                      Precision Measurements
                    </h3>
                    <Badge variant="outline" className="bg-white/80">Millimeter Accuracy</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (millimetres) *</Label>
                      <Input
                        id="length"
                        type="number"
                        step="1"
                        value={formData.roomMeasurements.length}
                        onChange={(e) => handleInputChange('roomMeasurements', 'length', e.target.value)}
                        placeholder="3500"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width (millimetres) *</Label>
                      <Input
                        id="width"
                        type="number"
                        step="1"
                        value={formData.roomMeasurements.width}
                        onChange={(e) => handleInputChange('roomMeasurements', 'width', e.target.value)}
                        placeholder="2500"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (millimetres) *</Label>
                      <Input
                        id="height"
                        type="number"
                        step="1"
                        value={formData.roomMeasurements.height}
                        onChange={(e) => handleInputChange('roomMeasurements', 'height', e.target.value)}
                        placeholder="2400"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-6 rounded-xl border border-emerald-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                          <p className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Floor Area</p>
                          <p className="text-3xl font-bold text-emerald-800">{calculateSquareMeters()}</p>
                          <p className="text-emerald-600 text-sm">Square Meters</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                          <p className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Wall Area</p>
                          <p className="text-3xl font-bold text-emerald-800">{calculateWallArea()}</p>
                          <p className="text-emerald-600 text-sm">Square Meters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Renovation Components - Revolutionary Expandable System */}
                <div className="space-y-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg mr-3">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      AI-Powered Component Selection
                    </h3>
                    <div className="flex gap-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        71 Professional Tasks
                      </Badge>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Revolutionary Accuracy
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white/80 p-4 rounded-xl border border-purple-200">
                    <p className="text-gray-700 text-center font-medium">
                      🎯 Select main components, then expand for detailed sub-tasks to achieve ground-breaking quote accuracy
                    </p>
                    <p className="text-gray-600 text-sm text-center mt-2">
                      Our AI learns from your adjustments to provide increasingly personalized estimates
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(componentLabels).map(([key, label]) => (
                      <div key={key} className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-gray-50">
                        {/* Main Component Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={key}
                              checked={formData.components[key].enabled}
                              onCheckedChange={(checked) => handleComponentToggle(key, checked)}
                              className="h-5 w-5"
                            />
                            <Label htmlFor={key} className="text-lg font-semibold cursor-pointer text-gray-800">
                              {label}
                            </Label>
                            {formData.components[key].enabled && (
                              <Badge variant="outline" className="text-xs">
                                {getSelectedSubtasks(key).length} tasks selected
                              </Badge>
                            )}
                          </div>
                          
                          {formData.components[key].enabled && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExpandedComponents(prev => ({
                                  ...prev,
                                  [key]: !prev[key]
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${expandedComponents[key] ? 'rotate-180' : ''}`} />
                              {expandedComponents[key] ? 'Collapse' : 'Expand'} Details
                            </Button>
                          )}
                        </div>

                        {/* Expandable Subtasks */}
                        {formData.components[key].enabled && expandedComponents[key] && (
                          <div className="mt-4 ml-8 space-y-3 border-l-2 border-blue-200 pl-4 animate-in slide-in-from-top-1 duration-300">
                            <div className="text-sm font-medium text-blue-800 mb-3">
                              Select specific {label.toLowerCase()} tasks:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(subtaskLabels[key]).map(([subtaskKey, subtaskLabel]) => (
                                <div key={subtaskKey} className="space-y-2">
                                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                    <Checkbox
                                      id={`${key}-${subtaskKey}`}
                                      checked={formData.components[key].subtasks[subtaskKey]}
                                      onCheckedChange={(checked) => handleSubtaskToggle(key, subtaskKey, checked)}
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor={`${key}-${subtaskKey}`}
                                      className="text-sm cursor-pointer text-gray-700 hover:text-gray-900"
                                    >
                                      {subtaskLabel}
                                    </Label>
                                  </div>
                                  
                                  {/* Interactive Options for Specific Tasks */}
                                  {formData.components[key].subtasks[subtaskKey] && (
                                    <div className="ml-6 space-y-2">
                                      
                                      {/* Demolition - Skip Bin Size */}
                                      {subtaskKey === 'supply_skip_bin' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Bin Size:</Label>
                                          <Select
                                            value={taskOptions.skip_bin_size}
                                            onValueChange={(value) => handleTaskOptionChange('skip_bin_size', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="4 meter bin">4 Meter Bin</SelectItem>
                                              <SelectItem value="5 meter bin">5 Meter Bin</SelectItem>
                                              <SelectItem value="6 meter bin">6 Meter Bin</SelectItem>
                                              <SelectItem value="9 meter bin">9 Meter Bin</SelectItem>
                                              <SelectItem value="12 meter bin">12 Meter Bin</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Framing - Build Niches Quantity */}
                                      {subtaskKey === 'build_niches' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Quantity:</Label>
                                          <Select
                                            value={taskOptions.build_niches_quantity.toString()}
                                            onValueChange={(value) => handleTaskOptionChange('build_niches_quantity', parseInt(value))}
                                          >
                                            <SelectTrigger className="h-8 w-20">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[1,2,3,4,5,6].map(num => (
                                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Framing - Swing Door Size */}
                                      {subtaskKey === 'swing_door_materials' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Door Size:</Label>
                                          <Select
                                            value={taskOptions.swing_door_size}
                                            onValueChange={(value) => handleTaskOptionChange('swing_door_size', value)}
                                          >
                                            <SelectTrigger className="h-8 w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="720mm">720mm</SelectItem>
                                              <SelectItem value="770mm">770mm</SelectItem>
                                              <SelectItem value="820mm">820mm</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Framing - Cavity Sliding Size */}
                                      {subtaskKey === 'cavity_sliding_unit' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Unit Size:</Label>
                                          <Select
                                            value={taskOptions.cavity_sliding_size}
                                            onValueChange={(value) => handleTaskOptionChange('cavity_sliding_size', value)}
                                          >
                                            <SelectTrigger className="h-8 w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="720mm">720mm</SelectItem>
                                              <SelectItem value="770mm">770mm</SelectItem>
                                              <SelectItem value="820mm">820mm</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Framing - Additional Costs */}
                                      {subtaskKey === 'additional_costs_allowance' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Amount: $</Label>
                                          <Input
                                            type="number"
                                            value={taskOptions.minor_costs_amount}
                                            onChange={(e) => handleTaskOptionChange('minor_costs_amount', parseFloat(e.target.value) || 0)}
                                            className="h-8 w-24"
                                            placeholder="0"
                                          />
                                        </div>
                                      )}

                                      {/* Plumbing - Water Feeds Type */}
                                      {subtaskKey === 'water_feeds_quantity' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={taskOptions.water_feeds_type}
                                            onValueChange={(value) => handleTaskOptionChange('water_feeds_type', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="single">Single Mixer</SelectItem>
                                              <SelectItem value="double">Double Mixer</SelectItem>
                                              <SelectItem value="triple">Triple Mixer</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Electrical - Power Points Quantity */}
                                      {subtaskKey === 'power_points_quantity' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Quantity:</Label>
                                          <Select
                                            value={taskOptions.power_points_quantity.toString()}
                                            onValueChange={(value) => handleTaskOptionChange('power_points_quantity', parseInt(value))}
                                          >
                                            <SelectTrigger className="h-8 w-20">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[1,2,3,4,5,6,7,8].map(num => (
                                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Plastering - Plasterboard Grade */}
                                      {(subtaskKey === 'supply_install_ceiling_sheets' || subtaskKey === 'supply_install_wall_sheets') && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.plasterboard_grade}
                                            onValueChange={(value) => handleTaskOptionChange('plasterboard_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="standard">Standard Grade</SelectItem>
                                              <SelectItem value="moisture_resistant">Moisture Resistant</SelectItem>
                                              <SelectItem value="fire_rated">Fire Rated</SelectItem>
                                              <SelectItem value="acoustic">Acoustic Grade</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Plastering - Cornice Type */}
                                      {subtaskKey === 'supply_install_cornice' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={taskOptions.cornice_type}
                                            onValueChange={(value) => handleTaskOptionChange('cornice_type', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="standard">Standard 75mm</SelectItem>
                                              <SelectItem value="premium">Premium 90mm</SelectItem>
                                              <SelectItem value="decorative">Decorative 110mm</SelectItem>
                                              <SelectItem value="shadowline">Shadow Line</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Tiling - Floor Tile Grade */}
                                      {subtaskKey === 'supply_install_floor_tiles' && (
                                        <div className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Label className="text-xs text-gray-600">Grade:</Label>
                                            <Select
                                              value={taskOptions.floor_tile_grade}
                                              onValueChange={(value) => handleTaskOptionChange('floor_tile_grade', value)}
                                            >
                                              <SelectTrigger className="h-8 w-36">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="budget_ceramic">Budget Ceramic</SelectItem>
                                                <SelectItem value="standard_ceramic">Standard Ceramic</SelectItem>
                                                <SelectItem value="premium_ceramic">Premium Ceramic</SelectItem>
                                                <SelectItem value="porcelain">Porcelain</SelectItem>
                                                <SelectItem value="natural_stone">Natural Stone</SelectItem>
                                                <SelectItem value="luxury_stone">Luxury Stone</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Label className="text-xs text-gray-600">Size:</Label>
                                            <Select
                                              value={taskOptions.tile_size}
                                              onValueChange={(value) => handleTaskOptionChange('tile_size', value)}
                                            >
                                              <SelectTrigger className="h-8 w-28">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="300x300mm">300x300mm</SelectItem>
                                                <SelectItem value="400x400mm">400x400mm</SelectItem>
                                                <SelectItem value="600x600mm">600x600mm</SelectItem>
                                                <SelectItem value="800x800mm">800x800mm</SelectItem>
                                                <SelectItem value="300x600mm">300x600mm</SelectItem>
                                                <SelectItem value="450x900mm">450x900mm</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      )}

                                      {/* Tiling - Wall Tile Grade */}
                                      {(subtaskKey === 'supply_install_wall_tiles' || subtaskKey === 'supply_install_half_height') && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.wall_tile_grade}
                                            onValueChange={(value) => handleTaskOptionChange('wall_tile_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-36">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget_ceramic">Budget Ceramic</SelectItem>
                                              <SelectItem value="standard_ceramic">Standard Ceramic</SelectItem>
                                              <SelectItem value="premium_ceramic">Premium Ceramic</SelectItem>
                                              <SelectItem value="porcelain">Porcelain</SelectItem>
                                              <SelectItem value="subway_tile">Subway Tile</SelectItem>
                                              <SelectItem value="mosaic">Mosaic Tiles</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Tiling - Feature Wall Grade */}
                                      {subtaskKey === 'supply_install_feature_wall' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={taskOptions.feature_tile_grade}
                                            onValueChange={(value) => handleTaskOptionChange('feature_tile_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-36">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="premium">Premium Ceramic</SelectItem>
                                              <SelectItem value="designer_porcelain">Designer Porcelain</SelectItem>
                                              <SelectItem value="natural_stone">Natural Stone</SelectItem>
                                              <SelectItem value="marble">Marble</SelectItem>
                                              <SelectItem value="mosaic_feature">Mosaic Feature</SelectItem>
                                              <SelectItem value="textured_stone">Textured Stone</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Vanity Grade */}
                                      {subtaskKey === 'pc_items_vanity_basin' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.vanity_grade}
                                            onValueChange={(value) => handleTaskOptionChange('vanity_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget">Budget ($800-1200)</SelectItem>
                                              <SelectItem value="standard">Standard ($1200-2000)</SelectItem>
                                              <SelectItem value="premium">Premium ($2000-3500)</SelectItem>
                                              <SelectItem value="luxury">Luxury ($3500+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Toilet Grade */}
                                      {subtaskKey === 'pc_items_toilet_cistern' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.toilet_grade}
                                            onValueChange={(value) => handleTaskOptionChange('toilet_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget">Budget ($400-600)</SelectItem>
                                              <SelectItem value="standard">Standard ($600-900)</SelectItem>
                                              <SelectItem value="premium">Premium ($900-1500)</SelectItem>
                                              <SelectItem value="designer">Designer ($1500+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Shower Screen Grade */}
                                      {subtaskKey === 'pc_items_shower_screen' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={taskOptions.shower_screen_grade}
                                            onValueChange={(value) => handleTaskOptionChange('shower_screen_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-36">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="standard">Standard Frame ($600-900)</SelectItem>
                                              <SelectItem value="semi_frameless">Semi Frameless ($900-1400)</SelectItem>
                                              <SelectItem value="frameless">Frameless ($1400-2200)</SelectItem>
                                              <SelectItem value="premium_frameless">Premium Frameless ($2200+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Tapware Grade */}
                                      {subtaskKey === 'pc_items_tapware' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.tapware_grade}
                                            onValueChange={(value) => handleTaskOptionChange('tapware_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget">Budget ($300-600)</SelectItem>
                                              <SelectItem value="standard">Standard ($600-1200)</SelectItem>
                                              <SelectItem value="premium">Premium ($1200-2000)</SelectItem>
                                              <SelectItem value="luxury">Luxury ($2000+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Lighting Grade */}
                                      {subtaskKey === 'pc_items_lighting' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.lighting_grade}
                                            onValueChange={(value) => handleTaskOptionChange('lighting_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-32">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget">Budget ($200-400)</SelectItem>
                                              <SelectItem value="standard">Standard ($400-800)</SelectItem>
                                              <SelectItem value="premium">Premium ($800-1500)</SelectItem>
                                              <SelectItem value="designer">Designer ($1500+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* PC Items - Mirror Grade */}
                                      {subtaskKey === 'pc_items_mirror_cabinet' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={taskOptions.mirror_grade}
                                            onValueChange={(value) => handleTaskOptionChange('mirror_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-36">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="basic_mirror">Basic Mirror ($150-300)</SelectItem>
                                              <SelectItem value="standard_cabinet">Standard Cabinet ($300-600)</SelectItem>
                                              <SelectItem value="premium_cabinet">Premium Cabinet ($600-1200)</SelectItem>
                                              <SelectItem value="luxury_cabinet">Luxury Cabinet ($1200+)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      {/* Tiles Supply Grade */}
                                      {subtaskKey === 'tiles_supply_coordination' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Service:</Label>
                                          <Select
                                            value={taskOptions.tiles_supply_grade}
                                            onValueChange={(value) => handleTaskOptionChange('tiles_supply_grade', value)}
                                          >
                                            <SelectTrigger className="h-8 w-40">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="standard">Standard (15% markup)</SelectItem>
                                              <SelectItem value="premium_service">Premium Service (20% markup)</SelectItem>
                                              <SelectItem value="full_service">Full Service (25% markup + coordination)</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Quick Select Buttons */}
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  Object.keys(subtaskLabels[key]).forEach(subtaskKey => {
                                    handleSubtaskToggle(key, subtaskKey, true);
                                  });
                                }}
                                className="text-xs"
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  Object.keys(subtaskLabels[key]).forEach(subtaskKey => {
                                    handleSubtaskToggle(key, subtaskKey, false);
                                  });
                                }}
                                className="text-xs"
                              >
                                Clear All
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Additional Notes */}
                <div className="space-y-4">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
                    placeholder="Any specific requirements, quality preferences, or constraints..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-2xl border border-blue-100">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-8 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        <div className="flex flex-col">
                          <span>Generating AI-Powered Quote...</span>
                          <span className="text-sm opacity-90">Analyzing 71 professional tasks</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center">
                          <div className="bg-white/20 p-2 rounded-lg mr-3">
                            <Calculator className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span>Generate Professional Quote</span>
                            <span className="text-sm opacity-90">Powered by Learning AI</span>
                          </div>
                        </div>
                      </>
                    )}
                  </Button>
                  <p className="text-center text-gray-600 text-sm mt-4">
                    🔒 Your data is secure • 🚀 Results in seconds • 🎯 Personalized accuracy
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Quote Summary */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="text-2xl flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Renovation Quote Generated
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-4xl font-black text-green-600">
                      ${quote.total_cost.toLocaleString()}
                    </h3>
                    <p className="text-green-700 font-semibold">Total Estimated Cost</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-3xl font-bold text-blue-600">
                      {calculateSquareMeters()} m²
                    </h3>
                    <p className="text-blue-700 font-semibold">Floor Area</p>
                    <p className="text-blue-500 text-xs">For floor materials</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-3xl font-bold text-purple-600">
                      {calculateWallArea()} m²
                    </h3>
                    <p className="text-purple-700 font-semibold">Wall Area</p>
                    <p className="text-purple-500 text-xs">For wall materials</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                    <Badge 
                      variant={quote.confidence_level === 'High' ? 'default' : quote.confidence_level === 'Medium' ? 'secondary' : 'outline'} 
                      className="text-lg p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold"
                    >
                      {quote.confidence_level} Confidence
                    </Badge>
                    <p className="text-yellow-700 font-semibold mt-2">AI Accuracy</p>
                    <p className="text-yellow-600 text-xs">Learning from your style</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">AI Analysis</h4>
                      <p className="text-blue-700">{quote.ai_analysis}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setAdjustmentMode(!adjustmentMode)}
                    variant={adjustmentMode ? 'destructive' : 'outline'}
                    className="flex-1"
                  >
                    {adjustmentMode ? 'Cancel Adjustments' : 'Adjust Costs'}
                  </Button>
                  <Button
                    onClick={() => {
                      setQuote(null);
                      setFormData({
                        clientInfo: { name: '', email: '', phone: '', address: '' },
                        roomMeasurements: { length: '', width: '', height: '' },
                        components: {
                          demolition: { enabled: false, subtasks: { removal_internal_ware: false, removal_wall_linings: false, removal_ceiling_linings: false, removal_ground_tiles_screed: false, removal_old_substrate: false, supply_skip_bin: false, asbestos_removal: false } },
                          framing: { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, additional_costs_allowance: false } },
                          plumbing_rough_in: { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
                          electrical_rough_in: { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
                          plastering: { enabled: false, subtasks: { supply_install_ceiling_sheets: false, supply_install_wall_sheets: false, supply_compounds_finishing: false, top_coat_ceilings: false, supply_install_cornice: false } },
                          waterproofing: { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
                          tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
                          shower_screens: { enabled: false, subtasks: { fixed_panel_install: false, frameless_shower_enclosure: false, semi_frameless_shower_enclosure: false, shower_curtain: false } },
                          pc_items_tile_supply: { enabled: false, subtasks: { pc_items_vanity_basin: false, pc_items_toilet_cistern: false, pc_items_shower_screen: false, pc_items_tapware: false, pc_items_lighting: false, pc_items_mirror_cabinet: false, pc_items_accessories: false, tiles_supply_coordination: false } },
                          fit_off: { enabled: false, subtasks: { accessories_install: false, site_clean: false, builders_clean: false, painting: false } }
                        },
                        additionalNotes: ''
                      });
                      setTaskOptions({
                        skip_bin_size: '6 meter bin',
                        build_niches_quantity: 1,
                        swing_door_size: '720mm',
                        cavity_sliding_size: '720mm',
                        minor_costs_amount: 0,
                        water_feeds_type: 'single',
                        power_points_quantity: 1,
                        plasterboard_grade: 'standard',
                        cornice_type: 'standard',
                        floor_tile_grade: 'standard_ceramic',
                        wall_tile_grade: 'standard_ceramic',
                        tile_size: '300x300mm',
                        feature_tile_grade: 'premium',
                        vanity_grade: 'standard',
                        toilet_grade: 'standard',
                        shower_screen_grade: 'standard',
                        tapware_grade: 'standard',
                        lighting_grade: 'standard',
                        mirror_grade: 'standard',
                        tiles_supply_grade: 'standard'
                      });
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    New Quote
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Cost Breakdown</CardTitle>
                {adjustmentMode && (
                  <div className="flex gap-2">
                    <Button onClick={submitAdjustments} size="sm" className="bg-green-600 hover:bg-green-700">
                      Save Adjustments
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {quote.cost_breakdown.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg">{item.component}</h4>
                        <div className="flex items-center gap-2">
                          {adjustmentMode ? (
                            <Input
                              type="number"
                              value={adjustedCosts[index] || item.estimated_cost}
                              onChange={(e) => handleAdjustCost(index, e.target.value)}
                              className="w-32"
                            />
                          ) : (
                            <span className="text-xl font-bold text-green-600">
                              ${item.estimated_cost.toLocaleString()}
                            </span>
                          )}
                          <SupplierDialog 
                            component={item.component.toLowerCase().replace(' ', '_')} 
                            componentLabel={item.component}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Range: ${item.cost_range_min.toLocaleString()} - ${item.cost_range_max.toLocaleString()}
                      </div>
                      <p className="text-gray-700">{item.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Information Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Client Details</h4>
                    <p><strong>Name:</strong> {formData.clientInfo.name}</p>
                    <p><strong>Email:</strong> {formData.clientInfo.email}</p>
                    <p><strong>Phone:</strong> {formData.clientInfo.phone}</p>
                    <p><strong>Address:</strong> {formData.clientInfo.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Room Specifications</h4>
                    <p><strong>Dimensions:</strong> {formData.roomMeasurements.length}m × {formData.roomMeasurements.width}m × {formData.roomMeasurements.height}m</p>
                    <p><strong>Floor Area:</strong> {calculateSquareMeters()} m²</p>
                    <p><strong>Volume:</strong> {(parseFloat(formData.roomMeasurements.length || 0) * parseFloat(formData.roomMeasurements.width || 0) * parseFloat(formData.roomMeasurements.height || 0)).toFixed(2)} m³</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RenovationQuotingApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;