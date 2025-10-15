import React from 'react';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import './DicomTable.css';

const TableHeadStyle = {backgroundColor: '#61dafb'};
const TableHeadCellStyle = {fontWeight: 'bold', color: '#282c34'};

const formatDate = (date) => {
    if (!date) return '-';
    if (date instanceof Date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    return date;
};

const DicomTable = ({metadataList}) =>
    (
        <Box className="dicom-table-container">
            <TableContainer component={Paper} elevation={3} sx={{height: 350, maxHeight: 350}}>
                <Table stickyHeader>
                    <TableHead sx={TableHeadStyle}>
                        <TableRow>
                            <TableCell sx={TableHeadCellStyle}>Patient ID</TableCell>
                            <TableCell sx={TableHeadCellStyle}>Modality</TableCell>
                            <TableCell sx={TableHeadCellStyle}>Institution Name</TableCell>
                            <TableCell sx={TableHeadCellStyle}>Study Date</TableCell>
                            <TableCell sx={TableHeadCellStyle}>Study Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metadataList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{color: '#999', fontStyle: 'italic'}}>
                                    No data available. Enter an S3 path to fetch DICOM metadata.
                                </TableCell>
                            </TableRow>
                        ) : (
                            metadataList.map((metadata, index) => (
                                <TableRow hover key={index}>
                                    <TableCell>{metadata?.PatientID || '-'}</TableCell>
                                    <TableCell>{metadata?.Modality || '-'}</TableCell>
                                    <TableCell>{metadata?.InstitutionName || '-'}</TableCell>
                                    <TableCell>{formatDate(metadata?.StudyDate)}</TableCell>
                                    <TableCell>{metadata?.StudyDescription || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );


export default DicomTable;
