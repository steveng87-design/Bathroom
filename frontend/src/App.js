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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All', 'Residential', 'Commercial', 'Luxury', 'Budget']);
  const [editingProject, setEditingProject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Email functionality states
  const [emailOptions, setEmailOptions] = useState({
    includeBreakdown: true,
    includePdf: false
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
  const [emailOptions, setEmailOptions] = useState({
    includePdf: true
  });
  
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
        tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
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
      // Wall area = 2 * (length + width) * height
      return (2 * (lengthInMeters + widthInMeters) * heightInMeters).toFixed(2);
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
        tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
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

  // Multi-Area Combined Quote Generation
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

      // Collect and validate areas
      let combinedComponents = {};
      let totalFloorArea = 0;
      let totalWallArea = 0;
      let validAreas = [];

      for (let i = 0; i < projectAreas.length; i++) {
        const area = projectAreas[i];
        
        // Check if area has valid measurements (use projectAreas, not formData.roomMeasurements)
        const { length, width, height } = area.measurements || {};
        const hasValidMeasurements = length && width && height && 
          parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0;
        
        console.log(`Area ${area.name}:`, {
          hasValidMeasurements,
          measurements: { length, width, height },
          measuredFloorArea: hasValidMeasurements ? (parseFloat(length) / 1000 * parseFloat(width) / 1000).toFixed(2) : 0,
          measuredWallArea: hasValidMeasurements ? (2 * (parseFloat(length) / 1000 + parseFloat(width) / 1000) * parseFloat(height) / 1000).toFixed(2) : 0
        });

        if (hasValidMeasurements) {
          // Calculate areas for this specific area
          const floorArea = parseFloat(length) / 1000 * parseFloat(width) / 1000;
          const wallArea = 2 * (parseFloat(length) / 1000 + parseFloat(width) / 1000) * parseFloat(height) / 1000;
          
          totalFloorArea += floorArea;
          totalWallArea += wallArea;
          
          validAreas.push({
            ...area,
            calculatedFloorArea: floorArea,
            calculatedWallArea: wallArea
          });
        }
      }

      console.log('Validation results:', {
        totalValidAreas: validAreas.length,
        totalFloorArea: totalFloorArea.toFixed(2),
        totalWallArea: totalWallArea.toFixed(2)
      });

      if (validAreas.length === 0) {
        toast.error('Please add at least one area with valid measurements (length, width, height)');
        setLoading(false);
        return;
      }

      // Collect selected components from both multi-area system and sidebar form
      // Check multi-area system (projectAreas)
      validAreas.forEach(area => {
        Object.entries(area.components).forEach(([component, comp]) => {
          if (comp && comp.enabled) {
            if (!combinedComponents[component]) {
              combinedComponents[component] = { enabled: true, subtasks: {} };
            }
            // Merge subtasks
            Object.entries(comp.subtasks || {}).forEach(([subtask, enabled]) => {
              if (enabled) {
                combinedComponents[component].subtasks[subtask] = true;
              }
            });
          }
        });
      });
      
      // Also check sidebar form data (formData.components)
      if (formData.components) {
        Object.entries(formData.components).forEach(([component, comp]) => {
          if (comp && comp.enabled) {
            if (!combinedComponents[component]) {
              combinedComponents[component] = { enabled: true, subtasks: {} };
            }
            // Merge subtasks
            Object.entries(comp.subtasks || {}).forEach(([subtask, enabled]) => {
              if (enabled) {
                combinedComponents[component].subtasks[subtask] = true;
              }
            });
          }
        });
      }

      console.log('Combined components:', combinedComponents);

      if (Object.keys(combinedComponents).length === 0) {
        toast.error('Please select at least one component to quote');
        setLoading(false);
        return;
      }

      // Use the first area's data as representative for the quote request
      const primaryArea = validAreas[0];
      const requestData = {
        client_info: formData.clientInfo,
        room_measurements: {
          length: parseFloat(primaryArea.measurements.length) / 1000,
          width: parseFloat(primaryArea.measurements.width) / 1000,
          height: parseFloat(primaryArea.measurements.height) / 1000
        },
        components: Object.keys(combinedComponents).reduce((acc, key) => {
          acc[key] = true;  // Backend expects boolean values, not objects
          return acc;
        }, {}),
        detailed_components: combinedComponents,
        task_options: primaryArea.taskOptions,
        additional_notes: `Multi-area project: ${validAreas.length} areas (${validAreas.map(a => a.name).join(', ')}). Total floor area: ${totalFloorArea.toFixed(2)}m². Total wall area: ${totalWallArea.toFixed(2)}m².`
      };

      console.log('Sending quote request:', requestData);

      // Try to generate quote with learning first, fallback to standard if no learning data
      let response;
      try {
        const userId = userProfile.contact_name || "default";
        response = await axios.post(`${API}/quotes/generate-with-learning?user_id=${userId}`, requestData);
        
        // Check if learning was applied
        const learningInfo = response.data.learning_info;
        if (learningInfo?.learning_applied) {
          console.log("🧠 AI Learning applied:", learningInfo);
        }
      } catch (learningError) {
        console.log("Learning not available, using standard quote generation");
        response = await axios.post(`${API}/quotes/request`, requestData);
      }
      
      const enhancedQuote = {
        ...response.data,
        total_floor_area: totalFloorArea,
        total_wall_area: totalWallArea,
        project_summary: `${validAreas.length} area renovation: ${validAreas.map(a => a.name).join(', ')}`
      };
      
      setQuote(enhancedQuote);
      console.log('Quote set:', enhancedQuote);
      console.log('Current view:', currentView);
      
      // Ensure we stay in new-quote view to see the results
      setCurrentView('new-quote');
      
      // Show success message with learning info if available
      const learningInfo = enhancedQuote.learning_info;
      if (learningInfo?.learning_applied) {
        toast.success(
          `🧠 Quote generated with AI learning! Personalized based on ${learningInfo.total_adjustments || 0} previous adjustments.`
        );
      } else {
        toast.success(`Combined quote generated for ${validAreas.length} areas: $${response.data.total_cost.toLocaleString()}`);
      }
      
    } catch (error) {
      console.error('=== QUOTE GENERATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to generate quote. ';
      if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your inputs and try again.';
      }
      
      toast.error(errorMessage);
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
    // Convert to number and validate
    const numericCost = parseFloat(newCost) || 0;
    setAdjustedCosts(prev => ({
      ...prev,
      [componentIndex]: numericCost
    }));
  };

  const handleCostAdjustment = (index, newCost) => {
    handleAdjustCost(index, newCost);
  };

  const getTotalAdjustedCost = () => {
    if (!quote || !quote.cost_breakdown) return 0;
    
    // If there are current adjustments, calculate from breakdown
    if (Object.keys(adjustedCosts).length > 0) {
      return quote.cost_breakdown.reduce((total, item, index) => {
        const cost = adjustedCosts[index] !== undefined ? adjustedCosts[index] : item.estimated_cost;
        return total + parseFloat(cost);
      }, 0);
    }
    
    // Otherwise, use the quote's saved total_cost (for loaded projects)
    return quote.total_cost;
  };

  const submitAdjustments = async () => {
    if (!quote) return;

    try {
      const totalAdjusted = getTotalAdjustedCost();
      
      // Submit individual component adjustments for AI learning
      const learningPromises = quote.cost_breakdown.map(async (item, index) => {
        if (adjustedCosts[index] !== undefined && adjustedCosts[index] !== item.estimated_cost) {
          const adjustmentRatio = adjustedCosts[index] / item.estimated_cost;
          
          const learningData = {
            quote_id: quote.id,
            user_id: userProfile.contact_name || "default",
            component: item.component,
            original_cost: item.estimated_cost,
            adjusted_cost: adjustedCosts[index],
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

  const generateProposalPDF = async () => {
    if (!quote) return;

    setGeneratingPDF(true);
    try {
      // Prepare adjusted costs for PDF generation if user has made adjustments
      const pdfRequestData = {
        user_profile: userProfile,
        adjusted_costs: null,
        adjusted_total: null
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
        adjusted_total: null
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
            setTimeout(() => {
              document.querySelector('[data-state="open"] button[aria-label="Close"]')?.click();
            }, 1000);
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
          tiling: { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
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
              tiling: currentComponents.tiling || { enabled: false, subtasks: { supply_install_sand_cement_bed: false, supply_install_floor_tiles: false, supply_install_wall_tiles: false, supply_install_shower_niche: false, supply_install_bath_niche: false, supply_install_floor_ceiling: false, supply_install_half_height: false, supply_install_nib_walls: false, supply_grout_silicone: false, supply_install_shower_hob: false, supply_install_bath_hob: false, supply_install_feature_wall: false } },
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
  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return renderHomeView();
      case 'new-quote':
        return renderQuoteForm();
      case 'saved-projects':
        return renderSavedProjectsView();
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
                  <p className="font-bold text-green-600">${project.total_cost?.toLocaleString()}</p>
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
                    <p className="text-2xl font-bold text-green-600">${project.total_cost?.toLocaleString() || '0'}</p>
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
                    ${getTotalAdjustedCost().toLocaleString() || quote.total_cost?.toLocaleString() || '0'}
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
                                type="number"
                                value={currentCost}
                                onChange={(e) => handleCostAdjustment(index, parseFloat(e.target.value) || 0)}
                                className="w-24 text-right"
                                min="0"
                                step="50"
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
                    ${getTotalAdjustedCost().toLocaleString()}
                  </span>
                </div>
                {(Object.keys(adjustedCosts).length > 0 || quote.cost_breakdown.some(item => item.adjusted_cost !== undefined)) && (
                  <div className="text-sm text-gray-600 mt-1">
                    {quote.original_total_cost ? (
                      <>
                        Original: ${quote.original_total_cost.toLocaleString()} 
                        <span className={`ml-2 ${getTotalAdjustedCost() > quote.original_total_cost ? 'text-red-600' : 'text-green-600'}`}>
                          ({getTotalAdjustedCost() > quote.original_total_cost ? '+' : ''}${(getTotalAdjustedCost() - quote.original_total_cost).toLocaleString()})
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
                  onClick={generateProposalPDF}
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
                      required
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
                      required
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
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Calculated Areas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Floor Area:</span>
                      <span className="font-bold text-green-700 ml-2">{calculateSquareMeters()} m²</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Wall Area:</span>
                      <span className="font-bold text-green-700 ml-2">{calculateWallArea()} m²</span>
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
      
      {/* Legacy Content - Hidden */}
      <div className="hidden">
      
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
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        
        {/* Floating Side Panel Trigger */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              className="fixed top-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl"
              size="lg"
            >
              <FolderOpen className="w-5 h-5 mr-2" />
              Saved Projects ({savedProjects.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[420px] sm:w-[540px] bg-white/95 backdrop-blur-sm">
            <SheetHeader>
              <SheetTitle className="flex items-center text-xl">
                <FolderOpen className="w-6 h-6 mr-2 text-purple-600" />
                Saved Projects
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4 mt-6">
              {/* Save Current Project - Simplified */}
              {quote && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 flex items-center mb-3">
                    <Save className="w-4 h-4 mr-2" />
                    Save Current Project
                  </h4>
                  <Button onClick={saveCurrentProject} size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-1" />
                    Save Project
                  </Button>
                </div>
              )}

              {/* Search and Filter */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Projects List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No saved projects found</p>
                    <p className="text-sm">Generate a quote and save your first project!</p>
                  </div>
                ) : (
                  filteredProjects.map(project => (
                    <div key={project.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                      {editingProject === project.id ? (
                        <div className="space-y-2">
                          <Input
                            value={project.project_name}
                            onChange={(e) => {
                              const updated = savedProjects.map(p => 
                                p.id === project.id ? {...p, project_name: e.target.value} : p
                              );
                              setSavedProjects(updated);
                            }}
                            className="font-medium"
                          />
                          <Select 
                            value={project.category} 
                            onValueChange={(value) => {
                              const updated = savedProjects.map(p => 
                                p.id === project.id ? {...p, category: value} : p
                              );
                              setSavedProjects(updated);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.filter(cat => cat !== 'All').map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateProject(project.id, {
                                project_name: project.project_name,
                                category: project.category
                              })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingProject(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 text-sm">{project.project_name}</h4>
                              <p className="text-xs text-gray-600">{project.client_name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {project.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-green-600">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span className="font-bold">${project.total_cost.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => loadProject(project.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                            >
                              Load
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingProject(project.id)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
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

        {/* Multi-Area Navigation Tabs */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-purple-600" />
                Project Areas ({projectAreas.length})
              </h3>
              <Dialog open={showAddAreaDialog} onOpenChange={setShowAddAreaDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    + Add Area
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Additional Area to Project</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-3 py-4">
                    {areaTypes.map(areaType => (
                      <Button
                        key={areaType.value}
                        variant="outline"
                        onClick={() => addNewArea(areaType.value)}
                        className="justify-start text-left p-4 h-auto hover:bg-blue-50"
                      >
                        <span className="text-2xl mr-3">{areaType.icon}</span>
                        <div>
                          <div className="font-semibold">{areaType.label}</div>
                          <div className="text-sm text-gray-500">
                            {areaType.value === 'ensuite' && 'Private bathroom attached to bedroom'}
                            {areaType.value === 'wc' && 'Separate toilet room'}
                            {areaType.value === 'laundry' && 'Washing and utility area'}
                            {areaType.value === 'powder_room' && 'Guest half-bathroom'}
                            {areaType.value === 'guest_bathroom' && 'Full guest bathroom'}
                            {areaType.value === 'kids_bathroom' && 'Children\'s bathroom'}
                            {areaType.value === 'bathroom' && 'Main family bathroom'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Area Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {projectAreas.map((area, index) => (
                <div key={area.id} className="relative">
                  <Button
                    variant={index === currentAreaIndex ? 'default' : 'outline'}
                    onClick={() => setCurrentAreaIndex(index)}
                    className={`${
                      index === currentAreaIndex 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'hover:bg-blue-50'
                    } flex items-center space-x-2 pr-8`}
                  >
                    <span>{areaTypes.find(t => t.value === area.type)?.icon || '🏠'}</span>
                    <span>{area.name}</span>
                    {area.quote && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                        ${area.quote.total_cost.toLocaleString()}
                      </Badge>
                    )}
                  </Button>
                  {projectAreas.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArea(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Current Area Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Currently Editing: {getCurrentArea()?.name}
                  </h4>
                  <div className="text-sm text-blue-600 flex items-center space-x-4 mt-1">
                    <span>Floor: {calculateSquareMeters()} m²</span>
                    <span>Wall: {calculateWallArea()} m²</span>
                    {getCurrentArea()?.quote && (
                      <span className="font-semibold text-green-600">
                        Cost: ${getCurrentArea().quote.total_cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {projectAreas.length > 1 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-800">
                      Total Project: ${getTotalProjectCost().toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">
                      {getTotalFloorArea()} m² floor • {getTotalWallArea()} m² wall
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!quote ? (
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 pointer-events-none"></div>
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
                        type="tel"
                        value={formData.clientInfo.phone}
                        onChange={(e) => handleInputChange('clientInfo', 'phone', e.target.value)}
                        placeholder="02-1234-5678"
                        className="mt-1"
                      />
                    </div>
                    <div className="relative">
                      <Label htmlFor="projectAddress" className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                        Project Address with GPS *
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="projectAddress"
                          value={formData.clientInfo.address}
                          onChange={(e) => {
                            handleInputChange('clientInfo', 'address', e.target.value);
                            setSelectedAddress(null); // Clear selected address when typing
                          }}
                          onFocus={() => {
                            if (addressSuggestions.length > 0) setShowAddressSuggestions(true);
                          }}
                          placeholder="Start typing address... (e.g. 123 Main St, Sydney)"
                          required
                          className="pr-12"
                        />
                        
                        {/* GPS/Directions Button */}
                        {(formData.clientInfo.address || selectedAddress) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={openDirections}
                            className="absolute right-1 top-1 h-8 w-10 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Get Directions"
                          >
                            <Navigation className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* GPS Coordinates Indicator */}
                        {selectedAddress && (
                          <div className="absolute right-12 top-2 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="GPS coordinates saved"></div>
                          </div>
                        )}
                      </div>

                      {/* Address Suggestions Dropdown */}
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {addressSuggestions.map((address, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectAddress(address)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {address.display_name.split(',').slice(0, 2).join(',')}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    {address.display_name}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
                            📍 Select address for GPS coordinates and precise directions
                          </div>
                        </div>
                      )}
                      
                      {/* Selected Address Confirmation */}
                      {selectedAddress && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-sm font-medium">GPS Location Confirmed</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={openDirections}
                              className="text-green-700 border-green-300 hover:bg-green-100 text-xs"
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Directions
                            </Button>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            📍 {selectedAddress.lat.toFixed(6)}, {selectedAddress.lng.toFixed(6)}
                          </div>
                        </div>
                      )}
                      
                      {/* Close suggestions when clicking outside */}
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowAddressSuggestions(false)}
                        />
                      )}
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
                        value={getCurrentArea()?.measurements?.length || ''}
                        onChange={(e) => handleAreaMeasurementChange('length', e.target.value)}
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
                        value={getCurrentArea()?.measurements?.width || ''}
                        onChange={(e) => handleAreaMeasurementChange('width', e.target.value)}
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
                        value={getCurrentArea()?.measurements?.height || ''}
                        onChange={(e) => handleAreaMeasurementChange('height', e.target.value)}
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
                          <div className="flex items-center space-x-3 relative z-10">
                            <div className="flex items-center space-x-2 p-1 rounded-lg hover:bg-blue-50 transition-colors">
                              <Checkbox
                                id={key}
                                checked={getCurrentArea()?.components[key]?.enabled || false}
                                onCheckedChange={(checked) => handleComponentToggle(key, checked)}
                                className="h-5 w-5 relative z-20"
                              />
                              <Label 
                                htmlFor={key} 
                                className="text-lg font-semibold cursor-pointer text-gray-800 select-none"
                              >
                                {label}
                              </Label>
                              {getCurrentArea()?.components[key]?.enabled && (
                                <Badge variant="outline" className="text-xs">
                                  {getSelectedSubtasks(key).length} tasks selected
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {getCurrentArea()?.components[key]?.enabled && (
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
                        {getCurrentArea()?.components[key]?.enabled && expandedComponents[key] && (
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
                                      checked={getCurrentArea()?.components[key]?.subtasks[subtaskKey] || false}
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
                                  {getCurrentArea()?.components[key]?.subtasks[subtaskKey] && (
                                    <div className="ml-6 space-y-2">
                                      
                                      {/* Demolition - Skip Bin Size */}
                                      {subtaskKey === 'supply_skip_bin' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Bin Size:</Label>
                                          <Select
                                            value={getCurrentTaskOptions().skip_bin_size || '6 meter bin'}
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
                                            value={getCurrentTaskOptions().build_niches_quantity?.toString() || '1'}
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
                                            value={getCurrentTaskOptions().swing_door_size || '720mm'}
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
                                            value={getCurrentTaskOptions().cavity_sliding_size || '720mm'}
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
                                            value={getCurrentTaskOptions().minor_costs_amount || 0}
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
                                            value={getCurrentTaskOptions().water_feeds_type}
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
                                            value={getCurrentTaskOptions().power_points_quantity?.toString() || '1'}
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
                                            value={getCurrentTaskOptions().plasterboard_grade}
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
                                            value={getCurrentTaskOptions().cornice_type}
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
                                              value={getCurrentTaskOptions().floor_tile_grade}
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
                                              value={getCurrentTaskOptions().tile_size}
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

                                      {/* Tiling - Wall Tile Grade and Size */}
                                      {(subtaskKey === 'supply_install_wall_tiles' || subtaskKey === 'supply_install_half_height') && (
                                        <div className="flex items-center space-x-2">
                                          <div className="flex items-center space-x-2">
                                            <Label className="text-xs text-gray-600">Grade:</Label>
                                            <Select
                                              value={getCurrentTaskOptions().wall_tile_grade}
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
                                          <div className="flex items-center space-x-2">
                                            <Label className="text-xs text-gray-600">Size:</Label>
                                            <Select
                                              value={getCurrentTaskOptions().wall_tile_size}
                                              onValueChange={(value) => handleTaskOptionChange('wall_tile_size', value)}
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

                                      {/* Tiling - Feature Wall Grade */}
                                      {subtaskKey === 'supply_install_feature_wall' && (
                                        <div className="flex items-center space-x-2">
                                          <Label className="text-xs text-gray-600">Type:</Label>
                                          <Select
                                            value={getCurrentTaskOptions().feature_tile_grade}
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
                                            value={getCurrentTaskOptions().vanity_grade}
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
                                            value={getCurrentTaskOptions().toilet_grade}
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
                                            value={getCurrentTaskOptions().shower_screen_grade}
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
                                            value={getCurrentTaskOptions().tapware_grade}
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
                                            value={getCurrentTaskOptions().lighting_grade}
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
                                            value={getCurrentTaskOptions().mirror_grade}
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
                                            value={getCurrentTaskOptions().tiles_supply_grade}
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
                  
                  {/* Auto-save status indicator */}
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Auto-saving your progress...
                    </div>
                  </div>

                  {/* Save Draft Button */}
                  <div className="mb-6">
                    <Button 
                      type="button"
                      onClick={saveDraftProject}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg font-semibold mb-4"
                      disabled={!formData.clientInfo.name}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Save Draft Project Now
                      <span className="text-sm opacity-90 ml-2">(works even if phone sleeps)</span>
                    </Button>
                    <p className="text-center text-orange-700 text-sm">
                      💡 Save incomplete projects anytime • Never lose your work • Continue later
                    </p>
                  </div>

                  {/* Generate Quote Button - Now with Automatic AI Learning */}
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
                            <span className="text-sm opacity-90">Self-Learning AI • Adapts to Your Pricing</span>
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
            {/* Multi-Area Quote Summary */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl flex items-center">
                    <CheckCircle2 className="w-6 h-6 mr-2" />
                    {quote.area_quotes ? `Multi-Area Project Quote (${quote.areas_count} Areas)` : 'Renovation Quote Generated'}
                  </CardTitle>
                  <Button
                    onClick={handleBackToEdit}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    ← Back to Edit Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {quote.area_quotes ? (
                  <>
                    {/* Total Project Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 className="text-4xl font-black text-green-600">
                          ${quote.total_project_cost.toLocaleString()}
                        </h3>
                        <p className="text-green-700 font-semibold">Total Project Cost</p>
                        <p className="text-green-500 text-xs">All {quote.areas_count} areas combined</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="text-3xl font-bold text-blue-600">
                          {getTotalFloorArea()} m²
                        </h3>
                        <p className="text-blue-700 font-semibold">Total Floor Area</p>
                        <p className="text-blue-500 text-xs">Combined floor space</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="text-3xl font-bold text-purple-600">
                          {getTotalWallArea()} m²
                        </h3>
                        <p className="text-purple-700 font-semibold">Total Wall Area</p>
                        <p className="text-purple-500 text-xs">Combined wall space</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                        <Badge
                          variant="outline"
                          className="text-lg p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold"
                        >
                          High Confidence
                        </Badge>
                        <p className="text-yellow-700 font-semibold mt-2">AI Accuracy</p>
                        <p className="text-yellow-600 text-xs">Multi-area analysis</p>
                      </div>
                    </div>

                    {/* Individual Area Breakdowns */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-purple-600" />
                        Individual Area Quotes
                      </h3>
                      
                      {quote.area_quotes.map((areaQuote, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">
                                  {areaTypes.find(t => t.value === areaQuote.area_type)?.icon || '🏠'}
                                </span>
                                <div>
                                  <div>{areaQuote.area_name}</div>
                                  <div className="text-sm font-normal text-gray-600">
                                    {areaTypes.find(t => t.value === areaQuote.area_type)?.label}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  ${areaQuote.total_cost.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Area Total</div>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {areaQuote.cost_breakdown.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                  <div>
                                    <h5 className="font-medium">{item.component}</h5>
                                    <p className="text-sm text-gray-600">{item.notes}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-green-600">
                                      ${item.estimated_cost.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ${item.cost_range_min.toLocaleString()} - ${item.cost_range_max.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {areaQuote.ai_analysis && (
                              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                                <div className="flex items-start">
                                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                                  <div>
                                    <h6 className="font-medium text-blue-800 text-sm">Area Analysis</h6>
                                    <p className="text-blue-700 text-sm">{areaQuote.ai_analysis}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 mt-6">
                      <h4 className="font-semibold text-green-800 mb-2">Project Summary</h4>
                      <p className="text-green-700">{quote.project_summary}</p>
                    </div>
                  </>
                ) : (
                  // Single area quote display (fallback)
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h3 className="text-4xl font-black text-green-600">
                        ${quote.total_cost?.toLocaleString() || '0'}
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
                      <p className="text-purple-500 text-xs">For wall finishes</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                      <Badge
                        variant="outline"
                        className="text-lg p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold"
                      >
                        {quote.confidence_level || 'High'} Confidence
                      </Badge>
                      <p className="text-yellow-700 font-semibold mt-2">AI Accuracy</p>
                      <p className="text-yellow-600 text-xs">Learning from your style</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                  <Button
                    onClick={() => setAdjustmentMode(!adjustmentMode)}
                    variant={adjustmentMode ? 'destructive' : 'outline'}
                    className="flex items-center justify-center"
                  >
                    {adjustmentMode ? 'Cancel Adjustments' : 'Adjust Costs'}
                  </Button>

                  {/* Save Project Button */}
                  <Button
                    onClick={saveCurrentProject}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Project
                  </Button>

                  {/* Email Quote Button */}
                  {/* Email Quote Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Quote
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center text-xl">
                          <Mail className="w-6 h-6 mr-2 text-blue-600" />
                          Email Quote to Client
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Client Email *</Label>
                          <Input
                            type="email"
                            value={formData.clientInfo.email}
                            onChange={(e) => handleInputChange('clientInfo', 'email', e.target.value)}
                            placeholder="client@example.com"
                            className="mt-1"
                          />
                        </div>
                        
                        {/* Email Options */}
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <Label className="text-sm font-medium">Email Options</Label>
                          
                          {/* Cost Breakdown Option */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="include-breakdown"
                                checked={emailOptions.includeBreakdown}
                                onCheckedChange={(checked) => setEmailOptions(prev => ({...prev, includeBreakdown: checked}))}
                              />
                              <Label htmlFor="include-breakdown" className="text-sm">Include detailed cost breakdown in email</Label>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 ml-6">Show individual component costs vs total price only</p>
                          
                          {/* PDF Generation Options */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="include-pdf"
                                checked={emailOptions.includePdf}
                                onCheckedChange={(checked) => setEmailOptions(prev => ({...prev, includePdf: checked}))}
                              />
                              <Label htmlFor="include-pdf" className="text-sm">Generate Scope of Works PDF</Label>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 ml-6">Creates detailed scope of works PDF for manual attachment</p>
                          
                          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                            📋 <strong>Note:</strong> Quote Summary PDF is always generated. Both PDFs will download automatically for you to attach to the email.
                          </div>
                        </div>
                        
                        {/* Email Preview */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>📧 Smart Email Integration:</strong>
                            <br />
                            • <strong>iOS/Mobile:</strong> Uses native share with auto-attached PDFs ✨
                            <br />
                            • <strong>Desktop:</strong> Downloads PDFs + opens email app with pre-written message
                            <br />
                            {emailOptions.includePdf ? '2 documents' : '1 document'} will be ready for sending!
                          </p>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <DialogClose asChild>
                            <Button variant="outline" className="flex-1">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={handleSendQuoteEmail}
                            disabled={sendingEmail || !formData.clientInfo.email}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                          >
                            {sendingEmail ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Preparing...
                              </>
                            ) : (
                              <>
                                <Mail className="w-4 h-4 mr-2" />
                                Open Email App
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Professional PDF Generation Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center text-xl">
                          <Building className="w-6 h-6 mr-2 text-purple-600" />
                          Professional Proposal Settings
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <Building className="w-4 h-4 mr-1" />
                              Company Name *
                            </Label>
                            <Input
                              value={userProfile.company_name}
                              onChange={(e) => handleProfileChange('company_name', e.target.value)}
                              placeholder="Your Company Name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <User className="w-4 h-4 mr-1" />
                              Contact Name *
                            </Label>
                            <Input
                              value={userProfile.contact_name}
                              onChange={(e) => handleProfileChange('contact_name', e.target.value)}
                              placeholder="Project Manager Name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <Phone className="w-4 h-4 mr-1" />
                              Phone Number *
                            </Label>
                            <Input
                              value={userProfile.phone}
                              onChange={(e) => handleProfileChange('phone', e.target.value)}
                              placeholder="02-1234-5678"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <Mail className="w-4 h-4 mr-1" />
                              Email Address *
                            </Label>
                            <Input
                              value={userProfile.email}
                              onChange={(e) => handleProfileChange('email', e.target.value)}
                              placeholder="contact@yourcompany.com"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <Award className="w-4 h-4 mr-1" />
                              License Number *
                            </Label>
                            <Input
                              value={userProfile.license_number}
                              onChange={(e) => handleProfileChange('license_number', e.target.value)}
                              placeholder="NSW-123456"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="flex items-center text-sm font-medium">
                              <Briefcase className="w-4 h-4 mr-1" />
                              Years Experience
                            </Label>
                            <Input
                              value={userProfile.years_experience}
                              onChange={(e) => handleProfileChange('years_experience', e.target.value)}
                              placeholder="5+"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-purple-800 text-sm font-medium">
                            📄 This will generate a professional scope of works PDF proposal similar to your winning client proposals
                          </p>
                          <p className="text-purple-600 text-xs mt-1">
                            Includes: Cover page, company overview, detailed scope of works, terms & conditions, and contact information
                          </p>
                        </div>
                        
                        <Button 
                          onClick={generateProposalPDF}
                          disabled={generatingPDF || !userProfile.company_name || !userProfile.contact_name || !userProfile.phone || !userProfile.email || !userProfile.license_number}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                        >
                          {generatingPDF ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Professional Proposal...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Generate & Download PDF Proposal
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={startNewQuote}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
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
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Button onClick={submitAdjustments} size="sm" className="bg-green-600 hover:bg-green-700">
                        Save Adjustments
                      </Button>
                      <div className="bg-blue-50 px-3 py-1 rounded">
                        <span className="text-sm text-blue-700">
                          New Total: <span className="font-bold">${getTotalAdjustedCost().toLocaleString()}</span>
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                          (Original: ${quote.total_cost.toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">🧠</span>
                        <div>
                          <p className="font-medium text-purple-800">AI Learning Active</p>
                          <p className="text-purple-600 text-xs">Your cost adjustments will be learned automatically. Future quotes will reflect your pricing patterns based on room size and components.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {quote.cost_breakdown.map((item, index) => {
                    const isAdjusted = adjustedCosts[index] !== undefined;
                    const currentCost = isAdjusted ? adjustedCosts[index] : item.estimated_cost;
                    
                    return (
                    <div key={index} className={`border rounded-lg p-4 hover:bg-gray-50 ${isAdjusted && adjustmentMode ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg">
                          {item.component}
                          {isAdjusted && adjustmentMode && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">ADJUSTED</span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2">
                          {adjustmentMode ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">$</span>
                              <Input
                                type="text"
                                placeholder="0"
                                value={adjustedCosts[index] !== undefined ? adjustedCosts[index].toString() : item.estimated_cost.toString()}
                                onChange={(e) => {
                                  // Remove non-numeric characters except decimal
                                  const value = e.target.value.replace(/[^\d.]/g, '');
                                  handleAdjustCost(index, value);
                                }}
                                onFocus={(e) => {
                                  // Select all text when focused for easy editing
                                  e.target.select();
                                }}
                                className="w-24 text-right"
                              />
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-green-600">
                              ${currentCost.toLocaleString()}
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
                    );
                  })}
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
      </div> {/* End legacy content */}
      
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