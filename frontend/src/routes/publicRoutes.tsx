import React from 'react';
import { Outlet } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';

// Direct imports instead of lazy loading
import HomePage from '../pages/public/Home/HomePage';
import AboutPage from '../pages/public/About/AboutPage';
import ContactPage from '../pages/public/Contact/ContactPage';
import DocumentVerifyPage from '../pages/public/DocumentVerify/DocumentVerifyPage';
import { PublicProceduresPage, ProcedureDetailPage } from '../pages/public/Procedures';

// Interface for route objects
export interface PublicRouteObject extends RouteObject {
  children?: PublicRouteObject[];
}

// Routes configuration for public pages
const publicRoutes: PublicRouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'document-verify', element: <DocumentVerifyPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'procedures', element: <PublicProceduresPage /> },
      { path: 'procedures/:procedureId', element: <ProcedureDetailPage /> },
    ],
  },
];

export default publicRoutes; 