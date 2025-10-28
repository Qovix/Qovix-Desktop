import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../components/routing/routes';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string, options?: { replace?: boolean; state?: any }) => {
    navigate(path, {
      replace: options?.replace || false,
      state: options?.state,
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  const goToAuth = {
    login: (replace = false) => goTo(ROUTES.AUTH.LOGIN, { replace }),
    signup: (replace = false) => goTo(ROUTES.AUTH.SIGNUP, { replace }),
    verifyEmail: (replace = false) => goTo(ROUTES.AUTH.VERIFY_EMAIL, { replace }),
  };

  const goToApp = {
    dashboard: (replace = false) => goTo(ROUTES.DASHBOARD, { replace }),
    databaseExplorer: (databaseId: string, replace = false) => 
      goTo(ROUTES.DATABASE_EXPLORER.replace(':databaseId', databaseId), { replace }),
    queryConsole: (databaseId: string, replace = false) => 
      goTo(ROUTES.QUERY_CONSOLE.replace(':databaseId', databaseId), { replace }),
    profile: (replace = false) => goTo(ROUTES.PROFILE, { replace }),
    settings: (replace = false) => goTo(ROUTES.SETTINGS, { replace }),
  };

  const isCurrentRoute = (path: string) => location.pathname === path;

  const isAuthRoute = () => location.pathname.startsWith('/auth');

  const getCurrentRoute = () => location.pathname;

  const getFromState = () => location.state?.from;

  return {
    goTo,
    goBack,
    goToAuth,
    goToApp,
    isCurrentRoute,
    isAuthRoute,
    getCurrentRoute,
    getFromState,
    location,
  };
};