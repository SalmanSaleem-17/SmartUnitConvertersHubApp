import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const USD_RATES: Record<string, { name: string; rate: number; flag: string }> = {
  USD: { name: 'US Dollar', rate: 1, flag: '🇺🇸' },
  EUR: { name: 'Euro', rate: 0.92, flag: '🇪🇺' },
  GBP: { name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
  PKR: { name: 'Pakistani Rupee', rate: 278, flag: '🇵🇰' },
  INR: { name: 'Indian Rupee', rate: 83, flag: '🇮🇳' },
  AED: { name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', rate: 3.75, flag: '🇸🇦' },
  CAD: { name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', rate: 1.52, flag: '🇦🇺' },
  JPY: { name: 'Japanese Yen', rate: 151, flag: '🇯🇵' },
  CNY: { name: 'Chinese Yuan', rate: 7.24, flag: '🇨🇳' },
  TRY: { name: 'Turkish Lira', rate: 32.4, flag: '🇹🇷' },
  CHF: { name: 'Swiss Franc', rate: 0.91, flag: '🇨🇭' },
  SGD: { name: 'Singapore Dollar', rate: 1.35, flag: '🇸🇬' },
  MYR: { name: 'Malaysian Ringgit', rate: 4.74, flag: '🇲🇾' },
  BDT: { name: 'Bangladeshi Taka', rate: 110, flag: '🇧🇩' },
};

export function CurrencyConverter() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('PKR');

  const out = useMemo(() => {
    const v = parseFloat(amount);
    if (!isFinite(v)) return null;
    const usd = v / USD_RATES[from].rate;
    return usd * USD_RATES[to].rate;
  }, [amount, from, to]);

  const opts = Object.entries(USD_RATES).map(([code, info]) => ({
    label: `${info.flag}  ${code} — ${info.name}`,
    value: code,
  }));

  return (
    <View className="gap-3">
      <Card className="border border-warning/60 bg-muted dark:bg-muted-dark">
        <View className="flex-row gap-2 items-center">
          <Ionicons name="information-circle" size={18} color={tokens.warning} />
          <Text variant="small" className="flex-1">
            Reference rates (offline). For live rates, use any major exchange before trading.
          </Text>
        </View>
      </Card>

      <Card>
        <View className="gap-3">
          <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" icon="cash" />
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Picker label="From" value={from} onChange={setFrom} options={opts} />
            </View>
            <Pressable
              onPress={() => {
                setFrom(to);
                setTo(from);
              }}
              className="w-11 h-12 rounded-md items-center justify-center bg-primary-soft dark:bg-primary-softDark active:opacity-80"
            >
              <Ionicons name="swap-horizontal" size={20} color={tokens.primary} />
            </Pressable>
            <View className="flex-1">
              <Picker label="To" value={to} onChange={setTo} options={opts} />
            </View>
          </View>
        </View>
      </Card>

      <ResultDisplay
        label="Converted"
        value={out === null ? '—' : `${out.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`}
        sub={`${amount} ${from} → ${to}`}
      />
    </View>
  );
}
