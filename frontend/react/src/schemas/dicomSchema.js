import { z } from 'zod';

/**
 * Schema for validating DICOM metadata response
 */
export const dicomMetadataSchema = z.object({
  PatientID: z.string().min(1, 'Patient ID is required'),
  Modality: z.string().min(1, 'Modality is required'),
  InstitutionName: z.string().min(1, 'Institution Name is required'),
  StudyDescription: z.string().min(1, 'Study Description is required'),
  StudyDate: z.string().regex(/^\d{8}$/, 'Study Date must be in YYYYMMDD format').transform((val) => {
    // Transform DICOM date format (YYYYMMDD) to Date object
    const year = val.substring(0, 4);
    const month = val.substring(4, 6);
    const day = val.substring(6, 8);
    return new Date(`${year}-${month}-${day}`);
  })
});

/**
 * Validates DICOM metadata against the schema
 * @param {Object} data - The data to validate
 * @returns {Object} - Validated and transformed data
 * @throws {Error} - If validation fails
 */
export const validateDicomMetadata = (data) => {
  return dicomMetadataSchema.parse(data);
};
