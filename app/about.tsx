import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ALL_CONVERTERS } from '@/constants/all-converters';
import { CATEGORY_ORDER } from '@/constants/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

export default function AboutScreen() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const features = [
    { icon: 'flash', title: 'Instant', text: 'Calculations happen on your device — zero loading.' },
    { icon: 'shield-checkmark', title: 'Accurate', text: 'Verified formulas, rigorously tested.' },
    { icon: 'lock-closed', title: 'Private', text: 'Your data never leaves the app.' },
    { icon: 'phone-portrait', title: 'Mobile-first', text: 'Designed for thumbs, beautiful in light & dark.' },
    { icon: 'pricetag', title: 'Free', text: 'Every tool, completely free to use.' },
    { icon: 'infinite', title: 'Always growing', text: 'New calculators added often.' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'About' }} />
      <ScrollView className="bg-bg dark:bg-bg-dark" contentContainerClassName="p-4 pb-8 gap-3.5">
        <Card className="bg-primary-soft dark:bg-primary-softDark border-primary/30 items-center">
          <View className="w-20 h-20 rounded-xl overflow-hidden items-center justify-center bg-white/80 mb-3">
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
          </View>
          <Text variant="caption" tone="primary" align="center">UNICALC HUB</Text>
          <Text variant="h1" align="center" className="mt-1">
            All-in-One Smart Calculators
          </Text>
          <Text variant="body" tone="muted" align="center" className="mt-1.5">
            {`${ALL_CONVERTERS.length} fast, accurate calculators across ${CATEGORY_ORDER.length} categories — from unit conversions and finance to Islamic, health, construction and fun. Built to be tappable, readable and friendly.`}
          </Text>
        </Card>

        <View className="flex-row flex-wrap -m-1.5">
          {features.map((f) => (
            <View key={f.title} className="w-1/2 p-1.5">
              <Card className="h-full">
                <View className="w-9 h-9 rounded-md items-center justify-center bg-primary-soft dark:bg-primary-softDark">
                  <Ionicons name={f.icon as any} size={18} color={tokens.primary} />
                </View>
                <Text variant="bodyStrong" className="mt-2.5">
                  {f.title}
                </Text>
                <Text variant="small" tone="muted" className="mt-1">
                  {f.text}
                </Text>
              </Card>
            </View>
          ))}
        </View>

        <Card>
          <Text variant="bodyStrong">Mission</Text>
          <Text variant="body" tone="muted" className="mt-1.5">
            Make everyday calculations effortless. We obsess over speed, clarity and trust — so you can focus on the answer, not the tool.
          </Text>
        </Card>

        <Text variant="caption" tone="subtle" align="center" className="mt-2">
          Crafted with care · Version 1.0.0
        </Text>
      </ScrollView>
    </>
  );
}
