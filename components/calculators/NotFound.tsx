import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function NotFound({ slug }: { slug: string }) {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  return (
    <Card className="items-center py-6">
      <Ionicons name="alert-circle" size={40} color={tokens.textSubtle} />
      <Text variant="h3" align="center" className="mt-2">Calculator not found</Text>
      <Text variant="small" tone="muted" align="center" className="mt-1">{slug}</Text>
    </Card>
  );
}
