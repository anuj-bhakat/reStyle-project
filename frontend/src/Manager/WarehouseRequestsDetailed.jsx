import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WarehouseRequestsDetailed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSendToLive = async () => {
        try {
            // Calculate final price (this could be your pricing algorithm)
            const calculatedFinalPrice = product.base_price*1.3;

            // Update the product with the final price
            const updateResponse = await axios.put(
                `http://localhost:3000/products/${listingId}`,
                {
                    status: 'live',
                    final_price: calculatedFinalPrice  // Set final price here
                }
            );

            if (updateResponse.status === 200) {
                navigate('/warehouse-reviews', {
                    state: { message: 'Product sent to live!', type: 'success' },
                });
            }
        } catch (err) {
            setError('Failed to update product status. Please try again.');
        }
    };


    const handleSendToRedesign = async () => {
        try {
            const updateResponse = await axios.put(
                `http://localhost:3000/products/${listingId}`,
                { status: 'redesigning' }
            );

            if (updateResponse.status === 200) {
                navigate('/warehouse-reviews', {
                    state: { message: 'Product sent for redesign!', type: 'info' },
                });
            }
        } catch (err) {
            setError('Failed to update product status. Please try again.');
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

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error || 'Product not found'}</p>
                    <button
                        onClick={() => navigate('/warehouse-reviews')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Back to Reviews
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- Header --- */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate('/warehouse-reviews')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Reviews
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Product Review Details</h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* --- Product Images --- */}
                    <div className="space-y-4">
                        <div className="aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
                            {product.product_images && product.product_images.length > 0 && (
                                <img
                                    src={product.product_images[selectedImageIndex]?.url}
                                    alt={product.description}
                                    className="w-full h-full object-contain bg-white"
                                    style={{ maxHeight: '400px' }}
                                />
                            )}
                        </div>
                        {product.product_images && product.product_images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto justify-center">
                                {product.product_images.map((image, index) => (
                                    <button
                                        key={image.image_id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'}`}
                                    >
                                        <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Product Info --- */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold">{product.brand} {product.product_type}</h1>
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Condition:</span>
                                    <span className="capitalize">{product.condition}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="capitalize">{product.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Created:</span>
                                    <span>{formatDate(product.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Updated:</span>
                                    <span>{formatDate(product.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- Action Buttons --- */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <button
                                onClick={handleSendToLive}
                                className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                            >
                                Send to Live
                            </button>
                            <button
                                onClick={handleSendToRedesign}
                                className="w-full bg-yellow-600 text-white py-3 mt-4 rounded-md font-medium hover:bg-yellow-700 transition-colors"
                            >
                                Send to Redesign
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseRequestsDetailed;
