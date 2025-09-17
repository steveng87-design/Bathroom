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
          minor_costs_allowance: false
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
          install_ceiling_sheets: false,
          install_wall_sheets: false,
          set_internals_joins: false,
          top_coat_ceilings: false,
          install_cornice: false
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
          floor_tiling: false,
          wall_tiling: false,
          shower_tiling: false,
          feature_tiling: false,
          grout_application: false,
          tile_cutting: false,
          edge_trimming: false,
          sealing: false
        }
      },
      fit_off: {
        enabled: false,
        subtasks: {
          toilet_installation: false,
          vanity_installation: false,
          shower_installation: false,
          tapware_installation: false,
          lighting_installation: false,
          mirror_installation: false,
          accessories_installation: false,
          final_connections: false
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

  const componentLabels = {
    demolition: 'Demolition',
    framing: 'Framing',
    plumbing_rough_in: 'Plumbing Rough In',
    electrical_rough_in: 'Electrical Rough In',
    plastering: 'Plastering',
    waterproofing: 'Waterproofing',
    tiling: 'Tiling',
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
      minor_costs_allowance: 'Minor Costs Allowance (User Specified)'
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
      install_ceiling_sheets: 'Install of New Ceiling Sheets',
      install_wall_sheets: 'Install of All Wall Sheets',
      set_internals_joins: 'Set All Internals and Joins',
      top_coat_ceilings: 'Top Coat Ceilings',
      install_cornice: 'Install Cornice'
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
      floor_tiling: 'Floor Tile Installation',
      wall_tiling: 'Wall Tile Installation',
      shower_tiling: 'Shower Recess Tiling',
      feature_tiling: 'Feature Wall Tiling',
      grout_application: 'Grouting & Cleaning',
      tile_cutting: 'Precision Tile Cutting',
      edge_trimming: 'Edge Trim Installation',
      sealing: 'Grout Sealing & Protection'
    },
    fit_off: {
      toilet_installation: 'Toilet & Cistern Installation',
      vanity_installation: 'Vanity & Basin Installation',
      shower_installation: 'Shower Screen & Hardware',
      tapware_installation: 'Tapware & Mixer Installation',
      lighting_installation: 'Light Fixture Installation',
      mirror_installation: 'Mirror & Cabinet Installation',
      accessories_installation: 'Towel Rails & Accessories',
      final_connections: 'Final Plumbing & Electrical Connections'
    }
  };

  const calculateSquareMeters = () => {
    const { length, width } = formData.roomMeasurements;
    if (length && width) {
      return (parseFloat(length) * parseFloat(width)).toFixed(2);
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
          length: parseFloat(formData.roomMeasurements.length),
          width: parseFloat(formData.roomMeasurements.width),
          height: parseFloat(formData.roomMeasurements.height)
        },
        components: transformedComponents,
        detailed_components: formData.components, // Send detailed structure for enhanced AI analysis
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Calculator className="w-10 h-10 mr-3 text-blue-600" />
            Bathroom Renovation Quote Generator
          </h1>
          <p className="text-xl text-gray-600">AI-powered accurate bathroom renovation cost estimates</p>
        </div>

        {!quote ? (
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-2xl">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Client Information
                  </h3>
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
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Ruler className="w-5 h-5 mr-2 text-blue-600" />
                    Room Measurements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (meters) *</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.1"
                        value={formData.roomMeasurements.length}
                        onChange={(e) => handleInputChange('roomMeasurements', 'length', e.target.value)}
                        placeholder="3.5"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="width">Width (meters) *</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        value={formData.roomMeasurements.width}
                        onChange={(e) => handleInputChange('roomMeasurements', 'width', e.target.value)}
                        placeholder="2.5"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (meters) *</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={formData.roomMeasurements.height}
                        onChange={(e) => handleInputChange('roomMeasurements', 'height', e.target.value)}
                        placeholder="2.4"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      Floor Area: {calculateSquareMeters()} m²
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Renovation Components - Revolutionary Expandable System */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                    Detailed Renovation Components
                    <Badge variant="secondary" className="ml-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Ground-breaking Accuracy
                    </Badge>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Select main components, then expand for detailed sub-tasks to get the most accurate quote possible.
                  </p>
                  
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
                                <div
                                  key={subtaskKey}
                                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                >
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

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating AI-Powered Quote...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Generate Quote
                    </>
                  )}
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-green-600">
                      ${quote.total_cost.toLocaleString()}
                    </h3>
                    <p className="text-gray-600">Total Estimated Cost</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600">
                      {calculateSquareMeters()} m²
                    </h3>
                    <p className="text-gray-600">Floor Area</p>
                  </div>
                  <div className="text-center">
                    <Badge variant={quote.confidence_level === 'High' ? 'default' : quote.confidence_level === 'Medium' ? 'secondary' : 'outline'} className="text-lg p-2">
                      {quote.confidence_level} Confidence
                    </Badge>
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
                          framing: { enabled: false, subtasks: { internal_wall_rectification: false, build_niches: false, recessed_mirror_cabinet: false, swing_door_materials: false, cavity_sliding_unit: false, new_window_framing: false, subfloor_replacement: false, minor_costs_allowance: false } },
                          plumbing_rough_in: { enabled: false, subtasks: { make_good_existing_feeds: false, new_inlet_feed_toilet: false, water_feeds_quantity: false, bath_inwall_mixer_outlet: false, basin_mixer_inwall: false, shower_outlet: false, floor_waste: false, new_stack_work: false, concrete_cutting_slab: false, rain_head_shower: false, inwall_cistern: false, wall_hung_toilet: false, vanity_install: false } },
                          electrical_rough_in: { enabled: false, subtasks: { make_safe_old_wiring: false, four_in_one_combo: false, power_points_quantity: false, led_strip_lighting: false, wall_lights: false, downlight: false, separate_extraction_fan: false, underfloor_heating: false, lighting_switching: false } },
                          plastering: { enabled: false, subtasks: { install_ceiling_sheets: false, install_wall_sheets: false, set_internals_joins: false, top_coat_ceilings: false, install_cornice: false } },
                          waterproofing: { enabled: false, subtasks: { shower_waterproofing: false, floor_waterproofing: false, wall_waterproofing: false, membrane_application: false, corner_sealing: false, penetration_sealing: false, compliance_certification: false } },
                          tiling: { enabled: false, subtasks: { floor_tiling: false, wall_tiling: false, shower_tiling: false, feature_tiling: false, grout_application: false, tile_cutting: false, edge_trimming: false, sealing: false } },
                          fit_off: { enabled: false, subtasks: { toilet_installation: false, vanity_installation: false, shower_installation: false, tapware_installation: false, lighting_installation: false, mirror_installation: false, accessories_installation: false, final_connections: false } }
                        },
                        additionalNotes: ''
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