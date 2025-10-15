import fs from 'fs';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import logger from '../logger/logger.js';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let s3Client;

// Setup AWS credentials from secrets.json
try {
  const secrets = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../secrets.json'))
  );
  s3Client = new S3Client({
    region: secrets.REGION || 'us-east-2',
    credentials: {
      accessKeyId: secrets.AWS_ACCESS_KEY_ID,
      secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
      sessionToken: secrets.AWS_SESSION_TOKEN
    }
  });
} catch (error) {
  logger.error('Error loading secrets.json:', error.message);
}

export default s3Client;
