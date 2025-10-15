import { Router } from 'express';
import {
  healthCheck,
  fetchDicomData
} from '../controller/dicomController.js';

export const dicomRouter = Router();

dicomRouter.get('/health',  healthCheck);
dicomRouter.post('/api/dicom-metadata', fetchDicomData);

