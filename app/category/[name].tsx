import React, { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORIES } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Text } from '@/components/ui/Text';
import { ConverterCard } from '@/components/ConverterCard';

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const decoded = decodeURIComponent(name ?? '');
  const cfg = CATEGORIES[decoded];
  const tools = useMemo(
    () => ALL_CONVERTERS.filter((cv) => cv.category === decoded),
    [decoded]
  );

  useEffect(() => {
    navigation.setOptions({ title: decoded || 'Category' });
  }, [decoded, navigation]);

  const tintBg = scheme === 'dark' ? cfg?.tintSoftDark : cfg?.tintSoft;

  return (
    <ScrollView
      className="bg-bg dark:bg-bg-dark"
      contentContainerClassName="p-4 pb-8 gap-3"
      showsVerticalScrollIndicator={false}
    >
      {cfg ? (
        <View
          className="p-4 rounded-lg border-hairline"
          style={{ backgroundColor: tintBg, borderColor: cfg.tint + '40' }}
        >
          <Text variant="caption" style={{ color: cfg.tint }}>
            {tools.length} TOOLS
          </Text>
          <Text variant="h2" className="mt-0.5">
            {decoded}
          </Text>
          <Text variant="body" tone="muted" className="mt-1">
            {cfg.description}
          </Text>
        </View>
      ) : null}

      {tools.length === 0 ? (
        <View className="pt-16 items-center">
          <Text variant="body" tone="muted">
            No tools in this category yet.
          </Text>
        </View>
      ) : (
        tools.map((cv) => <ConverterCard key={cv.slug} converter={cv} />)
      )}
    </ScrollView>
  );
}
