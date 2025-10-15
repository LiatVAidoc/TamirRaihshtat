import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock functions
const mockS3Send = jest.fn();
const mockStreamToBuffer = jest.fn();
const mockParseDicom = jest.fn();
const mockExtractMetadata = jest.fn();
const mockParseS3Path = jest.fn();

// Mock S3 client
await jest.unstable_mockModule('../data/s3Client.js', () => ({
  default: {
    send: mockS3Send
  }
}));

// Mock AWS SDK
await jest.unstable_mockModule('@aws-sdk/client-s3', () => ({
  GetObjectCommand: jest.fn().mockImplementation((params) => params)
}));

// Mock dicom-parser
await jest.unstable_mockModule('dicom-parser', () => ({
  default: {
    parseDicom: mockParseDicom
  }
}));

// Mock utility modules
await jest.unstable_mockModule('../controller/utils/streamToBuffer.js', () => ({
  streamToBuffer: mockStreamToBuffer
}));

await jest.unstable_mockModule('../controller/utils/dicomHelpers.js', () => ({
  extractMetadata: mockExtractMetadata
}));

await jest.unstable_mockModule('../controller/utils/s3PathParser.js', () => ({
  parseS3Path: mockParseS3Path
}));

const { downloadDicomFile, parseDicomFile } = await import(
  '../controller/utils/dicom-downloader.js'
);

describe('DICOM Downloader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadDicomFile', () => {
    test('should successfully download and parse DICOM file', async () => {
      const mockMetadata = {
        PatientID: 'TEST-123',
        StudyDate: '20230101',
        Modality: 'CT',
        InstitutionName: 'Test Hospital',
        StudyDescription: 'Test Study'
      };

      mockParseS3Path.mockReturnValue({
        bucket: 'test-bucket',
        key: 'path/to/file.dcm'
      });

      mockS3Send.mockResolvedValue({
        Body: 'mock-stream'
      });

      mockStreamToBuffer.mockResolvedValue(Buffer.from('mock-dicom-data'));

      const mockDataSet = {
        string: jest.fn()
      };
      mockParseDicom.mockReturnValue(mockDataSet);
      mockExtractMetadata.mockReturnValue(mockMetadata);

      const result = await downloadDicomFile('test-bucket/path/to/file.dcm');

      expect(mockParseS3Path).toHaveBeenCalledWith('test-bucket/path/to/file.dcm');
      expect(mockS3Send).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'path/to/file.dcm'
      });
      expect(mockStreamToBuffer).toHaveBeenCalledWith('mock-stream');
      expect(mockParseDicom).toHaveBeenCalled();
      expect(mockExtractMetadata).toHaveBeenCalledWith(mockDataSet);
      expect(result).toEqual(mockMetadata);
    });

    test('should handle S3 download errors', async () => {
      mockParseS3Path.mockReturnValue({
        bucket: 'test-bucket',
        key: 'path/to/file.dcm'
      });

      const error = new Error('S3 download failed');
      mockS3Send.mockRejectedValue(error);

      await expect(
        downloadDicomFile('test-bucket/path/to/file.dcm')
      ).rejects.toThrow('S3 download failed');
    });

    test('should handle parsing errors', async () => {
      mockParseS3Path.mockReturnValue({
        bucket: 'test-bucket',
        key: 'path/to/file.dcm'
      });

      mockS3Send.mockResolvedValue({
        Body: 'mock-stream'
      });

      mockStreamToBuffer.mockResolvedValue(Buffer.from('mock-dicom-data'));

      const error = new Error('Invalid DICOM format');
      mockParseDicom.mockImplementation(() => {
        throw error;
      });

      await expect(
        downloadDicomFile('test-bucket/path/to/file.dcm')
      ).rejects.toThrow('Invalid DICOM format');
    });
  });

  describe('parseDicomFile', () => {
    test('should parse DICOM buffer and extract metadata', () => {
      const mockBuffer = Buffer.from('mock-dicom-data');
      const mockDataSet = {
        string: jest.fn()
      };
      const mockMetadata = {
        PatientID: 'TEST-123',
        StudyDate: '20230101'
      };

      mockParseDicom.mockReturnValue(mockDataSet);
      mockExtractMetadata.mockReturnValue(mockMetadata);

      const result = parseDicomFile(mockBuffer);

      expect(mockParseDicom).toHaveBeenCalled();
      expect(mockExtractMetadata).toHaveBeenCalledWith(mockDataSet);
      expect(result).toEqual(mockMetadata);
    });

    test('should handle parsing errors', () => {
      const mockBuffer = Buffer.from('invalid-data');
      const error = new Error('Parse error');

      mockParseDicom.mockImplementation(() => {
        throw error;
      });

      expect(() => parseDicomFile(mockBuffer)).toThrow('Parse error');
    });
  });
});
