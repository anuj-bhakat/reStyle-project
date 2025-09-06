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

  // ✅ NEW: Render checklist item conditionally
  const renderChecklistItem = (key, value) => {
    if (isCompleted) {
      return (
        <li key={key} className="flex items-center gap-2">
          <span className="text-lg">
            {value ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-gray-400"> ❌</span>
            )}
          </span>
          <span
            className={`capitalize font-medium ${value ? "text-green-700" : "text-red-600"
              }`}
          >
            {key.replace(/_/g, " ")}
          </span>
        </li>
      );
    } else {
      return (
        <li key={key} className="flex items-center justify-between">
          <span className="capitalize font-medium text-gray-800">
            {key.replace(/_/g, " ")}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleConditionSet(key, true)}
              className={`px-4 py-1 rounded ${value === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
                } hover:bg-green-700 transition`}
            >
              True
            </button>
            <button
              onClick={() => handleConditionSet(key, false)}
              className={`px-4 py-1 rounded ${value === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
                } hover:bg-red-700 transition`}
            >
              False
            </button>
          </div>
        </li>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- Product Images --- */}
        <div className="space-y-4">
          <div className="aspect-[5/4] max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
            {product?.product_images?.length > 0 && (
              <img
                src={product.product_images[selectedImageIndex]?.url}
                alt={product.description}
                className="w-full h-full object-contain bg-white"
                style={{ maxHeight: "400px" }}
              />
            )}
          </div>

          {product?.product_images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto justify-center">
              {product.product_images.map((image, index) => (
                <button
                  key={image.image_id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index
                      ? "border-blue-500"
                      : "border-gray-200"
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

        {/* --- Product Info & Checklist --- */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Information
            </h2>
            <div className="mb-4">
              <h1 className="text-2xl font-bold capitalize">
                {product.brand} {product.product_type}
              </h1>
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

          {/* Condition Checklist */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Condition Checklist
            </h2>
            <ul className={isCompleted ? "space-y-3 pl-1" : "space-y-4"}>
              {Object.entries(conditions).map(([key, value]) =>
                renderChecklistItem(key, value)
              )}
            </ul>
          </div>

          {/* Pricing and Actions */}
          {!isCompleted && (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <div className="text-lg font-semibold text-blue-700 mb-4">
                Base Price: ₹{localBasePrice ?? "N/A"}
              </div>
              <div className="flex gap-4 flex-wrap justify-end">
                <button
                  onClick={() =>
                    onReject(
                      request.pickup_request_id,
                      request.listing_id,
                      conditions
                    )
                  }
                  disabled={!areAllConditionsFalse()}
                  className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Reject
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!hasAtLeastOneTrueCondition()}
                  className="bg-green-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-800 transition disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-end">
            <button
              onClick={handleBack}
              className="bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupRequestDetails;
