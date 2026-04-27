import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORY_ORDER } from '@/constants/categories';

import { Text } from '@/components/ui/Text';
import { CategoryCard } from '@/components/CategoryCard';

export default function CategoriesScreen() {
  const groups = useMemo(() => {
    const map: Record<string, number> = {};
    for (const converter of ALL_CONVERTERS) {
      map[converter.category] = (map[converter.category] ?? 0) + 1;
    }
    return map;
  }, []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView contentContainerClassName="p-4 pb-8" showsVerticalScrollIndicator={false}>
        <Text variant="h1">Browse</Text>
        <Text variant="body" tone="muted" className="mt-1">
          {`${ALL_CONVERTERS.length} tools across ${CATEGORY_ORDER.filter((c) => groups[c]).length} categories.`}
        </Text>

        <View className="flex-row flex-wrap -m-1.5 mt-4">
          {CATEGORY_ORDER.filter((cat) => groups[cat]).map((cat) => (
            <View key={cat} className="w-1/2 p-1.5">
              <CategoryCard category={cat} count={groups[cat]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
