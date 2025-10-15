import React, { useState } from 'react';
import S3PathForm from '../S3PathForm/S3PathForm';
import DicomTable from '../DicomTable/DicomTable';
import dicomApi from '../../services/dicomApi';

const DicomViewer = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metadataList, setMetadataList] = useState([]);

    const handleSubmit = async (s3Path) => {
        setLoading(true);
        setError(null);

        try {
            const data = await dicomApi.fetchDicomMetadata(s3Path);
            // Append new data to the existing list
            setMetadataList(prevList => [...prevList, data]);
        } catch (err) {
            setError(
                err.response?.data?.error || err.message || 'Failed to fetch DICOM metadata'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="App-error">
                    {error}
                </div>
            )}
            <S3PathForm onSubmit={handleSubmit} loading={loading} />
            <DicomTable metadataList={metadataList} />
        </>
    );
};

export default DicomViewer;
