import React from 'react';
import OfficerManagement from './OfficerManagement.js';

/**
 * OfficersList Component - Wrapper for OfficerManagement component
 */
const OfficersList = () => {
  return (
    <OfficerManagement 
      onEdit={() => console.log('Edit officer')} 
      onDelete={() => console.log('Delete officer')} 
      onView={() => console.log('View officer')} 
      onRefresh={() => console.log('Refresh officers')}
    />
  );
};

export default OfficersList; 