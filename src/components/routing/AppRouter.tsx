import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './RouteGuards';
import { ROUTES } from './routes';
import { useAppNavigation } from '../../hooks/useAppNavigation';

import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import EmailVerification from '../../pages/auth/EmailVerification';

import Dashboard from '../../pages/Dashboard';
import DatabaseExplorer from '../../pages/DatabaseExplorer';
import QueryConsole from '../../pages/QueryConsole';
import NotFound from '../../pages/NotFound';

const DatabaseExplorerWrapper: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>();
  const { goToApp } = useAppNavigation();

  const database = {
    id: databaseId || '1',
    name: 'Production MySQL',
    type: 'mysql',
    host: 'prod-mysql.example.com',
    port: 3306,
  };

  return (
    <DatabaseExplorer
      database={database}
      onBack={() => goToApp.dashboard(true)}
    />
  );
};

const QueryConsoleWrapper: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>();
  const { goToApp } = useAppNavigation();

  const database = {
    id: databaseId || '1',
    name: 'Production MySQL',
    type: 'mysql',
    host: 'prod-mysql.example.com',
    port: 3306,
  };

  return (
    <QueryConsole
      database={database}
      onBack={() => goToApp.databaseExplorer(database.id, true)}
    />
  );
};

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
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.DATABASE_EXPLORER}
        element={
          <ProtectedRoute requireAuth={true} requireVerification={true}>
            <DatabaseExplorerWrapper />
          </ProtectedRoute>
        }
      />
      
      <Route
        path={ROUTES.QUERY_CONSOLE}
        element={
          <ProtectedRoute requireAuth={true} requireVerification={true}>
            <QueryConsoleWrapper />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};