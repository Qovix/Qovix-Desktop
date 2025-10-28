import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail } from 'lucide-react';
import { AnimatedBackground, Button, Input, Label } from '../../components';
import { cn } from '../../utils/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 h-12 border border-gray-300 rounded-md bg-white transition-all duration-300 outline-none",
                    passwordFocused ? "border-[#bc3a08]" : "border-gray-300"
                  )}
                  required
                />
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 text-white relative overflow-hidden group"
                style={{ backgroundColor: '#bc3a08' }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative">Sign In</span>
              </Button>
            </motion.div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium text-sm">Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all"
              >
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  alt="GitHub"
                  className="w-5 h-5"
                />
                <span className="text-gray-700 font-medium text-sm">GitHub</span>
              </motion.button>
            </div>

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
              <a
                href="#"
                className="hover:underline inline-flex items-center gap-1"
                style={{ color: '#bc3a08' }}
              >
                Create an account
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </a>
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