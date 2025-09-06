import { supabase } from '../config/supabaseClient.js';

// Update order by UUID id
export const updateCustomerOrder = async (id, updateData) => {
  const { data, error } = await supabase
    .from('customer_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete order by UUID id
export const deleteCustomerOrder = async (id) => {
  const { error } = await supabase
    .from('customer_orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Fetch order by UUID id
export const fetchOrderById = async (id) => {
  const { data, error } = await supabase
    .from('customer_orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

// Fetch orders by customer_id
export const fetchOrdersByCustomerId = async (customer_id) => {
  const { data, error } = await supabase
    .from('customer_orders')
    .select('*')
    .eq('customer_id', customer_id);
  if (error) throw error;
  return data;
};


const generateOrderId = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return (
    'ORD' +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
};

// Create an order and mark its products as sold
export const createCustomerOrderAndMarkSold = async (orderData) => {
  // generate order_id here
  orderData.order_id = generateOrderId();

  // 1. Create the order
  const { data: newOrder, error: orderError } = await supabase
    .from('customer_orders')
    .insert([orderData])
    .select()
    .single();
  if (orderError) throw orderError;

  // 2. Mark all products as 'sold'
  const productIds = Object.keys(orderData.products);
  if (productIds.length > 0) {
    const { error: updateError } = await supabase
      .from('product_listings')
      .update({ status: 'sold' })
      .in('listing_id', productIds);

    if (updateError) {
      // handle error if needed, or even rollback the previous insertion (advanced, not shown)
      console.error('Error updating product status:', updateError.message);
    }
  }

  return newOrder;
};


export const fetchOrdersByStatus = async (status) => {
  const allowedStatuses = ['ordered', 'delivering', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid status value');
  }

  const { data, error } = await supabase
    .from('customer_orders')
    .select('*')
    .eq('status', status);

  if (error) throw error;
  return data;
};


export const fetchOrdersByDeliveryAgentId = async (deliveryagent_id) => {
  const { data, error } = await supabase
    .from('customer_orders')
    .select('*')
    .eq('deliveryagent_id', deliveryagent_id);

  if (error) throw error;
  return data;
};