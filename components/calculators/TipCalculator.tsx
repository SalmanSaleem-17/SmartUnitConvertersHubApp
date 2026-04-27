import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';

const PRESETS = [10, 12, 15, 18, 20, 25];

export function TipCalculator() {
  const [bill, setBill] = useState('1000');
  const [tipPct, setTipPct] = useState('15');
  const [people, setPeople] = useState('1');
  const [round, setRound] = useState<'none' | 'up' | 'down'>('none');

  const out = useMemo(() => {
    const b = parseFloat(bill) || 0;
    const t = parseFloat(tipPct) || 0;
    const p = Math.max(parseInt(people) || 1, 1);
    let tipAmount = (b * t) / 100;
    if (round === 'up') tipAmount = Math.ceil(tipAmount);
    if (round === 'down') tipAmount = Math.floor(tipAmount);
    const total = b + tipAmount;
    return {
      tip: tipAmount,
      total,
      perPerson: total / p,
      tipPerPerson: tipAmount / p,
      effectiveRate: b > 0 ? (tipAmount / b) * 100 : 0,
    };
  }, [bill, tipPct, people, round]);

  const fmt = (v: number) =>
    v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View className="gap-2.5">
      {/* Inputs */}
      <Card>
        <View className="flex-row gap-2">
          <View className="flex-[2]"><Input label="Bill amount" value={bill} onChangeText={setBill} keyboardType="decimal-pad" icon="receipt" /></View>
          <View className="flex-1"><Input label="People" value={people} onChangeText={setPeople} keyboardType="number-pad" /></View>
        </View>
        <Text variant="caption" tone="muted" className="mt-3 mb-1.5">TIP PERCENTAGE</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setTipPct(String(p))}
              className={`px-3 py-1.5 rounded-md border-hairline active:opacity-80 ${tipPct === String(p) ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark' : 'bg-muted border-border dark:bg-muted-dark dark:border-border-dark'}`}
            >
              <Text variant="small" className={`font-bold ${tipPct === String(p) ? 'text-white' : 'text-ink dark:text-ink-dark'}`}>{p}%</Text>
            </Pressable>
          ))}
          <View className="w-24">
            <Input value={tipPct} onChangeText={setTipPct} keyboardType="decimal-pad" placeholder="Custom" />
          </View>
        </View>
      </Card>

      {/* Total panel — single dense card with all the numbers */}
      <Card variant="subtle">
        <View className="flex-row items-center pb-2.5 border-b-hairline border-border dark:border-border-dark">
          <Text variant="small" tone="muted" className="flex-1">Tip amount</Text>
          <Text variant="bodyStrong">{fmt(out.tip)}</Text>
        </View>
        <View className="flex-row items-center py-2.5 border-b-hairline border-border dark:border-border-dark">
          <Text variant="small" tone="muted" className="flex-1">Grand total</Text>
          <Text variant="h3" tone="primary">{fmt(out.total)}</Text>
        </View>
        <View className="flex-row gap-3 pt-2.5">
          <View className="flex-1">
            <Text variant="caption" tone="muted">PER PERSON</Text>
            <Text variant="h2" tone="primary" className="mt-0.5">{fmt(out.perPerson)}</Text>
          </View>
          <View className="flex-1">
            <Text variant="caption" tone="muted">TIP / PERSON</Text>
            <Text variant="h2" className="mt-0.5">{fmt(out.tipPerPerson)}</Text>
          </View>
        </View>
      </Card>

      {/* Round controls */}
      <Card>
        <Text variant="caption" tone="muted">ROUND TIP</Text>
        <View className="flex-row gap-1.5 mt-1.5">
          {(['none', 'up', 'down'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRound(r)}
              className={`flex-1 py-2 items-center rounded-md border-hairline ${round === r ? 'bg-primary-soft border-primary dark:bg-primary-softDark' : 'bg-muted border-border dark:bg-muted-dark dark:border-border-dark'}`}
            >
              <Text variant="small" tone={round === r ? 'primary' : 'muted'} className="font-bold">
                {r === 'none' ? 'Exact' : r === 'up' ? 'Round up' : 'Round down'}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Tip breakdown table for quick comparison */}
      {parseFloat(bill) > 0 ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">{`AT ${tipPct}% · ${people} ${parseInt(people) === 1 ? 'PERSON' : 'PEOPLE'}`}</Text>
          <View className="mt-2 gap-1">
            {[5, 10, 15, 18, 20, 25].map((pct) => {
              const b = parseFloat(bill);
              const t = (b * pct) / 100;
              const p = Math.max(parseInt(people) || 1, 1);
              return (
                <View key={pct} className="flex-row">
                  <Text variant="small" className="w-12">{pct}%</Text>
                  <Text variant="small" tone="muted" className="flex-1">tip {fmt(t)}</Text>
                  <Text variant="small" tone="primary">{fmt((b + t) / p)}/pp</Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </View>
  );
}
