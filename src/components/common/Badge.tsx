import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'saffron' | 'blue' | 'purple' | 'red' | 'gray' | 'outline' | 'amber' | 'rose' | 'stone';
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
    forest: 'bg-emerald-50 text-forest-800 border-emerald-200/80',
    saffron: 'bg-amber-50 text-amber-900 border-amber-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    blue: 'bg-sky-50 text-sky-900 border-sky-200/80',
    purple: 'bg-purple-50 text-purple-900 border-purple-200/80',
    red: 'bg-rose-50 text-rose-800 border-rose-200/80',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
    gray: 'bg-stone-100 text-stone-700 border-stone-200/80',
    stone: 'bg-stone-100 text-stone-700 border-stone-200/80',
    outline: 'bg-transparent text-stone-700 border-stone-300'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
