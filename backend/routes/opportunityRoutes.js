import express from 'express';
import {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  deleteOpportunity,
  getOpportunityStats,
} from '../controllers/opportunityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin', 'sales_manager', 'sales_executive'));

// Stats route
router.get('/stats', getOpportunityStats);

// Main CRUD routes
router.route('/').get(getOpportunities).post(createOpportunity);

router
  .route('/:id')
  .get(getOpportunity)
  .put(updateOpportunity)
  .delete(authorize('admin', 'sales_manager'), deleteOpportunity);

// Stage update route
router.patch('/:id/stage', updateOpportunityStage);

export default router;
