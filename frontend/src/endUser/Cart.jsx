import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [cartIds, setCartIds] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loading, setLoading] = useState(false);

  // For showing error when trying to checkout with too many items
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const cartData = sessionStorage.getItem("cart");
    if (cartData) {
      try {
        const parsedCart = JSON.parse(cartData);
        if (parsedCart.length && typeof parsedCart[0] === "string") {
          setCartIds(parsedCart);
        } else {
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error("Error parsing cart data:", error);
        sessionStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
    if (cartIds.length === 0) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const requests = cartIds.map((id) =>
          axios.get(`${baseUrl}/products/${id}`)
        );
        const responses = await Promise.all(requests);
        const products = responses.map((res) => res.data);
        setCartItems(products);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cartIds]);

  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.final_price, 0);
    const delivery = subtotal < 500 && subtotal > 0 ? 50 : 15;
    setTotalPrice(subtotal + delivery);
    setDeliveryCharge(delivery);

    // Clear checkout error if cart size is acceptable again
    if (cartItems.length <= 5 && checkoutError) {
      setCheckoutError("");
    }
  }, [cartItems, checkoutError]);

  const handleRemove = (listingId) => {
    const updatedItems = cartItems.filter((item) => item.listing_id !== listingId);
    setCartItems(updatedItems);
    const updatedIds = cartIds.filter((id) => id !== listingId);
    setCartIds(updatedIds);
    sessionStorage.setItem("cart", JSON.stringify(updatedIds.length > 0 ? updatedIds : []));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (cartItems.length > 5) {
      setCheckoutError(
        "You cannot proceed to order summary with more than 5 products. Please remove some items."
      );
      return;
    }

    setCheckoutError("");
    navigate("/order-summary", {
      state: {
        fromCart: true,
        products: cartItems,
      },
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);

  const getPrimaryImage = (product) => {
    const primaryImage = product.product_images?.find((img) => img.is_primary);
    return primaryImage?.url || product.product_images?.[0]?.url || 'https://via.placeholder.com/150x150?text=No+Image';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <svg
              className="animate-spin h-16 w-16 text-indigo-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Loading spinner"
              role="img"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-sm">🛒</span>
            </div>
          </div>
          <div className="text-gray-700 text-xl font-semibold mt-4">Loading your cart...</div>
          <div className="text-gray-500 text-sm mt-2">Fetching your awesome finds</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
            onClick={() => navigate("/home")}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">Review your items before checkout</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">🛍️</div>
              <div className="text-sm text-gray-500 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.listing_id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center space-x-6">
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={getPrimaryImage(item)}
                        alt={`${item.brand} ${item.product_type}`}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                        }}
                      />
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.condition === 'new' ? 'NEW' : item.condition === 'gently_used' ? 'USED' : 'WORN'}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.brand} {item.product_type}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      {/* Product Attributes */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.checklist_json?.size && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Size: {item.checklist_json.size}
                          </span>
                        )}
                        {item.checklist_json?.color && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Color: {item.checklist_json.color}
                          </span>
                        )}
                        {item.checklist_json?.material && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {item.product_type === 'wristwatch' ? 'Strap: ' : 'Material: '}{item.checklist_json.material}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatPrice(item.final_price)}
                        </div>
                        
                        <button
                          onClick={() => handleRemove(item.listing_id)}
                          className="group flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                          title="Remove from cart"
                          aria-label={`Remove ${item.brand} ${item.product_type} from cart`}
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Button */}
            <div className="mt-6">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Warning for too many items */}
              {cartItems.length > 5 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Limit exceeded</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Maximum 5 items allowed. Please remove some items.
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice - deliveryCharge)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Delivery Charges</span>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{formatPrice(deliveryCharge)}</span>
                    {deliveryCharge === 50 && (
                      <div className="text-xs text-orange-600">Free delivery on orders above ₹500</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 text-xl font-bold text-gray-900 border-t-2 border-indigo-200">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Error */}
              {checkoutError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Checkout Error</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{checkoutError}</p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || cartItems.length > 5}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  cartItems.length === 0 || cartItems.length > 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Proceed to Checkout</span>
                </div>
              </button>

              {cartItems.length <= 5 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout guaranteed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
