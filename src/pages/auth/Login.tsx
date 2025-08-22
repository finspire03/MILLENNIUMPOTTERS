import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Building2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.tsx';
import Button from '../../components/ui/Button';
import { BRANCHES } from '../../utils/constants';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedBranchId = location.state?.branchId || localStorage.getItem('selectedBranch');
  const selectedBranch = BRANCHES.find(b => b.id === selectedBranchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailNotConfirmed(false);

    try {
      await signIn(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      // Check for the specific custom error message from the service
      if (err.message.includes('email address has not been confirmed')) {
        setEmailNotConfirmed(true);
      }
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-bank-building bg-cover bg-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-800/80 to-electric-900/70"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Millennium Potter</h1>
            </div>
            <h2 className="text-xl text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to your account</p>
          </div>

          {/* Branch Info */}
          {selectedBranch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-4 mb-6 text-center"
            >
              <p className="text-white text-sm">
                Signing in to <span className="font-semibold text-gold-400">{selectedBranch.name}</span>
              </p>
            </motion.div>
          )}

          {/* Login Form */}
          <div className="glass-card p-8">
            {error && (
              <div className={`rounded-lg p-4 mb-6 flex items-start space-x-3 ${
                emailNotConfirmed 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  emailNotConfirmed ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <p className={`text-sm ${
                  emailNotConfirmed ? 'text-yellow-700' : 'text-red-600'
                }`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-electric-600 focus:ring-electric-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-electric-600 hover:text-electric-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-electric-600 to-electric-700 hover:from-electric-700 hover:to-electric-800"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="text-electric-600 hover:text-electric-700 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white text-sm transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
