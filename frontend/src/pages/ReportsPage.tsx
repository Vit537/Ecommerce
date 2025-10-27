import React from 'react';
import { Box } from '@mui/material';
import ReportGenerator from '../components/ReportGenerator';
import AppHeader from '../components/AppHeader';

export default function ReportsPage() {
  return (
    <>
      <AppHeader title="Reportes" />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ReportGenerator />
      </Box>
    </>
  );
}
