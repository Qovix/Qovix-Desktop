import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './RouteGuards';
import { ROUTES } from './routes';
import { TabProvider } from '../../context/TabContext';

import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import EmailVerification from '../../pages/auth/EmailVerification';
import AppLayout from '../layout/AppLayout';
import NotFound from '../../pages/NotFound';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
      
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      
      <Route
        path={ROUTES.AUTH.SIGNUP}
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      
      <Route
        path={ROUTES.AUTH.VERIFY_EMAIL}
        element={
          <ProtectedRoute requireAuth={true} requireVerification={false}>
            <EmailVerification />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute requireAuth={true} requireVerification={true}>
            <TabProvider>
              <AppLayout />
            </TabProvider>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};