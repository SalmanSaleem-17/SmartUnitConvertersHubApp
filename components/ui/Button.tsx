import React from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
};

const sizing: Record<Size, { wrap: string; iconSize: number; gap: string }> = {
  sm: { wrap: 'py-2 px-3', iconSize: 16, gap: 'gap-1.5' },
  md: { wrap: 'py-3 px-4', iconSize: 18, gap: 'gap-2' },
  lg: { wrap: 'py-4 px-5', iconSize: 20, gap: 'gap-2.5' },
};

const variantWrap: Record<Variant, string> = {
  primary: 'bg-primary dark:bg-primary-dark',
  secondary: 'bg-muted dark:bg-muted-dark border-hairline border-border dark:border-border-dark',
  ghost: 'bg-transparent',
  danger: 'bg-danger dark:bg-danger-dark',
};

const fgColor: Record<Variant, string> = {
  primary: '#fff',
  secondary: '#0B1220',
  ghost: '#0EA5A5',
  danger: '#fff',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const s = sizing[size];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      className={cn(
        'rounded-md items-center justify-center active:opacity-85',
        s.wrap,
        variantWrap[variant],
        disabled && 'opacity-50',
        fullWidth ? 'self-stretch' : 'self-start',
        className,
      )}
    >
      <View className={cn('flex-row items-center justify-center', s.gap, iconPosition === 'right' && 'flex-row-reverse')}>
        {icon ? <Ionicons name={icon} size={s.iconSize} color={fgColor[variant]} /> : null}
        <Text
          variant={size === 'lg' ? 'bodyStrong' : 'body'}
          className="font-bold"
          style={{ color: fgColor[variant] }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
