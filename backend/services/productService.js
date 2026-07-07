import { pool } from '../config/db.js';

const buildProductsWithImages = (products, images) => {
  const imagesByListingId = {};
  for (const img of images) {
    if (!imagesByListingId[img.listing_id]) {
      imagesByListingId[img.listing_id] = [];
    }
    imagesByListingId[img.listing_id].push(img);
  }

  return products.map(prod => ({
    ...prod,
    product_images: imagesByListingId[prod.listing_id] || []
  }));
};

export const fetchAllProductsWithImages = async () => {
  try {
    const productsResult = await pool.query('SELECT * FROM product_listings ORDER BY created_at DESC');
    const imagesResult = await pool.query('SELECT image_id, listing_id, url, is_primary, created_at FROM product_images');
    return buildProductsWithImages(productsResult.rows, imagesResult.rows);
  } catch (error) {
    throw error;
  }
};

export const fetchProductsBySellerIdWithImages = async (seller_id) => {
  try {
    const productsResult = await pool.query('SELECT * FROM product_listings WHERE seller_id = $1', [seller_id]);
    const listingIds = productsResult.rows.map(p => p.listing_id);
    let images = [];
    if (listingIds.length > 0) {
      const placeholders = listingIds.map((_, i) => `$${i + 1}`).join(', ');
      const imagesResult = await pool.query(`SELECT image_id, listing_id, url, is_primary, created_at FROM product_images WHERE listing_id IN (${placeholders})`, listingIds);
      images = imagesResult.rows;
    }
    return buildProductsWithImages(productsResult.rows, images);
  } catch (error) {
    throw error;
  }
};

export const addProductWithImages = async (productData, images) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const keys = Object.keys(productData);
    const values = Object.values(productData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const insertQuery = `INSERT INTO product_listings (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await client.query(insertQuery, values);
    const product = result.rows[0];
    const listing_id = product.listing_id;

    let imagesData = [];
    if (images && images.length > 0) {
      const imgValues = [];
      const imgPlaceholders = images.map((img, index) => {
        const offset = index * 3;
        imgValues.push(listing_id, img.url, img.is_primary || false);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      }).join(', ');
      
      const imgQuery = `INSERT INTO product_images (listing_id, url, is_primary) VALUES ${imgPlaceholders} RETURNING *`;
      const imgResult = await client.query(imgQuery, imgValues);
      imagesData = imgResult.rows;
    }

    await client.query('COMMIT');
    return { product, images: imagesData };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateProductWithImages = async (listing_id, productData, images) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(productData)) {
      updates.push(`${key} = $${index++}`);
      values.push(value);
    }

    let updatedProduct;
    if (updates.length > 0) {
      values.push(listing_id);
      const query = `UPDATE product_listings SET ${updates.join(', ')} WHERE listing_id = $${index} RETURNING *`;
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Product not found for update');
      }
      updatedProduct = result.rows[0];
    } else {
      const result = await client.query('SELECT * FROM product_listings WHERE listing_id = $1', [listing_id]);
      updatedProduct = result.rows[0];
    }

    let insertedImages = [];
    if (Array.isArray(images)) {
      await client.query('DELETE FROM product_images WHERE listing_id = $1', [listing_id]);

      if (images.length > 0) {
        const imgValues = [];
        const imgPlaceholders = images.map((img, i) => {
          const offset = i * 3;
          imgValues.push(listing_id, img.url, img.is_primary || false);
          return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
        }).join(', ');
        
        const imgQuery = `INSERT INTO product_images (listing_id, url, is_primary) VALUES ${imgPlaceholders} RETURNING *`;
        const imgResult = await client.query(imgQuery, imgValues);
        insertedImages = imgResult.rows;
      }
      
      await client.query('COMMIT');
      return { product: updatedProduct, images: insertedImages };
    }

    await client.query('COMMIT');
    return { product: updatedProduct };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const fetchProductById = async (listing_id) => {
  try {
    const productsResult = await pool.query('SELECT * FROM product_listings WHERE listing_id = $1', [listing_id]);
    if (productsResult.rows.length === 0) {
      throw new Error('Product not found');
    }
    const imagesResult = await pool.query('SELECT image_id, listing_id, url, is_primary, created_at FROM product_images WHERE listing_id = $1', [listing_id]);
    
    const product = productsResult.rows[0];
    product.product_images = imagesResult.rows;
    return product;
  } catch (error) {
    throw error;
  }
};

export const fetchProductsByStatus = async (status) => {
  try {
    const productsResult = await pool.query('SELECT * FROM product_listings WHERE status = $1 ORDER BY created_at DESC', [status]);
    const listingIds = productsResult.rows.map(p => p.listing_id);
    let images = [];
    if (listingIds.length > 0) {
      const placeholders = listingIds.map((_, i) => `$${i + 1}`).join(', ');
      const imagesResult = await pool.query(`SELECT image_id, listing_id, url, is_primary, created_at FROM product_images WHERE listing_id IN (${placeholders})`, listingIds);
      images = imagesResult.rows;
    }
    return buildProductsWithImages(productsResult.rows, images);
  } catch (error) {
    throw error;
  }
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

  if (totalCount === 1) {
    if (trueCount === 1) return end;
    return 0;
  }
  if (totalCount > 1) {
    const price_per_check = (end - start) / (totalCount - 1);
    if (trueCount === 0) return 0;
    return start + (trueCount-1) * price_per_check;
  }
  return 0;
}

export const fetchAndUpdateBasePriceForPickupRequest = async (pickup_request_id) => {
  try {
    const pickupResult = await pool.query('SELECT listing_id, conditions_json FROM pickup_requests WHERE pickup_request_id = $1', [pickup_request_id]);
    const pickup = pickupResult.rows[0];
    if (!pickup) throw new Error('Pickup request not found');

    const listingResult = await pool.query('SELECT algorithm_price FROM product_listings WHERE listing_id = $1', [pickup.listing_id]);
    const listing = listingResult.rows[0];
    if (!listing) throw new Error('Listing not found');

    const trueCount = countTrueKeys(pickup.conditions_json);
    const totalCount = countAllKeys(pickup.conditions_json);
    const base_price = calculateBasePrice(listing.algorithm_price, trueCount, totalCount);

    await pool.query('UPDATE product_listings SET base_price = $1 WHERE listing_id = $2', [base_price, pickup.listing_id]);

    return {
      listing_id: pickup.listing_id,
      conditions_json: pickup.conditions_json,
      algorithm_price: listing.algorithm_price,
      true_conditions_count: trueCount,
      total_conditions_count: totalCount,
      base_price,
    };
  } catch (error) {
    throw error;
  }
};

export const fetchProductsWithImagesByListingIds = async (listingIds) => {
  if (!Array.isArray(listingIds) || listingIds.length === 0) {
    throw new Error('listingIds must be a non-empty array');
  }

  try {
    const placeholders = listingIds.map((_, i) => `$${i + 1}`).join(', ');
    const productsResult = await pool.query(`SELECT * FROM product_listings WHERE listing_id IN (${placeholders})`, listingIds);
    
    let images = [];
    if (productsResult.rows.length > 0) {
      const imagesResult = await pool.query(`SELECT image_id, listing_id, url, is_primary, created_at FROM product_images WHERE listing_id IN (${placeholders})`, listingIds);
      images = imagesResult.rows;
    }
    return buildProductsWithImages(productsResult.rows, images);
  } catch (error) {
    throw error;
  }
};