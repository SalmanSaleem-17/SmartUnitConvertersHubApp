import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'mono';
type Tone = 'default' | 'muted' | 'subtle' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'inverse';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  display: 'text-display font-extrabold tracking-tighter',
  h1: 'text-h1 font-extrabold tracking-tight',
  h2: 'text-h2 font-bold tracking-tight',
  h3: 'text-h3 font-bold',
  body: 'text-body font-medium',
  bodyStrong: 'text-body font-bold',
  small: 'text-small font-medium',
  caption: 'text-caption font-semibold tracking-wide',
  mono: 'text-body font-semibold',
};

const toneClasses: Record<Tone, string> = {
  default: 'text-ink dark:text-ink-dark',
  muted: 'text-ink-muted dark:text-ink-muted-dark',
  subtle: 'text-ink-subtle dark:text-ink-subtle-dark',
  primary: 'text-primary dark:text-primary-dark',
  accent: 'text-accent dark:text-accent-dark',
  success: 'text-success dark:text-success-dark',
  warning: 'text-warning dark:text-warning-dark',
  danger: 'text-danger dark:text-danger-dark',
  inverse: 'text-white',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function Text({ variant = 'body', tone = 'default', align, className, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      className={cn(variantClasses[variant], toneClasses[tone], align && alignClasses[align], className)}
    />
  );
}
