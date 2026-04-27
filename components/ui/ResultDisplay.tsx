import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from './Text';

export function ResultDisplay({
  label,
  value,
  sub,
  emphasize = true,
  className,
}: {
  label?: string;
  value: string;
  sub?: string;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'rounded-lg border-hairline px-4 py-3',
        emphasize
          ? 'bg-primary-soft dark:bg-primary-softDark border-primary/30'
          : 'bg-muted dark:bg-muted-dark border-border dark:border-border-dark',
        className,
      )}
    >
      {label ? (
        <Text variant="caption" tone={emphasize ? 'primary' : 'muted'}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Text
        className={cn(
          'text-3xl font-extrabold tracking-tight mt-0.5',
          emphasize ? 'text-primary dark:text-primary-dark' : 'text-ink dark:text-ink-dark',
        )}
      >
        {value}
      </Text>
      {sub ? (
        <Text variant="small" tone="muted" className="mt-0.5">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
