import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock the dependencies before importing the controller
const mockDownloadDicomFile = jest.fn();
const mockLoggerError = jest.fn();

// Use unstable_mockModule for ES modules
await jest.unstable_mockModule('../controller/utils/dicom-downloader.js', () => ({
  downloadDicomFile: mockDownloadDicomFile
}));

await jest.unstable_mockModule('../logger/logger.js', () => ({
  default: {
    error: mockLoggerError
  }
}));

const { healthCheck, fetchDicomData } = await import('../controller/dicomController.js');

describe('DicomController', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request, response, and next
    req = {
      body: {}
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('healthCheck', () => {
    test('should return success message', () => {
      healthCheck(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'The server is running'
      });
    });
  });

  describe('fetchDicomData', () => {
    test('should successfully fetch DICOM metadata', async () => {
      const mockMetadata = {
        PatientID: 'TEST-123',
        StudyDate: '20230101',
        Modality: 'CT',
        InstitutionName: 'Test Hospital',
        StudyDescription: 'Test Study'
      };

      req.body = {
        s3Path: 'test-bucket/path/to/file.dcm'
      };

      mockDownloadDicomFile.mockResolvedValue(mockMetadata);

      await fetchDicomData(req, res, next);

      expect(mockDownloadDicomFile).toHaveBeenCalledWith('test-bucket/path/to/file.dcm');
      expect(res.json).toHaveBeenCalledWith(mockMetadata);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when s3Path is missing', async () => {
      req.body = {};

      await fetchDicomData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
      expect(mockDownloadDicomFile).not.toHaveBeenCalled();
    });

    test('should return 400 when s3Path is empty string', async () => {
      req.body = {
        s3Path: ''
      };

      await fetchDicomData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
      expect(mockDownloadDicomFile).not.toHaveBeenCalled();
    });

    test('should return 400 when s3Path does not contain slash', async () => {
      req.body = {
        s3Path: 'invalid-path.dcm'
      };

      await fetchDicomData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
      expect(mockDownloadDicomFile).not.toHaveBeenCalled();
    });

    test('should return 400 when s3Path does not end with .dcm', async () => {
      req.body = {
        s3Path: 'bucket/path/to/file.txt'
      };

      await fetchDicomData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          details: expect.any(Array)
        })
      );
      expect(mockDownloadDicomFile).not.toHaveBeenCalled();
    });

    test('should accept s3Path with .DCM extension (case insensitive)', async () => {
      const mockMetadata = {
        PatientID: 'TEST-123'
      };

      req.body = {
        s3Path: 'bucket/path/to/file.DCM'
      };

      mockDownloadDicomFile.mockResolvedValue(mockMetadata);

      await fetchDicomData(req, res, next);

      expect(mockDownloadDicomFile).toHaveBeenCalledWith('bucket/path/to/file.DCM');
      expect(res.json).toHaveBeenCalledWith(mockMetadata);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 when downloadDicomFile throws error', async () => {
      req.body = {
        s3Path: 'bucket/path/to/file.dcm'
      };

      const error = new Error('S3 download failed');
      mockDownloadDicomFile.mockRejectedValue(error);

      await fetchDicomData(req, res, next);

      expect(mockLoggerError).toHaveBeenCalledWith('Error fetching DICOM data:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch DICOM metadata',
        message: 'S3 download failed'
      });
    });

    test('should handle errors without message property', async () => {
      req.body = {
        s3Path: 'bucket/path/to/file.dcm'
      };

      const error = { code: 'UNKNOWN_ERROR' };
      mockDownloadDicomFile.mockRejectedValue(error);

      await fetchDicomData(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch DICOM metadata',
        message: undefined
      });
    });
  });
});
