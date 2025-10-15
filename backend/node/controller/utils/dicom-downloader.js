import { GetObjectCommand } from '@aws-sdk/client-s3';
import dicomParser from 'dicom-parser';
import s3Client from '../../data/s3Client.js';
import { parseS3Path } from './s3PathParser.js';
import { streamToBuffer } from './streamToBuffer.js';
import { extractMetadata } from './dicomHelpers.js';

/**
 * Downloads a DICOM file from S3 and extracts its metadata
 * @param {string} s3Path - Path to the DICOM file in S3 (bucket-name/path/to/file.dcm)
 * @returns {Object} - Object containing the DICOM metadata
 */
async function downloadDicomFile(s3Path) {
  if (!s3Client) {
    throw new Error(
      'S3 client not initialized. Check secrets.json configuration.'
    );
  }

  const { bucket, key } = parseS3Path(s3Path);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const response = await s3Client.send(command);

  // Convert stream to buffer
  const buffer = await streamToBuffer(response.Body);

  // Parse the DICOM file
  const metadata = parseDicomFile(buffer);

  return metadata;
}

/**
 * Parses DICOM file and extracts metadata
 * @param {Buffer} buffer - Buffer containing DICOM file data
 * @returns {Object} - Object containing DICOM metadata
 */
function parseDicomFile(buffer) {
  // Parse the DICOM file
  const byteArray = new Uint8Array(buffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  // Extract metadata fields
  return extractMetadata(dataSet);
}

export { downloadDicomFile, parseDicomFile };
