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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading product details</h3>
          <p className="text-gray-600 text-sm">Please wait while we fetch the product information</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Product not found</h3>
          <p className="text-red-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
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

  const getStatusConfig = () => {
    if (product.status === 'live') {
      return {
        text: 'Available',
        className: 'bg-green-100 text-green-800 border border-green-200'
      };
    }
    if (product.status === 'redesigned') {
      return {
        text: 'Redesigned',
        className: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      };
    }
    return {
      text: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium"
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
            <h1 className="text-xl font-bold text-gray-900">reStyle Store</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images - More Space and Rounded */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
              {/* Main Image Container - More Rounded */}
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl mb-6 mx-4" style={{ aspectRatio: '1', marginTop: '1rem', marginBottom: '1.5rem' }}>
                {product.product_images && product.product_images.length > 0 ? (
                  <img
                    src={product.product_images[selectedImageIndex]?.url}
                    alt={product.description}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${statusConfig.className}`}>
                    {product.status === 'live' && (
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {product.status === 'redesigned' && (
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    {product.status === 'awaiting_pickup' && (
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {statusConfig.text}
                  </div>
                </div>

                {/* Fallback Image */}
                <div
                  className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  <div className="text-center">
                    <svg
                      className="w-20 h-20 text-gray-400 mx-auto mb-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-gray-500 text-base font-medium">Product Image</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail Images - Compact */}
              {product.product_images && product.product_images.length > 1 && (
                <div className="px-6">
                  <div className="flex space-x-2 justify-center">
                    {product.product_images.map((image, index) => (
                      <button
                        key={image.image_id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-indigo-500 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
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
                </div>
              )}
            </div>

            {/* Product Details - More Compact */}
            <div className="p-6 lg:p-8">
              <div className="space-y-4">
                {/* Brand and Title - Compact */}
                <div>
                  <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    {product.brand}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                    {product.product_type}
                  </h1>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>

                {/* Price Section - Compact */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(product.final_price)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
                </div>

                {/* Condition - Compact */}
                <div>
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">Condition</span>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    product.condition === 'new'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : product.condition === 'gently_used'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {product.condition === 'new'
                      ? 'New'
                      : product.condition === 'gently_used'
                      ? 'Gently Used'
                      : 'Worn'}
                  </div>
                </div>

                {/* Product Specifications - Compact Grid */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Product Details</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {product.checklist_json?.size && (
                      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          {sizeLabel}
                        </h4>
                        <p className="text-gray-900 font-bold text-sm">
                          {product.checklist_json.size}
                        </p>
                      </div>
                    )}
                    {product.checklist_json?.color && (
                      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Color
                        </h4>
                        <p className="text-gray-900 font-bold text-sm capitalize">
                          {product.checklist_json.color}
                        </p>
                      </div>
                    )}
                    {product.checklist_json?.material && (
                      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          {materialLabel}
                        </h4>
                        <p className="text-gray-900 font-bold text-sm capitalize">
                          {product.checklist_json.material}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="space-y-3 pt-3">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold text-base shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Buy Now</span>
                  </button>

                  {isInCart() ? (
                    <button
                      onClick={handleRemoveFromCart}
                      className="w-full border-2 border-red-500 text-red-600 py-3 px-4 rounded-xl font-bold text-base hover:bg-red-50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remove from Cart</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full border-2 border-indigo-600 text-indigo-600 py-3 px-4 rounded-xl font-bold text-base hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>

                {/* Trust Badges - Compact */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Quality Assured</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      <span>Fast Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
