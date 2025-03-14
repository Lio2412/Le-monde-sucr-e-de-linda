import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]", 
        className
      )} 
      role="status"
      {...props}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Chargement...
      </span>
    </div>
  );
}