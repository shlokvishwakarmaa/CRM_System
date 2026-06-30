import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect);
router.use(authorize('admin'));

// Get users by role (special route)
router.get('/role/:role', getUsersByRole);

// Main CRUD routes
router.route('/').get(getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
