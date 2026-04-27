import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_CONFIGS } from '@/constants/unit-configs';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { Picker } from '@/components/ui/Picker';

function formatNum(n: number): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 1e-4) return n.toExponential(6);
  if (abs >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

export function UnitConverter({ slug }: { slug: string }) {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const units = UNIT_CONFIGS[slug] ?? [];
  const [from, setFrom] = useState(units[0]?.symbol ?? '');
  const [to, setTo] = useState(units[1]?.symbol ?? units[0]?.symbol ?? '');
  const [value, setValue] = useState('1');

  useEffect(() => {
    setFrom(units[0]?.symbol ?? '');
    setTo(units[1]?.symbol ?? units[0]?.symbol ?? '');
    setValue('1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fromUnit = units.find((u) => u.symbol === from);
  const toUnit = units.find((u) => u.symbol === to);
  const num = parseFloat(value);
  const result = useMemo(() => {
    if (!fromUnit || !toUnit || !isFinite(num)) return null;
    const base = num * fromUnit.toBase;
    return base / toUnit.toBase;
  }, [num, fromUnit, toUnit]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  if (units.length === 0) {
    return (
      <Card>
        <Text variant="bodyStrong">Unit configuration unavailable.</Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input
            label="Value"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="Enter a number"
          />
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Picker
                label="From"
                value={from}
                onChange={setFrom}
                options={units.map((u) => ({ label: `${u.name} (${u.symbol})`, value: u.symbol }))}
              />
            </View>
            <Pressable
              onPress={swap}
              className="w-11 h-12 rounded-md items-center justify-center bg-primary-soft dark:bg-primary-softDark active:opacity-80"
            >
              <Ionicons name="swap-horizontal" size={20} color={tokens.primary} />
            </Pressable>
            <View className="flex-1">
              <Picker
                label="To"
                value={to}
                onChange={setTo}
                options={units.map((u) => ({ label: `${u.name} (${u.symbol})`, value: u.symbol }))}
              />
            </View>
          </View>
        </View>
      </Card>

      <Card className="bg-primary-soft dark:bg-primary-softDark border-primary/30">
        <Text variant="caption" tone="primary">RESULT</Text>
        <Text className="text-3xl font-extrabold text-primary dark:text-primary-dark mt-1">
          {result === null ? '—' : formatNum(result)} {toUnit?.symbol}
        </Text>
        {fromUnit && toUnit && isFinite(num) ? (
          <Text variant="small" tone="muted" className="mt-1">
            {formatNum(num)} {fromUnit.symbol} = {result === null ? '—' : formatNum(result)} {toUnit.symbol}
          </Text>
        ) : null}
      </Card>

      {fromUnit && toUnit ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Quick conversions</Text>
          <View className="mt-2 gap-1.5">
            {[1, 5, 10, 25, 50, 100].map((v) => {
              const r = (v * fromUnit.toBase) / toUnit.toBase;
              return (
                <View key={v} className="flex-row items-center gap-2">
                  <Text variant="body">
                    {v} {fromUnit.symbol}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={tokens.textSubtle} />
                  <Text variant="bodyStrong" tone="primary">
                    {formatNum(r)} {toUnit.symbol}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </View>
  );
}
