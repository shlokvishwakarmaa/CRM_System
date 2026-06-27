import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  addInteraction,
  deleteCustomer,
  getCustomerStats,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route
router.get('/stats', getCustomerStats);

// Main CRUD routes
router.route('/').get(getCustomers).post(createCustomer);

router
  .route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('admin', 'sales_manager'), deleteCustomer);

// Additional routes
router.patch('/:id/status', updateCustomerStatus);
router.post('/:id/interactions', addInteraction);

export default router;
