import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ManagerProductEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing_id } = location.state || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({});
  const [finalPriceMultiplier, setFinalPriceMultiplier] = useState("1.6");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (listing_id) {
      fetchProduct();
    }
  }, [listing_id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/products/${listing_id}`
      );
      setProduct(response.data);
      setFormData({
        brand: response.data.brand || "",
        product_type: response.data.product_type || "",
        condition: response.data.condition || "",
        description: response.data.description || "",
        checklist_json: response.data.checklist_json || {},
        // Exclude base_price and min_max_price
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch product details");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    const files = Array.from(e.target.files);
    if (files.length < 1 || files.length > 10) {
      alert("Please select between 1 and 10 images.");
      return;
    }
    setImages(files);
  };

  const handleInputChange = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (key, value, e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    setFormData((prev) => ({
      ...prev,
      checklist_json: { ...prev.checklist_json, [key]: value },
    }));
  };

  const calculateFinalPrice = () => {
    if (!product || !product.base_price) return 0;
    return product.base_price * parseFloat(finalPriceMultiplier);
  };

  const handleUpdateFields = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    try {
      setSubmitting(true);
      const updateData = {
        ...formData,
        final_price: calculateFinalPrice(),
        status: "redesigned",
      };
      await axios.put(
        `http://localhost:3000/products/${listing_id}`,
        updateData
      );
      alert("Product updated successfully!");
      navigate("/manager-redesign-review");
    } catch (err) {
      setError("Failed to update product");
      console.error("Error updating product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedesign = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    if (images.length < 1 || images.length > 10) {
      alert("Please upload between 1 and 10 images.");
      return;
    }
    try {
      setSubmitting(true);
      const formDataImages = new FormData();
      images.forEach((image, index) => {
        formDataImages.append("images", image);
      });
      await axios.put(
        `http://localhost:3000/products/redesign/${listing_id}`,
        formDataImages,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Product redesigned successfully!");
      // navigate("/manager-redesign-review");
    } catch (err) {
      setError("Failed to redesign product");
      console.error("Error redesigning product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
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
            onClick={fetchProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white text-gray-900 py-4 px-8 border-b shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/manager-redesign-review")}
              className="text-blue-600 py-2 px-4 rounded hover:bg-blue-100 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Product Details</h2>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <input
                type="text"
                name="product_type"
                value={formData.product_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Price Multiplier
              </label>
              <select
                value={finalPriceMultiplier}
                onChange={(e) => setFinalPriceMultiplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1.6">1.6x</option>
                <option value="1.8">1.8x</option>
                <option value="2.0">2.0x</option>
                <option value="2.2">2.2x</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculated Final Price
              </label>
              <input
                type="text"
                value={`${calculateFinalPrice().toFixed(2)}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.checklist_json &&
                Object.entries(formData.checklist_json).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace("_", " ")}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        handleChecklistChange(key, e.target.value, e)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload 1-10 New Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Selected: {images.length} images (1-10 required)
            </p>
            <button
              type="button"
              onClick={handleRedesign}
              disabled={submitting || images.length < 1 || images.length > 10}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Uploading..." : "Upload Images"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleUpdateFields}
              disabled={submitting || images.length < 1}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Fields"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProductEdit;
