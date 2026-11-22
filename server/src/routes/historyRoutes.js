import { Router } from 'express';
import { getHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/history', getHistory);

export default router;
