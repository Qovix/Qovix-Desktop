export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  DASHBOARD: '/dashboard',
  DATABASE_EXPLORER: '/database/:databaseId',
  QUERY_CONSOLE: '/database/:databaseId/console',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  HOME: '/',
  NOT_FOUND: '/404',
} as const;

export interface RouteConfig {
  path: string;
  requireAuth: boolean;
  requireVerification: boolean;
  title: string;
  description?: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  [ROUTES.AUTH.LOGIN]: {
    path: ROUTES.AUTH.LOGIN,
    requireAuth: false,
    requireVerification: false,
    title: 'Login - Qovix',
    description: 'Sign in to your Qovix account',
  },
  [ROUTES.AUTH.SIGNUP]: {
    path: ROUTES.AUTH.SIGNUP,
    requireAuth: false,
    requireVerification: false,
    title: 'Sign Up - Qovix',
    description: 'Create your Qovix account',
  },
  [ROUTES.AUTH.VERIFY_EMAIL]: {
    path: ROUTES.AUTH.VERIFY_EMAIL,
    requireAuth: true,
    requireVerification: false,
    title: 'Verify Email - Qovix',
    description: 'Verify your email address',
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    requireAuth: true,
    requireVerification: true,
    title: 'Dashboard - Qovix',
    description: 'Your Qovix dashboard',
  },
  [ROUTES.DATABASE_EXPLORER]: {
    path: ROUTES.DATABASE_EXPLORER,
    requireAuth: true,
    requireVerification: true,
    title: 'Database Explorer - Qovix',
    description: 'Explore your database',
  },
  [ROUTES.QUERY_CONSOLE]: {
    path: ROUTES.QUERY_CONSOLE,
    requireAuth: true,
    requireVerification: true,
    title: 'Query Console - Qovix',
    description: 'Execute SQL queries',
  },
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    requireAuth: true,
    requireVerification: true,
    title: 'Profile - Qovix',
    description: 'Manage your profile',
  },
  [ROUTES.SETTINGS]: {
    path: ROUTES.SETTINGS,
    requireAuth: true,
    requireVerification: true,
    title: 'Settings - Qovix',
    description: 'Application settings',
  },
};

export type RouteKey = keyof typeof ROUTES.AUTH | keyof typeof ROUTES;
export type AuthRouteKey = keyof typeof ROUTES.AUTH;