import { supabase } from '../config/supabaseClient.js';
import { fetchAllProductsWithImages, addProductWithImages, fetchAndUpdateBasePriceForPickupRequest, fetchProductsBySellerIdWithImages } from '../services/productService.js';
import { fetchProductById } from '../services/productService.js';
import { updateProductWithImages } from '../services/productService.js';
import { fetchProductsByStatus } from '../services/productService.js';
import { fetchProductsWithImagesByListingIds } from '../services/productService.js';

export const getAllProductsController = async (req, res) => {
  try {
    const products = await fetchAllProductsWithImages();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { listing_id } = req.params;

    const product = await fetchProductById(listing_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const addProductController = async (req, res) => {
  try {
    const images = req.files || [];
    const productData = req.body;

    if (images.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    // Parse JSON strings if sent as strings
    if (productData.algorithm_price && typeof productData.algorithm_price === 'string') {
      productData.algorithm_price = JSON.parse(productData.algorithm_price);
    }
    if (productData.checklist_json && typeof productData.checklist_json === 'string') {
      productData.checklist_json = JSON.parse(productData.checklist_json);
    }

    // Convert prices to numbers if available, else leave undefined
    productData.base_price = productData.base_price ? parseFloat(productData.base_price) : null;
    productData.final_price = productData.final_price ? parseFloat(productData.final_price) : null;

    // Set default status to 'draft' if not provided
    productData.status = productData.status || 'draft';

    const imageEntries = images.map((file, idx) => ({
      url: file.path,
      is_primary: idx === 0,
    }));

    const result = await addProductWithImages(productData, imageEntries);

    res.status(201).json({ message: 'Product with images added successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const updateProductController = async (req, res) => {
  try {
    const listing_id = req.params.listing_id;
    const { images, ...productData } = req.body;

    const result = await updateProductWithImages(listing_id, productData, images);

    res.json({ message: 'Product updated successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAwaitingReviewProductsController = async (req, res) => {
  try {
    const products = await fetchProductsByStatus('awaiting_review');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByStatusController = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Status must be specified in query." });
    }

    const products = await fetchProductsByStatus(status);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByStatusParamController = async (req, res) => {
  try {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({ error: "Status parameter is required." });
    }

    const products = await fetchProductsByStatus(status);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /products/base-price/:pickup_request_id
export const getAndUpdateBasePriceByPickupRequestId = async (req, res) => {
  try {
    const { pickup_request_id } = req.params;
    if (!pickup_request_id) {
      return res.status(400).json({ error: 'pickup_request_id is required' });
    }

    const result = await fetchAndUpdateBasePriceForPickupRequest(pickup_request_id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateProductImagesController = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const images = req.files || [];

    if (images.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    if (images.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images are allowed' });
    }

    // Map images as per addProductController
    const imageEntries = images.map((file, idx) => ({
      url: file.path,
      is_primary: idx === 0,
    }));

    // Delete existing images for this listing
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('listing_id', listing_id);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete old images' });
    }

    // Insert new images
    const { data: imagesData, error: insertError } = await supabase
      .from('product_images')
      .insert(
        imageEntries.map(img => ({
          listing_id,
          url: img.url,
          is_primary: img.is_primary,
        }))
      )
      .select();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to insert new images' });
    }

    res.status(200).json({ 
      message: 'Product images updated successfully',
      images: imagesData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getProductsBySellerIdController = async (req, res) => {
  try {
    const { seller_id } = req.params;
    if (!seller_id) {
      return res.status(400).json({ error: 'seller_id is required' });
    }

    const products = await fetchProductsBySellerIdWithImages(seller_id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMultipleProductsController = async (req, res) => {
  try {
    const { listing_ids } = req.body;

    if (!Array.isArray(listing_ids) || listing_ids.length === 0) {
      return res.status(400).json({ error: 'listing_ids must be a non-empty array' });
    }

    const products = await fetchProductsWithImagesByListingIds(listing_ids);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};