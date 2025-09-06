import express from 'express';
import parser from '../middlewares/multerCloudinary.js';
import {
  getAllProductsController,
  addProductController,
  updateProductController,
  getProductByIdController,
  getAwaitingReviewProductsController,
  getProductsByStatusParamController,
  getAndUpdateBasePriceByPickupRequestId,
  updateProductImagesController,
  getProductsBySellerIdController,
  getMultipleProductsController,
} from '../controllers/productController.js';




const router = express.Router();

router.get('/', getAllProductsController);
router.get('/history/:seller_id', getProductsBySellerIdController);
router.post('/multiple', getMultipleProductsController);

router.get('/:listing_id', getProductByIdController);
router.put('/:listing_id', updateProductController);

router.post('/', parser.array('images', 10), addProductController);

router.get('/awaiting-review', getAwaitingReviewProductsController);
router.get('/get/:status', getProductsByStatusParamController);

router.get('/base-price/:pickup_request_id', getAndUpdateBasePriceByPickupRequestId);

router.put('/redesign/:listing_id', parser.array('images', 10), updateProductImagesController);



export default router;