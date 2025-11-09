import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SellerProductDetails({ product, backToList }) {
  const [mainImage, setMainImage] = useState(
    product.product_images.find((img) => img.is_primary)?.url || ""
  );
  const [conditionsJson, setConditionsJson] = useState(null);
  const [loadingConditions, setLoadingConditions] = useState(true);
  const [conditionsError, setConditionsError] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    setLoadingConditions(true);
    axios
      .get(`${baseUrl}/pickup_requests/listing/${product.listing_id}`)
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          const firstWithConditions =
            data.find(
              (item) =>
                item.conditions_json &&
                Object.keys(item.conditions_json).length > 0
            ) || data[0];
          setConditionsJson(firstWithConditions.conditions_json || {});
        } else {
          setConditionsJson({});
        }
        setLoadingConditions(false);
      })
      .catch(() => {
        setConditionsError("Failed to load condition data.");
        setLoadingConditions(false);
      });
  }, [product.listing_id]);

  const getPriceDisplay = () => {
    if (product.base_price !== null && product.base_price !== undefined) {
      return `₹${product.base_price.toLocaleString()}`;
    }
    if (product.algorithm_price) {
      return `₹${product.algorithm_price.start.toLocaleString()} - ₹${product.algorithm_price.end.toLocaleString()}`;
    }
    return "Price unavailable";
  };

  const getStatusConfig = () => {
    if (product.status === "awaiting_pickup") {
      return {
        text: "Waiting to be picked up",
        className: "text-yellow-800 bg-yellow-100 border border-yellow-200",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    if (product.status === "draft") {
      return {
        text: "Waiting for confirmation",
        className: "text-blue-800 bg-blue-100 border border-blue-200",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      };
    }
    if (product.status === "picked_up" || product.status === "live") {
      return {
        text: "Accepted",
        className: "text-green-800 bg-green-100 border border-green-200",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      };
    }
    if (product.status === "rejected") {
      return {
        text: "Rejected",
        className: "text-red-800 bg-red-100 border border-red-200",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      };
    }
    return {
      text: product.status,
      className: "text-gray-800 bg-gray-100 border border-gray-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Product Details
                </h1>
              </div>
              <button
                onClick={backToList}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Image Gallery */}
              <div className="lg:w-1/2">
                <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-md mb-3">
                  <img
                    src={mainImage}
                    alt={`${product.brand} product`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.product_images.map((img) => (
                    <button
                      key={img.image_id}
                      onClick={() => setMainImage(img.url)}
                      className={`flex-shrink-0 border-2 rounded-lg p-1 transition-all duration-300 ${
                        mainImage === img.url
                          ? "border-indigo-500 shadow-md scale-105"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      aria-label="Select product image"
                    >
                      <img
                        src={img.url}
                        alt={`${product.brand} thumbnail`}
                        className="h-16 w-16 object-cover rounded-md"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Product Information */}
              <div className="lg:w-1/2 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {product.brand}
                  </h2>
                  <h3 className="text-lg text-indigo-600 font-semibold mb-3 capitalize">
                    {product.product_type}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Attributes */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-base font-bold text-gray-900 mb-3">Product Details</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Size</h5>
                      <p className="text-gray-900 font-bold text-sm">
                        {product.checklist_json.size?.toString() || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Color</h5>
                      <p className="text-gray-900 font-bold text-sm">
                        {product.checklist_json.color || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Material</h5>
                      <p className="text-gray-900 font-bold text-sm">
                        {product.checklist_json.material || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Condition Assessment */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h4 className="text-base font-bold text-gray-900 mb-3">Condition Assessment</h4>

                  {loadingConditions && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600 text-sm">Loading conditions...</span>
                    </div>
                  )}

                  {conditionsError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-700 font-medium text-sm">{conditionsError}</span>
                      </div>
                    </div>
                  )}

                  {!loadingConditions && !conditionsError && (!conditionsJson || Object.keys(conditionsJson).length === 0) && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 italic text-sm">No condition information available.</p>
                    </div>
                  )}

                  {!loadingConditions && !conditionsError && conditionsJson && Object.keys(conditionsJson).length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(conditionsJson).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border border-gray-100"
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                            val ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {val ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price and Status */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Listed Price</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {getPriceDisplay()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.className}`}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerOrderHistory() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
  }, [navigate]);

  const fetchOrders = async () => {
    const seller_id = localStorage.getItem("userid");
    if (!seller_id) {
      setError("Seller ID not found");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/products/history/${seller_id}`);
      setOrders(response.data);
      setLoading(false);
    } catch {
      setError("Failed to fetch order history.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProductClick = async (product) => {
    setLoading(true);
    try {
      await fetchOrders();
      setSelectedProduct(product);
      setLoading(false);
    } catch {
      setError("Failed to refresh order history.");
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    if (status === "awaiting_pickup") {
      return {
        className: "text-yellow-800 bg-yellow-100 border border-yellow-200",
        text: "Pickup Pending",
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    }
    if (status === "draft") {
      return {
        className: "text-blue-800 bg-blue-100 border border-blue-200",
        text: "Pending",
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      };
    }
    if (status === "picked_up" || status === "live") {
      return {
        className: "text-green-800 bg-green-100 border border-green-200",
        text: "Live",
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      };
    }
    if (status === "rejected") {
      return {
        className: "text-red-800 bg-red-100 border border-red-200",
        text: "Rejected",
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      };
    }
    return {
      className: "text-gray-800 bg-gray-100 border border-gray-200",
      text: status,
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  };

  if (loading) {
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
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading your listings</h3>
          <p className="text-gray-600 text-sm">Please wait while we fetch your product history</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
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

  if (selectedProduct) {
    return (
      <SellerProductDetails product={selectedProduct} backToList={() => setSelectedProduct(null)} />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4">
          <div className="text-8xl mb-6">📦</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No products listed yet</h3>
          <p className="text-gray-600 mb-8">You haven't listed any products for sale. Start selling to see your history here!</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Start Selling
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-3">
        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {orders.map((product, index) => {
            const primaryImage = product.product_images.find((img) => img.is_primary);
            const statusConfig = getStatusConfig(product.status);
            const getPriceDisplay = () => {
              if (product.base_price !== null && product.base_price !== undefined) {
                return `₹${product.base_price.toLocaleString()}`;
              }
              if (product.algorithm_price) {
                return `₹${product.algorithm_price.start.toLocaleString()} - ₹${product.algorithm_price.end.toLocaleString()}`;
              }
              return "N/A";
            };

            return (
              <div
                key={product.listing_id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.01] group"
                tabIndex={0}
                role="button"
                aria-label={`View details for ${product.brand} ${product.product_type}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleProductClick(product);
                  }
                }}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="relative h-32 overflow-hidden bg-gray-50">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={`${product.brand} ${product.product_type}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-1.5 right-1.5">
                    <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.className}`}>
                      {statusConfig.icon}
                      <span className="ml-0.5">{statusConfig.text}</span>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                    {product.brand}
                  </h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-1 capitalize">
                    {product.product_type}
                  </p>
                  
                  {/* Product Attributes */}
                  <div className="flex flex-wrap gap-1">
                    {product.checklist_json?.size && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {product.checklist_json.size}
                      </span>
                    )}
                    {product.checklist_json?.color && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {product.checklist_json.color}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
