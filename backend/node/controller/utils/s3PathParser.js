/**
 * Parses an S3 path into bucket and key components
 * @param {string} s3Path - Path to the file in S3 (bucket-name/path/to/file.dcm)
 * @returns {{bucket: string, key: string}} - Object containing bucket and key
 * @throws {Error} - If the S3 path format is invalid
 */
export function parseS3Path(s3Path) {
  const firstSlashIndex = s3Path.indexOf('/');

  if (firstSlashIndex === -1) {
    throw new Error(
      'Invalid S3 path format. Expected format: bucket-name/path/to/file.dcm'
    );
  }

  const bucket = s3Path.substring(0, firstSlashIndex);
  const key = s3Path.substring(firstSlashIndex + 1);

  return { bucket, key };
}
