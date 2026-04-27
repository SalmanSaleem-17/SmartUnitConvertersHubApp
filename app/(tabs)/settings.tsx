import React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORY_ORDER } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/cn';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const cats = CATEGORY_ORDER.length;

  const items: { icon: keyof typeof Ionicons.glyphMap; label: string; sub?: string; onPress?: () => void; right?: React.ReactNode }[] = [
    {
      icon: scheme === 'dark' ? 'moon' : 'sunny',
      label: 'Theme',
      sub: 'Follows system appearance',
      right: (
        <View className="px-2.5 py-1 rounded-pill bg-primary-soft dark:bg-primary-softDark">
          <Text variant="caption" tone="primary">
            {scheme === 'dark' ? 'Dark' : 'Light'}
          </Text>
        </View>
      ),
    },
    {
      icon: 'apps',
      label: 'About UniCalc Hub',
      sub: `${ALL_CONVERTERS.length} calculators across ${cats} categories`,
      onPress: () => router.push('/about' as any),
    },
    {
      icon: 'shield-checkmark',
      label: 'Privacy',
      sub: 'How we handle your data',
      onPress: () => router.push('/privacy' as any),
    },
    {
      icon: 'document-text',
      label: 'Terms of Service',
      onPress: () => router.push('/terms' as any),
    },
    {
      icon: 'mail',
      label: 'Contact',
      sub: 'Get in touch with the team',
      onPress: () => Linking.openURL('mailto:hello@unicalc.app'),
    },
    { icon: 'star', label: 'Rate UniCalc Hub', sub: 'Share your feedback' },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView contentContainerClassName="p-4 pb-8" showsVerticalScrollIndicator={false}>
        <Text variant="h1">Settings</Text>
        <Text variant="body" tone="muted" className="mt-1 mb-4">
          Personalise your UniCalc experience.
        </Text>

        <Card padded={false}>
          {items.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className={cn(
                'flex-row items-center gap-3 py-3.5 px-3.5 active:bg-muted dark:active:bg-muted-dark',
                i !== items.length - 1 && 'border-b-hairline border-border dark:border-border-dark',
              )}
            >
              <View className="w-9 h-9 rounded-md items-center justify-center bg-primary-soft dark:bg-primary-softDark">
                <Ionicons name={item.icon as any} size={18} color={tokens.primary} />
              </View>
              <View className="flex-1">
                <Text variant="bodyStrong">{item.label}</Text>
                {item.sub ? (
                  <Text variant="small" tone="muted" className="mt-0.5">
                    {item.sub}
                  </Text>
                ) : null}
              </View>
              {item.right ?? <Ionicons name="chevron-forward" size={18} color={tokens.textSubtle} />}
            </Pressable>
          ))}
        </Card>

        <Text variant="caption" tone="subtle" align="center" className="mt-6">
          UniCalc Hub · Version 1.0.0
        </Text>
        <Text variant="caption" tone="subtle" align="center" className="mt-1">
          Crafted with care · All calculations stay on your device
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
