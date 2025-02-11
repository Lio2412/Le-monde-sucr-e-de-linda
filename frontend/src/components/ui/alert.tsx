import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
}

const variantStyles = {
  default: 'text-blue-800 bg-blue-100',
  destructive: 'text-red-800 bg-red-100',
  success: 'text-green-800 bg-green-100'
};

export function Alert({ children, variant = 'default', className, ...props }: AlertProps) {
  return (
    <div 
      className={cn(
        'flex p-4 mb-4 text-sm rounded-lg',
        variantStyles[variant],
        className
      )} 
      role="alert" 
      {...props}
    >
      {children}
    </div>
  );
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function AlertDescription({ children, className, ...props }: AlertDescriptionProps) {
  return (
    <p className={cn("font-bold", className)} {...props}>
      {children}
    </p>
  );
}