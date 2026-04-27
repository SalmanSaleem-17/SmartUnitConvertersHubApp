import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

type Mode = 'of' | 'isWhat' | 'change';

export function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('20');
  const [b, setB] = useState('150');

  const out = useMemo(() => {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (!isFinite(x) || !isFinite(y)) return null;
    if (mode === 'of') return (x / 100) * y;
    if (mode === 'isWhat') return y === 0 ? null : (x / y) * 100;
    if (mode === 'change') return x === 0 ? null : ((y - x) / x) * 100;
    return null;
  }, [mode, a, b]);

  const labelA = mode === 'of' ? 'Percentage' : mode === 'isWhat' ? 'Value' : 'Original value';
  const labelB = mode === 'of' ? 'Of value' : mode === 'isWhat' ? 'Total' : 'New value';
  const resultLabel =
    mode === 'of'
      ? `${a}% of ${b} =`
      : mode === 'isWhat'
        ? `${a} is what % of ${b}?`
        : `Change from ${a} to ${b}`;
  const suffix = mode === 'of' ? '' : '%';

  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: '% of', value: 'of' },
            { label: 'Is what %', value: 'isWhat' },
            { label: '% change', value: 'change' },
          ]}
        />
        <View className="gap-3 mt-3.5">
          <Input label={labelA} value={a} onChangeText={setA} keyboardType="decimal-pad" />
          <Input label={labelB} value={b} onChangeText={setB} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="RESULT"
        value={out === null ? '—' : `${out.toLocaleString(undefined, { maximumFractionDigits: 4 })}${suffix}`}
        sub={resultLabel}
      />
    </View>
  );
}
