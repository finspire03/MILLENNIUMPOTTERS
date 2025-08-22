import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'metric';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  onClick 
}) => {
  const variants = {
    default: 'bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300',
    glass: 'glass-card',
    metric: 'metric-card'
  };

  return (
    <div 
      className={cn(
        variants[variant], 
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
