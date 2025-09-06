import { supabase } from '../config/supabaseClient.js';

export const fetchAllProductsWithImages = async () => {
  const { data, error } = await supabase
    .from('product_listings')
    .select(`
      *,
      product_images (
        image_id,
        url,
        is_primary,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchProductsBySellerIdWithImages = async (seller_id) => {
  const { data, error } = await supabase
    .from('product_listings')
    .select(`
      *,
      product_images (
        image_id,
        url,
        is_primary,
        created_at
      )
    `)
    .eq('seller_id', seller_id);

  if (error) throw error;

  return data;
};


export const addProductWithImages = async (productData, images) => {
  const { data, error } = await supabase
    .from('product_listings')
    .insert([productData])
    .select()
    .single();

  if (error) throw error;

  const listing_id = data.listing_id;

  const imagesToInsert = images.map(img => ({
    listing_id,
    url: img.url,
    is_primary: img.is_primary,
  }));

  const { data: imagesData, error: imagesError } = await supabase
    .from('product_images')
    .insert(imagesToInsert)
    .select();

  if (imagesError) throw imagesError;

  return { product: data, images: imagesData };
};




export const updateProductWithImages = async (listing_id, productData, images) => {
  // productData: fields to update in product_listings (excluding listing_id)
  // images: array of objects each having { image_id?, url, is_primary }

  // 1. Update product listing fields
  const { data: updatedProduct, error: productError } = await supabase
    .from('product_listings')
    .update(productData)
    .eq('listing_id', listing_id)
    .select()
    .single();

  if (productError) {
    throw productError;
  }

  // 2. If images provided, replace all images for this listing
  if (Array.isArray(images)) {
    // Delete existing images for this listing
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('listing_id', listing_id);

    if (deleteError) {
      throw deleteError;
    }

    // Prepare new images with listing_id
    const newImages = images.map(img => ({
      listing_id,
      url: img.url,
      is_primary: img.is_primary || false,
    }));

    // Insert new images
    const { data: insertedImages, error: imagesError } = await supabase
      .from('product_images')
      .insert(newImages)
      .select();

    if (imagesError) {
      throw imagesError;
    }

    return {
      product: updatedProduct,
      images: insertedImages,
    };
  }

  // If no images update, just return the updated product
  return { product: updatedProduct };
};



export const fetchProductById = async (listing_id) => {
  const { data, error } = await supabase
    .from('product_listings')
    .select(`
      *,
      product_images (
        image_id,
        url,
        is_primary,
        created_at
      )
    `)
    .eq('listing_id', listing_id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchProductsByStatus = async (status) => {
  const { data, error } = await supabase
    .from('product_listings')
    .select(`
      *,
      product_images (
        image_id,
        url,
        is_primary,
        created_at
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};



function countTrueKeys(conditionsJson) {
  if (!conditionsJson || typeof conditionsJson !== 'object') return 0;
  return Object.values(conditionsJson).filter(Boolean).length;
}
function countAllKeys(conditionsJson) {
  if (!conditionsJson || typeof conditionsJson !== 'object') return 0;
  return Object.keys(conditionsJson).length;
}

function calculateBasePrice(algorithmPrice, trueCount, totalCount) {
  if (!algorithmPrice || typeof algorithmPrice !== 'object') throw new Error('Invalid algorithm_price');
  if (typeof algorithmPrice.start === 'undefined' || typeof algorithmPrice.end === 'undefined') throw new Error('algorithm_price must have start and end');

  const start = Number(algorithmPrice.start);
  const end = Number(algorithmPrice.end);

  if (!isFinite(start) || !isFinite(end)) throw new Error('Invalid start or end price');

  // totalCount logic
  if (totalCount === 1) {
    if (trueCount === 1) return end;
    return 0;
  }
  if (totalCount > 1) {
    const price_per_check = (end - start) / (totalCount - 1);
    if (trueCount === 0) return 0;
    return start + (trueCount-1) * price_per_check;
  }
  // Fallback if conditions_json is empty
  return 0;
}

export const fetchAndUpdateBasePriceForPickupRequest = async (pickup_request_id) => {
  // Fetch data from pickup_requests
  const { data: pickup, error: errPickup } = await supabase
    .from('pickup_requests')
    .select('listing_id, conditions_json')
    .eq('pickup_request_id', pickup_request_id)
    .single();
  if (errPickup || !pickup) throw new Error('Pickup request not found');

  // Fetch algorithm_price from product_listings
  const { data: listing, error: errListing } = await supabase
    .from('product_listings')
    .select('algorithm_price')
    .eq('listing_id', pickup.listing_id)
    .single();
  if (errListing || !listing) throw new Error('Listing not found');

  // Count trues and total
  const trueCount = countTrueKeys(pickup.conditions_json);
  const totalCount = countAllKeys(pickup.conditions_json);

  // Calculate
  const base_price = calculateBasePrice(listing.algorithm_price, trueCount, totalCount);

  // Update base_price in product_listings
  const { error: updateError } = await supabase
    .from('product_listings')
    .update({ base_price })
    .eq('listing_id', pickup.listing_id);

  if (updateError) throw updateError;

  return {
    listing_id: pickup.listing_id,
    conditions_json: pickup.conditions_json,
    algorithm_price: listing.algorithm_price,
    true_conditions_count: trueCount,
    total_conditions_count: totalCount,
    base_price,
  };
};


export const fetchProductsWithImagesByListingIds = async (listingIds) => {
  if (!Array.isArray(listingIds) || listingIds.length === 0) {
    throw new Error('listingIds must be a non-empty array');
  }

  const { data, error } = await supabase
    .from('product_listings')
    .select(`
      *,
      product_images (
        image_id,
        url,
        is_primary,
        created_at
      )
    `)
    .in('listing_id', listingIds);

  if (error) throw error;
  return data;
};