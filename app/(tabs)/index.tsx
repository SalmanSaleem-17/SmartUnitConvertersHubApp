import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORY_ORDER, POPULAR_SLUGS } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CategoryCard } from '@/components/CategoryCard';
import { ConverterCard } from '@/components/ConverterCard';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const isDark = scheme === 'dark';

  const groups = useMemo(() => {
    const map: Record<string, typeof ALL_CONVERTERS> = {};
    for (const converter of ALL_CONVERTERS) {
      if (!map[converter.category]) map[converter.category] = [];
      map[converter.category].push(converter);
    }
    return map;
  }, []);

  const popular = useMemo(
    () =>
      POPULAR_SLUGS
        .map((slug) => ALL_CONVERTERS.find((c) => c.slug === slug))
        .filter((c): c is (typeof ALL_CONVERTERS)[number] => Boolean(c)),
    []
  );

  const stats = [
    { label: 'Free Tools', value: `${ALL_CONVERTERS.length}+` },
    { label: 'Categories', value: `${CATEGORY_ORDER.filter((c) => groups[c]).length}` },
    { label: 'Sign-ups', value: '0' },
    { label: 'Privacy', value: '100%' },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="px-5 pt-3.5 pb-6 rounded-b-xl overflow-hidden bg-primary dark:bg-primary-dark">
          <View className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-white/10" />
          <View className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-white/5" />

          <View className="flex-row justify-between items-start gap-3">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 rounded-lg overflow-hidden bg-white/95 items-center justify-center">
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text variant="caption" className="text-white/85">
                  UNICALC HUB
                </Text>
                <Text variant="h2" className="text-white mt-0.5">
                  All-in-One Smart Calculators
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/settings' as any)}
              className="w-10 h-10 rounded-md items-center justify-center bg-white/20 active:opacity-80"
            >
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color="#fff" />
            </Pressable>
          </View>

          <Text variant="body" className="text-white/90 mt-2.5">
            {ALL_CONVERTERS.length}+ fast, accurate calculators — from unit conversions to financial planning, all in one place, completely free.
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/search' as any)}
            className="flex-row items-center gap-2.5 px-3.5 py-3 rounded-md mt-4.5 bg-white/95 active:opacity-90"
            style={{ marginTop: 18 }}
          >
            <Ionicons name="search" size={18} color={tokens.textMuted} />
            <Text variant="body" tone="muted" className="flex-1">
              Search any calculator…
            </Text>
            <View className="px-2 py-0.5 rounded-sm bg-primary-soft">
              <Text variant="caption" tone="primary">⌘ K</Text>
            </View>
          </Pressable>

          <View className="flex-row gap-2 mt-4">
            {stats.map((s) => (
              <View
                key={s.label}
                className="flex-1 px-2 py-2.5 rounded-md border-hairline items-center bg-white/15 border-white/20"
              >
                <Text variant="h3" className="text-white">
                  {s.value}
                </Text>
                <Text variant="caption" className="text-white/85 mt-0.5">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="p-4">
          {/* Most Popular */}
          <View className="mb-6">
            <View className="flex-row items-end mb-3 gap-3">
              <View className="flex-1">
                <Badge label="Trending" icon="flame" tone="warning" />
                <Text variant="h2" className="mt-2">
                  Most Popular
                </Text>
                <Text variant="small" tone="muted" className="mt-0.5">
                  Tools our users reach for most often.
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
            >
              {popular.map((converter) => (
                <View key={converter.slug} style={{ width: 240 }}>
                  <ConverterCard converter={converter} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Categories Grid */}
          <View className="mb-6">
            <View className="flex-row items-end mb-3 gap-3">
              <View className="flex-1">
                <Text variant="h2">Browse Categories</Text>
                <Text variant="small" tone="muted" className="mt-0.5">
                  Explore tools grouped by purpose.
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/categories' as any)} hitSlop={12}>
                <Text variant="bodyStrong" tone="primary">View all →</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap -m-1.5">
              {CATEGORY_ORDER.filter((cat) => groups[cat])
                .slice(0, 6)
                .map((cat) => (
                  <View key={cat} className="w-1/2 p-1.5">
                    <CategoryCard category={cat} count={groups[cat].length} />
                  </View>
                ))}
            </View>
          </View>

          {/* Why Us */}
          <Card variant="subtle" className="mb-6">
            <Text variant="h3">Why UniCalc Hub?</Text>
            <View className="mt-3 gap-2.5">
              {[
                { icon: 'flash', label: 'Instant results — zero loading screens.' },
                { icon: 'shield-checkmark', label: 'Verified formulas, rigorously tested.' },
                { icon: 'lock-closed', label: 'Private — calculations stay on-device.' },
                { icon: 'infinite', label: 'Always free, forever.' },
              ].map((item) => (
                <View key={item.label} className="flex-row gap-2.5 items-center">
                  <View className="w-7 h-7 rounded-pill items-center justify-center bg-primary-soft dark:bg-primary-softDark">
                    <Ionicons name={item.icon as any} size={14} color={tokens.primary} />
                  </View>
                  <Text variant="body" className="flex-1">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <Text variant="caption" tone="subtle" align="center" className="my-3">
            Made for everyday calculations · Crafted with care
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
