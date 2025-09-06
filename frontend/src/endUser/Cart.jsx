import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const [cartIds, setCartIds] = useState([]); // just IDs from sessionStorage
  const [cartItems, setCartItems] = useState([]); // full product objects
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    const cartData = sessionStorage.getItem("cart");
    if (cartData) {
      try {
        const parsedCart = JSON.parse(cartData);
        if (parsedCart.length && typeof parsedCart[0] === "string") {
          setCartIds(parsedCart); // IDs only
        } else {
          setCartItems(parsedCart); // full product objects
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
      try {
        const requests = cartIds.map(id =>
          axios.get(`http://localhost:3000/products/${id}`)
        );
        const responses = await Promise.all(requests);
        const products = responses.map(res => res.data);
        setCartItems(products);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProducts();
  }, [cartIds]);

  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.final_price, 0);
    const delivery = subtotal < 500 && subtotal > 0 ? 50 : 0;
    setTotalPrice(subtotal + delivery);
    setDeliveryCharge(delivery);
  }, [cartItems]);

  const handleRemove = (listingId) => {
    const updatedItems = cartItems.filter(item => item.listing_id !== listingId);
    setCartItems(updatedItems);

    const updatedIds = cartIds.filter(id => id !== listingId);
    setCartIds(updatedIds);

    sessionStorage.setItem("cart", JSON.stringify(updatedIds.length > 0 ? updatedIds : []));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty 🛒</h2>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          onClick={() => navigate("/home")}
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">Your Cart 🛍️</h2>

        {/* Cart Items */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.listing_id}
              className="flex justify-between items-start border-b pb-4"
            >
              {/* Left: Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.description || item.product_type}
                </h3>
                <div className="text-sm text-gray-500 mt-1">
                  {item.checklist_json?.size && (
                    <p>Size: {item.checklist_json.size}</p>
                  )}
                </div>
              </div>

              {/* Right: Price & Remove */}
              <div className="text-right">
                <p className="text-lg font-medium text-gray-800">
                  {formatPrice(item.final_price)}
                </p>
                <button
                  onClick={() => handleRemove(item.listing_id)}
                  className="text-red-500 hover:text-red-700 text-sm mt-2"
                  title="Remove from cart"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-8 border-t pt-6">
          <div className="space-y-3 text-right">
            <div className="flex justify-between text-base font-medium text-gray-700">
              <span>Subtotal:</span>
              <span>{formatPrice(totalPrice - deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Charges:</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900 mt-2">
              <span>Total:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-green-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Order Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
