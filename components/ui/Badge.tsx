import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';
import { Text } from './Text';

type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

const wrapByTone: Record<Tone, string> = {
  primary: 'bg-primary-soft dark:bg-primary-softDark',
  accent: 'bg-accent-soft dark:bg-accent-softDark',
  success: 'bg-success/15 dark:bg-success-dark/15',
  warning: 'bg-warning/15 dark:bg-warning-dark/15',
  danger: 'bg-danger/15 dark:bg-danger-dark/15',
  neutral: 'bg-muted dark:bg-muted-dark',
};

const fgByTone: Record<Tone, { tone: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'; iconColor: string }> = {
  primary:  { tone: 'primary', iconColor: '#0EA5A5' },
  accent:   { tone: 'accent',  iconColor: '#7C3AED' },
  success:  { tone: 'success', iconColor: '#10B981' },
  warning:  { tone: 'warning', iconColor: '#F59E0B' },
  danger:   { tone: 'danger',  iconColor: '#EF4444' },
  neutral:  { tone: 'muted',   iconColor: '#5B6478' },
};

export function Badge({
  label,
  icon,
  tone = 'primary',
  className,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  tone?: Tone;
  className?: string;
}) {
  const fg = fgByTone[tone];
  return (
    <View className={cn('flex-row items-center gap-1 px-2.5 py-1 rounded-pill self-start', wrapByTone[tone], className)}>
      {icon ? <Ionicons name={icon} size={12} color={fg.iconColor} /> : null}
      <Text variant="caption" tone={fg.tone}>
        {label}
      </Text>
    </View>
  );
}
