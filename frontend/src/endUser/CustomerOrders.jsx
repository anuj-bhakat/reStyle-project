import React, { useEffect, useState } from "react";
import axios from "axios";

// Shows detailed product info in order preview, with colored brand/type and improved checklist styling
function CustomerOrdersPreview({ order }) {
  const productIds = Object.keys(order.products || []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-4xl mx-auto border border-gray-200">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight select-text">
            Order ID: <span className="text-indigo-600">{order.order_id}</span>
          </h2>
          <p className="text-gray-600 mt-1 font-medium">
            Ordered At:{" "}
            <span className="text-gray-900">{formatDateTime(order.created_at)}</span>
          </p>
        </div>
        <div className="text-gray-700 mt-3 sm:mt-0 font-medium">
          <span>Delivery Date:</span>{" "}
          <span className="text-gray-900">{formatDateTime(order.delivered_at)}</span>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {productIds.length > 0 ? (
          productIds.map((pid) => <ProductSummary key={pid} listingId={pid} />)
        ) : (
          <p className="text-gray-500 italic text-sm">No products in this order.</p>
        )}
      </div>

      {/* Footer info */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 border-t border-gray-300 pt-4 text-gray-800 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span
            className="bg-indigo-100 text-indigo-700 rounded-full px-3 py-0.5 shadow-inner"
            title="Number of products"
          >
            {productIds.length}
          </span>
          {productIds.length > 1 ? "products" : "product"}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600 font-normal">Other Charges</span>
          <span className="bg-blue-100 text-blue-800 rounded-lg px-3 py-0.5 w-fit shadow-inner">
            ₹{order.other_charges?.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600 font-normal">Total Price</span>
          <span className="bg-green-100 text-green-800 rounded-lg px-3 py-0.5 w-fit shadow-inner">
            ₹{order.total_price?.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600 font-normal">Order Status</span>
          <span
            className={`inline-block px-4 py-1 rounded-2xl font-semibold capitalize shadow-md text-center ${
              {
                ordered: "text-indigo-800 bg-indigo-200",
                delivering: "text-yellow-800 bg-yellow-200",
                delivered: "text-green-800 bg-green-200",
                cancelled: "text-red-800 bg-red-200",
                returned: "text-orange-800 bg-orange-200",
              }[order.status] ?? "text-gray-700 bg-gray-200"
            }`}
          >
            {order.status}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600 font-normal">Payment Status</span>
          <span
            className={`inline-block px-4 py-1 rounded-2xl font-semibold capitalize shadow-md text-center ${
              {
                paid: "text-green-800 bg-green-200",
                pending: "text-yellow-800 bg-yellow-200",
                failed: "text-red-800 bg-red-200",
                refunded: "text-blue-800 bg-blue-200",
              }[order.payment_status] ?? "text-gray-700 bg-gray-200"
            }`}
          >
            {order.payment_status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Product detail preview used within CustomerOrdersPreview with improved colors on brand/type and checklist labels
function ProductSummary({ listingId }) {
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorProduct, setErrorProduct] = useState(null);

  useEffect(() => {
    setLoadingProduct(true);
    axios
      .post(`http://localhost:3000/products/multiple`, {
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
      <div className="text-xs italic text-gray-400">Loading product...</div>
    );

  if (errorProduct)
    return (
      <div className="text-xs italic text-red-600">{errorProduct}</div>
    );

  if (!product) return null;

  return (
    <div className="flex border border-gray-300 rounded-lg p-4 gap-4 items-center bg-white shadow hover:shadow-lg transition-shadow duration-300">
      <img
        src={
          product.product_images.find((img) => img.is_primary)?.url ||
          "https://via.placeholder.com/80"
        }
        alt={`${product.brand} ${product.product_type}`}
        className="w-20 h-20 object-cover rounded-md flex-shrink-0 border border-gray-200"
        loading="lazy"
      />
      <div className="flex flex-col flex-grow">
        <h4 className="font-semibold truncate">
          <span className="text-indigo-700">{product.brand}</span>
          <span className="text-gray-700"> &nbsp;-&nbsp;</span>
          <span className="text-teal-700 capitalize">{product.product_type}</span>
        </h4>
        <p className="text-sm text-gray-600 truncate">{product.description}</p>
        <ul className="text-xs text-gray-700 mt-1 flex gap-4">
          <li>
            <span className="font-semibold text-blue-600">Size:</span>{" "}
            {product.checklist_json.size?.toString() || "N/A"}
          </li>
          <li>
            <span className="font-semibold text-pink-600">Color:</span>{" "}
            {product.checklist_json.color || "N/A"}
          </li>
          <li>
            <span className="font-semibold text-purple-600">Material:</span>{" "}
            {product.checklist_json.material || "N/A"}
          </li>
        </ul>
      </div>
      <div className="font-semibold text-indigo-700 w-24 text-right flex-shrink-0 text-lg">
        ₹{product.final_price ?? product.base_price ?? "N/A"}
      </div>
    </div>
  );
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const customerId = localStorage.getItem("userid");

  useEffect(() => {
    if (!customerId) {
      setErrorOrders("Customer ID not found in localStorage");
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    axios
      .get(`http://localhost:3000/customer_orders/customer/${customerId}`)
      .then((res) => {
        setOrders(res.data);
        setLoadingOrders(false);
      })
      .catch(() => {
        setErrorOrders("Failed to load orders");
        setLoadingOrders(false);
      });
  }, [customerId]);

  if (loadingOrders) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-indigo-600"
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
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (errorOrders) {
    return (
      <div className="text-center text-red-700 font-semibold mt-8 text-lg">
        {errorOrders}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-600 font-semibold text-lg">
        No orders found.
      </div>
    );
  }

  // Colors for badges
  const statusColorClass = {
    ordered: "text-indigo-800 bg-indigo-100",
    delivering: "text-yellow-800 bg-yellow-100",
    delivered: "text-green-800 bg-green-100",
    cancelled: "text-red-800 bg-red-100",
    returned: "text-orange-800 bg-orange-100",
  };

  const paymentStatusColorClass = {
    paid: "text-green-800 bg-green-100",
    pending: "text-yellow-800 bg-yellow-100",
    failed: "text-red-800 bg-red-100",
    refunded: "text-blue-800 bg-blue-100",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      {!selectedOrder && (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
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
              className="cursor-pointer flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-300 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-250 gap-3 text-center sm:text-left"
            >
              <div className="text-lg font-bold text-gray-900 truncate sm:w-1/4">
                Order: <span className="text-indigo-700">{order.order_id}</span>
              </div>
              <div className="text-indigo-700 font-bold text-lg sm:text-base whitespace-nowrap sm:w-1/5">
                ₹{order.total_price?.toLocaleString() ?? "0"}
              </div>
              <div
                className={`inline-block px-4 py-1 rounded-full font-bold capitalize text-center text-md shadow-md sm:w-1/5 ${
                  statusColorClass[order.status] ?? "text-gray-700 bg-gray-200"
                }`}
              >
                {order.status}
              </div>
              <div
                className={`inline-block px-4 py-1 rounded-full font-bold capitalize text-center text-md shadow-md sm:w-1/5 ${
                  paymentStatusColorClass[order.payment_status] ?? "text-gray-700 bg-gray-200"
                }`}
              >
                {order.payment_status.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mb-6 text-indigo-700 hover:text-indigo-900 font-semibold focus:outline-none"
            aria-label="Back to order list"
          >
            &larr; Back to Orders
          </button>
          <CustomerOrdersPreview order={selectedOrder} />
        </div>
      )}
    </div>
  );
}
