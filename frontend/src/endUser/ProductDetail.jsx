import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const location = useLocation();
  const listingId = location.state?.listingId;

  // ---------- CART STATE ----------
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!listingId) {
      setError('Product ID missing');
      setLoading(false);
      return;
    }
    fetchProductDetails();
    loadCartFromSession();
  }, [listingId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/products/${listingId}`);
      if (response.status === 200) {
        setProduct(response.data);
        setError('');
        // Auto select size if only one size is present (string)
        const sizeVal = response.data.checklist_json?.size;
        if (sizeVal && typeof sizeVal === 'string') {
          setSelectedSize(sizeVal);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to fetch product details. Please try again.');
      }
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ---------- CART HANDLERS ----------
  const loadCartFromSession = () => {
    const data = sessionStorage.getItem('cart');
    if (data) {
      setCart(JSON.parse(data));
    }
  };

  const updateCartInSession = (updatedCart) => {
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const isInCart = () => {
    return cart.includes(product?.listing_id);
  };

  const handleAddToCart = () => {
    // If size exists but not selected, alert
    if (!selectedSize && product.checklist_json?.size) {
      alert('Please select a size');
      return;
    }
    const updatedCart = [...cart, product.listing_id];
    updateCartInSession(updatedCart);
  };

  const handleRemoveFromCart = () => {
    const updatedCart = cart.filter((id) => id !== product.listing_id);
    updateCartInSession(updatedCart);
  };

  const handleBuyNow = () => {
    navigate('/order-summary', {
      state: {
        product,
        selectedSize,
        fromCart: false,
      },
    });
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Dynamic labels based on product_type
  const sizeLabel =
    product.product_type === 'wristwatch'
      ? 'Dial Size'
      : product.product_type === 'bag'
      ? 'Bag Capacity'
      : 'Size';

  const materialLabel =
    product.product_type === 'wristwatch' ? 'Strap Material' : 'Material';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Products
            </button>
            <h1 className="text-xl font-semibold text-gray-900">reStyle Store</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4 relative">
            <div className="aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm relative">
              {product.product_images && product.product_images.length > 0 ? (
                <img
                  src={product.product_images[selectedImageIndex]?.url}
                  alt={product.description}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              {/* Status Tag top right */}
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold uppercase text-white ${
                  product.status === 'live'
                    ? 'bg-green-600'
                    : product.status === 'inactive'
                    ? 'bg-gray-600'
                    : 'bg-yellow-600'
                }`}
              >
                {product.status}
              </span>

              <div
                className="w-full h-full bg-gray-200 flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-gray-500">Product Image</p>
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto justify-center">
                {product.product_images.map((image, index) => (
                  <button
                    key={image.image_id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Brand and Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.brand} {product.product_type}
              </h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.final_price)}
                </span>
              </div>
            </div>

            {/* Condition Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Condition:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.condition === 'new'
                    ? 'bg-green-100 text-green-800'
                    : product.condition === 'gently_used'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {product.condition === 'new'
                  ? 'New'
                  : product.condition === 'gently_used'
                  ? 'Gently Used'
                  : 'Worn'}
              </span>
            </div>

            {/* Size, Color, Material Labels */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm font-medium text-gray-700">
              {product.checklist_json?.size && <div>{sizeLabel}</div>}
              {product.checklist_json?.color && <div>Color</div>}
              {product.checklist_json?.material && <div>{materialLabel}</div>}
            </div>

            {/* Size, Color, Material Values */}
            <div className="grid grid-cols-3 gap-4 text-center mt-1 text-gray-800">
              {product.checklist_json?.size && <div>{product.checklist_json.size}</div>}
              {product.checklist_json?.color && (
                <div className="capitalize">{product.checklist_json.color}</div>
              )}
              {product.checklist_json?.material && (
                <div className="capitalize">{product.checklist_json.material}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleBuyNow}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Buy Now
              </button>

              {isInCart() ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="w-full border border-red-600 text-red-600 py-3 px-6 rounded-md font-medium hover:bg-red-50 transition-colors"
                >
                  − Remove from Cart
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  + Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
