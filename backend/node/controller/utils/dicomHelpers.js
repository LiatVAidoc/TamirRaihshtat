import { z } from 'zod';

/**
 * Schema for validating DICOM tag configuration
 */
const dicomTagsSchema = z.record(
  z.string().min(1, 'Field name cannot be empty'),
  z.string().regex(/^x[0-9a-fA-F]{8}$/, 'Tag must be in format x00000000')
);

/**
 * DICOM tag configuration - maps field names to their DICOM tag identifiers
 */
const DICOM_TAGS = {
  PatientID: 'x00100020',
  StudyDate: 'x00080020',
  Modality: 'x00080060',
  InstitutionName: 'x00080080',
  StudyDescription: 'x00081030',
};

// Validate DICOM_TAGS configuration at module load
const validationResult = dicomTagsSchema.safeParse(DICOM_TAGS);
if (!validationResult.success) {
  throw new Error(
    `Invalid DICOM_TAGS configuration: ${JSON.stringify(validationResult.error.errors)}`
  );
}

/**
 * Safely retrieves a string value from a DICOM dataset
 * @param {Object} dataSet - The parsed DICOM dataset
 * @param {string} tag - The DICOM tag to retrieve
 * @returns {string} - The tag value or 'N/A' if not found
 */
export function getString(dataSet, tag) {
  try {
    return dataSet.string(tag) || 'N/A';
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Extracts metadata fields from a DICOM dataset
 * @param {Object} dataSet - The parsed DICOM dataset
 * @param {Object} tags - Optional tag configuration (defaults to DICOM_TAGS)
 * @returns {Object} - Object containing DICOM metadata
 */
export function extractMetadata(dataSet, tags = DICOM_TAGS) {
  const metadata = {};

  for (const [fieldName, tagId] of Object.entries(tags)) {
    metadata[fieldName] = getString(dataSet, tagId);
  }

  return metadata;
}
