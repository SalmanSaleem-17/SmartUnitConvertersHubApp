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
        'min-h-[130px] rounded-xl p-4 overflow-hidden shadow-md active:opacity-90',
        !fullWidth && 'flex-1',
      )}
      style={{ backgroundColor: grad1, shadowColor: grad2 }}
    >
      <View
        className="absolute rounded-full opacity-50"
        style={{ width: 160, height: 160, top: -50, right: -40, backgroundColor: grad2 }}
      />
      <View className="flex-row justify-between items-center">
        <View className="w-9 h-9 rounded-md items-center justify-center bg-white/20">
          <Ionicons name={cfg.icon as any} size={20} color="#fff" />
        </View>
        <View className="px-2.5 py-1 rounded-pill bg-black/20">
          <Text variant="caption" className="text-white">
            {String(count)}
          </Text>
        </View>
      </View>
      <View className="mt-4">
        <Text variant="h2" className="text-white">
          {category}
        </Text>
        <Text variant="small" className="text-white/85 mt-1" numberOfLines={2}>
          {cfg.description}
        </Text>
      </View>
    </Pressable>
  );
}
