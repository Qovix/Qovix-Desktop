import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedBackground, Button, Input, Label } from '../../components';
import { cn } from '../../utils/utils';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ROUTES } from '../../components/routing/routes';

export default function Login() {
  const { login } = useAuth();
  const { goToApp, goToAuth, getFromState } = useAppNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'invalid_credentials') {
          setError('Invalid email or password');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
        return;
      }

      login(data.data.token, data.data.user);
      
      if (data.data.user.is_verified) {
        const from = getFromState();
        if (from) {
          goToApp.dashboard(true);
        } else {
          goToApp.dashboard(true);
        }
      } else {
        goToAuth.verifyEmail(true);
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="inline-flex items-center justify-center gap-3 mb-4"
          >
            <h1 
              className="text-4xl font-bold tracking-wide" 
              style={{ 
                color: '#bc3a08',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: '700',
                letterSpacing: '0.2em',
                textShadow: '0 2px 4px rgba(188, 58, 8, 0.2)'
              }}
            >
              Qovix
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600"
          >
            Transform natural language into powerful SQL queries
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <motion.div
                animate={{
                  scale: emailFocused ? 1.02 : 1,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative"
              >
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                  style={emailFocused ? { color: "#bc3a08" } : {}}
                />

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@example.com"
                  className={cn(
                    "pl-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                    emailFocused ? "border-[#bc3a08]" : "border-gray-300"
                  )}
                  required
                />
              </motion.div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <motion.div
                animate={{
                  scale: passwordFocused ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                  style={passwordFocused ? { color: '#bc3a08' } : {}}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                    passwordFocused ? "border-[#bc3a08]" : "border-gray-300"
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#bc3a08] to-[#d4471a] hover:from-[#a63507] hover:to-[#bc3a08] text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to Qovix?
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to={ROUTES.AUTH.SIGNUP}
                  className="text-[#bc3a08] hover:text-[#a63507] font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Powered by AI • Trusted by data professionals worldwide
        </motion.p>
      </div>
    </div>
  );
}