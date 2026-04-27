import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';

export function IconBadge({
  icon,
  size = 44,
  bg,
  color,
  className,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  bg: string;
  color: string;
  className?: string;
}) {
  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ width: size, height: size, borderRadius: Math.min(size / 3, 16), backgroundColor: bg }}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}
