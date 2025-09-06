import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PickupRequestDetails from "./PickupRequestDetails";

const DeliveryAgentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("pickup");
  const [basePrice, setBasePrice] = useState(null);
  const [productDetailsMap, setProductDetailsMap] = useState({});

  const navigate = useNavigate();

  const token = localStorage.getItem("agentToken");
  const agentId = localStorage.getItem("agent_id");

  useEffect(() => {
    if (!token) {
      // If no token, redirect to login
      navigate("/agent-login", { replace: true });
      return;
    }
    fetchPickupRequests();
  }, [token, navigate]);

  const fetchPickupRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/pickup_requests/get/${agentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const requests = res.data || [];
      setRequests(requests);

      const productFetches = await Promise.all(
        requests.map((req) =>
          axios
            .get(`http://localhost:3000/products/${req.listing_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => ({ listing_id: req.listing_id, data: res.data }))
            .catch(() => null)
        )
      );

      const productMap = {};
      productFetches.forEach((entry) => {
        if (entry) {
          productMap[entry.listing_id] = entry.data;
        }
      });

      setProductDetailsMap(productMap);
    } catch (err) {
      setError("Failed to fetch pickup requests.");
    }
  };

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
        `http://localhost:3000/products/${listing_id}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(
        `http://localhost:3000/pickup_requests/${pickup_request_id}`,
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
        `http://localhost:3000/products/${listing_id}`,
        { status: "picked_up" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(
        `http://localhost:3000/pickup_requests/${pickup_request_id}`,
        { conditions_json: conditions, status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const basePriceResponse = await axios.get(
        `http://localhost:3000/products/base-price/${pickup_request_id}`,
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
    <div className="min-h-screen w-full flex flex-col items-center bg-blue-50">
      {/* HEADER */}
      <header className="w-full bg-white shadow sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelected(null);
                setActiveSection("pickup");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeSection === "pickup"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              Pickup Requests
            </button>
            <button
              onClick={() => {
                setSelected(null);
                setActiveSection("history");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeSection === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              History
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="w-full max-w-7xl px-6 py-8">
        {error && <div className="text-red-600 text-center mb-6">{error}</div>}

        {!selected ? (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              {activeSection === "pickup" ? "Pickup Requests" : "Pickup History"}
            </h2>

            {filteredRequests.length === 0 ? (
              <div className="text-gray-600 text-center">
                No {activeSection === "pickup" ? "pickup requests" : "history"} found.
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 justify-center">
                {filteredRequests.map((req) => {
                  const product = productDetailsMap[req.listing_id];
                  const primaryImage = getPrimaryImage(product);
                  return (
                    <div
                      key={req.pickup_request_id}
                      className="bg-white rounded-xl shadow border p-4 max-w-xs min-w-[260px] cursor-pointer hover:shadow-lg transition relative"
                      onClick={() => setSelected(req)}
                    >
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                        {req.status}
                      </span>
                      {primaryImage && (
                        <img
                          src={primaryImage}
                          alt="Product"
                          className="rounded-md shadow mx-auto mb-4 w-3/4"
                        />
                      )}
                      <div className="text-center">
                        <div className="font-bold text-lg">{product?.brand || "Brand Unknown"}</div>
                        <div className="text-gray-600 text-sm capitalize">{product?.product_type || "Unknown Type"}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          <strong>Created:</strong> {new Date(req.created_at).toLocaleString()}
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