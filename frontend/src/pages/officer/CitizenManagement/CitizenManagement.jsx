import React from 'react';
import { Box, Typography } from '@mui/material';
import CitizenList from './CitizenList';
import { useTranslation } from 'react-i18next';

const CitizenManagement = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('officer.citizenManagement.title', 'Quản lý thông tin công dân')}
      </Typography>
      <CitizenList />
    </Box>
  );
};

export default CitizenManagement;
