import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function formatDate(datetime) {
  if (!datetime) return "N/A";
  const dt = new Date(datetime);
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "numeric",
    hour12: true,
  });
}

const ManageCustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("accept"); // accept, pending, delivered

  const navigate = useNavigate();
  const deliveryAgentId = localStorage.getItem("agent_id");

  useEffect(() => {
    fetchOrdersByTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedOrderId) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [selectedOrderId]);

  // Fetch orders based on active tab and apply filtering for pending and delivered tabs
  const fetchOrdersByTab = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (tab === "accept") {
        // Orders with status "ordered"
        res = await axios.get("http://localhost:3000/customer_orders/status/ordered");
        const orders = res.data || [];
        setOrders(orders);
        if (orders.length) {
          const listingIds = extractListingIds(orders);
          await fetchProductDetails(listingIds);
        } else {
          setOrders([]);
          setProductDetails({});
        }
      } else if (tab === "pending" || tab === "delivered") {
        if (!deliveryAgentId) {
          setError("Delivery agent not identified");
          setOrders([]);
          setProductDetails({});
          setLoading(false);
          return;
        }
        // Get all orders assigned to this agent
        res = await axios.get(`http://localhost:3000/customer_orders/agent/${deliveryAgentId}`);
        let agentOrders = res.data || [];

        if (tab === "pending") {
          agentOrders = agentOrders.filter(order => order.status === "delivering");
        } else if (tab === "delivered") {
          agentOrders = agentOrders.filter(order => order.status === "delivered");
        }

        setOrders(agentOrders);

        if (agentOrders.length) {
          const listingIds = extractListingIds(agentOrders);
          await fetchProductDetails(listingIds);
        } else {
          setOrders([]);
          setProductDetails({});
        }
      }
    } catch (err) {
      setError("Failed to fetch orders.");
      setOrders([]);
      setProductDetails({});
    } finally {
      setLoading(false);
    }
  };

  const extractListingIds = (orders) => {
    const ids = new Set();
    orders.forEach(order => {
      Object.keys(order.products).forEach(pid => ids.add(pid));
    });
    return Array.from(ids);
  };

  const fetchProductDetails = async (listingIds) => {
    if (!listingIds.length) return;
    try {
      const res = await axios.post("http://localhost:3000/products/multiple", { listing_ids: listingIds });
      const map = {};
      res.data.forEach(prod => {
        map[prod.listing_id] = prod;
      });
      setProductDetails(map);
    } catch (e) {
      console.error("Error fetching product details:", e);
    }
  };

  const handleSelect = (id) => setSelectedOrderId(id);

  // Action handlers
  const handleAcceptRequest = async () => {
    if (!selectedOrderId) return;
    setUpdating(true);
    setError(null);

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      setError("Order not found");
      setUpdating(false);
      return;
    }
    if (!deliveryAgentId) {
      setError("Delivery agent not identified");
      setUpdating(false);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/customer_orders/${selectedOrderId}`, {
        ...order,
        status: "delivering",
        deliveryagent_id: deliveryAgentId,
      });
      await fetchOrdersByTab("accept");
      setSelectedOrderId(null);
    } catch {
      setError("Failed to accept request");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedOrderId) return;
    setUpdating(true);
    setError(null);

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      setError("Order not found");
      setUpdating(false);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/customer_orders/${selectedOrderId}`, {
        ...order,
        status: "delivered",
        payment_status: "paid",
        delivered_at: new Date().toISOString(),
      });
      // Refetch data for current tab
      await fetchOrdersByTab(activeTab);
      setSelectedOrderId(null);
    } catch {
      setError("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const getActionButtonText = () => {
    if (activeTab === "accept") return "Accept Request";
    if (activeTab === "pending") return "Mark as Delivered & Paid";
    return "Delivered";
  };

  const getActionHandler = () => {
    if (activeTab === "accept") return handleAcceptRequest;
    if (activeTab === "pending") return handleMarkDelivered;
    return null;
  };

  const isActionDisabled = () => {
    if (activeTab === "accept") return updating;
    if (activeTab === "pending") return updating || !activeTab === "pending" || false;
    if (activeTab === "delivered") return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-indigo-600 mx-auto" />
          <p className="text-indigo-700 mt-6 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex justify-center gap-6 bg-white py-6 border-b shadow-sm">
        {["accept", "pending", "delivered"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-indigo-200"
            }`}
          >
            {tab === "accept" ? "Accept Requests" : (tab === "pending" ? "Pending Deliveries" : "Deliveries")}
          </button>
        ))}
      </div>

      <div className={`p-8 bg-gradient-to-br from-gray-100 to-white min-h-screen ${selectedOrderId ? "filter blur-sm" : ""}`}>
        {orders.length === 0 ? (
          <p className="text-center mt-20 text-lg text-gray-500">
            No orders found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => handleSelect(order.id)}
                onKeyDown={e => (e.key === "Enter" || e.key === " " ? handleSelect(order.id) : null)}
                tabIndex={0}
                role="button"
                className={`cursor-pointer border rounded-xl shadow-sm p-6 bg-white transition transform ${
                  selectedOrderId === order.id ? "border-indigo-500 shadow-lg scale-105" : "border-gray-300"
                } hover:shadow-lg`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-indigo-700 truncate">{order.order_id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "delivering"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "ordered"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600"
                  } capitalize`}>{order.status}</span>
                </div>
                <div className="flex justify-between text-sm mb-1 text-gray-700">
                  <span>Ordered At:</span>
                  <span>{formatDate(order.order_datetime)}</span>
                </div>
                <div className="flex justify-between mb-1 font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{order.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Payment Status:</span>
                  <span className={`capitalize ${
                    order.payment_status === "paid"
                      ? "text-green-600"
                      : order.payment_status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>{order.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailsModal
          order={orders.find(o => o.id === selectedOrderId)}
          productDetails={productDetails}
          onClose={() => setSelectedOrderId(null)}
          onUpdate={activeTab === "accept" ? handleAcceptRequest : handleMarkDelivered}
          updating={updating}
          error={error}
          activeTab={activeTab}
        />
      )}
    </>
  );
};

const OrderDetailsModal = ({ order, productDetails, onClose, onUpdate, updating, error, activeTab }) => {
  if (!order) return null;

  const productIds = Object.keys(order.products || {});

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40" />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-600 text-3xl hover:text-gray-900 focus:outline-none"
            aria-label="Close details"
          >
            &times;
          </button>

          <h2 id="order-details-title" className="text-indigo-700 text-3xl font-bold mb-8">
            {order.order_id}
          </h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
            <div className="font-semibold">Status :</div>
            <div className="capitalize">{order.status}</div>

            <div className="font-semibold">Ordered At :</div>
            <div>{formatDate(order.order_datetime)}</div>

            <div className="font-semibold">Payment Status :</div>
            <div className={`capitalize font-semibold ${
              order.payment_status === "paid" ? "text-green-600" : 
              order.payment_status === "pending" ? "text-yellow-600" :
              "text-red-600"
            }`}>{order.payment_status}</div>

            <div className="font-semibold">Total :</div>
            <div className="text-indigo-900 font-semibold text-lg text-right">₹{order.total_price.toLocaleString()}</div>
          </div>

          <div className="mt-8 space-y-6">
            {productIds.map(pid => {
              const product = productDetails[pid];
              if (!product) return null;
              const primaryImg = product.product_images?.find(img => img.is_primary);

              return (
                <div key={pid} className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-6 max-w-3xl">
                    {primaryImg ? (
                      <img src={primaryImg.url} alt={`${product.brand} ${product.product_type}`} className="w-28 h-28 object-contain rounded-lg" />
                    ) : (
                      <div className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400">No Image</div>
                    )}
                    <div>
                      <h3 className="text-indigo-700 font-semibold text-xl truncate">{`${product.brand} ${product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}`}</h3>
                      <p className="text-gray-600 truncate">{product.description}</p>
                      <div className="mt-2 max-w-xs flex flex-wrap gap-2 text-xs text-gray-700">
                        {product.checklist_json && Object.entries(product.checklist_json).map(([k,v]) => (
                          <span key={k} className="bg-indigo-100 px-2 py-1 rounded">{`${k.replace("_", " ")}: ${v}`}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-indigo-900 font-semibold text-lg w-28 text-right">₹{order.products[pid]?.toLocaleString()}</div>
                </div>
              );
            })}
          </div>

          {error && <p className="text-red-600 text-center mt-6 font-semibold">{error}</p>}

          <div className="mt-10 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100">Close</button>
            <button
              onClick={onUpdate}
              disabled={updating || (activeTab === "pending" && order.status === "delivered") || (activeTab === "delivered")}
              className={`px-6 py-2 rounded font-semibold text-white transition ${updating || (activeTab === "pending" && order.status === "delivered") || (activeTab === "delivered") ? "bg-gray-400 cursor-not-allowed" : activeTab === "accept" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {updating ? "Processing..." : getActionButtonText(activeTab)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const getActionButtonText = (tab) => {
  if (tab === "accept") return "Accept Request";
  if (tab === "pending") return "Mark as Delivered & Paid";
  return "Delivered";
};

export default ManageCustomerOrders;
