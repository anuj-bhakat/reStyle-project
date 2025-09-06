import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const location = useLocation();
  const listingId = location.state?.listingId;


  useEffect(() => {
    if (!listingId) {
      setError('Product ID missing');
      setLoading(false);
      return;
    }
    fetchProductDetails();
  }, [listingId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/products/${listingId}`);
      
      if (response.status === 200) {
        setProduct(response.data);
        setError('');
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


const handleBuyNow = () => {
  if (!selectedSize && product.checklist_json?.size) {
    alert('Please select a size');
    return;
  }

  // Navigate to order summary and pass product + selectedSize
  navigate("/order-summary", {
    state: {
      product,
      selectedSize,
    },
  });
};


  const handleAddToCart = () => {
    if (!selectedSize && product.checklist_json?.size) {
      alert('Please select a size');
      return;
    }
    // Handle add to cart logic
    console.log('Adding to cart:', product.listing_id, 'Size:', selectedSize);
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
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-xl font-semibold text-gray-900">reStyle Store</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
                         {/* Main Image */}
             <div className="aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
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
              <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
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
                       selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.condition === 'new' ? 'bg-green-100 text-green-800' :
                product.condition === 'gently_used' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {product.condition === 'new' ? 'New' :
                 product.condition === 'gently_used' ? 'Gently Used' :
                 'Worn'}
              </span>
            </div>

            {/* Size Selection */}
            {product.checklist_json?.size && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Select Size</span>
                  {/* <button className="text-sm text-blue-600 hover:text-blue-700">Size Guide</button> */}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedSize(product.checklist_json.size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === product.checklist_json.size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {product.checklist_json.size}
                  </button>
                </div>
              </div>
            )}

            {/* Color Display */}
            {product.checklist_json?.color && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Color</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full border border-gray-300 bg-gray-200"></div>
                  <span className="text-sm text-gray-600 capitalize">{product.checklist_json.color}</span>
                </div>
              </div>
            )}



            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleBuyNow}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Add to Cart
              </button>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Product Type</span>
                <span className="text-gray-900 capitalize">{product.product_type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600 font-medium capitalize">{product.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
