import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManagerProductReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Pricing form state
  const [algorithmStart, setAlgorithmStart] = useState('');
  const [algorithmEnd, setAlgorithmEnd] = useState('');
  const [pricingError, setPricingError] = useState('');

  // Delivery agents state
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Checklist state
  const [constraints, setConstraints] = useState({});
  const [newConstraint, setNewConstraint] = useState('');

  const listingId = location.state?.listingId;

  useEffect(() => {
    if (!listingId) {
      setError('Product ID missing');
      setLoading(false);
      return;
    }
    fetchProductDetails();
    fetchDeliveryAgents();
  }, [listingId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/products/${listingId}`);
      if (response.status === 200) {
        setProduct(response.data);

        // Pre-fill existing pricing if available
        if (response.data.algorithm_price) {
          setAlgorithmStart(response.data.algorithm_price.start.toString());
          setAlgorithmEnd(response.data.algorithm_price.end.toString());
        }

        // Pre-fill existing checklist if present
        if (response.data.conditions_json) {
          setConstraints(response.data.conditions_json);
        }

        setError('');
      } else {
        setError('Product not found');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to fetch product details. Please try again.');
      }
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      setAgentsLoading(true);
      const response = await axios.get('http://localhost:3000/delivery-agent/');
      if (response.status === 200) {
        setAgents(response.data);
        setAgentsError('');
      } else {
        setAgentsError('Failed to load delivery agents.');
      }
    } catch (err) {
      setAgentsError('Failed to load delivery agents.');
      console.error('Error fetching agents:', err);
    } finally {
      setAgentsLoading(false);
    }
  };

  const validatePricing = () => {
    setPricingError('');
    if (!Object.keys(constraints).some(key => constraints[key])) {
      setPricingError('At least one checklist condition must be selected.');
      return false;
    }
    if (!algorithmStart || algorithmStart <= 0) {
      setPricingError('Algorithm start price must be a positive number');
      return false;
    }
    if (!algorithmEnd || algorithmEnd <= 0) {
      setPricingError('Algorithm end price must be a positive number');
      return false;
    }
    if (parseFloat(algorithmStart) >= parseFloat(algorithmEnd)) {
      setPricingError('Algorithm start price must be less than end price');
      return false;
    }
    if (!selectedAgentId) {
      setPricingError('Please select a delivery agent.');
      return false;
    }
    return true;
  };

  const handleApproveAndSend = async () => {
    if (!validatePricing()) {
      return;
    }
    try {
      setSubmitting(true);
      setPricingError('');

      // 1. Prepare checklist constraints all as `false` for pickup request
      const defaultChecklist = {};
      for (const [key, value] of Object.entries(constraints)) {
        if (value === true) {
          defaultChecklist[key] = false;
        }
      }

      // 2. Build pickup request payload
      const pickupPayload = {
        deliveryagent_id: selectedAgentId,
        seller_id: product.seller_id,
        listing_id: product.listing_id,
        status: 'processing',
        conditions_json: defaultChecklist,
      };

      // 3. Send pickup request first
      const pickupResponse = await axios.post(
        'http://localhost:3000/pickup_requests/create',
        pickupPayload
      );

      if (pickupResponse.status === 200 || pickupResponse.status === 201) {
        // 4. Now update the product with algorithm price ONLY
        const pricingData = {
          algorithm_price: {
            start: parseInt(algorithmStart),
            end: parseInt(algorithmEnd),
          },
          status: "awaiting_review",
        };

        const updateResponse = await axios.put(
          `http://localhost:3000/products/${listingId}`,
          pricingData
        );

        if (updateResponse.status === 200) {
          navigate('/manager-dashboard', {
            state: {
              message: 'Pickup request sent and product approved!',
              type: 'success',
            },
          });
        } else {
          setPricingError('Failed to update product after pickup request.');
        }
      } else {
        setPricingError('Failed to create pickup request. Please try again.');
      }
    } catch (err) {
      console.error('Error approving product or sending pickup request:', err);
      setPricingError(
        err.response?.data?.message || 'Failed to approve or send pickup request.'
      );
    } finally {
      setSubmitting(false);
    }
  };


  // Checklist Handlers
  const handleAddConstraint = () => {
    if (!newConstraint.trim()) return;
    const key = newConstraint.trim();
    if (!constraints[key]) {
      setConstraints({ ...constraints, [key]: false });
    }
    setNewConstraint('');
  };

  const toggleConstraint = (key) => {
    setConstraints({ ...constraints, [key]: !constraints[key] });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/manager-dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFormReady =
    Object.keys(constraints).some(key => constraints[key]) &&
    algorithmStart &&
    algorithmEnd &&
    selectedAgentId;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/manager-dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Product Review</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* --- Product Images --- */}
          <div className="space-y-4">
            <div className="aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
              {product.product_images && product.product_images.length > 0 && (
                <img
                  src={product.product_images[selectedImageIndex]?.url}
                  alt={product.description}
                  className="w-full h-full object-contain bg-white"
                  style={{ maxHeight: '400px' }}
                />
              )}
            </div>
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto justify-center">
                {product.product_images.map((image, index) => (
                  <button
                    key={image.image_id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                  >
                    <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Product Info, Checklist & Pricing --- */}
          <div className="space-y-6">

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">{product.brand} {product.product_type}</h1>
                <p className="text-gray-600">{product.description}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="capitalize">{product.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{product.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(product.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{formatDate(product.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Checklist Constraints</h2>
              <div className="flex mb-4 space-x-2">
                <input
                  type="text"
                  placeholder="Enter constraint name"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handleAddConstraint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(constraints).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleConstraint(key)}
                      className="h-4 w-4"
                    />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Set Pricing</h2>
              {pricingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{pricingError}</p>
                </div>
              )}
              <div className="space-y-4">
                {/* Algorithm Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="algorithmStart" className="block text-sm font-medium text-gray-700 mb-1">
                      Algorithm Start ($)
                    </label>
                    <input
                      type="number"
                      id="algorithmStart"
                      value={algorithmStart}
                      onChange={(e) => setAlgorithmStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start price"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="algorithmEnd" className="block text-sm font-medium text-gray-700 mb-1">
                      Algorithm End ($)
                    </label>
                    <input
                      type="number"
                      id="algorithmEnd"
                      value={algorithmEnd}
                      onChange={(e) => setAlgorithmEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="End price"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
                {/* Delivery Agent Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Agent</label>
                  {agentsLoading && <p>Loading agents...</p>}
                  {agentsError && <p className="text-red-600">{agentsError}</p>}
                  {!agentsLoading && !agentsError && agents.length === 0 && <p>No delivery agents available.</p>}
                  {!agentsLoading && !agentsError && agents.length > 0 && (
                    <DropdownAgentSelector
                      agents={agents}
                      selectedAgentId={selectedAgentId}
                      setSelectedAgentId={setSelectedAgentId}
                    />
                  )}
                </div>
                {/* Pricing Preview */}
                {(algorithmStart || algorithmEnd) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Pricing Preview</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {algorithmStart && algorithmEnd && (
                        <div>Algorithm Range: ${algorithmStart} - ${algorithmEnd}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Approve Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={handleApproveAndSend}
                disabled={submitting || !isFormReady}
                className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Approving...' : 'Approve & Send'}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Agent Dropdown ---
const DropdownAgentSelector = ({ agents, selectedAgentId, setSelectedAgentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="block truncate">
          {selectedAgentId
            ? agents.find(agent => agent.deliveryagent_id === selectedAgentId)?.agentid || 'Select delivery agent'
            : 'Select delivery agent'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 11.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 14z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
          tabIndex={-1}
          role="listbox"
          aria-labelledby="listbox-label"
          aria-activedescendant={selectedAgentId}
        >
          {agents.map((agent) => (
            <li
              key={agent.deliveryagent_id}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${selectedAgentId === agent.deliveryagent_id ? 'bg-blue-100' : ''}`}
              onClick={() => {
                setSelectedAgentId(agent.deliveryagent_id);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedAgentId === agent.deliveryagent_id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedAgentId(agent.deliveryagent_id);
                  setIsOpen(false);
                }
              }}
            >
              <span className={`block truncate ${selectedAgentId === agent.deliveryagent_id ? 'font-semibold' : 'font-normal'}`}>
                {agent.agentid}
              </span>
              {selectedAgentId === agent.deliveryagent_id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerProductReview;
