import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true); // initial loading

  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const isCartCheckout = location?.state?.fromCart === true;
  const singleProduct = location?.state?.product;
  const cartProducts = location?.state?.products;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { address } = response.data.user;
        setUserAddress(address);
      } catch (err) {
        setError("Failed to fetch address information.");
      } finally {
        setLoading(false);
      }
    };

    if (!singleProduct && !cartProducts) {
      setError("No products to checkout.");
      setLoading(false);
      return;
    }

    const items = isCartCheckout ? cartProducts : [singleProduct];
    const tempMap = {};
    let subtotal = 0;

    items.forEach((item) => {
      tempMap[item.listing_id] = item.final_price;
      subtotal += item.final_price;
    });

    const charge = subtotal < 500 ? 50 : 15;

    setProducts(items);
    setProductMap(tempMap);
    setDeliveryCharge(charge);
    setFinalPrice(subtotal + charge);

    fetchUserProfile();
  }, [singleProduct, cartProducts, isCartCheckout, token]);

  const handleCheckout = async () => {
    if (!products || products.length === 0) {
      setError("No product data. Cannot place order.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderDatetime = new Date().toISOString();

      const orderData = {
        customer_id: userid,
        products: productMap,
        other_charges: deliveryCharge,
        total_price: finalPrice,
        status: "ordered",
        order_datetime: orderDatetime,
        payment_status: "pending",
        delivered_at: null,
      };

      await axios.post("http://localhost:3000/customer_orders", orderData);

      setSuccess(true);

      if (isCartCheckout) {
        sessionStorage.removeItem("cart");
      }

      setTimeout(() => {
        navigate("/home");
      }, 5000);
    } catch (error) {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num);

  if (loading && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6 sm:p-10">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-16 w-16 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading animation"
            role="img"
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
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-indigo-700 text-xl font-semibold font-sans select-none">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-red-600 text-lg font-semibold bg-red-100 rounded-md shadow-md p-6 max-w-md font-sans select-none">
          {error}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 text-lg font-sans select-none">
          No products to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 sm:p-12">
        {/* Heading */}
        <h2 className="flex items-center justify-center text-3xl md:text-4xl font-extrabold mb-12 text-indigo-700 select-none">
          Order Summary
        </h2>

        {success && (
          <div className="text-center bg-green-100 text-green-700 p-4 rounded-md shadow-sm mb-8 font-sans select-none">
            ✅ Order placed successfully! Redirecting to Home...
          </div>
        )}

        {/* Address */}
        <section className="mb-8">
          <div className="flex items-center space-x-4 mb-3">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 shrink-0 font-sans">
              Deliver to:
            </h3>
            <div className="flex-1 text-gray-900 tracking-wide leading-relaxed whitespace-normal font-medium font-sans text-base md:text-lg">
              {[userAddress?.plot, userAddress?.colony, userAddress?.city, userAddress?.country]
                .filter(Boolean)
                .join(", ")}
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer font-sans"
            >
              Edit
            </button>
          </div>
        </section>

        {/* Products */}
        <section className="mb-8 max-w-4xl mx-auto border-b border-gray-300 pb-4 px-4 md:px-8">
          <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-900 tracking-wide font-sans">
            Product{products.length > 1 ? "s" : ""}
          </h3>
          <ul className="divide-y divide-gray-200 font-sans">
            {products.map((p) => (
              <li
                key={p.listing_id}
                className="flex justify-between py-2 text-gray-800 text-base font-medium"
              >
                <span>
                  <span className="text-blue-700">{p.brand}</span>
                  <span className="text-gray-700"> &nbsp;-&nbsp; </span>
                  <span className="text-teal-700 capitalize">{p.product_type}</span>
                </span>
                <span className="text-indigo-700 font-semibold font-mono">
                  {formatINR(p?.final_price)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Charges Section */}
        <section className="mb-8 max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex justify-between text-gray-700 font-semibold text-base md:text-lg mb-2 tracking-wide">
            <span>Delivery Charge:</span>
            <span className="font-mono text-indigo-700">{formatINR(deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-indigo-900 font-extrabold text-xl md:text-3xl tracking-tight">
            <span>Total Price:</span>
            <span>{formatINR(finalPrice)}</span>
          </div>
        </section>

        {/* Checkout Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCheckout}
            disabled={loading || success}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-base md:text-lg shadow-md transition duration-300 ease-in-out select-none ${
              loading || success
                ? "bg-green-400 cursor-not-allowed text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            {loading ? "Placing Order..." : success ? "Order Placed" : "Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
