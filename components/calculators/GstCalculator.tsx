import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export function GstCalculator() {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('17');

  const out = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (!isFinite(a) || !isFinite(r)) return null;
    if (mode === 'add') {
      const tax = (a * r) / 100;
      return { net: a, tax, total: a + tax };
    } else {
      const net = (a * 100) / (100 + r);
      return { net, tax: a - net, total: a };
    }
  }, [mode, amount, rate]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Add GST', value: 'add' },
            { label: 'Remove GST', value: 'remove' },
          ]}
        />
        <View className="gap-3 mt-3.5">
          <Input label={mode === 'add' ? 'Net amount' : 'Gross amount'} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" icon="cash" />
          <Input label="GST / tax rate %" value={rate} onChangeText={setRate} keyboardType="decimal-pad" icon="pricetag" />
        </View>
      </Card>

      <ResultDisplay
        label={mode === 'add' ? 'Total payable' : 'Net amount'}
        value={out ? fmt(mode === 'add' ? out.total : out.net) : '—'}
        sub={out ? `Tax amount: ${fmt(out.tax)}` : undefined}
      />
    </View>
  );
}
