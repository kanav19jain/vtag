import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  endCall,
  getCall,
  getPublicVehicle,
  startCall,
} from '../controllers/publicController.js';
import { callLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const tagRule = param('tagId')
  .isString()
  .trim()
  .matches(/^vt_[A-Za-z0-9_-]{8,40}$/)
  .withMessage('Invalid VTag identifier');

router.get('/tags/:tagId', [tagRule, validate], getPublicVehicle);

router.post(
  '/tags/:tagId/calls',
  callLimiter,
  [tagRule, body('forceFailure').optional().isBoolean().withMessage('Invalid demo option'), validate],
  startCall
);

router.get('/calls/:publicId', [
  param('publicId').isUUID().withMessage('Invalid demo call identifier'),
  validate,
], getCall);

router.patch('/calls/:publicId/end', [
  param('publicId').isUUID().withMessage('Invalid demo call identifier'),
  validate,
], endCall);

export default router;
