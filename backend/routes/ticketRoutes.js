import express from 'express';
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  updateTicketStatus,
  addComment,
  deleteTicket,
  getTicketStats,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin', 'support_executive'));

// Stats route
router.get('/stats', getTicketStats);

// Main CRUD routes
router.route('/').get(getTickets).post(createTicket);

router
  .route('/:id')
  .get(getTicket)
  .put(updateTicket)
  .delete(authorize('admin'), deleteTicket);

// Additional routes
router.patch('/:id/status', updateTicketStatus);
router.post('/:id/comments', addComment);

export default router;
