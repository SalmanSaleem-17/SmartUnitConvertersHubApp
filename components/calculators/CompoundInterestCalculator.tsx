import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

export function CompoundInterestCalculator() {
  const [principal, setP] = useState('100000');
  const [rate, setR] = useState('10');
  const [years, setY] = useState('5');
  const [compound, setC] = useState('12'); // monthly default

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const out = useMemo(() => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);
    const n = parseFloat(compound);
    if (![P, r, t, n].every((x) => isFinite(x) && x > 0)) return null;
    const A = P * Math.pow(1 + r / n, n * t);
    return { final: A, interest: A - P };
  }, [principal, rate, years, compound]);

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Principal" value={principal} onChangeText={setP} keyboardType="decimal-pad" icon="cash" />
          <Input label="Annual rate (%)" value={rate} onChangeText={setR} keyboardType="decimal-pad" icon="trending-up" />
          <Input label="Years" value={years} onChangeText={setY} keyboardType="decimal-pad" icon="calendar" />
          <Picker
            label="Compounded"
            value={compound}
            onChange={setC}
            options={[
              { label: 'Annually', value: '1' },
              { label: 'Semi-annually', value: '2' },
              { label: 'Quarterly', value: '4' },
              { label: 'Monthly', value: '12' },
              { label: 'Daily', value: '365' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay label="Final amount" value={out ? fmt(out.final) : '—'} sub={out ? `Interest earned: ${fmt(out.interest)}` : undefined} />
    </View>
  );
}
