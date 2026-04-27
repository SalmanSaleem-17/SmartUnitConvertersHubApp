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

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const cats = CATEGORY_ORDER.length;

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'PREFERENCES',
      items: [
        {
          icon: scheme === 'dark' ? 'moon' : 'sunny',
          label: 'Theme',
          sub: 'Follows system appearance',
          right: (
            <View className="px-2.5 py-0.5 rounded-pill bg-primary-soft dark:bg-primary-softDark">
              <Text variant="caption" tone="primary">
                {scheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </View>
          ),
        },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        {
          icon: 'apps',
          label: 'About UniCalc Hub',
          sub: `${ALL_CONVERTERS.length} calculators · ${cats} categories`,
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
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: 'mail',
          label: 'Contact',
          sub: 'hello@unicalc.app',
          onPress: () => Linking.openURL('mailto:hello@unicalc.app'),
        },
        { icon: 'star', label: 'Rate UniCalc Hub', sub: 'Share your feedback' },
      ],
    },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark">
      <ScrollView contentContainerClassName="px-4 pt-3 pb-4" showsVerticalScrollIndicator={false}>
        <Text variant="caption" tone="muted">SETTINGS</Text>
        <Text variant="h1" className="mt-0.5">Personalise</Text>

        {sections.map((section) => (
          <View key={section.title} className="mt-4">
            <Text variant="caption" tone="muted" className="pl-1 mb-2">
              {section.title}
            </Text>
            <Card padded={false}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  className={cn(
                    'flex-row items-center gap-3 py-3 px-3.5 active:bg-muted dark:active:bg-muted-dark',
                    i !== section.items.length - 1 && 'border-b-hairline border-border dark:border-border-dark',
                  )}
                >
                  <View className="w-8 h-8 rounded-md items-center justify-center bg-primary-soft dark:bg-primary-softDark">
                    <Ionicons name={item.icon as any} size={16} color={tokens.primary} />
                  </View>
                  <View className="flex-1">
                    <Text variant="bodyStrong">{item.label}</Text>
                    {item.sub ? (
                      <Text variant="small" tone="muted" className="mt-0.5">{item.sub}</Text>
                    ) : null}
                  </View>
                  {item.right ?? <Ionicons name="chevron-forward" size={16} color={tokens.textSubtle} />}
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <Text variant="caption" tone="subtle" align="center" className="mt-6">
          UniCalc Hub · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
