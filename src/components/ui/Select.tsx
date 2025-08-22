import React from 'react';
import { cn } from '../../utils/helpers';
import { LucideIcon } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ icon: Icon, className, children, ...props }) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      )}
      <select
        className={cn(
          'w-full py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-colors bg-white',
          Icon ? 'pl-10 pr-4' : 'px-4',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;
