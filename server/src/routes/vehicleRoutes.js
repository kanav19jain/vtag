import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createVehicle,
  deleteVehicle,
  downloadQr,
  getVehicle,
  listVehicles,
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { VEHICLE_TYPES } from '../models/Vehicle.js';

const router = Router();
router.use(protect);

const mongoIdRule = param('id').isMongoId().withMessage('Invalid vehicle identifier');

router.get('/vehicles', listVehicles);

router.post(
  '/vehicles',
  [
    body('registrationNumber')
      .trim()
      .customSanitizer((value) => (typeof value === 'string' ? value.toUpperCase().replace(/\s+/g, ' ') : value))
      .notEmpty()
      .withMessage('Registration number is required')
      .isLength({ max: 20 })
      .withMessage('Registration number is too long')
      .matches(/^[A-Z0-9 -]+$/)
      .withMessage('Use letters, numbers, spaces and hyphens only'),
    body('model')
      .trim()
      .notEmpty()
      .withMessage('Model is required')
      .isLength({ max: 80 })
      .withMessage('Model is too long'),
    body('vehicleType')
      .isIn(VEHICLE_TYPES)
      .withMessage(`Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}`),
    validate,
  ],
  createVehicle
);

router.get('/vehicles/:id', [mongoIdRule, validate], getVehicle);
router.get('/vehicles/:id/qr', [mongoIdRule, validate], downloadQr);
router.delete('/vehicles/:id', [mongoIdRule, validate], deleteVehicle);

export default router;
