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
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <p className="mt-4 text-gray-600">Loading redesigning products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRedesigningProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      <header className="bg-white shadow-md py-4 px-6 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Manager Dashboard
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => navigate("/manager-dashboard")}
              className={`py-2 px-3 rounded text-sm ${
                isActive("/manager-dashboard")
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => navigate("/pending-reviews")}
              className={`py-2 px-3 rounded text-sm ${
                isActive("/pending-reviews")
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              Pending Reviews
            </button>
            <button
              onClick={() => navigate("/manager-redesign-review")}
              className={`py-2 px-3 rounded text-sm ${
                isActive("/manager-redesign-review")
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              Redesign Review
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 py-2 px-3 rounded hover:bg-red-100 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Products for Redesign
        </h2>

        {products.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <div className="text-5xl mb-4 text-gray-400">🎨</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No products for redesign
            </h3>
            <p className="text-gray-500">
              All products have been processed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((product) => (
              <div
                key={product.listing_id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full"
              >
                {/* Product Image */}
                <div className="relative bg-gray-100 flex justify-center items-center h-48 p-2 rounded-t-lg overflow-hidden">
                  {product.product_images?.[0]?.url ? (
                    <img
                      src={product.product_images[0].url}
                      alt={product.product_type}
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                      <div className="text-4xl mb-1">📷</div>
                      <p className="text-xs">No Image</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full capitalize">
                    Redesign
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col p-3 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-gray-800 text-xs capitalize">
                      {product.brand} {product.product_type}
                    </h3>
                    <span className="text-[11px] text-gray-500 capitalize">
                      {product.condition.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-[12px] text-gray-600 line-clamp-2 mb-2">
                    {product.description}
                  </p>

                  <div className="text-[11px] text-gray-600 mb-2">
                    Base Price: {formatPrice(product.base_price)}
                  </div>

                  {product.checklist_json && (
                    <div className="flex flex-wrap gap-1 text-[11px] text-gray-700 mb-2">
                      {Object.entries(product.checklist_json).map(
                        ([key, value]) => (
                          <span
                            key={key}
                            className="bg-gray-100 px-2 py-0.5 rounded"
                          >
                            {key}: {value}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-gray-500 mb-2">
                    Created: {formatDate(product.created_at)}
                    <br />
                    Updated: {formatDate(product.updated_at)}
                  </div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleEditProduct(product.listing_id)}
                      className="w-full bg-green-600 text-white text-sm py-1.5 rounded-md hover:bg-green-700 transition"
                    >
                      Edit & Redesign
                    </button>
                  </div>
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
