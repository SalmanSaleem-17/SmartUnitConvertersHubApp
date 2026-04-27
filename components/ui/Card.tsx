import React from 'react';
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';

type Variant = 'default' | 'subtle' | 'outline';

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark',
  subtle: 'bg-muted dark:bg-muted-dark border-border dark:border-border-dark',
  outline: 'bg-transparent border-border-strong dark:border-border-strong-dark',
};

type CardBaseProps = {
  variant?: Variant;
  padded?: boolean;
  className?: string;
};

export function Card({
  children,
  variant = 'default',
  padded = true,
  className,
  ...rest
}: ViewProps & CardBaseProps) {
  return (
    <View
      {...rest}
      className={cn(
        'rounded-lg border',
        padded && 'p-3.5',
        variant === 'outline' ? 'border' : 'border-hairline',
        variantClasses[variant],
        'shadow-sm',
        className,
      )}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  variant = 'default',
  padded = true,
  className,
  ...rest
}: PressableProps & CardBaseProps) {
  return (
    <Pressable
      {...rest}
      className={cn(
        'rounded-lg border active:opacity-90',
        padded && 'p-3.5',
        variantClasses[variant],
        'shadow-sm',
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
