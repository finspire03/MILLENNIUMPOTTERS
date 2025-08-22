import React from 'react';
import { motion } from 'framer-motion';
import { CURRENCIES } from '../../utils/constants';

const CurrencyAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CURRENCIES.map((currency, index) => (
        <motion.div
          key={currency.code}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: -100,
            opacity: [0, 0.3, 0.6, 0.3, 0],
            rotate: 360
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: index * 2,
            ease: 'linear'
          }}
        >
          <div className="bg-gradient-to-br from-gold-400/20 to-gold-600/20 backdrop-blur-sm rounded-lg p-4 currency-glow">
            <div className="text-2xl md:text-4xl font-bold text-gold-400">
              {currency.symbol}
            </div>
            <div className="text-xs text-gold-300 text-center mt-1">
              {currency.code}
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Floating money bills */}
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={`bill-${index}`}
          className="absolute"
          initial={{ 
            x: -100,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            rotate: -45
          }}
          animate={{
            x: window.innerWidth + 100,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.2, 0.4, 0.2, 0],
            rotate: 45
          }}
          transition={{
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            delay: index * 3,
            ease: 'linear'
          }}
        >
          <div className="w-16 h-8 bg-gradient-to-r from-emerald-400/30 to-emerald-600/30 rounded border border-emerald-400/50 backdrop-blur-sm">
            <div className="w-full h-full bg-pattern opacity-30"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CurrencyAnimation;
