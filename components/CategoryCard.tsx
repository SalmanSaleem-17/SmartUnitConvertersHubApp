import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import { CATEGORIES } from '@/constants/categories';
import { Text } from './ui/Text';

export function CategoryCard({
  category,
  count,
  fullWidth,
}: {
  category: string;
  count: number;
  fullWidth?: boolean;
}) {
  const cfg = CATEGORIES[category];
  const router = useRouter();
  if (!cfg) return null;

  const [grad1, grad2] = cfg.gradient;

  return (
    <Pressable
      onPress={() => router.push(`/category/${encodeURIComponent(category)}` as any)}
      className={cn(
        'h-[108px] rounded-md p-3 overflow-hidden active:opacity-90',
        !fullWidth && 'flex-1',
      )}
      style={{
        backgroundColor: grad1,
        shadowColor: grad2,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View
        className="absolute rounded-full opacity-40"
        style={{ width: 110, height: 110, top: -30, right: -25, backgroundColor: grad2 }}
      />
      <View className="flex-row justify-between items-start">
        <View className="w-7 h-7 rounded-md items-center justify-center bg-white/20">
          <Ionicons name={cfg.icon as any} size={16} color="#fff" />
        </View>
        <View className="px-1.5 py-0.5 rounded-pill bg-black/25">
          <Text variant="caption" className="text-white">{String(count)}</Text>
        </View>
      </View>
      <View className="mt-auto">
        <Text variant="bodyStrong" className="text-white" numberOfLines={1}>
          {category}
        </Text>
        <Text variant="caption" className="text-white/85 mt-0.5" numberOfLines={2}>
          {cfg.description}
        </Text>
      </View>
    </Pressable>
  );
}
