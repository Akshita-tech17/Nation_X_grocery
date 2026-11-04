import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-card active:scale-[0.98] border border-transparent focus-visible:ring-3 focus-visible:ring-ring/50',
    secondary:
      'bg-brand-soft hover:bg-brand-soft/80 text-primary font-medium border border-primary/20 active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-ring/50',
    outline:
      'bg-card hover:bg-muted text-foreground border border-border hover:border-border/80 font-medium shadow-card active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-ring/50',
    ghost:
      'bg-transparent hover:bg-muted text-foreground/80 hover:text-foreground font-medium active:scale-[0.98]',
    amber:
      'bg-marigold hover:bg-marigold/90 text-marigold-foreground font-medium shadow-card active:scale-[0.98] border border-transparent focus-visible:ring-3 focus-visible:ring-marigold/50',
    danger:
      'bg-destructive hover:bg-destructive/90 text-white font-medium shadow-card active:scale-[0.98] border border-transparent'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:outline-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
