import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userid = localStorage.getItem("userid");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");

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
        const response = await axios.get(`${baseUrl}/user/profile/`, {
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

      const response = await axios.post(`${baseUrl}/customer_orders`, orderData);

      const generatedOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      setOrderId(generatedOrderId);

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

  const getPrimaryImage = (product) => {
    const primaryImage = product.product_images?.find((img) => img.is_primary);
    return primaryImage?.url || product.product_images?.[0]?.url || 'https://via.placeholder.com/80x80?text=No+Image';
  };

  if (loading && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4">
          <div className="relative mb-4">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600 mx-auto"
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
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-indigo-600 font-bold">📦</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Preparing your order...</h3>
          <p className="text-gray-600 text-sm">Please wait while we finalize the details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-red-800 mb-4">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">No items to checkout</h3>
          <p className="text-gray-600 mb-6 text-sm">Add some items to your cart first</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎉</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase</p>

          {orderId && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="text-lg font-bold text-indigo-600 font-mono">{orderId}</p>
            </div>
          )}

          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Order placed successfully</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Payment processing initiated</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">Redirecting to home page in 5 seconds...</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Summary</h1>
            <p className="text-gray-600 text-sm">Review your order before placing it</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Address
                </h2>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center space-x-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                {userAddress ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-semibold text-gray-800 text-sm">Default Address</span>
                    </div>
                    <p className="text-gray-700">
                      {[userAddress?.plot, userAddress?.colony, userAddress?.city, userAddress?.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {userAddress?.phone && (
                      <p className="text-gray-600 text-sm">📞 {userAddress.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No address information available</p>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Items ({products.length})
              </h2>

              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.listing_id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={getPrimaryImage(product)}
                        alt={`${product.brand} ${product.product_type}`}
                        className="w-16 h-16 object-cover rounded-lg border border-white shadow-sm"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                        }}
                      />
                      <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {product.condition === 'new' ? 'NEW' : product.condition === 'gently_used' ? 'USED' : 'WORN'}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {product.brand} {product.product_type}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{product.description}</p>

                      {/* Product Attributes */}
                      <div className="flex flex-wrap gap-1">
                        {product.checklist_json?.size && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.checklist_json.size}
                          </span>
                        )}
                        {product.checklist_json?.color && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {product.checklist_json.color}
                          </span>
                        )}
                        {product.checklist_json?.material && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {product.product_type === 'wristwatch' ? 'Strap: ' : 'Mat: '}{product.checklist_json.material}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {formatINR(product.final_price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Subtotal ({products.length} items)</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatINR(finalPrice - deliveryCharge)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Delivery Charges</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 text-sm">{formatINR(deliveryCharge)}</span>
                    {deliveryCharge === 50 ? (
                      <div className="text-xs text-orange-600">Add ₹{500 - (finalPrice - deliveryCharge)} more for free delivery</div>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 text-lg font-bold text-gray-900 border-t-2 border-indigo-200">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">{formatINR(finalPrice)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || success || localStorage.getItem('isGuest') === 'true'}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-300 ${loading || success || localStorage.getItem('isGuest') === 'true'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 shadow-md hover:shadow-lg'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {localStorage.getItem('isGuest') === 'true' ? (
                        <span>Sign up to Place Order</span>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Place Order</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </button>
              {localStorage.getItem('isGuest') === 'true' && (
                <div className="mt-2 text-center text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded">
                  Guest accounts cannot place orders. Please create a full account to purchase.
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mt-3">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
