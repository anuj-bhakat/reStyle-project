import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ManagerRedesignReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("managerToken");
    if (!token) {
      navigate("/manager-login", { replace: true });
      return;
    }
    fetchRedesigningProducts();
  }, [navigate]);

  const fetchRedesigningProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/products/get/redesigning");
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch redesigning products");
      console.error("Error fetching redesigning products:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatPrice = (price) => (price ? `$${price}` : "Not set");

  const handleEditProduct = (listing_id) => {
    navigate("/manager-edit-product", {
      state: { listing_id },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("managerToken");
    navigate("/manager-login", { replace: true });
  };

  const isActive = (path) => location.pathname.startsWith(path);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading redesigning products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg px-8 py-6 text-center">
          <div className="text-red-500 text-3xl mb-3">⚠️</div>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchRedesigningProducts}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Manager Dashboard</h1>
          <div className="space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate("/manager-dashboard")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isActive("/manager-dashboard")
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => navigate("/warehouse-reviews")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isActive("/pending-reviews")
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Warehouse Requests
            </button>
            <button
              onClick={() => navigate("/manager-redesign-review")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isActive("/manager-redesign-review")
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Redesign Review
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Products for Redesign</h2>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-5xl mb-3 text-gray-300">🎨</div>
            <h3 className="text-base font-medium text-gray-800 mb-1">No products for redesign</h3>
            <p className="text-sm text-gray-500">All products have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.listing_id}
                className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative bg-gray-50 flex justify-center items-center h-48 p-2 rounded-t-xl overflow-hidden">
                  {product.product_images?.[0]?.url ? (
                    <img
                      src={product.product_images[0].url}
                      alt={product.product_type}
                      className="object-contain h-full w-full rounded-md transition-transform duration-200 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                      <div className="text-4xl mb-1">📷</div>
                      <p className="text-xs">No Image</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shadow">
                    Redesign
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col p-4 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 capitalize truncate">
                      {product.brand} {product.product_type}
                    </h3>
                    <span className="text-[11px] text-gray-600 capitalize">
                      {product.condition.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                  <div className="text-[11px] text-gray-600 font-medium mb-3">
                    Base Price: {formatPrice(product.base_price)}
                  </div>

                  {product.checklist_json && (
                    <div className="flex flex-wrap gap-1 text-[11px] text-gray-700 mb-3">
                      {Object.entries(product.checklist_json).map(([key, value]) => (
                        <span
                          key={key}
                          className="bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition"
                          title={`${key}: ${value}`}
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-gray-500 mb-3">
                    <div>Created: {formatDate(product.created_at)}</div>
                    <div>Updated: {formatDate(product.updated_at)}</div>
                  </div>

                  <button
                    onClick={() => handleEditProduct(product.listing_id)}
                    className="mt-auto w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition shadow"
                  >
                    Edit & Redesign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerRedesignReview;
