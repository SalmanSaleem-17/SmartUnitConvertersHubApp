import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';
import { Text } from './Text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  rightSlot?: React.ReactNode;
  containerClassName?: string;
  className?: string;
};

export function Input({
  label,
  hint,
  error,
  icon,
  rightSlot,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  return (
    <View className={cn('gap-1', containerClassName)}>
      {label ? (
        <Text variant="caption" tone="muted">
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center rounded-md border-hairline bg-muted dark:bg-muted-dark px-3 min-h-[42px]',
          error ? 'border-danger dark:border-danger-dark' : 'border-border dark:border-border-dark',
        )}
      >
        {icon ? <Ionicons name={icon} size={16} color={tokens.icon} style={{ marginRight: 6 }} /> : null}
        <TextInput
          {...props}
          placeholderTextColor={tokens.textSubtle}
          className={cn('flex-1 text-[15px] font-semibold py-2.5 text-ink dark:text-ink-dark', className)}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
