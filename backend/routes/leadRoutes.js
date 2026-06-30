import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
} from '../controllers/leadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats route (must come before /:id)
router.get('/stats', authorize('admin', 'sales_manager'), getLeadStats);

// Main CRUD routes
router
  .route('/')
  .get(getLeads)
  .post(authorize('admin', 'sales_manager', 'sales_executive'), createLead);

router
  .route('/:id')
  .get(getLead)
  .put(authorize('admin', 'sales_manager', 'sales_executive'), updateLead)
  .delete(authorize('admin', 'sales_manager'), deleteLead);

// Status update route
router.patch('/:id/status', authorize('admin', 'sales_manager', 'sales_executive'), updateLeadStatus);

export default router;
