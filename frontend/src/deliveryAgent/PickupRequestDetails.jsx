import React, { useState, useEffect } from "react";

const PickupRequestDetails = ({
  request,
  product,
  basePrice,
  onBack,
  onReject,
  onSubmit,
}) => {
  const [conditions, setConditions] = useState(request.conditions_json || {});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [localBasePrice, setLocalBasePrice] = useState(basePrice);
  const isGuest = localStorage.getItem('isGuest') === 'true';

  const isCompleted = request.status === "completed";

  const handleBack = () => {
    onBack();
  };

  const handleSubmit = () => {
    if (hasAtLeastOneTrueCondition()) {
      onSubmit(request.pickup_request_id, request.listing_id, conditions);
    }
  };

  const handleConditionSet = (key, boolValue) => {
    setConditions((prev) => ({
      ...prev,
      [key]: boolValue,
    }));
  };

  const hasAtLeastOneTrueCondition = () =>
    Object.values(conditions).some((val) => val === true);

  const areAllConditionsFalse = () =>
    Object.values(conditions).every((val) => val === false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  useEffect(() => {
    if (basePrice !== null) {
      setLocalBasePrice(basePrice);
    }
  }, [basePrice]);

  // Checklist Item Renderer
  const renderChecklistItem = (key, value) => {
    if (isCompleted) {
      return (
        <li key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="capitalize font-medium text-gray-700">
            {key.replace(/_/g, " ")}
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            {value ? (
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Yes
              </span>
            ) : (
              <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                No
              </span>
            )}
          </span>
        </li>
      );
    } else {
      return (
        <li key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-blue-200">
          <span className="capitalize font-medium text-gray-800">
            {key.replace(/_/g, " ")}
          </span>
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => handleConditionSet(key, true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === true
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleConditionSet(key, false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${value === false
                ? "bg-white text-red-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              No
            </button>
          </div>
        </li>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
      >
        <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md mr-3 border border-gray-100 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        <span className="font-medium">Back to Requests</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* --- Product Images (Left Column) --- */}
        <div className="space-y-6">
          <div className="relative aspect-[4/3] w-full bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
            {product?.product_images?.length > 0 ? (
              <>
                <img
                  src={product.product_images[selectedImageIndex]?.url}
                  alt={product.description}
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white rounded-full shadow-lg ${product.status === 'processing' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                    {product.status}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 flex-col">
                <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {product?.product_images?.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto justify-center py-2 px-1">
              {product.product_images.map((image, index) => (
                <button
                  key={image.image_id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 transform hover:-translate-y-1 ${selectedImageIndex === index
                    ? "border-blue-600 shadow-md scale-105"
                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
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

        {/* --- Product Info & Actions (Right Column) --- */}
        <div className="space-y-6">
          {/* Product Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">

            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <svg className="w-32 h-32 text-indigo-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">Product Details</h2>
              <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-2 leading-tight">
                {product.brand} {product.product_type}
              </h1>
              <p className="text-gray-600 border-l-4 border-indigo-200 pl-4 py-1 mb-6 text-sm leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Condition</span>
                  <span className="block text-gray-900 font-medium capitalize">{product.condition}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="block text-gray-500 text-xs font-semibold uppercase mb-1">Created At</span>
                  <span className="block text-gray-900 font-medium">{formatDate(product.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Condition Checklist
            </h2>
            <ul className="space-y-3">
              {Object.entries(conditions).map(([key, value]) =>
                renderChecklistItem(key, value)
              )}
            </ul>
          </div>

          {/* Actions Card */}
          {!isCompleted && (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-gray-600 font-medium">Estimated Base Price</div>
                <div className="text-2xl font-bold text-indigo-600">₹{localBasePrice ?? "N/A"}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    onReject(
                      request.pickup_request_id,
                      request.listing_id,
                      conditions
                    )
                  }
                  disabled={!areAllConditionsFalse() || isGuest}
                  title={isGuest ? "Action disabled in Guest Mode" : ""}
                  className={`group relative flex items-center justify-center w-full py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${!areAllConditionsFalse() || isGuest
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-transparent"
                    : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                    }`}
                >
                  <span className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                  Reject Request
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasAtLeastOneTrueCondition() || isGuest}
                  title={isGuest ? "Action disabled in Guest Mode" : ""}
                  className={`group relative flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${!hasAtLeastOneTrueCondition() || isGuest
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                    }`}
                >
                  Confirm Pickup
                  <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">
                *Ensure at least one condition is met to process pickup.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupRequestDetails;
