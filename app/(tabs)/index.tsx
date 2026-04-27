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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-3">
        {/* ── Hero — cleaner, deep gradient feel via solid primary + subtle pattern ── */}
        <View className="px-4 pt-2 pb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 rounded-md overflow-hidden bg-white items-center justify-center" style={{ shadowColor: tokens.shadow, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Image source={require('@/assets/images/icon.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
              </View>
              <View>
                <Text variant="caption" tone="muted">UNICALC HUB</Text>
                <Text variant="h2" className="-mt-0.5">All-in-One Calculator</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/settings' as any)}
              className="w-9 h-9 rounded-md items-center justify-center bg-muted dark:bg-muted-dark active:opacity-70"
            >
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={tokens.icon} />
            </Pressable>
          </View>
        </View>

        {/* ── Search bar (taps to Search tab) ── */}
        <View className="px-4 -mt-2">
          <Pressable
            onPress={() => router.push('/(tabs)/search' as any)}
            className="flex-row items-center gap-2.5 px-3.5 py-3 rounded-md bg-surface dark:bg-surface-dark border-hairline border-border dark:border-border-dark active:opacity-90"
            style={{ shadowColor: tokens.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
          >
            <Ionicons name="search" size={18} color={tokens.textMuted} />
            <Text variant="body" tone="subtle" className="flex-1">
              {`Search ${ALL_CONVERTERS.length} calculators…`}
            </Text>
            <Ionicons name="arrow-forward-circle" size={20} color={tokens.primary} />
          </Pressable>
        </View>

        {/* ── Trending (horizontal scroll, dense cards) ── */}
        <View className="mt-5">
          <View className="flex-row items-end justify-between px-4 mb-2.5">
            <View>
              <Text variant="caption" tone="muted">TRENDING NOW</Text>
              <Text variant="h2" className="mt-0.5">Popular tools</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/categories' as any)} hitSlop={8}>
              <Text variant="bodyStrong" tone="primary">All →</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
          >
            {popular.map((converter) => (
              <View key={converter.slug} style={{ width: 220 }}>
                <ConverterCard converter={converter} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Categories ── */}
        <View className="mt-6 px-4">
          <View className="flex-row items-end justify-between mb-2.5">
            <View>
              <Text variant="caption" tone="muted">EXPLORE</Text>
              <Text variant="h2" className="mt-0.5">Categories</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/categories' as any)} hitSlop={8}>
              <Text variant="bodyStrong" tone="primary">All →</Text>
            </Pressable>
          </View>
          <View className="flex-row flex-wrap -m-1">
            {CATEGORY_ORDER.filter((cat) => groups[cat])
              .slice(0, 6)
              .map((cat) => (
                <View key={cat} className="w-1/2 p-1">
                  <CategoryCard category={cat} count={groups[cat].length} />
                </View>
              ))}
          </View>
        </View>

        {/* ── Why us — compact strip instead of a card ── */}
        <View className="mt-6 px-4">
          <Card variant="subtle">
            <View className="flex-row items-center justify-between">
              <Stat icon="flash" label="Instant" tone={tokens.primary} />
              <View className="w-px h-8 bg-border dark:bg-border-dark" />
              <Stat icon="lock-closed" label="Private" tone={tokens.primary} />
              <View className="w-px h-8 bg-border dark:bg-border-dark" />
              <Stat icon="shield-checkmark" label="Accurate" tone={tokens.primary} />
              <View className="w-px h-8 bg-border dark:bg-border-dark" />
              <Stat icon="infinite" label="Free" tone={tokens.primary} />
            </View>
          </Card>
          <Text variant="caption" tone="subtle" align="center" className="mt-4">
            {`${ALL_CONVERTERS.length} calculators · zero sign-ups · all on-device`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; tone: string }) {
  return (
    <View className="items-center flex-1">
      <Ionicons name={icon} size={16} color={tone} />
      <Text variant="caption" className="mt-1">{label}</Text>
    </View>
  );
}
