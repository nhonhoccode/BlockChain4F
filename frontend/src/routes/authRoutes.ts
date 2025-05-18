import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';

// Direct imports instead of lazy loading
import LoginPage from '../pages/auth/Login/LoginPage';
import RegisterPage from '../pages/auth/Register/RegisterPage';
import OfficerRegisterPage from '../pages/auth/OfficerRegister/OfficerRegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPassword/ResetPasswordPage';
import GoogleCallbackPage from '../pages/auth/GoogleCallback/GoogleCallback.jsx';

// Interface for route objects
export interface AuthRouteObject extends RouteObject {
  children?: AuthRouteObject[];
}

// Routes configuration for authentication pages
const authRoutes: AuthRouteObject[] = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'officer-register', element: <OfficerRegisterPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'google/callback', element: <GoogleCallbackPage /> },
    ],
  },
];

export default authRoutes; 