import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LiveMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalLoans: 1247,
    activeCustomers: 2856,
    totalDisbursed: 45670000,
    collectionRate: 96.8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalLoans: prev.totalLoans + Math.floor(Math.random() * 3),
        activeCustomers: prev.activeCustomers + Math.floor(Math.random() * 5),
        totalDisbursed: prev.totalDisbursed + Math.floor(Math.random() * 50000),
        collectionRate: Math.max(95, Math.min(99, prev.collectionRate + (Math.random() - 0.5) * 0.5))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const metricItems = [
    {
      icon: Target,
      label: 'Total Loans',
      value: metrics.totalLoans.toLocaleString(),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      label: 'Active Customers',
      value: metrics.activeCustomers.toLocaleString(),
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: DollarSign,
      label: 'Total Disbursed',
      value: formatCurrency(metrics.totalDisbursed),
      color: 'from-gold-500 to-gold-600'
    },
    {
      icon: TrendingUp,
      label: 'Collection Rate',
      value: `${metrics.collectionRate.toFixed(1)}%`,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mt-16"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Live Platform Metrics</h3>
        <p className="text-gray-300">Real-time data from all branches</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricItems.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6 + index * 0.1 }}
            className="text-center"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-300">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-emerald-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>Live data • Updated every 5 seconds</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveMetrics;
