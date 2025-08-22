import React from 'react';
import { cn } from '../../utils/helpers';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

const Input: React.FC<InputProps> = ({ icon: Icon, className, ...props }) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      )}
      <input
        className={cn(
          'w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-colors',
          Icon ? 'pl-10 pr-4' : 'px-4',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;
