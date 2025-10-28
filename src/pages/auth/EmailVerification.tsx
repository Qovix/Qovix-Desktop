import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/utils';
import { Button } from '../../components/ui/button';
import { AnimatedBackground } from '../../components/animation/AnimatedBackground';
import { useAuth } from '../../context/AuthContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export default function EmailVerification() {
  const { user, token, updateUser } = useAuth();
  const { goToAuth, goToApp } = useAppNavigation();

  useEffect(() => {
    if (!user || !token) {
      goToAuth.login(true);
    }
  }, [user, token, goToAuth]);

  useEffect(() => {
    if (user?.is_verified) {
      goToApp.dashboard(true);
    }
  }, [user, goToApp]);

  if (!user || !token) {
    return null;
  }
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTimeLeft(15 * 60); 
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && !isLoading) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i] || '';
    }
    
    setCode(newCode);
    setError('');

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
          code: codeToVerify,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'invalid_code') {
          setError('Invalid verification code. Please try again.');
        } else if (data.error === 'code_expired') {
          setError('Verification code has expired. Please request a new one.');
        } else if (data.error === 'already_verified') {
          setError('Email is already verified.');
          setTimeout(() => goToApp.dashboard(true), 2000);
        } else {
          setError(data.message || 'Verification failed. Please try again.');
        }
        
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      const updatedUser = { ...user, is_verified: true };
      updateUser(updatedUser);
      setSuccess(true);
      setTimeout(() => {
        goToApp.dashboard(true);
      }, 2000);

    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please check your connection and try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'already_verified') {
          setError('Email is already verified.');
        } else {
          setError(data.message || 'Failed to resend code. Please try again.');
        }
        return;
      }

      setTimeLeft(15 * 60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center">
        <AnimatedBackground />
        
        <div className="relative z-10 w-full max-w-md px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                Email Verified!
              </h1>
              <p className="text-gray-600">
                Your email has been successfully verified. Redirecting you to the dashboard...
              </p>
            </motion.div>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.6 }}
              className="w-full h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <div className="h-full bg-gradient-to-r from-[#bc3a08] to-[#d4471a] rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8"
        >
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <Mail className="w-8 h-8 text-[#bc3a08]" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verify Your Email
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit verification code to
                </p>
                <p className="font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-bold border-2 rounded-lg transition-all duration-300 outline-none",
                      digit 
                        ? "border-[#bc3a08] bg-orange-50 text-[#bc3a08]" 
                        : "border-gray-300 bg-white focus:border-[#bc3a08]",
                      error && "border-red-500"
                    )}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="text-center space-y-3">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in {formatTime(timeLeft)}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Verification code has expired
                  </p>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleResendCode}
                    disabled={isResending || timeLeft > 14 * 60}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      timeLeft > 14 * 60 
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#bc3a08] hover:text-[#a63507] cursor-pointer"
                    )}
                  >
                    <RotateCcw className={cn("w-4 h-4", isResending && "animate-spin")} />
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => handleVerify()}
                disabled={isLoading || code.some(digit => !digit)}
                className="w-full h-12 bg-gradient-to-r from-[#bc3a08] to-[#d4471a] hover:from-[#a63507] hover:to-[#bc3a08] text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </motion.div>

            <div className="text-center">
              <button
                onClick={() => goToAuth.signup()}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to signup
              </button>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          Didn't receive the code? Check your spam folder or request a new one
        </motion.p>
      </div>
    </div>
  );
}