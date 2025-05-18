import React from 'react';
import { useRoutes } from 'react-router-dom';

// Import route definitions
import publicRoutes from './publicRoutes';
import authRoutes from './authRoutes';
import citizenRoutes from './citizenRoutes';
import officerRoutes from './officerRoutes';
import chairmanRoutes from './chairmanRoutes';

const AppRoutes: React.FC = () => {
  // Combine all routes
  const combinedRoutes = [
    ...publicRoutes,
    ...authRoutes,
    ...citizenRoutes,
    ...officerRoutes,
    ...chairmanRoutes
  ];
  
  // Use React Router's useRoutes hook to create the routing
  const routing = useRoutes(combinedRoutes);
  
  return routing;
};

export default AppRoutes; 