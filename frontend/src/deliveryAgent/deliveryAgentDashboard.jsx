import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PickupRequestDetails from "./PickupRequestDetails";
import ManageCustomerOrders from "./ManageCustomerOrders";

const DeliveryAgentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("pickup");
  const [basePrice, setBasePrice] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("agentToken");
  const agentId = localStorage.getItem("agent_id");

  const loadAllPickupData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${baseUrl}/pickup_requests/get/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requestsData = res.data || [];
      setRequests(requestsData);

      const productFetches = await Promise.all(
        requestsData.map((req) =>
          axios
            .get(`${baseUrl}/products/${req.listing_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => ({ listing_id: req.listing_id, data: res.data }))
            .catch(() => null)
        )
      );

      const productMap = {};
      productFetches.forEach((entry) => {
        if (entry) productMap[entry.listing_id] = entry.data;
      });
      setProductDetailsMap(productMap);
    } catch (err) {
      setError("Failed to fetch pickup requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/agent-login", { replace: true });
      return;
    }
    loadAllPickupData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agent_id");
    navigate("/agent-login", { replace: true });
  };

  const filteredRequests = requests.filter((req) =>
    activeSection === "pickup" ? req.status === "processing" : req.status === "completed"
  );

  const getPrimaryImage = (product) =>
    product?.product_images?.find((img) => img.is_primary)?.url;

  const handleReject = async (pickup_request_id, listing_id, conditions) => {
    try {
      await axios.put(
        `${baseUrl}/products/${listing_id}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `${baseUrl}/pickup_requests/${pickup_request_id}`,
        { conditions_json: conditions, status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) => prev.filter((r) => r.pickup_request_id !== pickup_request_id));
      setSelected(null);
    } catch (err) {
      setError("Failed to reject request.");
    }
  };

  const handleSubmit = async (pickup_request_id, listing_id, conditions) => {
    try {
      await axios.put(
        `${baseUrl}/products/${listing_id}`,
        { status: "picked_up" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `${baseUrl}/pickup_requests/${pickup_request_id}`,
        { conditions_json: conditions, status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const basePriceResponse = await axios.get(
        `${baseUrl}/products/base-price/${pickup_request_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBasePrice(basePriceResponse.data.base_price);
      setRequests((prev) =>
        prev.map((r) =>
          r.pickup_request_id === pickup_request_id ? { ...r, status: "completed" } : r
        )
      );
    } catch (err) {
      setError("Failed to submit request.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h1 className="text-xl font-bold">Delivery Agent Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              Logout
            </button>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-2 flex-wrap mt-3">
            <button
              onClick={() => {
                if (activeSection !== "pickup") {
                  setSelected(null);
                  setActiveSection("pickup");
                  loadAllPickupData();
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
                activeSection === "pickup"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "bg-blue-500/20 text-white hover:bg-blue-500/30 backdrop-blur-sm border border-blue-400/30"
              }`}
            >
              {loading && activeSection === "pickup" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full">
                  <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                </div>
              )}
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm">Pickup Requests</span>
              </span>
            </button>
            <button
              onClick={() => {
                if (activeSection !== "history") {
                  setSelected(null);
                  setActiveSection("history");
                  loadAllPickupData();
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
                activeSection === "history"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "bg-blue-500/20 text-white hover:bg-blue-500/30 backdrop-blur-sm border border-blue-400/30"
              }`}
            >
              {loading && activeSection === "history" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full">
                  <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                </div>
              )}
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">History</span>
              </span>
            </button>
            <button
              onClick={() => {
                if (activeSection !== "delivery") {
                  setSelected(null);
                  setActiveSection("delivery");
                  // Usually ManageCustomerOrders handles its own fetching
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === "delivery"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "bg-blue-500/20 text-white hover:bg-blue-500/30 backdrop-blur-sm border border-blue-400/30"
              }`}
            >
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm">Delivery Requests</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl px-6 py-8">
        {error && <div className="text-red-600 text-center mb-6">{error}</div>}

        {/* Delivery Requests Section */}
        {activeSection === "delivery" ? (
          <ManageCustomerOrders />
        ) : !selected ? (
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 text-center">
                {activeSection === "pickup" ? "Pickup Requests" : "Pickup History"}
              </h2>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Processing</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Completed</span>
                </span>
              </div>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-xl font-semibold text-blue-700 mb-3">Loading pickup requests...</p>
                  <p className="text-gray-600">Please wait while we fetch the latest data</p>
                </div>
                <div className="mt-8 flex space-x-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-24">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-8 shadow-lg">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-4v2a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0H8m0 0V7a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                </div>
                <p className="text-gray-700 text-xl font-medium mb-3">No {activeSection === "pickup" ? "pickup requests" : "history"} found</p>
                <p className="text-gray-500 text-base max-w-md mx-auto">
                  {activeSection === "pickup"
                    ? "You don't have any pickup requests at the moment. New requests will appear here automatically."
                    : "Your pickup history will appear here once you complete requests. Track your completed pickups here."}
                </p>
                <div className="mt-6 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                {filteredRequests.map((req) => {
                  const product = productDetailsMap[req.listing_id];
                  const primaryImage = getPrimaryImage(product);
                  const statusColor = req.status === 'processing' ? 'bg-blue-500' : req.status === 'completed' ? 'bg-gray-500' : 'bg-green-500';
                  const statusIcon = req.status === 'processing' ?
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg> :
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>;
                  
                  return (
                    <div
                      key={req.pickup_request_id}
                      onClick={() => setSelected(req)}
                      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-blue-200 group max-w-xs min-w-[280px] ${
                        activeSection === "history"
                          ? "max-w-[250px] min-w-[200px]"
                          : "w-full"
                      }`}
                    >
                      <div className="relative mb-4">
                        <span className={`absolute top-0 left-0 ${statusColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1 z-10`}>
                          {statusIcon}
                          <span className="capitalize">{req.status}</span>
                        </span>
                        <div className="mt-8">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt="Product"
                              className={`rounded-xl shadow-md mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300 ${
                                activeSection === "history" ? "w-1/2" : "w-full max-w-[200px] h-48 object-cover"
                              }`}
                            />
                          ) : (
                            <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 ${
                              activeSection === "history" ? "w-1/2 h-24" : "w-full h-48"
                            }`}>
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                          {product?.brand || "Brand Unknown"}
                        </div>
                        <div className="text-gray-600 text-sm capitalize font-medium">
                          {product?.product_type || "Unknown Type"}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3 mt-3">
                          <div className="flex items-center justify-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Created:</span>
                            <span>{new Date(req.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="text-blue-600 text-xs font-semibold bg-blue-50 rounded-full py-1 px-3 inline-block">
                            Click to view details
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <PickupRequestDetails
            request={selected}
            product={productDetailsMap[selected.listing_id]}
            basePrice={basePrice}
            onBack={() => setSelected(null)}
            onReject={handleReject}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
};

export default DeliveryAgentDashboard;
