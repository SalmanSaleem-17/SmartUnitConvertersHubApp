import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORY_ORDER, CATEGORIES } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/cn';

import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { ConverterCard } from '@/components/ConverterCard';

export default function SearchScreen() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_CONVERTERS.filter((conv) => {
      if (activeCat && conv.category !== activeCat) return false;
      if (!needle) return true;
      return (
        conv.name.toLowerCase().includes(needle) ||
        conv.description.toLowerCase().includes(needle) ||
        conv.category.toLowerCase().includes(needle) ||
        conv.slug.includes(needle)
      );
    });
  }, [q, activeCat]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <View className="px-4 pt-3 pb-2">
        <Text variant="caption" tone="muted">SEARCH</Text>
        <Text variant="h1" className="mt-0.5">Find a calculator</Text>
        <View className="mt-3">
          <Input
            value={q}
            onChangeText={setQ}
            placeholder={`Search ${ALL_CONVERTERS.length} tools…`}
            icon="search"
            rightSlot={
              q ? (
                <Pressable onPress={() => setQ('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={tokens.icon} />
                </Pressable>
              ) : null
            }
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 6 }}
        style={{ flexGrow: 0, maxHeight: 40 }}
      >
        <FilterChip label="All" active={!activeCat} tint={tokens.primary} onPress={() => setActiveCat(null)} />
        {CATEGORY_ORDER.map((cat) => {
          const cfg = CATEGORIES[cat];
          if (!cfg) return null;
          return (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCat === cat}
              tint={cfg.tint}
              tintBg={scheme === 'dark' ? cfg.tintSoftDark : cfg.tintSoft}
              onPress={() => setActiveCat(activeCat === cat ? null : cat)}
            />
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerClassName="px-4 pt-2 pb-3 gap-2"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View className="pt-16 items-center">
            <Ionicons name="search" size={48} color={tokens.textSubtle} />
            <Text variant="h3" className="mt-3">No results</Text>
            <Text variant="small" tone="muted" align="center" className="mt-1">
              Try a different keyword or clear the filter.
            </Text>
          </View>
        ) : (
          <>
            <Text variant="caption" tone="muted" className="pl-1 mb-1">
              {filtered.length} {filtered.length === 1 ? 'RESULT' : 'RESULTS'}
            </Text>
            {filtered.map((conv) => (
              <ConverterCard key={conv.slug} converter={conv} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  tint,
  tintBg,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tint: string;
  tintBg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('px-3 py-1.5 rounded-pill border-hairline active:opacity-85')}
      style={{
        backgroundColor: active ? tint : tintBg ?? 'transparent',
        borderColor: active ? tint : 'rgba(0,0,0,0.06)',
      }}
    >
      <Text variant="caption" style={{ color: active ? '#fff' : tint }}>
        {label}
      </Text>
    </Pressable>
  );
}
