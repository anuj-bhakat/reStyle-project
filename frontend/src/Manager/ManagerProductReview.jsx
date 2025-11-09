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
      setPricingError("Algorithm start price must be a positive number");
      return false;
    }
    if (!algorithmEnd || algorithmEnd <= 0) {
      setPricingError("Algorithm end price must be a positive number");
      return false;
    }
    if (parseFloat(algorithmStart) >= parseFloat(algorithmEnd)) {
      setPricingError("Algorithm start price must be less than end price");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => navigate("/manager-dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/manager-dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900"
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
            <h1 className="text-xl font-semibold text-gray-900">
              Product Review
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* --- Product Images & Info (Left Column) --- */}
          <div className="space-y-6">
            <div className="relative aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
              {product.product_images?.length > 0 && (
                <>
                  <img
                    src={product.product_images[selectedImageIndex]?.url}
                    alt={product.description}
                    className="w-full h-full object-contain bg-white"
                    style={{ maxHeight: "400px" }}
                  />
                  <span
                    className={`absolute top-2 left-2 px-3 py-1 text-xs text-white rounded-full ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </>
              )}
            </div>

            {product.product_images?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto justify-center">
                {product.product_images.map((image, index) => (
                  <button
                    key={image.image_id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-blue-500"
                        : "border-gray-200"
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

            {/* Moved Product Info Here */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h2>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  {product.brand} {product.product_type}
                </h1>
                <p className="text-gray-600">{product.description}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Condition:</span>
                  <span className="capitalize">{product.condition}</span>
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
          </div>

          {/* --- Checklist, Pricing, Delivery Agent, Submit --- */}
          <div className="space-y-6">
            {/* Checklist Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Checklist Constraints
              </h2>
              <div className="flex mb-4 space-x-2">
                <input
                  type="text"
                  placeholder="Enter constraint name"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={handleConstraintInputKeyDown}
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
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Set Pricing
              </h2>
              {pricingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{pricingError}</p>
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="algorithmStart"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Algorithm Start (₹)
                    </label>
                    <input
                      type="number"
                      id="algorithmStart"
                      value={algorithmStart}
                      onChange={(e) => setAlgorithmStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Start price"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="algorithmEnd"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Algorithm End (₹)
                    </label>
                    <input
                      type="number"
                      id="algorithmEnd"
                      value={algorithmEnd}
                      onChange={(e) => setAlgorithmEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="End price"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>

                {/* Delivery Agent Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Delivery Agent
                  </label>
                  {agentsLoading && <p>Loading agents...</p>}
                  {agentsError && <p className="text-red-600">{agentsError}</p>}
                  {!agentsLoading && !agentsError && agents.length === 0 && (
                    <p>No delivery agents available.</p>
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
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Pricing Preview
                    </h4>
                    <div className="text-sm text-blue-800">
                      Algorithm Range: ₹{algorithmStart} - ₹{algorithmEnd}
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
                {submitting ? "Approving..." : "Approve & Send"}
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

  return (
    <div className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="block truncate">
          {selectedAgentId
            ? agents.find((agent) => agent.deliveryagent_id === selectedAgentId)
                ?.agentid || "Select delivery agent"
            : "Select delivery agent"}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
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
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto text-sm">
          {agents.map((agent) => (
            <li
              key={agent.deliveryagent_id}
              onClick={() => {
                setSelectedAgentId(agent.deliveryagent_id);
                setIsOpen(false);
              }}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                selectedAgentId === agent.deliveryagent_id ? "bg-blue-50" : ""
              }`}
            >
              {agent.agentid}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerProductReview;
