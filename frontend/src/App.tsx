import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import { GoogleOAuthProvider } from '@react-oauth/google';

import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BlockchainProvider } from './contexts/BlockchainContext';
import Loading from './components/common/Loaders/LoadingOverlay';

// Import routes without file extension
import AppRoutes from './routes/AppRoutes';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = "722684845941-fth90dde3mbbhdb06bgc2udqro85b083.apps.googleusercontent.com";

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
      cookiePolicy={'single_host_origin'}
    >
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <CssBaseline />
          <AuthProvider>
            <NotificationProvider>
              <BlockchainProvider>
                <BrowserRouter>
                  <Suspense fallback={<Loading />}>
                    <AppRoutes />
                  </Suspense>
                </BrowserRouter>
              </BlockchainProvider>
            </NotificationProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App; 