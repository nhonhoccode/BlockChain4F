import React from 'react';
import { Helmet } from 'react-helmet-async';
import OfficerDashboard from './OfficerDashboard';
import { Box } from '@mui/material';

/**
 * OfficerDashboardPage Component - Container for the officer dashboard
 * Wraps the OfficerDashboard component with page metadata
 */
const OfficerDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Bảng điều khiển cán bộ | Hệ thống quản lý hành chính</title>
        <meta name="description" content="Bảng điều khiển dành cho cán bộ xã trong hệ thống quản lý hành chính" />
      </Helmet>
      
      <Box sx={{ width: '100%' }}>
        <OfficerDashboard />
      </Box>
    </>
  );
};

export default OfficerDashboardPage; 