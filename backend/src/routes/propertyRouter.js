import express from 'express';
import {
  getProperties,
  getProperty,
  createPropertyReview,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { checkDateAvailability } from '../controllers/holdController.js';
import { protect } from '../controllers/authController.js';

const propertyRouter = express.Router();

propertyRouter.get('/check-availability', checkDateAvailability);
propertyRouter.get('/', getProperties);
propertyRouter.get('/:id', getProperty);

// Protected review and property management routes
propertyRouter.post('/:id/review', protect, createPropertyReview);
propertyRouter.put('/:id', protect, updateProperty);
propertyRouter.delete('/:id', protect, deleteProperty);

export { propertyRouter };