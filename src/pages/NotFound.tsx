import { Link } from 'react-router-dom';
import { ROUTES } from '../components/routing/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-[#bc3a08]">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#bc3a08] to-[#d4471a] hover:from-[#a63507] hover:to-[#bc3a08] text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </Link>
          
          <div>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="text-[#bc3a08] hover:text-[#a63507] font-medium transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}