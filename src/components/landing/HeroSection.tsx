import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Shield, Users } from 'lucide-react';
import CurrencyAnimation from './CurrencyAnimation';
import Button from '../ui/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-bank-building bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-800/80 to-electric-900/70"></div>
      </div>

      {/* Currency Animation Overlay */}
      <CurrencyAnimation />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo & Brand */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white text-shadow-lg">
                Millennium Potter
              </h1>
              <p className="text-gold-300 text-lg font-medium">Modern Microfinance Platform</p>
            </div>
          </div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Empowering Communities Through
              <span className="block text-gold-400">Smart Financial Solutions</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              A comprehensive branch-based microfinance platform with hierarchical user management, 
              real-time operations, and powerful analytics designed for modern financial institutions.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12"
          >
            {[
              { icon: TrendingUp, title: 'Real-Time Analytics', desc: 'Live performance metrics and insights' },
              { icon: Shield, title: 'Secure Operations', desc: 'Bank-level security and compliance' },
              { icon: Users, title: 'Multi-Branch Management', desc: 'Centralized control across locations' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="glass-panel p-6 text-center"
              >
                <feature.icon className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-900 font-bold px-8 py-4"
            >
              Get Started Today
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              className="px-8 py-4"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 pt-8 border-t border-white/20"
          >
            <p className="text-gray-300 text-sm mb-4">Trusted by financial institutions across Nigeria</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {['Bank-Grade Security', 'NDIC Compliant', '99.9% Uptime', '24/7 Support'].map((badge) => (
                <span key={badge} className="text-white text-xs font-medium">{badge}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
