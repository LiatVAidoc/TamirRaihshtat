import api from './api';
import { validateDicomMetadata } from '../schemas/dicomSchema';

class DicomAPI {
    /**
     * Fetches DICOM metadata from S3 path
     * @param {string} s3Path - The S3 path to the DICOM file
     * @returns {Promise<Object>} - The DICOM metadata
     */
    async fetchDicomMetadata(s3Path) {
        const response = await api.post('/dicom-metadata', { s3Path });

        // Validate the response data using Zod schema
        try {
            const validatedData = validateDicomMetadata(response);
            return validatedData;
        } catch (error) {
            console.error('Validation error:', error);
            throw new Error('Invalid data format received from server');
        }
    }

    /**
     * Health check endpoint
     * @returns {Promise<Object>} - Health check response
     */
    async healthCheck() {
        return await api.get('/health');
    }
}

export default new DicomAPI();
