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
    forest: 'bg-brand-soft text-primary border-primary/20',
    saffron: 'bg-amber-500/10 text-amber-900 border-amber-500/25',
    amber: 'bg-amber-500/10 text-amber-900 border-amber-500/25',
    blue: 'bg-blue-500/10 text-blue-900 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-900 border-purple-500/20',
    red: 'bg-rose-500/10 text-rose-900 border-rose-500/20',
    rose: 'bg-rose-500/10 text-rose-900 border-rose-500/20',
    gray: 'bg-muted text-muted-foreground border-border',
    stone: 'bg-muted text-muted-foreground border-border',
    outline: 'bg-card text-foreground border-border'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
