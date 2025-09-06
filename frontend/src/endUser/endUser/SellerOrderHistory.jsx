import React, { useEffect, useState } from "react";
import axios from "axios";

function SellerProductDetails({ product, backToList }) {
  const [mainImage, setMainImage] = useState(
    product.product_images.find((img) => img.is_primary)?.url || ""
  );
  const [conditionsJson, setConditionsJson] = useState(null);
  const [loadingConditions, setLoadingConditions] = useState(true);
  const [conditionsError, setConditionsError] = useState(null);

  useEffect(() => {
    setLoadingConditions(true);
    axios
      .get(`http://localhost:3000/pickup_requests/listing/${product.listing_id}`)
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

  const getStatusMessage = () => {
    if (product.status === "awaiting_pickup") {
      return (
        <span className="inline-block text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full font-semibold text-lg">
          Waiting to be picked up
        </span>
      );
    }
    if (product.status === "draft") {
      return (
        <span className="inline-block text-blue-700 bg-blue-100 px-4 py-2 rounded-full font-semibold text-lg">
          Waiting for confirmation
        </span>
      );
    }
    if (product.status === "picked_up" || product.status === "live") {
      return (
        <span className="inline-block text-green-700 bg-green-100 px-4 py-2 rounded-full font-semibold text-lg">
          Accepted
        </span>
      );
    }
    if (product.status === "rejected") {
      return (
        <span className="inline-block text-red-700 bg-red-100 px-4 py-2 rounded-full font-semibold text-lg">
          Rejected
        </span>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
        <button
          onClick={backToList}
          className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
          aria-label="Go back to order list"
        >
          &larr; Back to Orders
        </button>
      </div>

      {/* Details grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Images */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <img
              src={mainImage}
              alt={`${product.brand} product`}
              className="w-full h-full object-contain bg-white"
              loading="lazy"
            />
          </div>
          <div className="mt-6 flex flex-row space-x-4 overflow-x-auto w-full">
            {product.product_images.map((img) => (
              <button
                key={img.image_id}
                onClick={() => setMainImage(img.url)}
                className={`flex-shrink-0 border rounded-lg p-1 focus:outline-none transition-shadow duration-200 ${
                  mainImage === img.url ? "border-indigo-600 shadow-lg" : "border-gray-300"
                }`}
                aria-label="Select product image"
              >
                <img
                  src={img.url}
                  alt={`${product.brand} thumbnail`}
                  className="h-20 w-20 object-cover rounded"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Content */}
        <div className="md:w-1/2 flex flex-col justify-start space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {product.brand}{" "}
            <span className="text-indigo-600">- {product.product_type}</span>
          </h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Product Attributes (Size, Color, Material) */}
          <section className="grid grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg shadow-inner">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Size
              </h3>
              <p className="text-gray-900 text-base font-medium">
                {product.checklist_json.size?.toString() || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Color
              </h3>
              <p className="text-gray-900 text-base font-medium">
                {product.checklist_json.color || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Material
              </h3>
              <p className="text-gray-900 text-base font-medium">
                {product.checklist_json.material || "N/A"}
              </p>
            </div>
          </section>

          {/* Condition: professional ecommerce style */}
          <section className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg border-b border-gray-300 pb-2">
              Condition
            </h3>

            {loadingConditions && (
              <p className="text-gray-500 italic">Loading conditions...</p>
            )}

            {conditionsError && (
              <p className="text-red-600 font-semibold">{conditionsError}</p>
            )}

            {!loadingConditions &&
              !conditionsError &&
              (!conditionsJson || Object.keys(conditionsJson).length === 0) && (
                <p className="text-gray-600 italic">No condition information available.</p>
              )}

            {!loadingConditions &&
              !conditionsError &&
              conditionsJson &&
              Object.keys(conditionsJson).length > 0 && (
                <ul className="grid grid-cols-2 gap-4">
                  {Object.entries(conditionsJson).map(([key, val]) => (
                    <li
                      key={key}
                      className="flex items-center space-x-3 text-base font-medium"
                    >
                      {val ? (
                        <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center bg-red-100 rounded-full text-red-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              )}
          </section>

          {/* Price and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
            <div className="text-xl font-semibold text-gray-900">
              Price:{" "}
              <span className="font-medium text-gray-800">{getPriceDisplay()}</span>
            </div>
            <div>{getStatusMessage()}</div>
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

  const fetchOrders = async () => {
    const seller_id = localStorage.getItem("userid");
    if (!seller_id) {
      setError("Seller ID not found in localStorage");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/products/history/${seller_id}`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <svg
          className="animate-spin h-12 w-12 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-600 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (selectedProduct) {
    // Show product detail view including its header
    return (
      <SellerProductDetails product={selectedProduct} backToList={() => setSelectedProduct(null)} />
    );
  }

  // SellerOrderHistory WITHOUT header as requested
  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md min-h-screen">
      {/* Products grid smaller cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {orders.map((product) => {
          const primaryImage = product.product_images.find((img) => img.is_primary);

          return (
            <div
              key={product.listing_id}
              onClick={() => handleProductClick(product)}
              className="cursor-pointer group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col"
              tabIndex={0}
              role="button"
              aria-label={`View details for ${product.brand} ${product.product_type}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleProductClick(product);
                }
              }}
            >
              <div className="relative w-full h-40 overflow-hidden rounded-t-lg bg-gray-50">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={`${product.brand} ${product.product_type}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-grow">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {product.brand} - {product.product_type}
                </h3>
                <p className="text-gray-700 text-xs line-clamp-2">{product.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
