import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

const EmailVerification: React.FC = () => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes to detect email verification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify-email`
          }
        });
        setResent(true);
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResending(false);
    }
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
          </div>

          {/* Email Verification Card */}
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>

            <p className="text-gray-600 mb-6">
              We've sent a verification link to your email address. Please click the link to verify your account and complete the registration process.
            </p>

            <div className="space-y-4">
              {resent ? (
                <div className="flex items-center justify-center space-x-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Verification email sent!</span>
                </div>
              ) : (
                <Button
                  onClick={handleResendEmail}
                  loading={resending}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              )}

              <Button
                onClick={() => navigate('/auth/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> Check your spam folder if you don't see the email in your inbox.
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

export default EmailVerification;
