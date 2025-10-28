import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AnimatedBackground } from '../../components/animation/AnimatedBackground';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ROUTES } from '../../components/routing/routes';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function Signup() {
  const { login } = useAuth();
  const { goToAuth } = useAppNavigation();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
  });
  
  const [focused, setFocused] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocus = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'user_exists') {
          setErrors({ email: 'An account with this email already exists' });
        } else {
          setErrors({ general: data.message || 'Signup failed. Please try again.' });
        }
        return;
      }

      // Success - login user and navigate to verification
      login(data.data.token, data.data.user);
      goToAuth.verifyEmail(true);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'John',
      icon: User,
      value: formData.firstName,
      error: errors.firstName,
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Doe',
      icon: User,
      value: formData.lastName,
      error: errors.lastName,
    },
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'johndoe',
      icon: UserCheck,
      value: formData.username,
      error: errors.username,
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'you@example.com',
      icon: Mail,
      value: formData.email,
      error: errors.email,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-lg px-6">
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
            Create your account to get started
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {inputFields.slice(0, 2).map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-gray-700">
                    {field.label}
                  </Label>
                  <motion.div
                    animate={{
                      scale: focused[field.id] ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative"
                  >
                    <field.icon
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                      style={focused[field.id] ? { color: "#bc3a08" } : {}}
                    />
                    <Input
                      id={field.id}
                      type={field.type}
                      value={field.value}
                      onChange={(e) => handleInputChange(field.id as keyof SignupFormData, e.target.value)}
                      onFocus={() => handleFocus(field.id)}
                      onBlur={() => handleBlur(field.id)}
                      placeholder={field.placeholder}
                      className={cn(
                        "pl-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                        focused[field.id] ? "border-[#bc3a08]" : "border-gray-300",
                        field.error ? "border-red-500" : ""
                      )}
                      required
                    />
                  </motion.div>
                  {field.error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs"
                    >
                      {field.error}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>

            {inputFields.slice(2).map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-gray-700">
                  {field.label}
                </Label>
                <motion.div
                  animate={{
                    scale: focused[field.id] ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative"
                >
                  <field.icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                    style={focused[field.id] ? { color: "#bc3a08" } : {}}
                  />
                  <Input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleInputChange(field.id as keyof SignupFormData, e.target.value)}
                    onFocus={() => handleFocus(field.id)}
                    onBlur={() => handleBlur(field.id)}
                    placeholder={field.placeholder}
                    className={cn(
                      "pl-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                      focused[field.id] ? "border-[#bc3a08]" : "border-gray-300",
                      field.error ? "border-red-500" : ""
                    )}
                    required
                  />
                </motion.div>
                {field.error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs"
                  >
                    {field.error}
                  </motion.p>
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <motion.div
                animate={{
                  scale: focused.password ? 1.02 : 1,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative"
              >
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                  style={focused.password ? { color: "#bc3a08" } : {}}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                    focused.password ? "border-[#bc3a08]" : "border-gray-300",
                    errors.password ? "border-red-500" : ""
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
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <motion.div
                animate={{
                  scale: focused.confirmPassword ? 1.02 : 1,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative"
              >
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
                  style={focused.confirmPassword ? { color: "#bc3a08" } : {}}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onFocus={() => handleFocus('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                    focused.confirmPassword ? "border-[#bc3a08]" : "border-gray-300",
                    errors.confirmPassword ? "border-red-500" : ""
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#bc3a08] to-[#d4471a] hover:from-[#a63507] hover:to-[#bc3a08] text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to={ROUTES.AUTH.LOGIN}
                  className="text-[#bc3a08] hover:text-[#a63507] font-medium transition-colors"
                >
                  Sign in
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
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}