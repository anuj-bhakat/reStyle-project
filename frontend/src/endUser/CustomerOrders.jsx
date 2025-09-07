import React, { useEffect, useState } from "react";
import axios from "axios";

// Shows detailed product info in order preview, with polished typography and subtle badges
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
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6 max-w-4xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight select-text">
            Order ID: <span className="text-indigo-600">{order.order_id}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Ordered At:{" "}
            <span className="text-gray-800 font-semibold">
              {formatDateTime(order.created_at)}
            </span>
          </p>
        </div>
        <div className="text-sm text-gray-600 mt-3 sm:mt-0 font-medium">
          <span>Delivery Date: </span>
          <span className="text-gray-800 font-semibold">
            {formatDateTime(order.delivered_at)}
          </span>
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
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 border-t border-gray-200 pt-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5 text-sm font-medium"
            title="Number of products"
          >
            {productIds.length}
          </span>
          {productIds.length > 1 ? "products" : "product"}
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Other Charges</span>
          <span className="bg-blue-100 text-blue-700 text-sm px-2.5 py-0.5 rounded-md w-fit font-semibold">
            ₹{order.other_charges?.toLocaleString() ?? "0"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Total Price</span>
          <span className="bg-green-100 text-green-800 text-sm px-2.5 py-0.5 rounded-md w-fit font-semibold">
            ₹{order.total_price?.toLocaleString() ?? "0"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Order Status</span>
          <span
            className={`px-3 py-0.5 rounded-full text-sm font-semibold capitalize text-center ${
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
          <span className="text-gray-500 font-medium">Payment Status</span>
          <span
            className={`px-3 py-0.5 rounded-full text-sm font-semibold capitalize text-center ${
              {
                paid: "text-green-800 bg-green-200",
                pending: "text-yellow-800 bg-yellow-200",
                failed: "text-red-800 bg-red-200",
                refunded: "text-blue-800 bg-blue-200",
              }[order.payment_status] ?? "text-gray-700 bg-gray-200"
            }`}
          >
            {order.payment_status === "pending"
              ? "Payment Pending"
              : order.payment_status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Product detail preview inside order
function ProductSummary({ listingId }) {
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorProduct, setErrorProduct] = useState(null);

  useEffect(() => {
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
    return <div className="text-xs italic text-gray-400">Loading product...</div>;
  if (errorProduct)
    return <div className="text-xs italic text-red-600">{errorProduct}</div>;
  if (!product) return null;

  return (
    <div className="flex border border-gray-200 rounded-lg p-4 gap-4 items-center bg-white hover:shadow-md transition duration-200">
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
        <h4 className="font-medium text-gray-900 truncate">
          <span className="text-indigo-600">{product.brand}</span>
          {" - "}
          <span className="text-teal-600 capitalize">{product.product_type}</span>
        </h4>
        <p className="text-sm text-gray-600 truncate">{product.description}</p>
        <ul className="text-xs text-gray-500 mt-1 flex gap-4">
          <li>
            <span className="font-medium text-gray-700">Size:</span>{" "}
            {product.checklist_json.size?.toString() || "N/A"}
          </li>
          <li>
            <span className="font-medium text-gray-700">Color:</span>{" "}
            {product.checklist_json.color || "N/A"}
          </li>
          <li>
            <span className="font-medium text-gray-700">Material:</span>{" "}
            {product.checklist_json.material || "N/A"}
          </li>
        </ul>
      </div>
      <div className="text-indigo-700 font-medium w-24 text-right flex-shrink-0 text-base">
        ₹{product.final_price ?? product.base_price ?? "N/A"}
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
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (errorOrders) {
    return (
      <div className="text-center text-red-600 font-medium mt-8 text-base">
        {errorOrders}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-600 font-medium text-base">
        No orders found.
      </div>
    );
  }

  // Badge colors
  const statusColorClass = {
    ordered: "text-indigo-800 bg-indigo-200",
    delivering: "text-yellow-800 bg-yellow-200",
    delivered: "text-green-800 bg-green-200",
    cancelled: "text-red-800 bg-red-200",
    returned: "text-orange-800 bg-orange-200",
  };

  const paymentStatusColorClass = {
    paid: "text-green-800 bg-green-200",
    pending: "text-yellow-800 bg-yellow-200",
    failed: "text-red-800 bg-red-200",
    refunded: "text-blue-800 bg-blue-200",
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
              className="cursor-pointer flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition duration-200 gap-3 text-center sm:text-left"
            >
              <div className="text-sm text-gray-700 sm:w-1/4 font-semibold">
                Ordered On: <br />
                <span className="text-gray-900 font-bold">
                  {formatDateTime(order.created_at)}
                </span>
              </div>
              <div className="text-base font-semibold text-gray-900 truncate sm:w-1/4">
                <span>Order ID:</span> <br />
                <span className="text-indigo-600 font-bold">{order.order_id}</span>
              </div>
              <div className="text-indigo-700 font-medium text-base sm:w-1/5">
                ₹{order.total_price?.toLocaleString() ?? "0"}
              </div>
              <div
                className={`px-3 py-0.5 rounded-full text-sm font-semibold capitalize text-center sm:w-1/5 ${
                  statusColorClass[order.status] ?? "text-gray-700 bg-gray-200"
                }`}
              >
                {order.status}
              </div>
              <div
                className={`px-3 py-0.5 rounded-full text-sm font-semibold capitalize text-center sm:w-1/5 ${
                  paymentStatusColorClass[order.payment_status] ?? "text-gray-700 bg-gray-200"
                }`}
              >
                {order.payment_status === "pending"
                  ? "Payment Pending"
                  : order.payment_status.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
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
