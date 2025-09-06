import { supabase } from '../config/supabaseClient.js';

// Create new pickup request
export const createPickupRequest = async (pickupData) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .insert([pickupData])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Update existing pickup request by id
export const updatePickupRequest = async (id, updateData) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .update(updateData)
    .eq('pickup_request_id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
};


export const fetchPickupRequestsByDeliveryAgent = async (deliveryagent_id) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('*')
    .eq('deliveryagent_id', deliveryagent_id);

  if (error) throw error;

  return data;
};


export const fetchPickupRequestsByListingId = async (listing_id) => {
  const { data, error } = await supabase
    .from('pickup_requests')
    .select('*')
    .eq('listing_id', listing_id);

  if (error) throw error;

  return data;
};