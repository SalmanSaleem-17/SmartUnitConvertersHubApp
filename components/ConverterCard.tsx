import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import { iconFor } from '@/constants/icon-map';
import { CATEGORIES } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

import { Text } from './ui/Text';
import { PressableCard } from './ui/Card';
import { IconBadge } from './ui/IconBadge';
import type { ConverterMeta } from '@/constants/all-converters';

export function ConverterCard({ converter, compact }: { converter: ConverterMeta; compact?: boolean }) {
  const router = useRouter();
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const cat = CATEGORIES[converter.category];
  const tint = cat?.tint ?? tokens.primary;
  const tintBg = scheme === 'dark' ? cat?.tintSoftDark ?? tokens.primarySoft : cat?.tintSoft ?? tokens.primarySoft;

  return (
    <PressableCard
      onPress={() => router.push(`/calc/${converter.slug}` as any)}
      padded={false}
      className="overflow-hidden"
    >
      <View className={cn('flex-row items-center gap-3', compact ? 'p-3' : 'p-3.5')}>
        <IconBadge icon={iconFor(converter.icon)} bg={tintBg} color={tint} size={compact ? 36 : 44} />
        <View className="flex-1 gap-0.5">
          <Text variant={compact ? 'bodyStrong' : 'h3'} numberOfLines={compact ? 1 : 2}>
            {converter.name}
          </Text>
          {!compact && (
            <Text variant="small" tone="muted" numberOfLines={2}>
              {converter.description}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={tokens.textSubtle} />
      </View>
      {!compact && (
        <View className="flex-row items-center gap-1.5 px-3.5 py-2 border-t-hairline border-border dark:border-border-dark">
          <View className="w-1.5 h-1.5 rounded-pill" style={{ backgroundColor: tint }} />
          <Text variant="caption" style={{ color: tint }}>
            {converter.category}
          </Text>
        </View>
      )}
    </PressableCard>
  );
}
