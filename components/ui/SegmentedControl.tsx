import React from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from './Text';

export type Segment<T extends string> = { label: string; value: T };

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Segment<T>[];
  className?: string;
}) {
  return (
    <View className={cn('flex-row rounded-md p-0.5 bg-muted dark:bg-muted-dark', className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'flex-1 py-2 items-center rounded-sm active:opacity-90',
              active && 'bg-surface dark:bg-surface-dark',
            )}
          >
            <Text variant="small" tone={active ? 'primary' : 'muted'} className="font-bold">
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
