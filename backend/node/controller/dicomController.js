import { downloadDicomFile } from './utils/dicom-downloader.js';
import { z } from 'zod';
import logger from '../logger/logger.js';

const s3PathSchema = z.object({
  s3Path: z
    .string()
    .min(1, 'S3 path is required')
    .regex(/\//, 'S3 path must contain a slash (bucket/key format)')
    .regex(/\.dcm$/i, 'S3 path must end with .dcm extension')
});

export const healthCheck = (req, res, next) => {
  res.json({ message: 'The server is running' });
};

export const fetchDicomData = async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = s3PathSchema.safeParse(req.body);

    if (!validationResult.success) {
      const details = validationResult.error?.errors
        ? validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        : [{ field: 's3Path', message: 'Validation failed' }];

      return res.status(400).json({
        error: 'Validation failed',
        details
      });
    }

    const { s3Path } = validationResult.data;

    const metadata = await downloadDicomFile(s3Path);
    res.json(metadata);
  } catch (error) {
    logger.error('Error fetching DICOM data:', error);
    res.status(500).json({
      error: 'Failed to fetch DICOM metadata',
      message: error.message
    });
  }
};
