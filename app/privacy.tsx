import React from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

export default function PrivacyScreen() {
  const sections: { title: string; body: string }[] = [
    {
      title: '1. Local-first calculations',
      body: 'Every calculator runs locally on your device. Inputs, formulas and results stay in memory and are never uploaded to a server.',
    },
    {
      title: '2. No account required',
      body: 'You don\'t need to sign up, sign in, or share an email to use any tool. We don\'t collect names, addresses, or contact info.',
    },
    {
      title: '3. Crash & analytics data',
      body: 'If you opt-in to crash reporting, anonymised diagnostic data may be sent to help us fix bugs. You can decline this entirely.',
    },
    {
      title: '4. Data you save locally',
      body: 'Favorites and recent calculations may be stored on this device for convenience. They never leave the device unless you back up your phone yourself.',
    },
    {
      title: '5. Children\'s privacy',
      body: 'UniCalc Hub is appropriate for general audiences and does not knowingly collect personal information from children.',
    },
    {
      title: '6. Changes to this policy',
      body: 'If we update this policy, the latest version will always live in this screen. Continued use implies acceptance.',
    },
    {
      title: '7. Contact',
      body: 'Questions? Reach us at hello@unicalc.app — we read every email.',
    },
  ];
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy' }} />
      <ScrollView className="bg-bg dark:bg-bg-dark" contentContainerClassName="p-4 pb-8 gap-3">
        <Text variant="h1">Privacy</Text>
        <Text variant="body" tone="muted">
          A short, plain-English summary of how UniCalc Hub treats your data.
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
