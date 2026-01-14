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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { AlertCircle, Calculator, MapPin, Phone, Mail, Ruler, CheckCircle2, Loader2, ChevronDown, FileText, Download, Building, User, Award, Briefcase, FolderOpen, Save, Edit3, Trash2, Filter, Search, Menu, X, Calendar, DollarSign, Navigation, ExternalLink, Home, Settings, Users, PlusCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RenovationQuotingApp = () => {
  // Initialize with some default data to prevent validation issues
  const [formData, setFormData] = useState({
    clientInfo: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '02-1234-5678',
      address: '123 Test Street, Sydney NSW 2000'
    },
    roomMeasurements: {
      length: '3500',
      width: '2500', 
      height: '2400'
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
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [userProfile, setUserProfile] = useState({
    // Business Information
    company_name: 'Professional Bathroom Renovations',
    contact_name: 'Project Manager', 
    phone: '',
    email: '',
    website: '',
    abn_acn: '',
    license_number: '',
    insurance_number: '',
    
    // Business Address
    business_address: '',
    city: '',
    state: '',
    postal_code: '',
    
    // Experience & Credentials
    years_experience: '5+',
    projects_completed: '100+',
    specializations: '',
    certifications: '',
    
    // Quote Settings
    quote_validity_days: '30',
    payment_terms: 'Payment required upon completion',
    warranty_period: '12 months',
    
    // Branding
    logo_url: '',
    brand_color: '#2563eb'
  });
  // Project Management States  
  const [savedProjects, setSavedProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectsPanel, setShowProjectsPanel] = useState(false);
  
  // Contract Generation States
  const [contractForm, setContractForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    projectDescription: '',
    totalPrice: '',
    startDate: new Date().toISOString().split('T')[0],
    completionDays: 30
    paymentSchedule: [
      { stage: '1', description: 'Deposit (upon contract signing)', percentage: 10 },
      { stage: '2', description: 'Demolition, Frame & Rough-in Complete', percentage: 40 },
      { stage: '3', description: 'Coverings & Tiling Complete', percentage: 30 },
      { stage: '4', description: 'Fit-off & Handover Complete', percentage: 20 }
    ]
  });
  const [editingStage, setEditingStage] = useState(null);
  const [customPaymentSchedule, setCustomPaymentSchedule] = useState({
    completionDays: 30,
  });
  const [generatingContract, setGeneratingContract] = useState(false);
  const [previewContract, setPreviewContract] = useState(null);
  const [savedContracts, setSavedContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All', 'Residential', 'Commercial', 'Luxury', 'Budget']);
  const [editingProject, setEditingProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Email functionality states
  const [emailOptions, setEmailOptions] = useState({
    includeBreakdown: true,
    includePdf: true
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Sidebar and Navigation states
  const [currentView, setCurrentView] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Email Dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  
  // PDF Dialog state
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfIncludeBreakdown, setPdfIncludeBreakdown] = useState(true);
  
  // Google Maps Integration
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Multi-Area System States
  const [projectAreas, setProjectAreas] = useState([
    {
      id: 'main',
      name: 'Main Bathroom',
      type: 'bathroom',
      measurements: { length: '3500', width: '2500', height: '2400' },
      components: {
        demolition: { enabled: false, subtasks: { removal_internal_ware: false, removal_wall_linings: false, removal_ceiling_linings: false, removal_ground_tiles_screed: false, removal_old_substrate: false, supply_skip_bin: false, asbestos_removal: false } },
        framing: { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, additional_costs_allowance: false } },
        plumbing_rough_in: { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
        electrical_rough_in: { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
        plastering: { enabled: false, subtasks: { supply_install_ceiling_sheets: false, supply_install_wall_sheets: false, supply_compounds_finishing: false, top_coat_ceilings: false, supply_install_cornice: false } },
        waterproofing: { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
        tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_skirt_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
        shower_screens: { enabled: false, subtasks: { fixed_panel_install: false, frameless_shower_enclosure: false, semi_frameless_shower_enclosure: false, shower_curtain: false } },
        pc_items_tile_supply: { enabled: false, subtasks: { pc_items_vanity_basin: false, pc_items_toilet_cistern: false, pc_items_shower_screen: false, pc_items_tapware: false, pc_items_lighting: false, pc_items_mirror_cabinet: false, pc_items_accessories: false, tiles_supply_coordination: false } },
        fit_off: { enabled: false, subtasks: { accessories_install: false, site_clean: false, builders_clean: false, painting: false } }
      },
      taskOptions: {
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
        wall_tile_size: '300x300mm',
        feature_tile_grade: 'premium',
        vanity_grade: 'standard',
        toilet_grade: 'standard',
        shower_screen_grade: 'standard',
        tapware_grade: 'standard',
        lighting_grade: 'standard',
        mirror_grade: 'standard',
        tiles_supply_grade: 'standard'
      },
      additionalNotes: '',
      quote: null
    }
  ]);
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [showAddAreaDialog, setShowAddAreaDialog] = useState(false);
  
  const areaTypes = [
    { value: 'bathroom', label: 'Bathroom', icon: '🛁' },
    { value: 'ensuite', label: 'Ensuite', icon: '🚿' },
    { value: 'wc', label: 'Separate Toilet (WC)', icon: '🚽' },
    { value: 'laundry', label: 'Laundry', icon: '🧺' },
    { value: 'powder_room', label: 'Powder Room', icon: '💄' },
    { value: 'guest_bathroom', label: 'Guest Bathroom', icon: '🏨' },
    { value: 'kids_bathroom', label: 'Kids Bathroom', icon: '🧸' }
  ];
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
    wall_tile_size: '300x300mm',
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
    plumbing_rough_in: 'Plumbing',
    electrical_rough_in: 'Electrical',
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
      supply_install_wall_tiles: 'Supply Materials and Install Wall Tiles (including adhesive, spacers, trim)',
      supply_install_skirt_tiles: 'Supply Materials and Install Skirt Tiles (including adhesive, spacers, trim)',
      supply_install_shower_niche: 'Supply Materials and Install Shower Niche (including waterproof niche, trim)',
      supply_install_bath_niche: 'Supply Materials and Install Bath Niche (including niche box, trim)',
      supply_install_floor_ceiling: 'Supply Materials and Install Floor to Ceiling Tiling (including adhesive, trim)',
      supply_install_half_height: 'Supply Materials and Install Half Height Wall Tiles (including adhesive, trim)',
      supply_install_nib_walls: 'Supply Materials and Install Nib Wall Tilings (including adhesive, corner trim)',
      supply_grout_silicone: 'Supply & Apply Grout and Silicone (including grout, silicone, sealers)',
      supply_install_shower_hob: 'Supply Materials and Install Shower Hob Tiling (including waterproof membrane)',
      supply_install_bath_hob: 'Supply Materials and Install Bath Hob Tiling (including waterproof membrane)',  
      supply_install_feature_wall: 'Supply Materials and Install Feature Wall (including adhesive, trim)'
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

  const calculateSquareMeters = (areaIndex = null) => {
    const area = areaIndex !== null ? projectAreas[areaIndex] : getCurrentArea();
    const { length, width } = area?.measurements || {};
    
    if (length && width && parseFloat(length) > 0 && parseFloat(width) > 0) {
      // Convert from millimetres to meters first, then calculate square meters
      const lengthInMeters = parseFloat(length) / 1000;
      const widthInMeters = parseFloat(width) / 1000;
      return (lengthInMeters * widthInMeters).toFixed(2);
    }
    return '0';
  };

  const calculateWallArea = (areaIndex = null) => {
    const area = areaIndex !== null ? projectAreas[areaIndex] : getCurrentArea();
    const { length, width, height } = area?.measurements || {};
    
    if (length && width && height && parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0) {
      // Convert from millimetres to meters first
      const lengthInMeters = parseFloat(length) / 1000;
      const widthInMeters = parseFloat(width) / 1000;
      const heightInMeters = parseFloat(height) / 1000;
      
      // Calculate gross wall area = 2 * (length + width) * height
      const grossWallArea = 2 * (lengthInMeters + widthInMeters) * heightInMeters;
      
      // Deduct standard bathroom openings:
      // - Door: 0.9m × 2.1m = 1.89 m²
      // - Window (if applicable): 1.2m × 1.0m = 1.2 m² (optional)
      const doorArea = 0.9 * 2.1; // 1.89 m²
      const windowArea = 0.0; // Can be made configurable later
      
      const netWallArea = grossWallArea - doorArea - windowArea;
      
      // Return net wall area (actual wall surface to be tiled/painted)
      return Math.max(netWallArea, 0).toFixed(2);
    }
    return '0';
  };

  const getCurrentArea = () => projectAreas[currentAreaIndex];
  const getCurrentTaskOptions = () => getCurrentArea()?.taskOptions || {};
  
  const getTotalProjectCost = () => {
    return projectAreas.reduce((total, area) => {
      return total + (area.quote?.total_cost || 0);
    }, 0);
  };

  const getTotalFloorArea = () => {
    return projectAreas.reduce((total, area, index) => {
      const areaSize = parseFloat(calculateSquareMeters(index)) || 0;
      return total + areaSize;
    }, 0).toFixed(2);
  };

  const getTotalWallArea = () => {
    return projectAreas.reduce((total, area, index) => {
      const areaSize = parseFloat(calculateWallArea(index)) || 0;
      return total + areaSize;
    }, 0).toFixed(2);
  };

  // Multi-Area Management Functions
  const addNewArea = (areaType) => {
    const newArea = {
      id: `area_${Date.now()}`,
      name: areaTypes.find(t => t.value === areaType)?.label || 'New Area',
      type: areaType,
      measurements: { length: '', width: '', height: '' },
      components: {
        demolition: { enabled: false, subtasks: { removal_internal_ware: false, removal_wall_linings: false, removal_ceiling_linings: false, removal_ground_tiles_screed: false, removal_old_substrate: false, supply_skip_bin: false, asbestos_removal: false } },
        framing: { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, additional_costs_allowance: false } },
        plumbing_rough_in: { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
        electrical_rough_in: { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
        plastering: { enabled: false, subtasks: { supply_install_ceiling_sheets: false, supply_install_wall_sheets: false, supply_compounds_finishing: false, top_coat_ceilings: false, supply_install_cornice: false } },
        waterproofing: { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
        tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_skirt_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
        shower_screens: { enabled: false, subtasks: { fixed_panel_install: false, frameless_shower_enclosure: false, semi_frameless_shower_enclosure: false, shower_curtain: false } },
        pc_items_tile_supply: { enabled: false, subtasks: { pc_items_vanity_basin: false, pc_items_toilet_cistern: false, pc_items_shower_screen: false, pc_items_tapware: false, pc_items_lighting: false, pc_items_mirror_cabinet: false, pc_items_accessories: false, tiles_supply_coordination: false } },
        fit_off: { enabled: false, subtasks: { accessories_install: false, site_clean: false, builders_clean: false, painting: false } }
      },
      taskOptions: {
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
        wall_tile_size: '300x300mm',
        feature_tile_grade: 'premium',
        vanity_grade: 'standard',
        toilet_grade: 'standard',
        shower_screen_grade: 'standard',
        tapware_grade: 'standard',
        lighting_grade: 'standard',
        mirror_grade: 'standard',
        tiles_supply_grade: 'standard'
      },
      additionalNotes: '',
      quote: null
    };

    setProjectAreas(prev => [...prev, newArea]);
    setCurrentAreaIndex(projectAreas.length); // Switch to new area
    setShowAddAreaDialog(false);
    toast.success(`Added ${newArea.name} to project`);
  };

  const removeArea = (areaIndex) => {
    if (projectAreas.length <= 1) {
      toast.error('Cannot remove the last area');
      return;
    }
    
    if (!window.confirm(`Remove ${projectAreas[areaIndex].name} from project?`)) return;
    
    setProjectAreas(prev => prev.filter((_, index) => index !== areaIndex));
    setCurrentAreaIndex(Math.max(0, currentAreaIndex - 1));
    toast.success('Area removed from project');
  };

  const updateAreaData = (areaIndex, section, field, value, isCheckbox = false) => {
    setProjectAreas(prev => prev.map((area, index) => {
      if (index === areaIndex) {
        return {
          ...area,
          [section]: {
            ...area[section],
            [field]: isCheckbox ? value : value
          }
        };
      }
      return area;
    }));
  };

  const handleInputChange = (section, field, value, isCheckbox = false) => {
    if (section === 'clientInfo' || section === 'roomMeasurements') {
      // Update client info and room measurements in formData
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: isCheckbox ? value : value
        }
      }));
      
      // CRITICAL: Also update projectAreas measurements to sync with calculations
      if (section === 'roomMeasurements') {
        setProjectAreas(prev => 
          prev.map((area, index) => 
            index === currentAreaIndex 
              ? {
                  ...area,
                  measurements: {
                    ...area.measurements,
                    [field]: value
                  }
                }
              : area
          )
        );
      }
    } else if (section === 'additionalNotes') {
      // Update additional notes in formData
      setFormData(prev => ({
        ...prev,
        [field]: isCheckbox ? value : value
      }));
    } else {
      // Update other sections in current area of projectAreas
      setProjectAreas(prev => prev.map((area, index) => {
        if (index === currentAreaIndex) {
          return {
            ...area,
            [section]: {
              ...area[section],
              [field]: isCheckbox ? value : value
            }
          };
        }
        return area;
      }));
    }
  };

  const handleAreaMeasurementChange = (field, value) => {
    setProjectAreas(prev => prev.map((area, index) => {
      if (index === currentAreaIndex) {
        return {
          ...area,
          measurements: {
            ...area.measurements,
            [field]: value
          }
        };
      }
      return area;
    }));
  };

  const handleComponentToggle = (component, enabled) => {
    setProjectAreas(prev => prev.map((area, index) => {
      if (index === currentAreaIndex) {
        return {
          ...area,
          components: {
            ...area.components,
            [component]: {
              ...area.components[component],
              enabled: enabled,
              // If disabling main component, disable all subtasks
              subtasks: enabled ? area.components[component].subtasks : 
                Object.keys(area.components[component].subtasks).reduce((acc, key) => {
                  acc[key] = false;
                  return acc;
                }, {})
            }
          }
        };
      }
      return area;
    }));
  };

  const handleSubtaskToggle = (component, subtask, enabled) => {
    setProjectAreas(prev => prev.map((area, index) => {
      if (index === currentAreaIndex) {
        return {
          ...area,
          components: {
            ...area.components,
            [component]: {
              ...area.components[component],
              subtasks: {
                ...area.components[component].subtasks,
                [subtask]: enabled
              }
            }
          }
        };
      }
      return area;
    }));
  };

  const getSelectedSubtasks = (component) => {
    const currentArea = getCurrentArea();
    return Object.entries(currentArea.components[component]?.subtasks || {})
      .filter(([key, value]) => value)
      .map(([key, value]) => key);
  };

  // New Quote Form Helper Functions
  const toggleExpandedComponent = (componentKey) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentKey]: !prev[componentKey]
    }));
  };

  const handleFormComponentToggle = (component, enabled) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          enabled: enabled,
          subtasks: prev.components[component]?.subtasks || {}
        }
      }
    }));
    
    // Auto-expand when enabling a component
    if (enabled) {
      setExpandedComponents(prev => ({
        ...prev,
        [component]: true
      }));
    }
  };

  const handleFormSubtaskToggle = (component, subtask, enabled) => {
    setFormData(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component],
          subtasks: {
            ...prev.components[component]?.subtasks,
            [subtask]: enabled
          }
        }
      }
    }));
  };

  const selectAllSubtasks = (component) => {
    const allSubtasks = Object.keys(subtaskLabels[component] || {});
    allSubtasks.forEach(subtaskKey => {
      handleFormSubtaskToggle(component, subtaskKey, true);
    });
  };

  const clearAllSubtasks = (component) => {
    const allSubtasks = Object.keys(subtaskLabels[component] || {});
    allSubtasks.forEach(subtaskKey => {
      handleFormSubtaskToggle(component, subtaskKey, false);
    });
  };

  const handleTaskOptionChange = (optionKey, value) => {
    setProjectAreas(prev => prev.map((area, index) => {
      if (index === currentAreaIndex) {
        return {
          ...area,
          taskOptions: {
            ...area.taskOptions,
            [optionKey]: value
          }
        };
      }
      return area;
    }));
  };

  // Multi-Area Individual Quote Generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required client information first
      if (!formData.clientInfo.name?.trim() || !formData.clientInfo.email?.trim()) {
        toast.error('Please fill in client name and email address');
        setLoading(false);
        return;
      }

      // Collect and validate areas - generate individual quotes for each area
      let areaQuotes = [];
      let validAreas = [];

      for (let i = 0; i < projectAreas.length; i++) {
        const area = projectAreas[i];
        
        // Check if area has valid measurements
        const { length, width, height } = area.measurements || {};
        const hasValidMeasurements = length && width && height && 
          parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0;
        
        // Check if area has selected components
        const areaComponents = {};
        Object.entries(area.components || {}).forEach(([key, value]) => {
          if (value.enabled) {
            areaComponents[key] = value;
          }
        });
        
        console.log(`Area ${area.name}:`, {
          hasValidMeasurements,
          measurements: { length, width, height },
          selectedComponents: Object.keys(areaComponents),
          measuredFloorArea: hasValidMeasurements ? (parseFloat(length) / 1000 * parseFloat(width) / 1000).toFixed(2) : 0,
          measuredWallArea: hasValidMeasurements ? (2 * (parseFloat(length) / 1000 + parseFloat(width) / 1000) * parseFloat(height) / 1000).toFixed(2) : 0
        });

        if (hasValidMeasurements && Object.keys(areaComponents).length > 0) {
          // Calculate areas for this specific area
          const floorArea = parseFloat(length) / 1000 * parseFloat(width) / 1000;
          const wallArea = 2 * (parseFloat(length) / 1000 + parseFloat(width) / 1000) * parseFloat(height) / 1000;
          const perimeter = 2 * (parseFloat(length) / 1000 + parseFloat(width) / 1000);
          
          // Prepare individual quote request for this area
          const requestData = {
            client_info: formData.clientInfo,
            room_measurements: {
              length: parseFloat(length) / 1000,
              width: parseFloat(width) / 1000,
              height: parseFloat(height) / 1000
            },
            components: Object.keys(areaComponents).reduce((acc, key) => {
              acc[key] = true;  // Backend expects boolean values
              return acc;
            }, {}),
            detailed_components: areaComponents,
            task_options: area.taskOptions || {},
            additional_notes: `Area: ${area.name} (${area.type}). Floor: ${floorArea.toFixed(2)}m². Wall: ${wallArea.toFixed(2)}m². Perimeter: ${perimeter.toFixed(1)}m (for skirt tiles @ $35/linear meter = $${(perimeter * 35).toFixed(0)}). ${area.type === 'separate_toilet' ? 'This is a separate toilet area - typically requires floor tiles and skirt tiles rather than full wall tiling.' : ''}`
          };

          console.log(`Generating quote for ${area.name}:`, requestData);

          try {
            // Generate individual quote for this area
            let response;
            try {
              const userId = userProfile.contact_name || "default";
              response = await axios.post(`${API}/quotes/generate-with-learning?user_id=${userId}`, requestData);
            } catch (learningError) {
              console.log(`Learning not available for ${area.name}, using standard generation`);
              response = await axios.post(`${API}/quotes/request`, requestData);
            }

            // Add area context to the quote
            const areaQuote = {
              ...response.data,
              area_name: area.name,
              area_type: area.type,
              area_floor_area: floorArea.toFixed(2),
              area_wall_area: wallArea.toFixed(2),
              area_measurements: area.measurements
            };
            
            areaQuotes.push(areaQuote);
            validAreas.push({
              ...area,
              floorArea: floorArea.toFixed(2),
              wallArea: wallArea.toFixed(2),
              quote: areaQuote
            });
          } catch (error) {
            console.error(`Error generating quote for ${area.name}:`, error);
            toast.error(`Failed to generate quote for ${area.name}: ${error.response?.data?.detail || error.message}`);
            setLoading(false);
            return;
          }
        }
      }

      if (validAreas.length === 0) {
        toast.error('Please add at least one area with valid measurements and selected components');
        setLoading(false);
        return;
      }

      // Calculate totals from individual area quotes
      const totalCost = areaQuotes.reduce((sum, quote) => sum + quote.total_cost, 0);
      const totalFloorArea = validAreas.reduce((sum, area) => sum + parseFloat(area.floorArea), 0);
      const totalWallArea = validAreas.reduce((sum, area) => sum + parseFloat(area.wallArea), 0);

      // Create combined multi-area quote object
      const combinedQuote = {
        id: `multi_${Date.now()}`,
        total_cost: totalCost,
        area_quotes: areaQuotes,
        areas_count: validAreas.length,
        combined_floor_area: totalFloorArea.toFixed(2),
        combined_wall_area: totalWallArea.toFixed(2),
        client_info: formData.clientInfo,
        created_at: new Date().toISOString(),
        // Combine all cost breakdowns for overall view
        cost_breakdown: areaQuotes.reduce((combined, areaQuote) => {
          const prefixedBreakdown = areaQuote.cost_breakdown.map(item => ({
            ...item,
            component: `${areaQuote.area_name} - ${item.component}`,
            area_name: areaQuote.area_name
          }));
          return [...combined, ...prefixedBreakdown];
        }, [])
      };

      console.log('Multi-area quote generated:', combinedQuote);
      setQuote(combinedQuote);
      toast.success(`Multi-area quote generated successfully! ${validAreas.length} areas quoted for $${totalCost.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error generating multi-area quote:', error);
      toast.error(`Failed to generate quote: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEdit = () => {
    setQuote(null);
    toast.success('Returned to project editing');
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
    // Handle empty string - keep it as empty string to signify "use original cost"
    if (newCost === '') {
      setAdjustedCosts(prev => ({
        ...prev,
        [componentIndex]: ''
      }));
      return;
    }
    
    // Convert to number and validate, ensuring max 2 decimal places
    let numericCost = parseFloat(newCost);
    
    // If parsing failed, treat as empty (revert to original)
    if (isNaN(numericCost)) {
      setAdjustedCosts(prev => ({
        ...prev,
        [componentIndex]: ''
      }));
      return;
    }
    
    // Round to 2 decimal places to avoid floating point precision issues
    numericCost = Math.round(numericCost * 100) / 100;
    
    setAdjustedCosts(prev => ({
      ...prev,
      [componentIndex]: numericCost
    }));
  };

  const handleCostAdjustment = (index, newCost) => {
    handleAdjustCost(index, newCost);
  };

  // Helper function to calculate room perimeter for skirt tiles (in linear meters)
  const calculatePerimeter = (areaIndex = null) => {
    const area = areaIndex !== null ? projectAreas[areaIndex] : getCurrentArea();
    const { length, width } = area?.measurements || {};
    
    if (length && width && parseFloat(length) > 0 && parseFloat(width) > 0) {
      // Convert from millimeters to meters first
      const lengthInMeters = parseFloat(length) / 1000;
      const widthInMeters = parseFloat(width) / 1000;
      // Perimeter = 2 × (length + width)
      return (2 * (lengthInMeters + widthInMeters)).toFixed(1);
    }
    return '0';
  };

  // Helper function to format currency with proper decimal places
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    
    const num = parseFloat(amount);
    
    // If it's a whole number, show without decimals
    if (num === Math.floor(num)) {
      return num.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    
    // If it has decimals, show maximum 2 decimal places
    return num.toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getTotalAdjustedCost = () => {
    if (!quote || !quote.cost_breakdown) return 0;
    
    // If user has made current adjustments, calculate from the ORIGINAL project baseline
    if (Object.keys(adjustedCosts).length > 0) {
      // Start with the original saved project total as baseline
      const originalTotal = quote.total_cost || 0;
      
      // Calculate the difference from original component values
      let totalAdjustment = 0;
      
      quote.cost_breakdown.forEach((item, index) => {
        if (adjustedCosts[index] !== undefined) {
          if (adjustedCosts[index] === '') {
            // Empty string means user cleared the field - no adjustment
            // Keep original component cost (no change to totalAdjustment)
          } else {
            // Calculate the difference between adjusted and original
            const adjustedValue = parseFloat(adjustedCosts[index]) || 0;
            const originalValue = item.estimated_cost;
            const adjustment = adjustedValue - originalValue;
            totalAdjustment += adjustment;
          }
        }
      });
      
      // Return original total plus all adjustments
      return originalTotal + totalAdjustment;
    }
    
    // If no current adjustments, use the saved project total_cost
    return quote.total_cost;
  };

  const submitAdjustments = async () => {
    if (!quote) return;

    try {
      const totalAdjusted = getTotalAdjustedCost();
      
      // Submit individual component adjustments for AI learning
      const learningPromises = quote.cost_breakdown.map(async (item, index) => {
        const adjustedValue = adjustedCosts[index];
        // Only submit if there's a real adjustment (not undefined and not empty string)
        if (adjustedValue !== undefined && adjustedValue !== '' && adjustedValue !== item.estimated_cost) {
          const adjustmentRatio = adjustedValue / item.estimated_cost;
          
          const learningData = {
            quote_id: quote.id,
            user_id: userProfile.contact_name || "default",
            component: item.component,
            original_cost: item.estimated_cost,
            adjusted_cost: adjustedValue,
            adjustment_ratio: adjustmentRatio,
            project_size: getCurrentArea()?.measurements ? 
              (parseFloat(getCurrentArea().measurements.length) / 1000 * parseFloat(getCurrentArea().measurements.width) / 1000) : null,
            location: formData.clientInfo.address || null,
            notes: `User adjustment: ${adjustmentRatio > 1 ? 'increased' : 'decreased'} by ${Math.abs((adjustmentRatio - 1) * 100).toFixed(1)}%`
          };
          
          return axios.post(`${API}/quotes/${quote.id}/learn-adjustment`, learningData);
        }
        return null;
      });

      // Wait for all learning submissions
      const learningResults = await Promise.all(learningPromises.filter(p => p !== null));
      
      // Update the quote with new total and individual costs
      setQuote(prev => ({
        ...prev,
        total_cost: totalAdjusted,
        original_total_cost: prev.original_total_cost || prev.total_cost, // Preserve original total
        cost_breakdown: prev.cost_breakdown.map((item, index) => {
          if (adjustedCosts[index] !== undefined) {
            return {
              ...item,
              estimated_cost: adjustedCosts[index],
              adjusted_cost: adjustedCosts[index],
              original_cost: item.original_cost || item.estimated_cost // Preserve original cost
            };
          }
          return item;
        })
      }));
      
      // Show success message with learning info
      const adjustmentCount = learningResults.length;
      toast.success(
        `💡 Adjustments saved! AI learned from ${adjustmentCount} cost changes. ` +
        `Your future quotes will be more accurate based on these insights.`
      );
      
      setAdjustmentMode(false);
      setAdjustedCosts({});
      
    } catch (error) {
      console.error('Error submitting adjustments:', error);
      toast.error('Failed to save adjustments. Please try again.');
    }
  };

  // Get AI Learning Insights
  const [learningInsights, setLearningInsights] = useState(null);
  
  const fetchLearningInsights = async () => {
    try {
      const userId = userProfile.contact_name || "default";
      const response = await axios.get(`${API}/user/${userId}/learning-insights`);
      setLearningInsights(response.data);
    } catch (error) {
      console.error('Error fetching learning insights:', error);
    }
  };

  const generateProposalPDF = async (showBreakdown = true) => {
    if (!quote) return;

    setGeneratingPDF(true);
    try {
      // Prepare adjusted costs for PDF generation if user has made adjustments
      const pdfRequestData = {
        user_profile: userProfile,
        adjusted_costs: null,
        adjusted_total: null,
        include_breakdown: showBreakdown
      };
      
      // Check if user has made cost adjustments (either in current session or previously saved)
      const hasCurrentAdjustments = Object.keys(adjustedCosts).length > 0;
      const hasSavedAdjustments = quote.cost_breakdown.some(item => item.adjusted_cost !== undefined);
      
      if (hasCurrentAdjustments || hasSavedAdjustments) {
        const adjustedCostsByComponent = {};
        const finalTotalCost = getTotalAdjustedCost();
        
        quote.cost_breakdown.forEach((item, index) => {
          // Use current adjustment if available, otherwise use saved adjusted cost, otherwise skip
          let adjustedCost = null;
          if (adjustedCosts[index] !== undefined) {
            adjustedCost = adjustedCosts[index];
          } else if (item.adjusted_cost !== undefined) {
            adjustedCost = item.adjusted_cost;
          }
          
          if (adjustedCost !== null) {
            adjustedCostsByComponent[item.component] = adjustedCost;
          }
        });
        
        console.log('PDF Generation - Current Adjustments:', adjustedCosts);
        console.log('PDF Generation - Quote Breakdown:', quote.cost_breakdown);
        console.log('PDF Generation - Final Adjusted Costs by Component:', adjustedCostsByComponent);
        console.log('PDF Generation - Final Total:', finalTotalCost);
        console.log('PDF Generation - Quote Original Total:', quote.total_cost);
        console.log('PDF Generation - UI Displayed Total:', getTotalAdjustedCost());
        
        pdfRequestData.adjusted_costs = adjustedCostsByComponent;
        pdfRequestData.adjusted_total = finalTotalCost;
      } else {
        console.log('PDF Generation - No adjusted costs found (current or saved)');
        console.log('PDF Generation - Using displayed total anyway:', getTotalAdjustedCost());
        
        // Even without adjustments, ensure PDF uses the displayed total
        pdfRequestData.adjusted_total = getTotalAdjustedCost();
        pdfRequestData.include_breakdown = showBreakdown;
      }

      const response = await axios.post(
        `${API}/quotes/${quote.id}/generate-proposal`,
        pdfRequestData,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Scope_of_Works_${formData.clientInfo.name.replace(/\s+/g, '_')}_${quote.id.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const adjustmentMessage = Object.keys(adjustedCosts).length > 0 
        ? ' with your cost adjustments applied!' 
        : '!';
      toast.success(`Professional proposal PDF generated successfully${adjustmentMessage}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate proposal PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Maps Integration - Smart device detection
  const openInMaps = (address) => {
    if (!address.trim()) {
      toast.error('Please enter an address first');
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMac = /Macintosh/.test(navigator.userAgent);
    
    let mapsUrl;
    
    if (isIOS || isMac) {
      // Apple Maps for iOS/Mac devices
      mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      // Fallback to web version if app not installed
      setTimeout(() => {
        window.open(`https://maps.apple.com/?q=${encodedAddress}`, '_blank');
      }, 500);
    } else {
      // Google Maps for Android/other devices
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }

    try {
      window.open(mapsUrl, '_blank');
      toast.success(`Opening ${isIOS || isMac ? 'Apple' : 'Google'} Maps...`);
    } catch (error) {
      // Fallback to Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
      toast.success('Opening Google Maps...');
    }
  };

  // Duplicate saveCurrentProject function removed - using the enhanced version below

  // Send Quote Email function - Updated for automatic attachment handling
  const handleSendQuoteEmail = async () => {
    if (!quote || !formData.clientInfo.email) {
      toast.error('Missing quote or client email');
      return;
    }

    setSendingEmail(true);
    try {
      // Generate PDFs if requested
      const pdfFiles = [];
      
      // Prepare adjusted costs for PDF generation if user has made adjustments
      const pdfRequestData = {
        user_profile: userProfile,
        adjusted_costs: null,
        adjusted_total: null,
        include_breakdown: includeBreakdown
      };
      
      // Check if user has made cost adjustments (either in current session or previously saved)
      const hasCurrentAdjustments = Object.keys(adjustedCosts).length > 0;
      const hasSavedAdjustments = quote.cost_breakdown.some(item => item.adjusted_cost !== undefined);
      
      if (hasCurrentAdjustments || hasSavedAdjustments) {
        const adjustedCostsByComponent = {};
        const finalTotalCost = getTotalAdjustedCost();
        
        quote.cost_breakdown.forEach((item, index) => {
          // Use current adjustment if available, otherwise use saved adjusted cost, otherwise skip
          let adjustedCost = null;
          if (adjustedCosts[index] !== undefined) {
            adjustedCost = adjustedCosts[index];
          } else if (item.adjusted_cost !== undefined) {
            adjustedCost = item.adjusted_cost;
          }
          
          if (adjustedCost !== null) {
            adjustedCostsByComponent[item.component] = adjustedCost;
          }
        });
        
        console.log('PDF Generation - Current Adjustments:', adjustedCosts);
        console.log('PDF Generation - Quote Breakdown:', quote.cost_breakdown);
        console.log('PDF Generation - Final Adjusted Costs by Component:', adjustedCostsByComponent);
        console.log('PDF Generation - Final Total:', finalTotalCost);
        console.log('PDF Generation - Quote Original Total:', quote.total_cost);
        console.log('PDF Generation - UI Displayed Total:', getTotalAdjustedCost());
        
        pdfRequestData.adjusted_costs = adjustedCostsByComponent;
        pdfRequestData.adjusted_total = finalTotalCost;
      } else {
        console.log('PDF Generation - No adjusted costs found (current or saved)');
        console.log('PDF Generation - Using displayed total anyway:', getTotalAdjustedCost());
        
        // Even without adjustments, ensure PDF uses the displayed total
        pdfRequestData.adjusted_total = getTotalAdjustedCost();
        pdfRequestData.include_breakdown = includeBreakdown;
      }
      
      // Always generate quote summary PDF
      try {
        const quoteResponse = await axios.post(`${API}/quotes/${quote.id}/generate-quote-summary`, pdfRequestData, {
          responseType: 'blob'
        });
        
        const quoteBlob = new Blob([quoteResponse.data], { type: 'application/pdf' });
        const quoteFilename = `Quote_Summary_${formData.clientInfo.name.replace(/\s+/g, '_')}_${quote.id.substring(0, 8)}.pdf`;
        pdfFiles.push({ blob: quoteBlob, filename: quoteFilename, name: 'Quote Summary' });
      } catch (error) {
        console.error('Error generating quote PDF:', error);
        toast.error('Failed to generate quote PDF');
        return;
      }
      
      // Generate scope of works PDF if requested
      if (emailOptions.includePdf) {
        try {
          const scopeResponse = await axios.post(`${API}/quotes/${quote.id}/generate-proposal`, pdfRequestData, {
            responseType: 'blob'
          });
          
          const scopeBlob = new Blob([scopeResponse.data], { type: 'application/pdf' });
          const scopeFilename = `Scope_of_Works_${formData.clientInfo.name.replace(/\s+/g, '_')}_${quote.id.substring(0, 8)}.pdf`;
          pdfFiles.push({ blob: scopeBlob, filename: scopeFilename, name: 'Scope of Works' });
        } catch (error) {
          console.error('Error generating scope PDF:', error);
          toast.error('Failed to generate scope of works PDF');
          return;
        }
      }

      // Create email content using ADJUSTED costs (not original AI costs)
      const subject = `Bathroom Renovation Quote - ${formData.clientInfo.name}`;
      
      // Use adjusted total cost if user has made adjustments, otherwise original cost
      const finalTotalCost = Object.keys(adjustedCosts).length > 0 ? getTotalAdjustedCost() : (quote.total_cost || 0);
      
      let emailBody = `Dear ${formData.clientInfo.name},

Thank you for your interest in our bathroom renovation services. Please find your personalized quote below:

PROJECT DETAILS:
🏠 Project: ${formData.clientInfo.name} Bathroom Renovation
📍 Address: ${formData.clientInfo.address}
📞 Phone: ${formData.clientInfo.phone}

QUOTE SUMMARY:
💰 Total Estimated Cost: $${finalTotalCost.toLocaleString()}
🤖 Generated using AI-powered precision analysis
📊 Based on ${getCurrentArea()?.measurements ? `${(parseFloat(getCurrentArea().measurements.length) / 1000 * parseFloat(getCurrentArea().measurements.width) / 1000).toFixed(1)}m²` : 'your'} bathroom specifications

`;

      // Only include breakdown if user specifically requested it
      if (includeBreakdown && quote.cost_breakdown) {
        emailBody += `COST BREAKDOWN:
`;
        quote.cost_breakdown.forEach((item, index) => {
          // Use adjusted cost if available, otherwise original cost
          const finalCost = adjustedCosts[index] !== undefined ? adjustedCosts[index] : item.estimated_cost;
          emailBody += `• ${item.component}: $${finalCost.toLocaleString()}
`;
        });
        emailBody += `
`;
      }

      emailBody += `WHAT'S INCLUDED:
✅ Professional consultation and planning
✅ High-quality materials and fixtures  
✅ Expert installation and craftsmanship
✅ Project management and coordination
✅ Quality assurance and warranty

ATTACHED DOCUMENTS:
`;
      
      pdfFiles.forEach(pdf => {
        emailBody += `📋 ${pdf.name} (${pdf.filename})
`;
      });

      emailBody += `
NEXT STEPS:
This quote is valid for 30 days. To proceed:
• Review the attached documents
• Contact us to discuss timeline and design options
• Schedule a consultation for permits and approvals
• Discuss payment terms and project start date

We look forward to transforming your bathroom into the space of your dreams!

Best regards,
${userProfile.company_name}
${userProfile.contact_name}
${userProfile.phone}
${userProfile.email}

---
Generated by Bathroom Quote Saver.AI - Professional AI-Powered Quoting System`;

      // Check if Web Share API is supported (works great on iOS)
      if (navigator.share && navigator.canShare) {
        // Convert blobs to File objects for sharing
        const filesToShare = pdfFiles.map(pdf => new File([pdf.blob], pdf.filename, { type: 'application/pdf' }));
        
        const shareData = {
          title: subject,
          text: emailBody,
          files: filesToShare
        };

        // Check if files can be shared
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            toast.success('Email shared successfully with attachments!');
            
            // Close dialog
            setEmailDialogOpen(false);
            return;
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Web Share API failed:', error);
            }
            // Fall through to mailto approach
          }
        }
      }

      // Fallback: Create downloadable files and open mailto
      pdfFiles.forEach(pdfFile => {
        const url = window.URL.createObjectURL(pdfFile.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfFile.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      // Open email client with content
      const mailtoLink = `mailto:${formData.clientInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      
      toast.success(
        `${pdfFiles.length} PDF${pdfFiles.length !== 1 ? 's' : ''} downloaded! Email app opened. Please attach the downloaded files and send.`
      );
      
      // Close dialog after a delay
      setTimeout(() => {
        document.querySelector('[data-state="open"] button[aria-label="Close"]')?.click();
      }, 2000);
      
    } catch (error) {
      console.error('Error preparing email:', error);
      toast.error('Failed to prepare email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Load saved projects
  const loadSavedProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setSavedProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Save Current Project
  const saveCurrentProject = async () => {
    if (!quote || !quote.id) {
      toast.error('No quote to save. Please generate a quote first.');
      return;
    }

    try {
      const projectName = `${formData.clientInfo.name || 'Client'} - ${new Date().toLocaleDateString()}`;
      const saveData = {
        project_name: projectName,
        client_name: formData.clientInfo.name || 'Unknown Client',
        category: 'Residential',
        request_data: {
          client_info: formData.clientInfo,
          room_measurements: formData.roomMeasurements,
          components: formData.components,
          detailed_components: formData.components,
          task_options: taskOptions,
          additional_notes: formData.additionalNotes
        },
        quote_id: quote.id,
        created_at: new Date().toISOString(),
        total_cost: getTotalAdjustedCost() || quote.total_cost
      };

      await axios.post(`${API}/projects/save`, saveData);
      await loadSavedProjects(); // Refresh the list
      toast.success(`Project saved as "${projectName}"`);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    }
  };

  // Start New Quote - Auto-save current and reset form
  const startNewQuote = async () => {
    try {
      // If there's a current quote, auto-save it
      if (quote && quote.id) {
        const projectName = `Auto-saved Quote ${new Date().toLocaleDateString()} - ${formData.clientInfo.name}`;
        const saveData = {
          project_name: projectName,
          client_name: formData.clientInfo.name || 'Unknown Client',
          category: 'Residential',
          request_data: {
            client_info: formData.clientInfo,
            room_measurements: formData.roomMeasurements,
            components: formData.components,
            detailed_components: formData.components,
            task_options: taskOptions,
            additional_notes: formData.additionalNotes
          },
          quote_id: quote.id,
          created_at: new Date().toISOString(),
          total_cost: getTotalAdjustedCost() || quote.total_cost
        };

        await axios.post(`${API}/projects/save`, saveData);
        toast.success(`Current quote auto-saved as "${projectName}"`);
      }

      // Reset form to fresh state
      setFormData({
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
          demolition: { enabled: false, subtasks: { removal_internal_ware: false, removal_wall_linings: false, removal_ceiling_linings: false, removal_ground_tiles_screed: false, removal_old_substrate: false, supply_skip_bin: false, asbestos_removal: false } },
          framing: { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, additional_costs_allowance: false } },
          plumbing_rough_in: { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
          electrical_rough_in: { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
          plastering: { enabled: false, subtasks: { supply_install_ceiling_sheets: false, supply_install_wall_sheets: false, supply_compounds_finishing: false, top_coat_ceilings: false, supply_install_cornice: false } },
          waterproofing: { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
          tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_skirt_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
          shower_screens: { enabled: false, subtasks: { fixed_panel_install: false, frameless_shower_enclosure: false, semi_frameless_shower_enclosure: false, shower_curtain: false } },
          pc_items_tile_supply: { enabled: false, subtasks: { pc_items_vanity_basin: false, pc_items_toilet_cistern: false, pc_items_shower_screen: false, pc_items_tapware: false, pc_items_lighting: false, pc_items_mirror_cabinet: false, pc_items_accessories: false, tiles_supply_coordination: false } },
          fit_off: { enabled: false, subtasks: { accessories_install: false, site_clean: false, builders_clean: false, painting: false } }
        },
        additionalNotes: ''
      });

      // Reset quote and adjustment states
      setQuote(null);
      setAdjustedCosts({});
      setAdjustmentMode(false);
      setExpandedComponents({});
      
      // Reset task options to defaults
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
        wall_tile_size: '300x300mm',
        feature_tile_grade: 'premium',
        vanity_grade: 'standard',
        toilet_grade: 'standard', 
        shower_screen_grade: 'standard',
        tapware_grade: 'standard',
        lighting_grade: 'standard',
        mirror_grade: 'standard',
        tiles_supply_grade: 'standard'
      });

      // Reload saved projects to show the newly saved one
      await loadSavedProjects();
      
      toast.success('Ready for new quote! Fresh form loaded.');
      
    } catch (error) {
      console.error('Error starting new quote:', error);
      toast.error('Failed to start new quote. Please try again.');
    }
  };

  // Filter projects
  const filteredProjects = savedProjects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Load projects on component mount
  React.useEffect(() => {
    loadSavedProjects();
  }, []);

  // Load user profile from localStorage
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);


  // PWA Installation Effect  
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      toast.success('App installed successfully! 🎉');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Installing app...');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Project Management Functions
  const fetchSavedProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setSavedProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchProjectCategories = async () => {
    try {
      const response = await axios.get(`${API}/projects/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Duplicate function removed

  const loadProject = async (projectId) => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/quote`);
      const { project, quote: loadedQuote, request } = response.data;
      
      if (request) {
        // Load client information into formData
        setFormData(prev => ({
          ...prev,
          clientInfo: request.client_info || {
            name: '',
            email: '',
            phone: '',
            address: ''
          },
          additionalNotes: request.additional_notes || ''
        }));

        // Determine if this is a multi-area or single-area project
        const isMultiArea = request.area_name || request.area_type;
        
        if (isMultiArea) {
          // Handle multi-area project loading
          // For now, create a single area from the loaded data
          // TODO: In future, support loading multiple areas from saved projects
          const loadedArea = {
            id: request.area_id || 'loaded_area',
            name: request.area_name || 'Loaded Area',
            type: request.area_type || 'bathroom',
            measurements: {
              length: (request.room_measurements.length * 1000).toString(),
              width: (request.room_measurements.width * 1000).toString(),
              height: (request.room_measurements.height * 1000).toString()
            },
            components: request.detailed_components || request.components || {},
            taskOptions: request.task_options || {
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
              wall_tile_size: '300x300mm',
              feature_tile_grade: 'premium',
              vanity_grade: 'standard',
              toilet_grade: 'standard',
              shower_screen_grade: 'standard',
              tapware_grade: 'standard',
              lighting_grade: 'standard',
              mirror_grade: 'standard',
              tiles_supply_grade: 'standard'
            },
            additionalNotes: request.additional_notes || '',
            quote: loadedQuote
          };

          // Replace the current project areas with the loaded area
          setProjectAreas([loadedArea]);
          setCurrentAreaIndex(0);
        } else {
          // Handle legacy single-area project loading
          const legacyArea = {
            id: 'loaded_legacy',
            name: 'Main Bathroom',
            type: 'bathroom',
            measurements: {
              length: (request.room_measurements.length * 1000).toString(),
              width: (request.room_measurements.width * 1000).toString(),
              height: (request.room_measurements.height * 1000).toString()
            },
            components: request.detailed_components || request.components || {},
            taskOptions: request.task_options || {
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
              wall_tile_size: '300x300mm',
              feature_tile_grade: 'premium',
              vanity_grade: 'standard',
              toilet_grade: 'standard',
              shower_screen_grade: 'standard',
              tapware_grade: 'standard',
              lighting_grade: 'standard',
              mirror_grade: 'standard',
              tiles_supply_grade: 'standard'
            },
            additionalNotes: request.additional_notes || '',
            quote: loadedQuote
          };

          // Replace the current project areas with the loaded legacy area
          setProjectAreas([legacyArea]);
          setCurrentAreaIndex(0);
        }

        // Ensure components have the correct structure while preserving loaded states
        setProjectAreas(prev => prev.map(area => {
          const currentComponents = area.components || {};
          return {
            ...area,
            components: {
              demolition: currentComponents.demolition || { enabled: false, subtasks: { removal_internal_ware: false, removal_wall_linings: false, removal_ceiling_linings: false, removal_ground_tiles_screed: false, removal_old_substrate: false, supply_skip_bin: false, asbestos_removal: false } },
              framing: currentComponents.framing || { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, additional_costs_allowance: false } },
              plumbing_rough_in: currentComponents.plumbing_rough_in || { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
              electrical_rough_in: currentComponents.electrical_rough_in || { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
              plastering: currentComponents.plastering || { enabled: false, subtasks: { supply_install_ceiling_sheets: false, supply_install_wall_sheets: false, supply_compounds_finishing: false, top_coat_ceilings: false, supply_install_cornice: false } },
              waterproofing: currentComponents.waterproofing || { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
              tiling: currentComponents.tiling || { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_skirt_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
              shower_screens: currentComponents.shower_screens || { enabled: false, subtasks: { fixed_panel_install: false, frameless_shower_enclosure: false, semi_frameless_shower_enclosure: false, shower_curtain: false } },
              pc_items_tile_supply: currentComponents.pc_items_tile_supply || { enabled: false, subtasks: { pc_items_vanity_basin: false, pc_items_toilet_cistern: false, pc_items_shower_screen: false, pc_items_tapware: false, pc_items_lighting: false, pc_items_mirror_cabinet: false, pc_items_accessories: false, tiles_supply_coordination: false } },
              fit_off: currentComponents.fit_off || { enabled: false, subtasks: { accessories_install: false, site_clean: false, builders_clean: false, painting: false } }
            }
          };
        }));
      }
      
      setQuote(loadedQuote);
      setSidebarOpen(false);
      toast.success(`Project loaded successfully: ${project.project_name}`);
      
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      await axios.put(`${API}/projects/${projectId}`, updates);
      toast.success('Project updated successfully!');
      fetchSavedProjects();
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const testDeleteFirstProject = async () => {
    try {
      console.log('Testing delete functionality...');
      const projects = await axios.get(`${API}/projects`);
      console.log('Projects retrieved:', projects.data.length);
      
      if (projects.data.length > 0) {
        const firstProjectId = projects.data[0].id;
        console.log('Deleting project:', firstProjectId);
        
        const response = await axios.delete(`${API}/projects/${firstProjectId}`);
        console.log('Delete response:', response.data);
        
        fetchSavedProjects(); // Refresh the list
        toast.success('TEST: Project deleted successfully!');
      } else {
        toast.info('No projects to delete');
      }
    } catch (error) {
      console.error('TEST Delete error:', error);
      toast.error('TEST: Delete failed - ' + error.message);
    }
  };

  const deleteProject = async (projectId) => {
    console.log('deleteProject called with ID:', projectId);
    
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      console.log('Delete cancelled by user');
      return;
    }
    
    // Prevent duplicate requests by checking if we're already deleting this project
    if (deleteProject.deleting === projectId) {
      console.log('Delete already in progress for project:', projectId);
      return;
    }
    
    try {
      // Mark as deleting to prevent duplicates
      deleteProject.deleting = projectId;
      
      console.log('Making API call to delete project:', projectId);
      const response = await axios.delete(`${API}/projects/${projectId}`);
      console.log('Delete API response:', response.data);
      
      toast.success('Project deleted successfully');
      fetchSavedProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error.response?.status === 404) {
        toast.info('Project was already deleted');
        fetchSavedProjects(); // Refresh to show current state
      } else {
        toast.error('Failed to delete project');
      }
    } finally {
      // Clear the deleting flag
      delete deleteProject.deleting;
    }
  };

  // Project selection functions
  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    const filteredProjectIds = filteredProjects.map(p => p.id);
    setSelectedProjects(prev => 
      prev.length === filteredProjectIds.length 
        ? [] // Deselect all if all are selected
        : filteredProjectIds // Select all
    );
  };

  const deleteSelectedProjects = async () => {
    if (selectedProjects.length === 0) {
      toast.error('No projects selected');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} selected projects? This cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting selected projects:', selectedProjects);
      
      // Delete all selected projects in parallel
      await Promise.all(selectedProjects.map(projectId => 
        axios.delete(`${API}/projects/${projectId}`)
      ));
      
      toast.success(`Successfully deleted ${selectedProjects.length} projects`);
      setSelectedProjects([]); // Clear selection
      fetchSavedProjects(); // Refresh the list
    } catch (error) {
      console.error('Error deleting selected projects:', error);
      toast.error('Failed to delete some projects');
      fetchSavedProjects(); // Refresh to show current state
    }
  };

  const clearDraftProjects = async () => {
    if (!window.confirm('Are you sure you want to delete all draft projects with $0 cost? This cannot be undone.')) {
      return;
    }

    try {
      const draftProjects = savedProjects.filter(project => project.total_cost === 0 || project.category === 'Draft');
      
      if (draftProjects.length === 0) {
        toast.info('No draft projects to delete');
        return;
      }

      // Delete all draft projects
      await Promise.all(draftProjects.map(project => 
        axios.delete(`${API}/projects/${project.id}`)
      ));
      
      toast.success(`Deleted ${draftProjects.length} draft projects successfully`);
      fetchSavedProjects();
    } catch (error) {
      console.error('Error clearing drafts:', error);
      toast.error('Failed to clear draft projects');
    }
  };

  // Auto-save functionality
  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('bathroom_quote_draft', JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('bathroom_quote_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load if saved within last 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('bathroom_quote_draft');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const saveDraftProject = async () => {
    if (!formData.clientInfo.name) {
      toast.error('Please enter client name first');
      return;
    }

    const draftName = `DRAFT: ${formData.clientInfo.name} - ${new Date().toLocaleDateString()}`;
    
    try {
      // Create a mock quote for draft saving
      const draftQuote = {
        id: `draft_${Date.now()}`,
        request_id: `draft_req_${Date.now()}`,
        total_cost: 0,
        cost_breakdown: [],
        ai_analysis: 'Draft project - not yet estimated',
        confidence_level: 'Draft',
        created_at: new Date().toISOString()
      };

      // Save draft request data
      const draftRequest = {
        id: draftQuote.request_id,
        client_info: formData.clientInfo,
        room_measurements: {
          length: parseFloat(formData.roomMeasurements.length) / 1000 || 0,
          width: parseFloat(formData.roomMeasurements.width) / 1000 || 0,
          height: parseFloat(formData.roomMeasurements.height) / 1000 || 0
        },
        components: {},
        detailed_components: formData.components,
        task_options: taskOptions,
        additional_notes: formData.additionalNotes,
        created_at: new Date().toISOString()
      };

      // Store both in database
      await axios.post(`${API}/quotes/save-draft`, {
        quote: draftQuote,
        request: draftRequest
      });

      const projectData = {
        project_name: draftName,
        category: 'Draft',
        quote_id: draftQuote.id,
        client_name: formData.clientInfo.name,
        total_cost: 0,
        notes: 'Draft project - incomplete form data saved'
      };

      await axios.post(`${API}/projects/save`, projectData);
      
      // Clear auto-save after successful draft save
      clearLocalStorage();
      
      toast.success(`Draft saved: ${draftName}`);
      fetchSavedProjects();
      
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft project');
    }
  };

  // Auto-save form data as user types (debounced)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage({
        formData,
        taskOptions,
        userProfile
      });
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData, taskOptions, userProfile]);

  // Google Maps Address Functions
  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      // Using a free geocoding service (you can replace with Google Places API if you have a key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=au&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      const suggestions = data.map(item => ({
        display_name: item.display_name,
        formatted_address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        place_id: item.place_id
      }));

      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Error searching addresses:', error);
    }
  };

  const selectAddress = (address) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      clientInfo: {
        ...prev.clientInfo,
        address: address.formatted_address
      }
    }));
    setShowAddressSuggestions(false);
    toast.success('Address selected with GPS coordinates');
  };

  const openDirections = () => {
    if (selectedAddress) {
      // Open Google Maps with coordinates for precise navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedAddress.lat},${selectedAddress.lng}`;
      window.open(url, '_blank');
    } else if (formData.clientInfo.address) {
      // Fallback to address string
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formData.clientInfo.address)}`;
      window.open(url, '_blank');
    } else {
      toast.error('Please enter project address first');
    }
  };

  // Debounced address search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.clientInfo.address && !selectedAddress) {
        searchAddresses(formData.clientInfo.address);
      }
    }, 500); // Search after 500ms of typing

    return () => clearTimeout(timeoutId);
  }, [formData.clientInfo.address, selectedAddress]);

  // Load saved draft on component mount
  React.useEffect(() => {
    fetchSavedProjects();
    fetchProjectCategories();
    
    // Load draft data if available
    const savedDraft = loadFromLocalStorage();
    if (savedDraft) {
      setFormData(savedDraft.formData || formData);
      setTaskOptions(savedDraft.taskOptions || taskOptions);
      setUserProfile(savedDraft.userProfile || userProfile);
      toast.info('Draft data restored from previous session', {
        action: {
          label: 'Clear',
          onClick: () => {
            clearLocalStorage();
            window.location.reload();
          },
        },
      });
    }
  }, []);

  // Force calculation updates when projectAreas change (for loaded projects)
  React.useEffect(() => {
    // Trigger re-render of calculation components when projectAreas change
    // This ensures calculations update when projects are loaded
    if (projectAreas && projectAreas.length > 0) {
      const currentArea = projectAreas[currentAreaIndex];
      if (currentArea?.measurements?.length && currentArea?.measurements?.width) {
        // Create a small state update to force component re-render without infinite loops
        const timeoutId = setTimeout(() => {
          // This prevents infinite loops by using a timeout
          setProjectAreas(prev => [...prev]);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [projectAreas.length, currentAreaIndex]); // Only trigger on area count or index changes

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

  // Sidebar Navigation
  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Home', description: 'Dashboard & Overview' },
    { id: 'new-quote', icon: PlusCircle, label: 'New Quote', description: 'Create Quote' },
    { id: 'saved-projects', icon: FolderOpen, label: 'Saved Projects', description: 'Manage Projects' },
    { id: 'profile', icon: Settings, label: 'Profile', description: 'Business Settings' },
  ];

  const renderSidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200`}>
      <div className="p-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg text-gray-900">Quote Saver</h1>
              <p className="text-xs text-gray-600">AI Powered</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
        >
          {sidebarCollapsed ? <ChevronDown className="w-4 h-4 rotate-90" /> : <X className="w-4 h-4" />}
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Render different views based on currentView
  const renderContractsView = () => {
    const handleContractFormChange = (field, value) => {
      setContractForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const generateStandaloneContract = async () => {
      if (!contractForm.clientName || !contractForm.clientEmail || !contractForm.totalPrice) {
        toast.error('Please fill in all required fields');
        return;
      }

      setGeneratingContract(true);
      
      try {
        // Create quote request
        const quoteResponse = await axios.post(`${API}/quotes/request`, {
          client_info: {
            name: contractForm.clientName,
            email: contractForm.clientEmail,
            phone: contractForm.clientPhone,
            address: contractForm.clientAddress
          },
          room_measurements: {
            length: 3.5,
            width: 2.5,
            height: 2.4
          },
          components: {
            demolition: true,
            tiling: true
          },
          additional_notes: contractForm.projectDescription || 'Complete bathroom renovation'
        });

        // Get the actual quote ID from the response
        const quoteId = quoteResponse.data.quote_id || quoteResponse.data.id;

        // Prepare contractor info from user profile
        const contractorInfo = {
          contractor_name: userProfile.company_name || 'Bathroom Renovations Pty Ltd',
          contractor_abn: userProfile.abn_acn || '',
          contractor_license: userProfile.license_number || '',
          contractor_address: `${userProfile.business_address}${userProfile.city ? ', ' + userProfile.city : ''}${userProfile.state ? ' ' + userProfile.state : ''}${userProfile.postal_code ? ' ' + userProfile.postal_code : ''}`,
          contractor_email: userProfile.email || '',
          contractor_phone: userProfile.phone || '',
          contractor_contact: userProfile.contact_name || ''
        };

        // Generate contract using the real quote ID and profile data
        const contractResponse = await axios.post(`${API}/contracts/generate`, {
          quote_id: quoteId,
          start_date: contractForm.startDate,
          completion_days: parseInt(contractForm.completionDays),
          contractor_info: contractorInfo,
          total_price_override: parseFloat(contractForm.totalPrice),
          custom_notes: contractForm.projectDescription,
          custom_payment_schedule: contractForm.paymentSchedule,
          client_info: {
            name: contractForm.clientName,
            email: contractForm.clientEmail,
            phone: contractForm.clientPhone,
            address: contractForm.clientAddress
          }
        }, {
          responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([contractResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contract_${contractForm.clientName.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success('Contract generated successfully!');
        setPreviewContract(true);
      } catch (error) {
        console.error('Error generating contract:', error);
        toast.error('Failed to generate contract: ' + (error.response?.data?.detail || error.message));
      } finally {
        setGeneratingContract(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Contract Generator
              </h2>
              <p className="text-gray-600 text-sm mt-1">Generate contracts independently or review contract terms and conditions</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Australia-Wide</Badge>
          </div>

          {/* Contract Form */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractClientName">Client Name *</Label>
                    <Input
                      id="contractClientName"
                      value={contractForm.clientName}
                      onChange={(e) => handleContractFormChange('clientName', e.target.value)}
                      placeholder="John Smith"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractClientEmail">Email *</Label>
                    <Input
                      id="contractClientEmail"
                      type="email"
                      value={contractForm.clientEmail}
                      onChange={(e) => handleContractFormChange('clientEmail', e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractClientPhone">Phone</Label>
                    <Input
                      id="contractClientPhone"
                      value={contractForm.clientPhone}
                      onChange={(e) => handleContractFormChange('clientPhone', e.target.value)}
                      placeholder="02-1234-5678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contractClientAddress">Project Address *</Label>
                    <Input
                      id="contractClientAddress"
                      value={contractForm.clientAddress}
                      onChange={(e) => handleContractFormChange('clientAddress', e.target.value)}
                      placeholder="123 Main Street, Sydney NSW 2000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">Project Details</h3>
                <div>
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <textarea
                    id="projectDescription"
                    value={contractForm.projectDescription}
                    onChange={(e) => handleContractFormChange('projectDescription', e.target.value)}
                    placeholder="Complete bathroom renovation including demolition, plumbing, tiling, and fit-off..."
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalPrice">Total Contract Price ($) *</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      value={contractForm.totalPrice}
                      onChange={(e) => handleContractFormChange('totalPrice', e.target.value)}
                      placeholder="25000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">GST Included</p>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractForm.startDate}
                      onChange={(e) => handleContractFormChange('startDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completionDays">Completion Period (days) *</Label>
                    <Input
                      id="completionDays"
                      type="number"
                      value={contractForm.completionDays}
                      onChange={(e) => handleContractFormChange('completionDays', e.target.value)}
                      placeholder="30"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Schedule Preview */}
              {contractForm.totalPrice && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-900">Payment Schedule</h3>
                    <Badge className="bg-blue-100 text-blue-800">Customizable</Badge>
                  </div>
                  <div className="space-y-3">
                    {contractForm.paymentSchedule.map((stage, index) => (
                      <div key={stage.stage} className="bg-white p-3 rounded-md border border-blue-200">
                        {editingStage === index ? (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Stage Description</Label>
                              <Input
                                value={stage.description}
                                onChange={(e) => {
                                  const newSchedule = [...contractForm.paymentSchedule];
                                  newSchedule[index].description = e.target.value;
                                  setContractForm(prev => ({ ...prev, paymentSchedule: newSchedule }));
                                }}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                <Label className="text-xs">Percentage (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={stage.percentage}
                                  onChange={(e) => {
                                    const newSchedule = [...contractForm.paymentSchedule];
                                    newSchedule[index].percentage = parseFloat(e.target.value) || 0;
                                    setContractForm(prev => ({ ...prev, paymentSchedule: newSchedule }));
                                  }}
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex gap-1 mt-5">
                                <Button
                                  size="sm"
                                  onClick={() => setEditingStage(null)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-sm">{stage.stage}. {stage.description}</span>
                              <span className="ml-2 text-blue-600 font-semibold">({stage.percentage}%)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-sm">
                                ${(parseFloat(contractForm.totalPrice) * stage.percentage / 100).toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStage(index)}
                                className="h-7 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-blue-200 pt-2 flex justify-between items-center font-bold bg-white p-3 rounded-md">
                      <span>Total</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${contractForm.paymentSchedule.reduce((sum, s) => sum + s.percentage, 0) !== 100 ? 'text-red-600' : 'text-green-600'}`}>
                          ({contractForm.paymentSchedule.reduce((sum, s) => sum + s.percentage, 0)}%)
                        </span>
                        <span>${parseFloat(contractForm.totalPrice).toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    {contractForm.paymentSchedule.reduce((sum, s) => sum + s.percentage, 0) !== 100 && (
                      <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
                        ⚠️ Warning: Total percentage must equal 100%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contract Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Contract Terms & Conditions</p>
                    <p>This contract includes 33 clauses covering Australian building industry standards, including:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                      <li>Contractor and client obligations</li>
                      <li>Payment terms and schedule</li>
                      <li>Statutory warranties (Home Building Act compliance)</li>
                      <li>Insurance requirements ($10M public liability)</li>
                      <li>Variation procedures</li>
                      <li>Dispute resolution</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={generateStandaloneContract}
                  disabled={generatingContract || !contractForm.clientName || !contractForm.clientEmail || !contractForm.totalPrice}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {generatingContract ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate & Download Contract
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setContractForm({
                      clientName: '',
                      clientEmail: '',
                      clientPhone: '',
                      clientAddress: '',
                      projectDescription: '',
                      totalPrice: '',
                      startDate: new Date().toISOString().split('T')[0],
                      completionDays: 30
                    });
                    setPreviewContract(null);
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Contract Preview Info */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              What's Included in Your Contract
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Professional contract header with reference number</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Complete client and contractor details</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Detailed scope of works description</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Australian standard payment schedule (10/40/30/20)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Project timeline and completion dates</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>33 comprehensive terms and conditions</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Signature blocks for both parties</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Professional PDF format ready to print</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Load contracts function
  const loadContracts = async () => {
    setLoadingContracts(true);
    try {
      const response = await axios.get(`${API}/contracts/list`);
      setSavedContracts(response.data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoadingContracts(false);
    }
  };

  // Render Saved Contracts View
  const renderSavedContractsView = () => {
    const updateContractStatus = async (contractId, newStatus) => {
      try {
        await axios.patch(`${API}/contracts/${contractId}/status`, { status: newStatus });
        toast.success(`Contract ${newStatus}!`);
        loadContracts(); // Reload list
      } catch (error) {
        console.error('Error updating contract status:', error);
        toast.error('Failed to update contract status');
      }
    };

    const downloadContract = async (contractId) => {
      try {
        const response = await axios.get(`${API}/contracts/${contractId}/download`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contract_${contractId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Contract downloaded!');
      } catch (error) {
        console.error('Error downloading contract:', error);
        toast.error('Failed to download contract');
      }
    };

    const deleteContract = async (contractId) => {
      if (!window.confirm('Are you sure you want to delete this contract?')) return;
      
      try {
        await axios.delete(`${API}/contracts/${contractId}`);
        toast.success('Contract deleted!');
        loadContracts();
      } catch (error) {
        console.error('Error deleting contract:', error);
        toast.error('Failed to delete contract');
      }
    };

    const getStatusBadge = (status) => {
      const statusConfig = {
        generated: { color: 'bg-gray-100 text-gray-800', label: 'Generated' },
        sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
        approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
        rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
      };
      const config = statusConfig[status] || statusConfig.generated;
      return (
        <Badge className={config.color}>{config.label}</Badge>
      );
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
                Saved Contracts
              </h2>
              <p className="text-gray-600 text-sm mt-1">View, manage, and approve generated contracts</p>
            </div>
            <Button onClick={loadContracts} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loadingContracts ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 mt-2">Loading contracts...</p>
            </div>
          ) : savedContracts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No contracts generated yet</p>
              <Button 
                onClick={() => setCurrentView('contracts')}
                className="mt-4"
              >
                Generate Your First Contract
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Contract #{contract.contract_number || contract.id.substring(0, 8)}
                          </h3>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Client:</span>
                            <span className="ml-2 font-medium">{contract.client_info?.name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <span className="ml-2 font-medium">${contract.total_price?.toLocaleString('en-AU', {minimumFractionDigits: 2})}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <span className="ml-2 font-medium">{contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <span className="ml-2 font-medium">{new Date(contract.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => downloadContract(contract.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        
                        {contract.status === 'generated' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateContractStatus(contract.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateContractStatus(contract.id, 'rejected')}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteContract(contract.id)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return renderHomeView();
      case 'new-quote':
        return renderQuoteForm();
      case 'saved-projects':
        return renderSavedProjectsView();
      case 'contracts':
        return renderContractsView();
      case 'saved-contracts':
        return renderSavedContractsView();
      case 'profile':
        return renderProfileView();
      default:
        return renderHomeView();
    }
  };

  // Home Dashboard View
  const renderHomeView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Home className="w-6 h-6 mr-2 text-blue-600" />
          Dashboard Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Projects</p>
                <p className="text-3xl font-bold">{savedProjects.length}</p>
              </div>
              <FolderOpen className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">AI Learning</p>
                <p className="text-3xl font-bold">Active</p>
              </div>
              <Award className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Profile Status</p>
                <p className="text-xl font-bold">Ready</p>
              </div>
              <User className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              startNewQuote();
              setCurrentView('new-quote');
            }}
            className="flex items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <PlusCircle className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-medium">Create New Quote</div>
              <div className="text-sm text-blue-100">Start a fresh bathroom renovation quote</div>
            </div>
          </button>
          <button
            onClick={() => setCurrentView('saved-projects')}
            className="flex items-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
          >
            <FolderOpen className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-medium">View Saved Projects</div>
              <div className="text-sm text-green-100">Manage and load existing quotes</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      {savedProjects.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {savedProjects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{project.project_name}</p>
                  <p className="text-sm text-gray-600">{project.client_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${formatCurrency(project.total_cost || 0)}</p>
                  <p className="text-xs text-gray-500">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Profile Settings View
  const renderProfileView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          Business Profile Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Business Information</h3>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Company Name *</Label>
              <Input
                value={userProfile.company_name}
                onChange={(e) => setUserProfile({...userProfile, company_name: e.target.value})}
                placeholder="Your Company Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Contact Name *</Label>
              <Input
                value={userProfile.contact_name}
                onChange={(e) => setUserProfile({...userProfile, contact_name: e.target.value})}
                placeholder="Your Full Name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                  placeholder="02-1234-5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Website</Label>
              <Input
                value={userProfile.website}
                onChange={(e) => setUserProfile({...userProfile, website: e.target.value})}
                placeholder="www.yourwebsite.com"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">ABN/ACN</Label>
                <Input
                  value={userProfile.abn_acn}
                  onChange={(e) => setUserProfile({...userProfile, abn_acn: e.target.value})}
                  placeholder="12 345 678 901"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">License Number</Label>
                <Input
                  value={userProfile.license_number}
                  onChange={(e) => setUserProfile({...userProfile, license_number: e.target.value})}
                  placeholder="License #"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Business Address & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Business Address</h3>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Street Address</Label>
              <Input
                value={userProfile.business_address}
                onChange={(e) => setUserProfile({...userProfile, business_address: e.target.value})}
                placeholder="123 Business Street"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">City</Label>
                <Input
                  value={userProfile.city}
                  onChange={(e) => setUserProfile({...userProfile, city: e.target.value})}
                  placeholder="Sydney"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">State</Label>
                <Select
                  value={userProfile.state}
                  onValueChange={(value) => setUserProfile({...userProfile, state: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSW">NSW</SelectItem>
                    <SelectItem value="VIC">VIC</SelectItem>
                    <SelectItem value="QLD">QLD</SelectItem>
                    <SelectItem value="SA">SA</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                    <SelectItem value="TAS">TAS</SelectItem>
                    <SelectItem value="NT">NT</SelectItem>
                    <SelectItem value="ACT">ACT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Postal Code</Label>
              <Input
                value={userProfile.postal_code}
                onChange={(e) => setUserProfile({...userProfile, postal_code: e.target.value})}
                placeholder="2000"
                className="mt-1"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-6">Quote Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Quote Validity (Days)</Label>
                <Input
                  value={userProfile.quote_validity_days}
                  onChange={(e) => setUserProfile({...userProfile, quote_validity_days: e.target.value})}
                  placeholder="30"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Warranty Period</Label>
                <Input
                  value={userProfile.warranty_period}
                  onChange={(e) => setUserProfile({...userProfile, warranty_period: e.target.value})}
                  placeholder="12 months"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Terms</Label>
              <Textarea
                value={userProfile.payment_terms}
                onChange={(e) => setUserProfile({...userProfile, payment_terms: e.target.value})}
                placeholder="Payment required upon completion"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={() => {
              // Save to localStorage
              localStorage.setItem('userProfile', JSON.stringify(userProfile));
              toast.success('Profile settings saved successfully!');
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile Settings
          </Button>
        </div>
      </div>
    </div>
  );

  // Saved Projects View
  const renderSavedProjectsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
          Saved Projects ({savedProjects.length})
        </h2>
        
        {/* Project Management UI - This will use existing saved projects functionality */}
        <div className="grid gap-4">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No saved projects yet</p>
              <p className="text-gray-500 mb-6">Create your first quote to get started</p>
              <Button
                onClick={() => {
                  startNewQuote();
                  setCurrentView('new-quote');
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Quote
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{project.project_name}</h3>
                    <p className="text-gray-600">Client: {project.client_name}</p>
                    <p className="text-sm text-gray-500">Created: {new Date(project.created_at).toLocaleDateString()}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.category || 'Residential'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {project.request_data?.components ? Object.keys(project.request_data.components).filter(k => project.request_data.components[k]?.enabled).length : 0} components
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${formatCurrency(project.total_cost || 0)}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await axios.get(`${API}/projects/${project.id}/quote`);
                            const projectData = response.data;
                            
                            // RESTORE the original saved quote with the project's saved total cost
                            if (projectData.quote) {
                              console.log('=== DEBUGGING PROJECT DATA ===');
                              console.log('Full project data:', projectData);
                              console.log('Project total_cost:', projectData.project?.total_cost);
                              console.log('Quote total_cost:', projectData.quote?.total_cost);
                              console.log('Project object:', projectData.project);
                              console.log('Quote object:', projectData.quote);
                              
                              // Use the project's saved total cost (the displayed $23,200)
                              const savedProjectCost = project.total_cost; // Use the cost shown in the saved projects list
                              const restoredQuote = {
                                ...projectData.quote,
                                total_cost: savedProjectCost,
                                original_total_cost: savedProjectCost
                              };
                              
                              console.log('Restored quote with saved cost:', restoredQuote);
                              setQuote(restoredQuote);
                            } else {
                              setQuote(null);
                            }
                            setAdjustedCosts({});
                            setAdjustmentMode(false);
                            
                            // Load the project data into the form
                            const projectRequest = projectData.request_data || projectData.request;
                            if (projectRequest) {
                              // Convert components from boolean format to object format
                              const loadedComponents = {...formData.components}; // Start with default structure
                              
                              // If we have boolean format components, convert them
                              if (projectRequest.components) {
                                Object.keys(projectRequest.components).forEach(componentKey => {
                                  if (projectRequest.components[componentKey] === true) {
                                    loadedComponents[componentKey] = {
                                      ...loadedComponents[componentKey],
                                      enabled: true
                                    };
                                  }
                                });
                              }
                              
                              // If we have detailed components (object format), use them directly
                              if (projectRequest.detailed_components) {
                                Object.keys(projectRequest.detailed_components).forEach(componentKey => {
                                  if (projectRequest.detailed_components[componentKey]?.enabled) {
                                    loadedComponents[componentKey] = projectRequest.detailed_components[componentKey];
                                  }
                                });
                              }
                              
                              setFormData({
                                clientInfo: projectRequest.client_info || {
                                  name: '',
                                  email: '',
                                  phone: '',
                                  address: ''
                                },
                                roomMeasurements: projectRequest.room_measurements || {
                                  length: '',
                                  width: '',
                                  height: ''
                                },
                                components: loadedComponents,
                                additionalNotes: projectRequest.additional_notes || ''
                              });
                              
                              console.log('Converted components to object format:', loadedComponents);
                              
                              // Load task options
                              if (projectRequest.task_options) {
                                setTaskOptions(projectRequest.task_options);
                              }
                              
                              // Auto-expand components that were previously enabled so user can see/modify them
                              const enabledComponents = {};
                              const componentsData = projectRequest.components || projectRequest.detailed_components;
                              if (componentsData) {
                                Object.keys(componentsData).forEach(componentKey => {
                                  // Check both boolean format (components) and object format (detailed_components)
                                  if (componentsData[componentKey] === true || componentsData[componentKey]?.enabled) {
                                    enabledComponents[componentKey] = true;
                                  }
                                });
                              }
                              setExpandedComponents(enabledComponents);
                              
                              console.log('Loaded project components:', componentsData);
                              console.log('Expanded components:', enabledComponents);
                            }
                            
                            setCurrentView('new-quote');
                            toast.success(`Loaded project: ${project.project_name} - Ready for modification!`);
                          } catch (error) {
                            console.error('Error loading project:', error);
                            toast.error('Failed to load project');
                          }
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Load Project
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            await axios.delete(`${API}/projects/${project.id}`);
                            await loadSavedProjects(); // Refresh the list
                            toast.success('Project deleted successfully');
                          } catch (error) {
                            console.error('Error deleting project:', error);
                            toast.error('Failed to delete project');
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );


  // Contracts View - Standalone Contract Generation

  // Quote Form View (existing form content)
  const renderQuoteForm = () => {
    // If there's already a quote, show the quote results instead of the form
    if (quote) {
      return (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Multi-Area Quote Summary */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  {quote.area_quotes ? `Multi-Area Project Quote (${quote.areas_count} Areas)` : 'Renovation Quote Generated'}
                </CardTitle>
                <Button
                  onClick={() => {
                    setQuote(null);
                    setAdjustedCosts({});
                    setAdjustmentMode(false);
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  ← New Quote
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-4xl font-black text-green-600">
                    ${formatCurrency(getTotalAdjustedCost() || quote.total_cost || 0)}
                  </h3>
                  <p className="text-green-700 font-semibold">Total Project Cost</p>
                  <p className="text-green-500 text-xs">Professional renovation quote</p>
                </div>
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-3xl font-bold text-blue-600">
                    {calculateSquareMeters()} m²
                  </h3>
                  <p className="text-blue-700 font-semibold">Floor Area</p>
                  <p className="text-blue-500 text-xs">Calculated space</p>
                </div>
                <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <Badge
                    variant="outline"
                    className="text-lg p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                  >
                    High Confidence
                  </Badge>
                  <p className="text-purple-700 font-semibold mt-2">AI Accuracy</p>
                  <p className="text-purple-600 text-xs">Professional estimate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Cost Breakdown</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setAdjustmentMode(!adjustmentMode)}
                    variant="outline"
                    className={adjustmentMode ? "bg-blue-600 text-white" : ""}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {adjustmentMode ? 'Exit Edit Mode' : 'Adjust Costs'}
                  </Button>
                </div>
              </div>
              {adjustmentMode && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <Button onClick={submitAdjustments} size="sm" className="bg-green-600 hover:bg-green-700">
                      Save Adjustments
                    </Button>
                    <Button 
                      onClick={() => {
                        setAdjustedCosts({});
                        setAdjustmentMode(false);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>AI Learning:</strong> When you save cost adjustments, our AI learns your pricing preferences to provide more accurate quotes in future projects.
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {quote.cost_breakdown.map((item, index) => {
                  const hasCurrentAdjustment = adjustedCosts[index] !== undefined;
                  const hasSavedAdjustment = item.adjusted_cost !== undefined;
                  const isAdjusted = hasCurrentAdjustment || hasSavedAdjustment;
                  
                  // Priority: current session adjustment > saved adjusted cost > estimated cost
                  let currentCost = item.estimated_cost;
                  if (hasCurrentAdjustment) {
                    currentCost = adjustedCosts[index];
                  } else if (hasSavedAdjustment) {
                    currentCost = item.adjusted_cost;
                  }
                  
                  return (
                    <div key={index} className={`border rounded-lg p-4 hover:bg-gray-50 ${isAdjusted && adjustmentMode ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h5 className="font-medium">{item.component}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          {adjustmentMode ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">$</span>
                              <Input
                                type="text"
                                value={adjustedCosts[index] !== undefined ? (adjustedCosts[index] === '' ? '' : adjustedCosts[index].toString()) : currentCost.toString()}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  
                                  // Allow empty field
                                  if (value === '') {
                                    handleCostAdjustment(index, '');
                                    return;
                                  }
                                  
                                  // Remove non-numeric characters except decimal point
                                  value = value.replace(/[^\d.]/g, '');
                                  
                                  // Ensure only one decimal point
                                  const parts = value.split('.');
                                  if (parts.length > 2) {
                                    value = parts[0] + '.' + parts.slice(1).join('');
                                  }
                                  
                                  // Limit to 2 decimal places
                                  if (parts[1] && parts[1].length > 2) {
                                    value = parts[0] + '.' + parts[1].substring(0, 2);
                                  }
                                  
                                  handleCostAdjustment(index, value);
                                }}
                                onFocus={(e) => {
                                  // Select all text when focused for easy editing
                                  e.target.select();
                                }}
                                onBlur={(e) => {
                                  // Format the number properly on blur if it's not empty
                                  const value = e.target.value;
                                  if (value !== '' && !isNaN(parseFloat(value))) {
                                    const formatted = parseFloat(value).toFixed(2);
                                    handleCostAdjustment(index, formatted);
                                  }
                                }}
                                className="w-32 text-right"
                                placeholder="0.00"
                              />
                            </div>
                          ) : (
                            <div>
                              <span className={`text-lg font-bold ${isAdjusted ? 'text-blue-600' : 'text-gray-900'}`}>
                                ${currentCost.toLocaleString()}
                              </span>
                              {isAdjusted && currentCost !== item.estimated_cost && (
                                <div className="text-xs text-gray-500 line-through">
                                  Original: ${(item.original_cost || item.estimated_cost).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ${formatCurrency(getTotalAdjustedCost())}
                  </span>
                </div>
                {(Object.keys(adjustedCosts).length > 0 || quote.cost_breakdown.some(item => item.adjusted_cost !== undefined)) && (
                  <div className="text-sm text-gray-600 mt-1">
                    {quote.original_total_cost ? (
                      <>
                        Original: ${formatCurrency(quote.original_total_cost)} 
                        <span className={`ml-2 ${getTotalAdjustedCost() > quote.original_total_cost ? 'text-red-600' : 'text-green-600'}`}>
                          ({getTotalAdjustedCost() > quote.original_total_cost ? '+' : ''}${formatCurrency(Math.abs(getTotalAdjustedCost() - quote.original_total_cost))})
                        </span>
                      </>
                    ) : (
                      <span className="text-blue-600 text-sm">✓ Cost adjustments applied</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quote Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setPdfDialogOpen(true)}
                  disabled={generatingPDF}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center"
                >
                  {generatingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate PDF
                </Button>

                <Button
                  onClick={() => setEmailDialogOpen(true)}
                  disabled={sendingEmail}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center justify-center"
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  Email Quote
                </Button>

                <Button
                  onClick={saveCurrentProject}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Project
                </Button>

                <Button
                  onClick={() => {
                    startNewQuote();
                    setCurrentView('new-quote');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  New Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show the quote form
    return (
      <div className="space-y-6">
        {/* Multi-Area Project Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building className="w-6 h-6 mr-2 text-blue-600" />
              Project Areas ({projectAreas.length})
            </h2>
            <button
              onClick={() => setShowAddAreaDialog(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Area
            </button>
          </div>

          {/* Area Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {projectAreas.map((area, index) => (
              <button
                key={area.id}
                onClick={() => setCurrentAreaIndex(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center ${
                  currentAreaIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl mr-2">{areaTypes.find(t => t.value === area.type)?.icon}</span>
                {area.name}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Currently Editing: {getCurrentArea()?.name}</h3>
                <p className="text-blue-600 text-sm">
                  Floor: {calculateSquareMeters()} m² • Wall: {calculateWallArea()} m²
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Mail className="w-6 h-6 mr-2" />
              Professional Project Details
            </CardTitle>
            <p className="text-blue-100 text-sm">Complete the form below for your personalized AI-generated quote</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientInfo.phone}
                      onChange={(e) => handleInputChange('clientInfo', 'phone', e.target.value)}
                      placeholder="02-1234-5678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Address</Label>
                    <Input
                      id="clientAddress"
                      value={formData.clientInfo.address}
                      onChange={(e) => handleInputChange('clientInfo', 'address', e.target.value)}
                      placeholder="123 Main Street, Sydney NSW 2000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Room Measurements */}
              <div className="space-y-6 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg mr-3">
                      <Ruler className="w-5 h-5 text-white" />
                    </div>
                    Room Measurements
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="length">Length (mm) *</Label>
                    <Input
                      id="length"
                      value={formData.roomMeasurements.length}
                      onChange={(e) => handleInputChange('roomMeasurements', 'length', e.target.value)}
                      placeholder="3500"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (mm) *</Label>
                    <Input
                      id="width"
                      value={formData.roomMeasurements.width}
                      onChange={(e) => handleInputChange('roomMeasurements', 'width', e.target.value)}
                      placeholder="2500"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (mm) *</Label>
                    <Input
                      id="height"
                      value={formData.roomMeasurements.height}
                      onChange={(e) => handleInputChange('roomMeasurements', 'height', e.target.value)}
                      placeholder="2400"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Calculated Areas</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Floor Area:</span>
                      <span className="font-bold text-green-700 ml-2">{calculateSquareMeters()} m²</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Wall Area:</span>
                      <span className="font-bold text-green-700 ml-2">{calculateWallArea()} m²</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Perimeter:</span>
                      <span className="font-bold text-orange-600 ml-2">{calculatePerimeter()} m</span>
                      <div className="text-xs text-orange-500 mt-1">For skirt tiles @ $35/m</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renovation Components */}
              <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg mr-3">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    Renovation Components
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(componentLabels).map(([key, label]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-lg border border-purple-200/50">
                        <Checkbox
                          id={key}
                          checked={formData.components[key]?.enabled || false}
                          onCheckedChange={(checked) => handleFormComponentToggle(key, checked)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <Label htmlFor={key} className="text-lg font-semibold text-gray-800 cursor-pointer flex-1">
                          {label}
                        </Label>
                        {formData.components[key]?.enabled && (
                          <button
                            type="button"
                            onClick={() => toggleExpandedComponent(key)}
                            className="text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {expandedComponents[key] ? (
                              <>
                                <ChevronDown className="w-5 h-5 rotate-180 transition-transform" />
                                <span className="sr-only">Collapse Details</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5 transition-transform" />
                                <span className="sr-only">Expand Details</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Detailed subtasks for expanded components */}
                      {formData.components[key]?.enabled && expandedComponents[key] && (
                        <div className="ml-6 space-y-2 bg-white/40 p-4 rounded-lg border border-purple-100">
                          <p className="text-sm text-purple-700 font-medium mb-3">Select specific {label.toLowerCase()} tasks:</p>
                          <div className="space-y-2">
                            {Object.entries(subtaskLabels[key] || {}).map(([subtaskKey, subtaskLabel]) => (
                              <div key={subtaskKey} className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`${key}_${subtaskKey}`}
                                    checked={formData.components[key]?.subtasks?.[subtaskKey] || false}
                                    onCheckedChange={(checked) => handleFormSubtaskToggle(key, subtaskKey, checked)}
                                    className="mt-1 data-[state=checked]:bg-purple-500"
                                  />
                                  <Label htmlFor={`${key}_${subtaskKey}`} className="text-sm text-gray-700 cursor-pointer flex-1 leading-5">
                                    {subtaskLabel}
                                  </Label>
                                </div>
                                
                                {/* Task Options Dropdowns - Show when subtask is selected */}
                                {formData.components[key]?.subtasks?.[subtaskKey] && (
                                  <div className="ml-6 space-y-2">
                                    
                                    {/* Demolition - Skip Bin Size */}
                                    {subtaskKey === 'supply_skip_bin' && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Bin Size:</Label>
                                        <Select
                                          value={taskOptions.skip_bin_size || '6 meter bin'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, skip_bin_size: value}))}
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
                                          value={taskOptions.build_niches_quantity?.toString() || '1'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, build_niches_quantity: parseInt(value)}))}
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
                                          value={taskOptions.swing_door_size || '720mm'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, swing_door_size: value}))}
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
                                          value={taskOptions.cavity_sliding_size || '720mm'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, cavity_sliding_size: value}))}
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

                                    {/* Framing - Additional Costs Amount */}
                                    {subtaskKey === 'additional_costs_allowance' && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Amount ($):</Label>
                                        <Input
                                          type="number"
                                          value={taskOptions.minor_costs_amount || 0}
                                          onChange={(e) => setTaskOptions(prev => ({...prev, minor_costs_amount: parseFloat(e.target.value) || 0}))}
                                          className="h-8 w-24"
                                          min="0"
                                          step="100"
                                        />
                                      </div>
                                    )}

                                    {/* Plumbing - Water Feeds Type */}
                                    {subtaskKey === 'water_feeds_quantity' && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Feed Type:</Label>
                                        <Select
                                          value={taskOptions.water_feeds_type || 'single'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, water_feeds_type: value}))}
                                        >
                                          <SelectTrigger className="h-8 w-28">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="single">Single Feed</SelectItem>
                                            <SelectItem value="double">Double Feed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* Electrical - Power Points Quantity */}
                                    {subtaskKey === 'power_points_quantity' && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Quantity:</Label>
                                        <Select
                                          value={taskOptions.power_points_quantity?.toString() || '1'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, power_points_quantity: parseInt(value)}))}
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

                                    {/* Plastering - Plasterboard Grade */}
                                    {(subtaskKey === 'supply_install_ceiling_sheets' || subtaskKey === 'supply_install_wall_sheets') && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Grade:</Label>
                                        <Select
                                          value={taskOptions.plasterboard_grade || 'standard'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, plasterboard_grade: value}))}
                                        >
                                          <SelectTrigger className="h-8 w-32">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="moisture_resistant">Moisture Resistant</SelectItem>
                                            <SelectItem value="fire_rated">Fire Rated</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* Plastering - Cornice Type */}
                                    {subtaskKey === 'supply_install_cornice' && (
                                      <div className="flex items-center space-x-2">
                                        <Label className="text-xs text-gray-600">Type:</Label>
                                        <Select
                                          value={taskOptions.cornice_type || 'standard'}
                                          onValueChange={(value) => setTaskOptions(prev => ({...prev, cornice_type: value}))}
                                        >
                                          <SelectTrigger className="h-8 w-32">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="decorative">Decorative</SelectItem>
                                            <SelectItem value="heritage">Heritage</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* Tiling - Floor Tile Grade and Size */}
                                    {subtaskKey === 'supply_install_floor_tiles' && (
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.floor_tile_grade || 'standard_ceramic'}
                                            onValueChange={(value) => setTaskOptions(prev => ({...prev, floor_tile_grade: value}))}
                                          >
                                            <SelectTrigger className="h-8 w-36">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="budget_ceramic">Budget Ceramic</SelectItem>
                                              <SelectItem value="standard_ceramic">Standard Ceramic</SelectItem>
                                              <SelectItem value="premium_ceramic">Premium Ceramic</SelectItem>
                                              <SelectItem value="porcelain">Porcelain</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Size:</Label>
                                          <Select
                                            value={taskOptions.tile_size || '300x300mm'}
                                            onValueChange={(value) => setTaskOptions(prev => ({...prev, tile_size: value}))}
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

                                    {/* Tiling - Wall Tile Grade and Size */}
                                    {(subtaskKey === 'supply_install_wall_tiles' || subtaskKey === 'supply_install_half_height') && (
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Grade:</Label>
                                          <Select
                                            value={taskOptions.wall_tile_grade || 'standard_ceramic'}
                                            onValueChange={(value) => setTaskOptions(prev => ({...prev, wall_tile_grade: value}))}
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
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Size:</Label>
                                          <Select
                                            value={taskOptions.wall_tile_size || '300x300mm'}
                                            onValueChange={(value) => setTaskOptions(prev => ({...prev, wall_tile_size: value}))}
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

                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2 mt-4 pt-2 border-t border-purple-200">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => selectAllSubtasks(key)}
                              className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            >
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => clearAllSubtasks(key)}
                              className="text-gray-600 hover:bg-gray-50"
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

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Quote...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Generate Quote
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full bg-white shadow-2xl z-50 w-64 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg text-gray-900">Quote Saver</h1>
              <p className="text-xs text-gray-600">AI Powered</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'home' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Home</div>
              <div className="text-xs text-gray-500">Dashboard & Overview</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              startNewQuote();
              setCurrentView('new-quote');
            }}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'new-quote' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <PlusCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">New Quote</div>
              <div className="text-xs text-gray-500">Create Quote</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('saved-projects')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'saved-projects' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Saved Projects</div>
              <div className="text-xs text-gray-500">Manage Projects</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('contracts')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'contracts' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">New Contract</div>
              <div className="text-xs text-gray-500">Generate Contract</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              setCurrentView('saved-contracts');
              loadContracts();
            }}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'saved-contracts' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Saved Contracts</div>
              <div className="text-xs text-gray-500">View & Approve</div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'profile' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Profile</div>
              <div className="text-xs text-gray-500">Business Settings</div>
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="transition-all duration-300 ml-64">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
      
      {/* PWA Installation Banner */}
      {showInstallPrompt && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📱</div>
              <div>
                <p className="font-semibold">Install Bathroom Quote Saver.AI</p>
                <p className="text-sm opacity-90">Get the full app experience on your device</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleInstallApp}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                size="sm"
              >
                Install App
              </Button>
              <Button
                onClick={() => setShowInstallPrompt(false)}
                variant="ghost"
                className="text-white hover:bg-white/20"
                size="sm"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {renderCurrentView()}
        </div>
      </div>
      </div> {/* End Main Content Area */}
      
      {/* Saved Projects Side Panel */}
      <Sheet open={showProjectsPanel} onOpenChange={setShowProjectsPanel}>
        <SheetTrigger asChild>
          <Button 
            className="fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl"
            size="lg"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Saved Projects ({savedProjects.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center">
              <FolderOpen className="w-6 h-6 mr-2 text-purple-600" />
              Saved Projects
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      {selectedCategory}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Drafts Button */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  onClick={clearDraftProjects}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  🗑️ Clear Drafts
                </Button>
                <Button
                  onClick={testDeleteFirstProject}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  🧪 Test Delete
                </Button>
                <span className="text-xs text-gray-500">
                  {savedProjects.filter(p => p.total_cost === 0).length} drafts
                </span>
              </div>
            </div>

            {/* Save Current Project Button */}
            {quote && (
              <Button
                onClick={saveCurrentProject}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Current Quote as Project
              </Button>
            )}

            {/* Bulk Actions */}
            {filteredProjects.length > 0 && (
              <div className="flex gap-2 pb-3 border-b">
                <Button
                  onClick={selectAllProjects}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {selectedProjects.length === filteredProjects.length ? 'Deselect All' : 'Select All'} 
                  ({selectedProjects.length})
                </Button>
                {selectedProjects.length > 0 && (
                  <Button
                    onClick={deleteSelectedProjects}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    🗑️ Delete Selected ({selectedProjects.length})
                  </Button>
                )}
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved projects yet</p>
                  <p className="text-sm">Generate a quote and save it!</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => toggleProjectSelection(project.id)}
                        className="mt-1"
                      />
                      
                      {/* Project Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {project.project_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {project.client_name}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {project.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-600">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span className="text-sm font-semibold">
                              ${project.total_cost.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs h-7"
                            onClick={() => loadProject(project.id)}
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-red-600 hover:text-red-700"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      
      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Mail className="w-6 h-6 mr-2 text-blue-600" />
              Email Quote to Client
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeBreakdown"
                    checked={includeBreakdown}
                    onCheckedChange={setIncludeBreakdown}
                  />
                  <Label htmlFor="includeBreakdown" className="text-sm">
                    Include detailed cost breakdown in email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includePdf"
                    checked={emailOptions.includePdf}
                    onCheckedChange={(checked) => setEmailOptions(prev => ({...prev, includePdf: checked}))}
                  />
                  <Label htmlFor="includePdf" className="text-sm">
                    Attach professional scope of works PDF
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Recipient:</strong> {formData.clientInfo.email}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Quote summary PDF will always be included automatically
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendQuoteEmail}
              disabled={sendingEmail || !formData.clientInfo.email}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* PDF Generation Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Generate PDF Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">PDF Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pdfIncludeBreakdown"
                    checked={pdfIncludeBreakdown}
                    onCheckedChange={setPdfIncludeBreakdown}
                  />
                  <Label htmlFor="pdfIncludeBreakdown" className="text-sm">
                    Include detailed cost breakdown in PDF
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                When checked, the PDF will include a detailed breakdown of costs by component. When unchecked, only the total cost will be shown.
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Document:</strong> Professional Scope of Works PDF
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {getTotalAdjustedCost() !== quote?.total_cost && Object.keys(adjustedCosts).length > 0 
                  ? "Will include your cost adjustments" 
                  : "Will use original AI-generated costs"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={() => {
                generateProposalPDF(pdfIncludeBreakdown);
                setPdfDialogOpen(false);
              }}
              disabled={generatingPDF}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
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