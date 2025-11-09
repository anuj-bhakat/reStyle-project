import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Enhanced order detail preview with modern design
function CustomerOrdersPreview({ order, onBack }) {
  const productIds = Object.keys(order.products || []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ordered":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "delivering":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-3a2 2 0 00-2-2H9z" />
          </svg>
        );
      case "delivered":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "cancelled":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "returned":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPaymentIcon = (status) => {
    switch (status) {
      case "paid":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "failed":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "refunded":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Order Details
            </h2>
            <p className="text-indigo-100 font-medium text-sm">
              <span className="text-white font-mono">{order.order_id}</span>
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-100 p-1.5 rounded-md">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 9l-3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Ordered</p>
                <p className="text-gray-900 font-semibold text-sm">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-1.5 rounded-md">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-3a2 2 0 00-2-2H9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Delivered</p>
                <p className="text-gray-900 font-semibold text-sm">{formatDateTime(order.delivered_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Order Items ({productIds.length})
          </h3>
          <div className="space-y-3">
            {productIds.length > 0 ? (
              productIds.map((pid) => <ProductSummary key={pid} listingId={pid} />)
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 italic text-sm">No products in this order.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Order Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-100 p-1.5 rounded-md">
                  <span className="text-indigo-600 font-bold text-sm">{productIds.length}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Items</p>
                  <p className="text-gray-900 font-semibold text-sm">{productIds.length > 1 ? "Products" : "Product"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded-md">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Other</p>
                  <p className="text-gray-900 font-semibold text-sm">₹{order.other_charges?.toLocaleString() ?? "0"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-1.5 rounded-md">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-green-600 font-bold text-sm">₹{order.total_price?.toLocaleString() ?? "0"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-md ${
                  order.status === "delivered" ? "bg-green-100" :
                  order.status === "delivering" ? "bg-yellow-100" :
                  order.status === "cancelled" ? "bg-red-100" : "bg-indigo-100"
                }`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    {
                      ordered: "text-indigo-800 bg-indigo-100",
                      delivering: "text-yellow-800 bg-yellow-100",
                      delivered: "text-green-800 bg-green-100",
                      cancelled: "text-red-800 bg-red-100",
                      returned: "text-orange-800 bg-orange-100",
                    }[order.status] ?? "text-gray-800 bg-gray-100"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-md ${
                order.payment_status === "paid" ? "bg-green-100" :
                order.payment_status === "pending" ? "bg-yellow-100" :
                order.payment_status === "failed" ? "bg-red-100" : "bg-blue-100"
              }`}>
                {getPaymentIcon(order.payment_status)}
              </div>
              <div>
                <p className="text-xs text-gray-600">Payment</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  {
                    paid: "text-green-800 bg-green-100",
                    pending: "text-yellow-800 bg-yellow-100",
                    failed: "text-red-800 bg-red-100",
                    refunded: "text-blue-800 bg-blue-100",
                  }[order.payment_status] ?? "text-gray-800 bg-gray-100"
                }`}>
                  {order.payment_status === "pending" ? "Payment Pending" : order.payment_status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced product detail preview inside order
function ProductSummary({ listingId }) {
  const [product, setProduct] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorProduct, setErrorProduct] = useState(null);

  useEffect(() => {
    axios
      .post(`${baseUrl}/products/multiple`, {
        listing_ids: [listingId],
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProduct(res.data[0]);
        } else {
          setErrorProduct("Product data not found");
        }
        setLoadingProduct(false);
      })
      .catch(() => {
        setErrorProduct("Failed to load product details");
        setLoadingProduct(false);
      });
  }, [listingId]);

  if (loadingProduct)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  
  if (errorProduct)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 text-sm font-medium">{errorProduct}</span>
        </div>
      </div>
    );
  
  if (!product) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 group">
      <div className="flex space-x-3 items-center">
        <div className="relative">
          <img
            src={
              product.product_images.find((img) => img.is_primary)?.url ||
              "https://via.placeholder.com/80"
            }
            alt={`${product.brand} ${product.product_type}`}
            className="w-16 h-16 object-cover rounded-md border border-gray-200 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {product.condition === 'new' ? 'NEW' : product.condition === 'gently_used' ? 'USED' : 'WORN'}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-base mb-1">
                <span className="text-indigo-600">{product.brand}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="text-teal-600 capitalize">{product.product_type}</span>
              </h4>
              <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.description}</p>
              
              {/* Product Attributes */}
              <div className="flex flex-wrap gap-1">
                {product.checklist_json?.size && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {product.checklist_json.size}
                  </span>
                )}
                {product.checklist_json?.color && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    {product.checklist_json.color}
                  </span>
                )}
                {product.checklist_json?.material && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {product.product_type === 'wristwatch' ? 'Strap' : 'Material'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-lg font-bold text-indigo-600">
                ₹{product.final_price ?? product.base_price ?? "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format date
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  const dt = new Date(dateTimeStr);
  return dt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const customerId = localStorage.getItem("userid");

  useEffect(() => {
    const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
  }, [navigate]);

  useEffect(() => {
    if (!customerId) {
      setErrorOrders("Customer ID not found");
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    axios
      .get(`${baseUrl}/customer_orders/customer/${customerId}`)
      .then((res) => {
        // Sort orders descending by created_at
        const sortedOrders = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);
        setLoadingOrders(false);
      })
      .catch(() => {
        setErrorOrders("Failed to load orders");
        setLoadingOrders(false);
      });
  }, [customerId]);

  if (loadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading your orders</h3>
          <p className="text-gray-600 text-sm">Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  if (errorOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{errorOrders}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4">
          <div className="text-8xl mb-6">📦</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h3>
          <p className="text-gray-600 mb-8">You haven't placed any orders. Start shopping to see your orders here!</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  // Enhanced badge colors with better styling
  const statusColorClass = {
    ordered: "text-indigo-800 bg-indigo-100 border border-indigo-200",
    delivering: "text-yellow-800 bg-yellow-100 border border-yellow-200",
    delivered: "text-green-800 bg-green-100 border border-green-200",
    cancelled: "text-red-800 bg-red-100 border border-red-200",
    returned: "text-orange-800 bg-orange-100 border border-orange-200",
  };

  const paymentStatusColorClass = {
    paid: "text-green-800 bg-green-100 border border-green-200",
    pending: "text-yellow-800 bg-yellow-100 border border-yellow-200",
    failed: "text-red-800 bg-red-100 border border-red-200",
    refunded: "text-blue-800 bg-blue-100 border border-blue-200",
  };

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-3">
        {!selectedOrder ? (
          <>
            {/* Orders Grid */}
            <div className="space-y-3">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for order ${order.order_id}`}
                  onClick={() => setSelectedOrder(order)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedOrder(order);
                    }
                  }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-center">
                    {/* Order Date */}
                    <div className="lg:col-span-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Ordered</div>
                      <div className="text-gray-900 font-semibold text-sm">
                        {formatDateTime(order.created_at).split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDateTime(order.created_at).split(',')[1]}
                      </div>
                    </div>

                    {/* Order ID */}
                    <div className="lg:col-span-2">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Order ID</div>
                      <div className="text-indigo-600 font-bold font-mono text-sm group-hover:text-indigo-700 transition-colors">
                        {order.order_id}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="lg:col-span-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Total</div>
                      <div className="text-indigo-700 font-bold text-lg">
                        ₹{order.total_price?.toLocaleString() ?? "0"}
                      </div>
                    </div>

                    {/* Order Status */}
                    <div className="lg:col-span-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Status</div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColorClass[order.status] ?? "text-gray-800 bg-gray-100 border border-gray-200"}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="lg:col-span-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Payment</div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${paymentStatusColorClass[order.payment_status] ?? "text-gray-800 bg-gray-100 border border-gray-200"}`}>
                        {order.payment_status === "pending" ? "Pending" : order.payment_status.replace("_", " ")}
                      </span>
                    </div>

                    {/* View Details Button */}
                    <div className="lg:col-span-1 flex justify-end">
                      <div className="bg-indigo-50 group-hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1">
                        <span className="text-sm">View</span>
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <CustomerOrdersPreview 
            order={selectedOrder} 
            onBack={() => setSelectedOrder(null)} 
          />
        )}
      </div>
    </div>
  );
}

