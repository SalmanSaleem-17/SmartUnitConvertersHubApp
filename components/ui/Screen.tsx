import React from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

type ScreenProps = ScrollViewProps & {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  scroll?: boolean;
  contentClassName?: string;
  padded?: boolean;
};

export function Screen({
  children,
  edges = ['top'],
  scroll = true,
  contentClassName,
  padded = true,
  ...props
}: ScreenProps) {
  const padCls = padded ? 'px-4 pb-8' : '';
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-bg dark:bg-bg-dark">
      {scroll ? (
        <ScrollView
          {...props}
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn(padCls, contentClassName)}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', padCls, contentClassName)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
