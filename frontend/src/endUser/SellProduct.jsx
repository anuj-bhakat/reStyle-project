import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const PRODUCT_SPEC_FIELDS = {
  shoes: {
    sizeLabel: "Shoe Size *",
    sizeOptions: ["", "6", "7", "8", "9", "10", "11"],
    colorLabel: "Color *",
    materialLabel: "Material *",
  },
  clothes: {
    sizeLabel: "Clothing Size *",
    sizeOptions: ["", "S", "M", "L", "XL", "XXL"],
    colorLabel: "Color *",
    materialLabel: "Material *",
  },
  bag: {
    sizeLabel: "Bag Capacity (L) *",
    sizeOptions: ["", "10L", "15L", "20L", "25L"],
    colorLabel: "Color *",
    materialLabel: "Material *",
  },
  wristwatch: {
    sizeLabel: "Dial Size (mm) *",
    sizeOptions: ["", "38", "40", "42", "44"],
    colorLabel: "Color *",
    materialLabel: "Strap Material *",
  },
};

const SellProduct = () => {
  // Form state
  const [formData, setFormData] = useState({
    productType: "",
    checklist: { size: "", color: "", material: "" },
    description: "",
    brandName: "",
    condition: "",
    sellerId: "",
  });

  // Image state
  const [images, setImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Get seller ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userid");
    if (userId) {
      setFormData((prev) => ({ ...prev, sellerId: userId }));
    } else {
      setErrors((prev) => ({
        ...prev,
        sellerId: "Seller ID not found. Please log in.",
      }));
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (validationAttempted) {
      setValidationAttempted(false);
    }
  };

  // Handle checklist changes
  const handleChecklistChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      checklist: { ...prev.checklist, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (validationAttempted) {
      setValidationAttempted(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = [];

    files.forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        newErrors.push(
          `File ${index + 1}: Invalid file type. Only images are allowed.`
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.push(`File ${index + 1}: File size exceeds 5MB.`);
        return;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        include: true,
        id: Date.now() + index,
      });
    });

    if (validFiles.length + images.length > 5) {
      newErrors.push("Maximum 5 images allowed.");
    } else {
      setImages((prev) => [...prev, ...validFiles.slice(0, 5 - prev.length)]);
    }

    setImageErrors(newErrors);
  };

  // Remove image
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Toggle image inclusion
  const toggleImageInclude = (id) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, include: !img.include } : img
      )
    );
  };

  // Product spec helper
  const currentSpecs = PRODUCT_SPEC_FIELDS[formData.productType] || {};

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.productType) {
      newErrors.productType = "Product type is required.";
    }
    // Validate product specs only if productType is selected
    if (formData.productType) {
      if (!formData.checklist.size.trim())
        newErrors.size = `${currentSpecs.sizeLabel} is required.`;
      if (!formData.checklist.color.trim())
        newErrors.color = `${currentSpecs.colorLabel} is required.`;
      if (!formData.checklist.material.trim())
        newErrors.material = `${currentSpecs.materialLabel} is required.`;
    }
    if (!formData.description.trim()) {
      newErrors.description = "Product description is required.";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less.";
    }
    if (!formData.brandName.trim()) {
      newErrors.brandName = "Brand name is required.";
    }
    if (!formData.condition) {
      newErrors.condition = "Condition is required.";
    }
    if (!formData.sellerId) {
      newErrors.sellerId = "Seller ID is required. Please log in.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate whole form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.productType) {
      newErrors.productType = "Product type is required.";
    }
    // Validate product specs only if productType is selected
    if (formData.productType) {
      if (!formData.checklist.size.trim())
        newErrors.size = `${currentSpecs.sizeLabel} is required.`;
      if (!formData.checklist.color.trim())
        newErrors.color = `${currentSpecs.colorLabel} is required.`;
      if (!formData.checklist.material.trim())
        newErrors.material = `${currentSpecs.materialLabel} is required.`;
    }
    if (!formData.description.trim()) {
      newErrors.description = "Product description is required.";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less.";
    }
    if (!formData.brandName.trim()) {
      newErrors.brandName = "Brand name is required.";
    }
    if (!formData.condition) {
      newErrors.condition = "Condition is required.";
    }
    if (!formData.sellerId) {
      newErrors.sellerId = "Seller ID is required. Please log in.";
    }
    const includedImages = images.filter((img) => img.include);
    if (includedImages.length === 0) {
      newErrors.images = "At least one image must be included.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append(
        "checklist_json",
        JSON.stringify(formData.checklist)
      );
      formDataToSend.append("brand", formData.brandName);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("product_type", formData.productType);
      formDataToSend.append("seller_id", formData.sellerId);
      const includedImages = images.filter((img) => img.include);
      includedImages.forEach((img) => {
        formDataToSend.append("images", img.file);
      });
      await axios.post("http://localhost:3000/products/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccess(true);
      // Reset form or redirect
    } catch (error) {
      const backendError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        error.message;
      setSubmitError(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: "Details", description: "Product information" },
    { id: 2, name: "Images", description: "Upload product photos" },
    { id: 3, name: "Submit", description: "Review and submit" },
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600">
            Your product has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sell Your Product
            </h1>
            <p className="text-gray-600">List your item on our high-end marketplace</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 ${
                        currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              {steps.map((step) => (
                <div key={step.id} className="text-center mx-4">
                  <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
            {/* Step 1: Product Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Product Details
                </h2>

                {validationAttempted && Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Please complete all required fields to continue:
                        </h3>
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {Object.values(errors).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Type */}
                <div>
                  <label
                    htmlFor="productType"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Type *
                  </label>
                  <select
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select product type</option>
                    <option value="shoes">Shoes</option>
                    <option value="wristwatch">Wristwatch</option>
                    <option value="clothes">Clothes</option>
                    <option value="bag">Bag</option>
                  </select>
                  {errors.productType && (
                    <span className="text-sm text-red-600">{errors.productType}</span>
                  )}
                </div>

                {/* Specifications */}
                {formData.productType && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Product Specifications
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Size (manual input instead of select) */}
                      <div>
                        <label
                          htmlFor="size"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {currentSpecs.sizeLabel}
                        </label>
                        <input
                          type="text"
                          id="size"
                          value={formData.checklist.size}
                          onChange={(e) => handleChecklistChange("size", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.size ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter size"
                        />
                        {errors.size && (
                          <span className="text-sm text-red-600">{errors.size}</span>
                        )}
                      </div>

                      {/* Color */}
                      <div>
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {currentSpecs.colorLabel}
                        </label>
                        <input
                          type="text"
                          id="color"
                          value={formData.checklist.color}
                          onChange={(e) => handleChecklistChange("color", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.color ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="e.g., Red, Blue"
                        />
                        {errors.color && (
                          <span className="text-sm text-red-600">{errors.color}</span>
                        )}
                      </div>

                      {/* Material */}
                      <div>
                        <label
                          htmlFor="material"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {currentSpecs.materialLabel}
                        </label>
                        <input
                          type="text"
                          id="material"
                          value={formData.checklist.material}
                          onChange={(e) => handleChecklistChange("material", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.material ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="e.g., Cotton, Leather"
                        />
                        {errors.material && (
                          <span className="text-sm text-red-600">{errors.material}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand Name */}
                <div>
                  <label
                    htmlFor="brandName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.brandName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter brand name"
                  />
                  {errors.brandName && (
                    <span className="text-sm text-red-600">{errors.brandName}</span>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label
                    htmlFor="condition"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.condition ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="gently_used">Gently Used</option>
                    <option value="worn">Worn</option>
                  </select>
                  {errors.condition && (
                    <span className="text-sm text-red-600">{errors.condition}</span>
                  )}
                </div>

                {/* Product Description: added top margin */}
                <div className="mt-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Product Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe your product in detail..."
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">
                      {formData.description.length}/500 characters
                    </span>
                    {errors.description && (
                      <span className="text-sm text-red-600">{errors.description}</span>
                    )}
                  </div>
                </div>

                {errors.sellerId && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <span className="text-sm text-red-700">{errors.sellerId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Images */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Product Images
                </h2>

                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600 mb-2">
                    Drag and drop images here, or click to select
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors"
                  >
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    Select Images
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Max 5 images, 5MB each (JPEG, PNG)
                  </p>
                </div>

                {/* Image Errors */}
                {imageErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {imageErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Product preview"
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <div className="mt-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`include-${image.id}`}
                            checked={image.include}
                            onChange={() => toggleImageInclude(image.id)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`include-${image.id}`}
                            className="text-sm text-gray-700"
                          >
                            Include this image
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <span className="text-sm text-red-700">{errors.images}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Submit */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Review and Submit
                </h2>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">Product Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type:</strong> {formData?.productType || "Not provided"}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {formData?.description || "Not provided"}
                    </div>
                    <div>
                      <strong>Brand:</strong> {formData?.brandName || "Not provided"}
                    </div>
                    <div>
                      <strong>Condition:</strong> {formData?.condition || "Not provided"}
                    </div>
                    <div>
                      <strong>Size:</strong> {formData?.checklist?.size || "Not provided"}
                    </div>
                    <div>
                      <strong>Color:</strong> {formData?.checklist?.color || "Not provided"}
                    </div>
                    <div>
                      <strong>Material:</strong>{" "}
                      {formData?.checklist?.material || "Not provided"}
                    </div>
                    <div>
                      <strong>Images:</strong>{" "}
                      {Array.isArray(images)
                        ? images.filter((img) => img?.include).length
                        : 0}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <span className="text-sm text-red-700">{submitError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    setValidationAttempted(true);
                    if (currentStep === 1) {
                      if (validateStep1()) {
                        setCurrentStep((prev) => prev + 1);
                        setValidationAttempted(false);
                      }
                    } else {
                      setCurrentStep((prev) => prev + 1);
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ml-auto"
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Product
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Render error in SellProduct:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We encountered an error while loading the form.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default SellProduct;
