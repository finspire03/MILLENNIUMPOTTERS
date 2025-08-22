import React from 'react';
import { cn } from '../../utils/helpers';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        'w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-electric-500 transition-colors',
        className
      )}
      rows={4}
      {...props}
    />
  );
};

export default Textarea;
