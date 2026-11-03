import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'saffron' | 'blue' | 'purple' | 'red' | 'gray' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'sm',
  className = '',
  icon
}) => {
  const variantStyles = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    saffron: 'bg-amber-50 text-amber-900 border-amber-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    gray: 'bg-warm-100 text-warm-800 border-warm-200',
    outline: 'bg-transparent text-warm-800 border-warm-300'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

