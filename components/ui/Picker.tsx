import React, { useState } from 'react';
import { Modal, Pressable, View, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/cn';
import { Text } from './Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type PickerOption = { label: string; value: string; sublabel?: string };

export type PickerProps = {
  label?: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Picker({ label, value, options, onChange, placeholder = 'Select...' }: PickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View className="gap-1">
      {label ? (
        <Text variant="caption" tone="muted">
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-md border-hairline border-border dark:border-border-dark bg-muted dark:bg-muted-dark px-3 min-h-[42px] active:opacity-90"
      >
        <Text variant="body" className="flex-1" tone={selected ? 'default' : 'subtle'} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={tokens.icon} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} className="flex-1 justify-end bg-black/50">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={cn(
              'rounded-t-xl border-t-hairline border-border dark:border-border-dark bg-surface dark:bg-surface-dark pb-6 max-h-[80%]',
            )}
          >
            <View className="items-center py-2.5">
              <View className="w-11 h-1.5 rounded-md bg-border-strong dark:bg-border-strong-dark" />
            </View>
            {label ? (
              <Text variant="h3" className="px-4 py-2">
                {label}
              </Text>
            ) : null}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'px-4 py-3.5 flex-row items-center gap-2',
                      active && 'bg-primary-soft dark:bg-primary-softDark',
                    )}
                  >
                    <View className="flex-1">
                      <Text variant="bodyStrong" tone={active ? 'primary' : 'default'}>
                        {item.label}
                      </Text>
                      {item.sublabel ? (
                        <Text variant="small" tone="muted">
                          {item.sublabel}
                        </Text>
                      ) : null}
                    </View>
                    {active ? <Ionicons name="checkmark" size={20} color={tokens.primary} /> : null}
                  </Pressable>
                );
              }}
              style={{ maxHeight: 480 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
