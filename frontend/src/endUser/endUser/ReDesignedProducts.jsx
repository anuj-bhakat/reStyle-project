import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReDesignedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    productType: '',
    brand: '',
    condition: '',
    priceRange: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/products/get/redesigned');
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.url || product.product_images?.[0]?.url || null;
  };

  const handleImageError = (e) => {
    // Use a simple data URL as fallback instead of external service
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const handleProductClick = (productId) => {
    // window.open(`/p?id=${productId}`, '_blank');
    navigate('/product', {
      state: { listingId: productId },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      if (filters.productType && product.product_type !== filters.productType) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.condition && product.condition !== filters.condition) return false;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (product.final_price < min || (max && product.final_price > max)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.final_price - b.final_price;
        case 'price-high':
          return b.final_price - a.final_price;
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

  const uniqueBrands = [...new Set(products.map(p => p.brand))];
  const uniqueTypes = [...new Set(products.map(p => p.product_type))];

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Product Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={filters.productType}
                  onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="gently_used">Gently Used</option>
                  <option value="worn">Worn</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({ productType: '', brand: '', condition: '', priceRange: '' })}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={() => setFilters({ productType: '', brand: '', condition: '', priceRange: '' })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <div
                    key={product.listing_id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleProductClick(product.listing_id)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={getPrimaryImage(product)}
                        alt={product.description}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                      />
                      {/* <img
                        src="https://via.placeholder.com/300x300?text=Product+Image"
                        alt="Product Image Fallback"
                        className="w-full h-full object-cover flex items-center justify-center"
                        style={{ display: 'none' }}
                      /> */}
                      {product.condition === 'new' && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.brand} {product.product_type}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      </div>

                      {/* Size and Color */}
                      {product.checklist_json && (
                        <div className="mb-3">
                          {product.checklist_json.size && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                              Size: {product.checklist_json.size}
                            </span>
                          )}
                          {product.checklist_json.color && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                              {product.checklist_json.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.final_price)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/product', { state: { listingId: product.listing_id } });
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Buy Now
                        </button>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReDesignedProducts;