import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cream' | 'dark' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  asLink?: boolean;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  asLink = false,
  href,
  disabled,
  id,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-medium tracking-tight rounded-full cursor-pointer select-none transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs sm:text-sm gap-1.5 min-h-[36px]',
    md: 'px-6 py-2.5 sm:py-3 text-sm sm:text-base gap-2 min-h-[44px]',
    lg: 'px-8 py-3.5 sm:py-4 text-base sm:text-lg gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    primary: 'bg-orange text-white hover:bg-orange-deep shadow-[0_4px_14px_rgba(221,90,31,0.3)] hover:shadow-[0_6px_20px_rgba(221,90,31,0.4)]',
    cream: 'bg-cream text-ink border border-ink/10 hover:bg-[#EBE3D7] shadow-sm',
    dark: 'bg-ink text-cream hover:bg-[#2E2722] shadow-[0_4px_14px_rgba(28,20,15,0.2)]',
    outline: 'bg-transparent text-ink border border-ink/20 hover:border-ink hover:bg-ink/5',
    ghost: 'bg-transparent text-ink hover:bg-ink/5 shadow-none border-transparent',
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (asLink && href) {
    return (
      <a
        id={id}
        href={href}
        className={classes}
        role="button"
      >
        {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      id={id}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};
