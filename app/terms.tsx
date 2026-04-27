import React from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

export default function TermsScreen() {
  const sections: { title: string; body: string }[] = [
    {
      title: 'Use of the app',
      body: 'UniCalc Hub is provided as-is. You are free to use any calculator for personal or commercial purposes. The results are educational and should not replace professional advice (medical, legal, financial, or engineering).',
    },
    {
      title: 'Accuracy',
      body: 'We use widely accepted formulas and rigorous testing, but real-world figures depend on countless variables. Always sanity-check critical numbers with a domain expert.',
    },
    {
      title: 'Liability',
      body: 'We are not liable for decisions made on the basis of any calculator output. You agree to use the app at your own risk.',
    },
    {
      title: 'Intellectual property',
      body: 'The UniCalc Hub name, design and code are owned by us. You may not redistribute or repackage the app, but you can freely share the results it produces.',
    },
    {
      title: 'Updates',
      body: 'We may update or change calculators at any time. Older versions of formulas may not be retained.',
    },
  ];
  return (
    <>
      <Stack.Screen options={{ title: 'Terms of Service' }} />
      <ScrollView className="bg-bg dark:bg-bg-dark" contentContainerClassName="p-4 pb-8 gap-3">
        <Text variant="h1">Terms of Service</Text>
        <Text variant="body" tone="muted">
          The short rules of using UniCalc Hub.
        </Text>
        <View className="gap-2.5 mt-1.5">
          {sections.map((s) => (
            <Card key={s.title}>
              <Text variant="bodyStrong">{s.title}</Text>
              <Text variant="body" tone="muted" className="mt-1.5">
                {s.body}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
