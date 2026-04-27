import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORIES } from '@/constants/categories';
import { iconFor } from '@/constants/icon-map';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

import { Text } from '@/components/ui/Text';
import { IconBadge } from '@/components/ui/IconBadge';
import { getCalculator } from '@/components/calculators/registry';

export default function CalcScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;

  const meta = ALL_CONVERTERS.find((m) => m.slug === slug);
  const cat = meta ? CATEGORIES[meta.category] : undefined;
  const tint = cat?.tint ?? tokens.primary;
  const tintBg = scheme === 'dark' ? cat?.tintSoftDark ?? tokens.primarySoft : cat?.tintSoft ?? tokens.primarySoft;

  React.useEffect(() => {
    if (meta) {
      navigation.setOptions({ title: meta.name, headerTintColor: tokens.text });
    }
  }, [meta, navigation, tokens.text]);

  if (!meta || !slug) {
    return (
      <View className="flex-1 p-6 justify-center bg-bg dark:bg-bg-dark">
        <Text variant="h2" align="center">Calculator not found</Text>
        <Text variant="body" tone="muted" align="center" className="mt-2">
          {`The slug "${String(slug)}" does not match any calculator.`}
        </Text>
      </View>
    );
  }

  const Component = getCalculator(meta.slug);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="bg-bg dark:bg-bg-dark"
      contentContainerClassName="px-3 pt-2 pb-10"
    >
      {/* Compact category strip — no big card, just a colored line + label */}
      <View className="flex-row items-center gap-2 mb-2.5 px-1">
        <IconBadge icon={iconFor(meta.icon)} size={28} bg={tintBg} color={tint} />
        <View className="flex-1">
          <Text variant="caption" style={{ color: tint }}>{meta.category.toUpperCase()}</Text>
          <Text variant="small" tone="muted" numberOfLines={2}>{meta.description}</Text>
        </View>
      </View>

      <Component slug={meta.slug} />
    </ScrollView>
  );
}
