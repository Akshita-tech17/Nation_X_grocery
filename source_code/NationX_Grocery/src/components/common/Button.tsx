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
      'bg-forest-900 hover:bg-forest-950 text-white shadow-sm active:scale-[0.98] border border-forest-900 focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2',
    secondary:
      'bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200/80 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-forest-600',
    outline:
      'bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-forest-600',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-700 hover:text-stone-900 active:scale-[0.98]',
    amber:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:scale-[0.98] border border-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98] border border-rose-600'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-semibold',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-bold'
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
