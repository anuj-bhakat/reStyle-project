import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userid = localStorage.getItem("userid");

  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const isCartCheckout = location.state?.fromCart === true;
  const singleProduct = location.state?.product;
  const cartProducts = location.state?.products;

  // Fetch address and calculate pricing
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { address } = response.data.user;
        setUserAddress(address);
      } catch (err) {
        setError("Failed to fetch user address");
      }
    };

    if (!singleProduct && !cartProducts) {
      setError("No product(s) to checkout.");
      return;
    }

    let items = isCartCheckout ? cartProducts : [singleProduct];

    // Calculate product map and total
    const tempMap = {};
    let subtotal = 0;

    items.forEach((item) => {
      tempMap[item.listing_id] = item.final_price;
      subtotal += item.final_price;
    });

    const charge = subtotal < 500 ? 50 : 0;

    setProducts(items);
    setProductMap(tempMap);
    setDeliveryCharge(charge);
    setFinalPrice(subtotal + charge);

    fetchUserProfile();
  }, [singleProduct, cartProducts, isCartCheckout, token]);

  const generateOrderId = () => {
    const prefix = "ORD";
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    return prefix + randomNum;
  };

  const handleCheckout = async () => {
    if (!products || products.length === 0) {
      setError("No product data. Cannot place order.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderId = generateOrderId();
      const orderDatetime = new Date().toISOString();

      const orderData = {
        order_id: orderId,
        customer_id: userid,
        products: productMap,
        other_charges: deliveryCharge,
        total_price: finalPrice,
        status: "ordered",
        order_datetime: orderDatetime,
        payment_status: "pending",
        delivered_at: null,
      };

      console.log("Sending order:", orderData);

      const response = await axios.post("http://localhost:3000/customer_orders", orderData);

      console.log("Order placed successfully:", response.data);
      setSuccess(true);

      // Clear cart if from cart
      if (isCartCheckout) {
        sessionStorage.removeItem("cart");
      }

      setTimeout(() => {
        navigate("/home");
      }, 5000);
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">No products to checkout.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Order Summary
        </h2>

        {error && <div className="text-red-600 text-center mb-6">{error}</div>}
        {success && (
          <div className="text-green-600 text-center mb-6 font-semibold">
            ✅ Order placed successfully! Redirecting to Home...
          </div>
        )}

        {!userAddress ? (
          <div className="text-center text-gray-500">Loading address...</div>
        ) : (
          <>
            {/* Deliver To Section */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-xl font-semibold">Deliver to:</h3>
              <button
                onClick={() => navigate("/profile")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit Address
              </button>
            </div>
            <div className="mb-4 text-gray-700 whitespace-pre-line">
              {userAddress.plot && <div><strong>Street:</strong> {userAddress.plot}</div>}
              {userAddress.colony && <div><strong>Area:</strong> {userAddress.colony}</div>}
              {userAddress.city && <div><strong>City:</strong> {userAddress.city}</div>}
              {userAddress.country && <div><strong>Country:</strong> {userAddress.country}</div>}
            </div>

            {/* Product Details */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Product(s):</h3>
              {products.map((p) => (
                <div key={p.listing_id} className="flex justify-between text-gray-800 py-1 border-b">
                  <span>{p.description || p.product_type || "Product"}</span>
                  <span>₹{p.final_price?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Charges */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Charges:</h3>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Price:</span>
              <span>₹{finalPrice?.toFixed(2)}</span>
            </div>

            {/* Pay & Checkout Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCheckout}
                disabled={loading || success}
                className={`px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2 ${
                  loading || success ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Placing Order...
                  </>
                ) : success ? "Order Placed" : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
