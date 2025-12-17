import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ManagerProductReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Pricing form state
  const [algorithmStart, setAlgorithmStart] = useState("");
  const [algorithmEnd, setAlgorithmEnd] = useState("");
  const [pricingError, setPricingError] = useState("");

  // Delivery agents state
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");

  // Checklist state
  const [constraints, setConstraints] = useState({});
  const [newConstraint, setNewConstraint] = useState("");

  const listingId = location.state?.listingId;

  useEffect(() => {
    if (!listingId) {
      setError("Product ID missing");
      setLoading(false);
      return;
    }
    fetchProductDetails();
    fetchDeliveryAgents();
  }, [listingId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/products/${listingId}`
      );
      if (response.status === 200) {
        setProduct(response.data);

        if (response.data.algorithm_price) {
          setAlgorithmStart(response.data.algorithm_price.start.toString());
          setAlgorithmEnd(response.data.algorithm_price.end.toString());
        }

        if (response.data.conditions_json) {
          setConstraints(response.data.conditions_json);
        }

        setError("");
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Product not found"
          : "Failed to fetch product details."
      );
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      setAgentsLoading(true);
      const response = await axios.get(`${baseUrl}/delivery-agent/`);
      if (response.status === 200) {
        setAgents(response.data);
        setAgentsError("");
      } else {
        setAgentsError("Failed to load delivery agents.");
      }
    } catch (err) {
      setAgentsError("Failed to load delivery agents.");
      console.error("Error fetching agents:", err);
    } finally {
      setAgentsLoading(false);
    }
  };

  const validatePricing = () => {
    setPricingError("");
    if (!Object.keys(constraints).some((key) => constraints[key])) {
      setPricingError("At least one checklist condition must be selected.");
      return false;
    }
    if (!algorithmStart || algorithmStart <= 0) {
      setPricingError("Start price must be a positive number");
      return false;
    }
    if (!algorithmEnd || algorithmEnd <= 0) {
      setPricingError("End price must be a positive number");
      return false;
    }
    if (parseFloat(algorithmStart) >= parseFloat(algorithmEnd)) {
      setPricingError("Start price must be less than end price");
      return false;
    }
    if (!selectedAgentId) {
      setPricingError("Please select a delivery agent.");
      return false;
    }
    return true;
  };

  const handleApproveAndSend = async () => {
    if (!validatePricing()) return;
    try {
      setSubmitting(true);
      setPricingError("");

      const defaultChecklist = {};
      for (const [key, value] of Object.entries(constraints)) {
        if (value === true) {
          defaultChecklist[key] = false;
        }
      }

      const pickupPayload = {
        deliveryagent_id: selectedAgentId,
        seller_id: product.seller_id,
        listing_id: product.listing_id,
        status: "processing",
        conditions_json: defaultChecklist,
      };

      const pickupResponse = await axios.post(
        `${baseUrl}/pickup_requests/create`,
        pickupPayload
      );

      if (pickupResponse.status === 200 || pickupResponse.status === 201) {
        const pricingData = {
          algorithm_price: {
            start: parseInt(algorithmStart),
            end: parseInt(algorithmEnd),
          },
          status: "awaiting_review",
        };

        const updateResponse = await axios.put(
          `${baseUrl}/products/${listingId}`,
          pricingData
        );

        if (updateResponse.status === 200) {
          navigate("/manager-dashboard", {
            state: {
              message: "Pickup request sent and product approved!",
              type: "success",
            },
          });
        } else {
          setPricingError("Failed to update product after pickup request.");
        }
      } else {
        setPricingError("Failed to create pickup request.");
      }
    } catch (err) {
      console.error("Approval Error:", err);
      setPricingError(
        err.response?.data?.message ||
        "Failed to approve or send pickup request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Checklist Handlers
  const handleAddConstraint = () => {
    const key = newConstraint.trim();
    if (!key) return;
    if (!constraints[key]) {
      setConstraints({ ...constraints, [key]: true }); // Default to true (checked)
    }
    setNewConstraint("");
  };

  const toggleConstraint = (key) => {
    setConstraints({ ...constraints, [key]: !constraints[key] });
  };

  const handleConstraintInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddConstraint();
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
      case "awaiting_review":
        return "bg-green-600";
      default:
        return "bg-orange-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Loading product details...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Something went wrong</h2>
          <p className="text-red-600 text-lg mb-6 font-medium">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => navigate("/manager-dashboard")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFormReady =
    Object.keys(constraints).some((key) => constraints[key]) &&
    algorithmStart &&
    algorithmEnd &&
    selectedAgentId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <button
              onClick={() => navigate("/manager-dashboard")}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Product Review
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* --- Product Images & Info (Left Column) --- */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] max-w-lg mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              {product.product_images?.length > 0 && (
                <>
                  <img
                    src={product.product_images[selectedImageIndex]?.url}
                    alt={product.description}
                    className="w-full h-full object-contain bg-gradient-to-br from-gray-50 to-gray-100"
                    style={{ maxHeight: "500px" }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 text-sm font-medium text-white rounded-full shadow-lg ${getStatusColor(
                      product.status
                    )}`}>
                      {product.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedImageIndex + 1} / {product.product_images.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {product.product_images?.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto justify-center pb-2">
                {product.product_images.map((image, index) => (
                  <button
                    key={image.image_id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Info Card */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-gray-900">Product Information</h2>
              </div>
              <div className="mb-2">
                <h1 className="text-lg font-bold text-gray-900 mb-1">
                  {product.brand} {product.product_type}
                </h1>
                <p className="text-gray-600 text-xs leading-relaxed">{product.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-xs">Condition:</span>
                  <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{product.condition.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-xs">Created:</span>
                  <span className="text-gray-900 font-medium text-xs">{formatDate(product.created_at)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 font-medium text-xs">Updated:</span>
                  <span className="text-gray-900 font-medium text-xs">{formatDate(product.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Checklist, Pricing, Delivery Agent, Submit --- */}
          <div className="space-y-4">
            {/* Checklist Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Checklist Constraints</h2>
              </div>
              <div className="flex mb-3 space-x-2">
                <input
                  type="text"
                  placeholder="Enter constraint name"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={handleConstraintInputKeyDown}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleAddConstraint}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(constraints).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleConstraint(key)}
                      className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="capitalize font-medium text-gray-700 text-sm">{key.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Set Pricing</h2>
              </div>
              {pricingError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-600 font-medium text-sm">{pricingError}</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="algorithmStart"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Start (₹)
                    </label>
                    <input
                      type="number"
                      id="algorithmStart"
                      value={algorithmStart}
                      onChange={(e) => setAlgorithmStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Start price"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="algorithmEnd"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      End (₹)
                    </label>
                    <input
                      type="number"
                      id="algorithmEnd"
                      value={algorithmEnd}
                      onChange={(e) => setAlgorithmEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="End price"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                {/* Delivery Agent Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Delivery Agent
                  </label>
                  {agentsLoading && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      <span className="text-gray-600 text-sm">Loading agents...</span>
                    </div>
                  )}
                  {agentsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 font-medium text-sm">{agentsError}</p>
                    </div>
                  )}
                  {!agentsLoading && !agentsError && agents.length === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium text-sm">No delivery agents available.</p>
                    </div>
                  )}
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
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Pricing Preview
                    </h4>
                    <div className="text-sm text-blue-800 font-medium">
                      Range: <span className="text-base">₹{algorithmStart}</span> - <span className="text-base">₹{algorithmEnd}</span>
                    </div>
                    {algorithmStart && algorithmEnd && (
                      <div className="text-xs text-blue-600 mt-1">
                        Difference: ₹{Math.abs(algorithmEnd - algorithmStart)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Approve Button */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-100">
              <button
                onClick={handleApproveAndSend}
                disabled={submitting || !isFormReady || isGuest}
                title={isGuest ? "Action disabled in Guest Mode" : ""}
                className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 shadow-md text-sm ${submitting || !isFormReady || isGuest
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
                  }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve & Send
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Agent Dropdown ---
const DropdownAgentSelector = ({
  agents,
  selectedAgentId,
  setSelectedAgentId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectedAgent = selectedAgentId
    ? agents.find((agent) => agent.deliveryagent_id === selectedAgentId)
    : null;

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full bg-white border border-gray-200 rounded-lg shadow-sm pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors"
      >
        <span className={`block truncate font-medium ${selectedAgent ? "text-gray-900" : "text-gray-500"}`}>
          {selectedAgent ? selectedAgent.agentid : "Select delivery agent"}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {agents.map((agent) => (
            <li
              key={agent.deliveryagent_id}
              onClick={() => {
                setSelectedAgentId(agent.deliveryagent_id);
                setIsOpen(false);
              }}
              className={`cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-indigo-50 transition-colors ${selectedAgentId === agent.deliveryagent_id ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                }`}
            >
              <span className="font-medium">{agent.agentid}</span>
              {selectedAgentId === agent.deliveryagent_id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
