import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReDesignedProducts from "./ReDesignedProducts";

const BuyProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    productType: "",
    brand: "",
    condition: "",
    priceRange: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [currentView, setCurrentView] = useState("old");
  const [cart, setCart] = useState([]);

  // ----- CART UTILS -----
  const getCart = () => {
    const cartData = sessionStorage.getItem("cart");
    return cartData ? JSON.parse(cartData) : [];
  };

  const saveCart = (updatedCart) => {
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart); // Sync with state
  };

  const isInCart = (listingId) => cart.includes(listingId);

  const addToCart = (listingId) => {
    if (!isInCart(listingId)) {
      const updatedCart = [...cart, listingId];
      saveCart(updatedCart);
    }
  };

  const removeFromCart = (listingId) => {
    const updatedCart = cart.filter((id) => id !== listingId);
    saveCart(updatedCart);
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchProducts();
      setCart(getCart());
    }
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/products/get/live"
      );
      setProducts(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (product) => {
    const primaryImage = product.product_images?.find((img) => img.is_primary);
    return primaryImage?.url || product.product_images?.[0]?.url || null;
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  const handleProductClick = (listingId) => {
    navigate("/product", {
      state: { listingId },
    });
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const filteredAndSortedProducts = products
    .filter((product) => {
      if (filters.productType && product.product_type !== filters.productType)
        return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.condition && product.condition !== filters.condition)
        return false;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (product.final_price < min || (max && product.final_price > max))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.final_price - b.final_price;
        case "price-high":
          return b.final_price - a.final_price;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

  const uniqueBrands = [...new Set(products.map((p) => p.brand))];
  const uniqueTypes = [...new Set(products.map((p) => p.product_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sub Header Tabs */}
      <header className="top-14 left-0 right-0 bg-white z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <div className="flex items-center space-x-10">
              <button
                onClick={() => setCurrentView("old")}
                className={`px-6 py-2 font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  currentView === "old"
                    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
                }`}
              >
                Old Products
              </button>
              <button
                onClick={() => setCurrentView("redesigned")}
                className={`px-6 py-2 font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  currentView === "redesigned"
                    ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
                }`}
              >
                ReDesigned Products
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conditional View */}
      {currentView === "redesigned" ? (
        <ReDesignedProducts />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Filters
                  </h3>

                  {/* Product Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type
                    </label>
                    <select
                      value={filters.productType}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          productType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Types</option>
                      {uniqueTypes.map((type) => (
                        <option key={type} value={type}>
                          {type
                            .split(" ")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <select
                      value={filters.brand}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Brands</option>
                      {uniqueBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Conditions</option>
                      <option value="new">New</option>
                      <option value="gently_used">Gently Used</option>
                      <option value="worn">Worn</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Prices</option>
                      <option value="0-500">Under ₹500</option>
                      <option value="500-1000">₹500 - ₹1,000</option>
                      <option value="1000-2000">₹1,000 - ₹2,000</option>
                      <option value="2000-5000">₹2,000 - ₹5,000</option>
                      <option value="5000-10000">₹5,000 - ₹10,000</option>
                      <option value="10000-999999">Above ₹10,000</option>
                    </select>
                  </div>

                  <button
                    onClick={() =>
                      setFilters({
                        productType: "",
                        brand: "",
                        condition: "",
                        priceRange: "",
                      })
                    }
                    className="w-full text-sm px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {filteredAndSortedProducts.length} of{" "}
                    {products.length} products
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {filteredAndSortedProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500 text-lg">No products found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <div
                        key={product.listing_id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group cursor-pointer"
                      >
                        {/* Clickable Section */}
                        <div
                          onClick={() => handleProductClick(product.listing_id)}
                          className="flex-1 flex flex-col"
                        >
                          {/* Product Image */}
                          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                            <img
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={handleImageError}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                              {product.brand} {product.product_type}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {product.description}
                            </p>
                            <p className="mt-3 text-blue-600 font-bold text-lg">
                              {formatPrice(product.final_price)}
                            </p>

                            {/* Spacer to push button down */}
                            <div className="mt-auto pt-4" />
                          </div>
                        </div>

                        {/* Cart Button */}
                        <div className="px-4 pb-4">
                          {isInCart(product.listing_id) ? (
                            <button
                              onClick={() => removeFromCart(product.listing_id)}
                              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                            >
                              − Remove from Cart
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(product.listing_id)}
                              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                            >
                              + Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyProduct;
