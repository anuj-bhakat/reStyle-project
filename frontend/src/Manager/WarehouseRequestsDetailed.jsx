import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WarehouseRequestsDetailed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const isGuest = localStorage.getItem('isGuest') === 'true';

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
            const response = await axios.get(`${baseUrl}/products/${listingId}`);
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
            const calculatedFinalPrice = product.base_price * 1.3;

            // Update the product with the final price
            const updateResponse = await axios.put(
                `${baseUrl}/products/${listingId}`,
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
                `${baseUrl}/products/${listingId}`,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* --- Header --- */}
            <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18 py-3">
                        <button
                            onClick={() => navigate('/warehouse-reviews')}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Warehouse Review Details
                        </h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* --- Product Images (Left) --- */}
                    <div className="space-y-4">
                        <div className="relative aspect-[3/2] w-full bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                            {product.product_images && product.product_images.length > 0 && (
                                <>
                                    <img
                                        src={product.product_images[selectedImageIndex]?.url}
                                        alt={product.description}
                                        className="w-full h-full object-contain p-4"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg capitalize">
                                            {product.status.replace("_", " ")}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {product.product_images && product.product_images.length > 1 && (
                            <div className="flex space-x-3 overflow-x-auto justify-center pb-2">
                                {product.product_images.map((image, index) => (
                                    <button
                                        key={image.image_id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                                            ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- Product Info & Actions (Right) --- */}
                    <div className="space-y-4">
                        {/* Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                            <div className="flex items-center mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Product Information</h2>
                            </div>

                            <div className="mb-4">
                                <h1 className="text-2xl font-extrabold text-gray-900 mb-1 capitalize tracking-tight">
                                    {product.brand} {product.product_type}
                                </h1>
                                <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-indigo-100 pl-3 py-0.5">
                                    {product.description}
                                </p>
                            </div>

                            <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0">
                                    <span className="text-gray-500 font-medium">Condition</span>
                                    <span className="capitalize font-semibold text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">
                                        {product.condition.replace("_", " ")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0">
                                    <span className="text-gray-500 font-medium">Created</span>
                                    <span className="font-semibold text-gray-900">{formatDate(product.created_at)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-200 last:border-0">
                                    <span className="text-gray-500 font-medium">Last Updated</span>
                                    <span className="font-semibold text-gray-900">{formatDate(product.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 mb-3">Action</h3>
                            <button
                                onClick={handleSendToLive}
                                disabled={isGuest}
                                title={isGuest ? "Action disabled in Guest Mode" : ""}
                                className={`w-full group relative flex items-center justify-center py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300 transform mb-3 ${isGuest ? "opacity-50 cursor-not-allowed" : "hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:-translate-y-0.5"
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve & Send to Live
                            </button>

                            <button
                                onClick={handleSendToRedesign}
                                disabled={isGuest}
                                title={isGuest ? "Action disabled in Guest Mode" : ""}
                                className={`w-full group relative flex items-center justify-center py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300 transform ${isGuest ? "opacity-50 cursor-not-allowed" : "hover:from-amber-600 hover:to-orange-700 hover:shadow-lg hover:-translate-y-0.5"
                                    }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
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
