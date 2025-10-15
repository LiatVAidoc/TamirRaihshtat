import { Router } from 'express';
import { dicomRouter } from './dicomRouter.js';

const router = Router();
router.use(dicomRouter);

export default router;
