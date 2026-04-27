import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from './Text';

export function Section({
  title,
  caption,
  right,
  children,
  className,
  ...props
}: ViewProps & { title?: string; caption?: string; right?: React.ReactNode; className?: string }) {
  return (
    <View {...props} className={cn('mb-6', className)}>
      {title || right ? (
        <View className="flex-row items-start mb-3 gap-3">
          <View className="flex-1">
            {title ? <Text variant="h2">{title}</Text> : null}
            {caption ? (
              <Text variant="small" tone="muted" className="mt-0.5">
                {caption}
              </Text>
            ) : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}
