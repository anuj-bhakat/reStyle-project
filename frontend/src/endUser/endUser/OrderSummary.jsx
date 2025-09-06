import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [finalPrice, setFinalPrice] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const userid = localStorage.getItem("userid");

  // Get the product object from location state
  const product = location.state?.product;

  useEffect(() => {
    // console.log("Loaded product:", product);

    if (!product) {
      setError("No product data found.");
      return;
    }

    // Calculate final price and delivery charge
    let price = product.final_price;
    if (price < 500) {
      setDeliveryCharge(50);
      price += 50;
    } else {
      setDeliveryCharge(0);
    }
    setFinalPrice(price);

    // Fetch user address
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user/profile/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { address } = response.data.user;
        // console.log("Fetched user address:", address);
        setUserAddress(address);
      } catch (err) {
        setError("Failed to fetch user address");
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [product, token]);

  // Helper to generate a random order id
  const generateOrderId = () => {
    const prefix = "ORD";
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit number
    return prefix + randomNum;
  };

  const handleCheckout = async () => {
    if (!product || !product.listing_id || !product.final_price) {
      setError("Invalid product data. Cannot place order.");
      console.error("Product data is invalid:", product);
      return;
    }

    setLoading(true);

    try {
      const orderId = generateOrderId();
      const orderDatetime = new Date().toISOString();

      const orderData = {
        order_id: orderId,
        customer_id: userid,
        products: {
          [product.listing_id]: product.final_price,
        },
        other_charges: deliveryCharge,
        total_price: finalPrice,
        status: "ordered",
        order_datetime: orderDatetime,
        payment_status: "pending",
        delivered_at: null,
      };

      // console.log("Sending order:", orderData);

      const response = await axios.post("http://localhost:3000/customer_orders", orderData);

      console.log("Order placed successfully:", response.data);
      setSuccess(true);

      // Redirect to /home after 5 seconds
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
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
              <h3 className="text-xl font-semibold">Product Details:</h3>
              <div className="flex justify-between">
                <span>
                  {product?.description || product?.name || "Product Name"}
                </span>
                <span>₹{product?.final_price?.toFixed(2) || 0}</span>
              </div>
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
                disabled={loading}
                className={`px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Pay & Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
