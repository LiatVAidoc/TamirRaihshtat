import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DicomTable from './DicomTable';

describe('DicomTable', () => {
  describe('Empty state', () => {
    test('should render empty state message when no data is provided', () => {
      render(<DicomTable metadataList={[]} />);

      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter an S3 path to fetch DICOM metadata/i)).toBeInTheDocument();
    });

    test('should render table headers', () => {
      render(<DicomTable metadataList={[]} />);

      expect(screen.getByText('Patient ID')).toBeInTheDocument();
      expect(screen.getByText('Modality')).toBeInTheDocument();
      expect(screen.getByText('Institution Name')).toBeInTheDocument();
      expect(screen.getByText('Study Date')).toBeInTheDocument();
      expect(screen.getByText('Study Description')).toBeInTheDocument();
    });
  });

  describe('With data', () => {
    test('should render metadata for a single entry', () => {
      const metadata = [
        {
          PatientID: 'TEST-123',
          Modality: 'CT',
          InstitutionName: 'Test Hospital',
          StudyDate: '20230101',
          StudyDescription: 'Chest CT'
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      expect(screen.getByText('TEST-123')).toBeInTheDocument();
      expect(screen.getByText('CT')).toBeInTheDocument();
      expect(screen.getByText('Test Hospital')).toBeInTheDocument();
      expect(screen.getByText('20230101')).toBeInTheDocument();
      expect(screen.getByText('Chest CT')).toBeInTheDocument();
    });

    test('should render metadata for multiple entries', () => {
      const metadata = [
        {
          PatientID: 'PATIENT-001',
          Modality: 'MR',
          InstitutionName: 'Hospital A',
          StudyDate: '20230115',
          StudyDescription: 'Brain MRI'
        },
        {
          PatientID: 'PATIENT-002',
          Modality: 'CT',
          InstitutionName: 'Hospital B',
          StudyDate: '20230220',
          StudyDescription: 'Chest CT'
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      expect(screen.getByText('PATIENT-001')).toBeInTheDocument();
      expect(screen.getByText('PATIENT-002')).toBeInTheDocument();
      expect(screen.getByText('MR')).toBeInTheDocument();
      expect(screen.getByText('CT')).toBeInTheDocument();
      expect(screen.getByText('Hospital A')).toBeInTheDocument();
      expect(screen.getByText('Hospital B')).toBeInTheDocument();
    });

    test('should display dash for missing fields', () => {
      const metadata = [
        {
          PatientID: 'TEST-123',
          // Missing other fields
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      expect(screen.getByText('TEST-123')).toBeInTheDocument();
      // Should render multiple dashes for missing fields
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    test('should handle null values gracefully', () => {
      const metadata = [
        {
          PatientID: null,
          Modality: null,
          InstitutionName: null,
          StudyDate: null,
          StudyDescription: null
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      const dashes = screen.getAllByText('-');
      expect(dashes).toHaveLength(5); // All 5 fields should show dashes
    });

    test('should format Date objects correctly', () => {
      const metadata = [
        {
          PatientID: 'TEST-123',
          Modality: 'CT',
          InstitutionName: 'Test Hospital',
          StudyDate: new Date('2023-01-15'),
          StudyDescription: 'Test Study'
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      // Date should be formatted as MM/DD/YYYY
      expect(screen.getByText(/01\/15\/2023/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty metadata object', () => {
      const metadata = [{}];

      render(<DicomTable metadataList={metadata} />);

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    test('should render correctly with mixed complete and incomplete data', () => {
      const metadata = [
        {
          PatientID: 'COMPLETE-001',
          Modality: 'MR',
          InstitutionName: 'Hospital A',
          StudyDate: '20230101',
          StudyDescription: 'Complete Study'
        },
        {
          PatientID: 'PARTIAL-002',
          Modality: 'CT'
          // Missing other fields
        }
      ];

      render(<DicomTable metadataList={metadata} />);

      expect(screen.getByText('COMPLETE-001')).toBeInTheDocument();
      expect(screen.getByText('PARTIAL-002')).toBeInTheDocument();
      expect(screen.getByText('Complete Study')).toBeInTheDocument();
    });
  });
});
