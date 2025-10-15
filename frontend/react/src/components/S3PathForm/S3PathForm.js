import React, { useState } from 'react';
import './S3PathForm.css';

const S3PathForm = ({ onSubmit, loading }) => {
  const [s3Path, setS3Path] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(s3Path);
  };

  return (
    <form onSubmit={handleSubmit} className="s3-path-form">
      <input
        type="text"
        placeholder="bucket-name/path/to/file.dcm"
        value={s3Path}
        onChange={(e) => setS3Path(e.target.value)}
        disabled={loading}
        required
        className="s3-path-input"
      />
      <button
        type="submit"
        disabled={loading || !s3Path}
        className="s3-path-submit-button"
      >
        {loading ? 'Loading...' : 'Fetch Metadata'}
      </button>
    </form>
  );
};

export default S3PathForm;
