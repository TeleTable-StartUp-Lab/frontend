import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'TeleTable - Login';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Elements Removed */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl shadow-2xl border border-white/10"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-md"
            >
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-dark-800/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-dark-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-200"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-dark-800/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-dark-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-dark-900 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-dark-900/50 group-hover:text-dark-900 transition-colors" />
              </span>
              Sign in
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;