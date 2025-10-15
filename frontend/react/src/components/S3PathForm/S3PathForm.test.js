import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import S3PathForm from './S3PathForm';

describe('S3PathForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render form with input and button', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('should have required attribute on input', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      expect(input).toBeRequired();
    });

    test('should initially disable submit button when input is empty', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const button = screen.getByRole('button', { name: /Fetch Metadata/i });
      expect(button).toBeDisabled();
    });
  });

  describe('User interaction', () => {
    test('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      await user.type(input, 'test-bucket/file.dcm');

      expect(input).toHaveValue('test-bucket/file.dcm');
    });

    test('should enable submit button when input has value', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      await user.type(input, 'test-bucket/file.dcm');

      expect(button).not.toBeDisabled();
    });

    test('should call onSubmit with correct path when form is submitted', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      await user.type(input, 'my-bucket/path/to/file.dcm');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith('my-bucket/path/to/file.dcm');
    });

    test('should submit form when pressing Enter', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');

      await user.type(input, 'test-bucket/file.dcm{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith('test-bucket/file.dcm');
    });

    test('should handle form submission without page reload', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const form = screen.getByRole('button', { name: /Fetch Metadata/i }).closest('form');

      await user.type(input, 'test-bucket/file.dcm');

      // Submit the form
      fireEvent.submit(form);

      // Verify onSubmit was called (which means preventDefault worked)
      expect(mockOnSubmit).toHaveBeenCalledWith('test-bucket/file.dcm');
    });
  });

  describe('Loading state', () => {
    test('should show loading text when loading is true', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={true} />);

      const button = screen.getByRole('button', { name: /Loading.../i });
      expect(button).toBeInTheDocument();
    });

    test('should disable input when loading is true', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={true} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      expect(input).toBeDisabled();
    });

    test('should disable button when loading is true', () => {
      render(<S3PathForm onSubmit={mockOnSubmit} loading={true} />);

      const button = screen.getByRole('button', { name: /Loading.../i });
      expect(button).toBeDisabled();
    });

    test('should not call onSubmit when loading is true', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={true} />);

      const button = screen.getByRole('button', { name: /Loading.../i });

      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('should transition between loading states correctly', () => {
      const { rerender } = render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      expect(screen.getByRole('button', { name: /Fetch Metadata/i })).toBeInTheDocument();

      rerender(<S3PathForm onSubmit={mockOnSubmit} loading={true} />);

      expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();

      rerender(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      expect(screen.getByRole('button', { name: /Fetch Metadata/i })).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string input', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      await user.type(input, 'test');
      await user.clear(input);

      expect(button).toBeDisabled();
    });

    test('should handle special characters in path', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      const specialPath = 'bucket-123/path_with-special.chars/file.dcm';
      await user.type(input, specialPath);
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledWith(specialPath);
    });

    test('should maintain input value after submission', async () => {
      const user = userEvent.setup();
      render(<S3PathForm onSubmit={mockOnSubmit} loading={false} />);

      const input = screen.getByPlaceholderText('bucket-name/path/to/file.dcm');
      const button = screen.getByRole('button', { name: /Fetch Metadata/i });

      await user.type(input, 'test-bucket/file.dcm');
      await user.click(button);

      expect(input).toHaveValue('test-bucket/file.dcm');
    });
  });
});
