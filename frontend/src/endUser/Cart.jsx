import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
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
          axios.get(`http://localhost:3000/products/${id}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col space-y-4">
        <svg
          className="animate-spin h-10 w-10 text-green-600"
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
        <div className="text-gray-700 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Your cart is empty 🛒</h2>
        <button
          className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-shadow"
          onClick={() => navigate("/home")}
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold mb-4 text-center text-gray-900">Your Cart 🛍️</h2>

        {/* Fixed message at top if more than 5 products */}
        {cartItems.length > 5 && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 font-semibold rounded-md text-center">
            You have more than 5 products in your cart. Please remove some items to proceed.
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.listing_id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow bg-white max-w-full"
            >
              {/* Left: Brand, Product Type and Size inline */}
              <div className="flex flex-col max-w-[70%]">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
                  <span className="font-semibold text-blue-800">{item.brand}</span>
                  <span className="text-gray-500">|</span>
                  <span className="capitalize text-teal-700">{item.product_type}</span>
                  {item.checklist_json?.size && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700">
                      Size: {item.checklist_json.size}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Right: Price and remove button on same row */}
              <div className="flex items-center space-x-3">
                <p className="font-semibold text-green-700 text-base">{formatPrice(item.final_price)}</p>
                <button
                  onClick={() => handleRemove(item.listing_id)}
                  className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                  title="Remove from cart"
                  aria-label={`Remove ${item.brand} ${item.product_type} from cart`}
                >
                  &minus;
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-12 border-t border-gray-300 pt-8">
          <div className="space-y-4 text-right">
            <div className="flex justify-between text-lg font-medium text-gray-700">
              <span>Subtotal:</span>
              <span>{formatPrice(totalPrice - deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-600">
              <span>Delivery Charges:</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-2xl font-extrabold text-gray-900 mt-3">
              <span>Total:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Bottom error message if checkout fails due to item limit */}
          {checkoutError && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 font-semibold rounded-md text-center">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            className="mt-10 w-full py-4 px-8 rounded-xl text-xl font-semibold shadow-lg bg-white text-green-700 border-2 border-green-600 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-green-600 hover:text-white"
          >
            Go to Order Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
