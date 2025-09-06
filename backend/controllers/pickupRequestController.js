import { createPickupRequest, fetchPickupRequestsByListingId, updatePickupRequest } from '../services/pickupRequestService.js';
import { fetchPickupRequestsByDeliveryAgent } from '../services/pickupRequestService.js';

// POST /pickup_requests/create
export const createPickupRequestController = async (req, res) => {
  try {
    const pickupData = req.body;

    // Optional: Validate required fields
    const required = ['deliveryagent_id', 'seller_id', 'listing_id', 'status'];
    for (const field of required) {
      if (!pickupData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const newRequest = await createPickupRequest(pickupData);
    res.status(201).json({ message: 'Pickup request created', data: newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /pickup_requests/:id
export const updatePickupRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) return res.status(400).json({ error: 'Pickup request ID is required' });

    const updatedRequest = await updatePickupRequest(id, updateData);
    res.json({ message: 'Pickup request updated', data: updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPickupRequestsByDeliveryAgentController = async (req, res) => {
  try {
    const { deliveryagent_id } = req.params;
    if (!deliveryagent_id) {
      return res.status(400).json({ error: 'Delivery agent ID is required' });
    }

    const requests = await fetchPickupRequestsByDeliveryAgent(deliveryagent_id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPickupRequestsByListingIdController = async (req, res) => {
  try {
    const { listing_id } = req.params;
    if (!listing_id) {
      return res.status(400).json({ error: 'listing_id is required' });
    }

    const requests = await fetchPickupRequestsByListingId(listing_id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};