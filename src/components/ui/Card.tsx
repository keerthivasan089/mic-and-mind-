import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'cream' | 'dark' | 'orange';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'paper',
  interactive = false,
  className = '',
  id,
  ...props
}) => {
  const variantStyles = {
    paper: 'bg-[#FBF6EB] text-[#1C140F] border-2 border-[#1C140F] shadow-[5px_5px_0px_#1C140F]',
    cream: 'bg-[#F4ECD9] text-[#1C140F] border-2 border-[#1C140F] shadow-[5px_5px_0px_#1C140F]',
    dark: 'bg-[#1C140F] text-[#F4ECD9] border-2 border-[#1C140F] shadow-[5px_5px_0px_#DD5A1F]',
    orange: 'bg-[#DD5A1F] text-white border-2 border-[#1C140F] shadow-[5px_5px_0px_#1C140F]',
  };

  const interactiveStyles = interactive
    ? 'transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_#1C140F]'
    : '';

  return (
    <div
      id={id}
      className={`rounded-2xl p-6 md:p-8 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
