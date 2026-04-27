import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

export function DiscountCalculator() {
  const [price, setPrice] = useState('2500');
  const [pct, setPct] = useState('20');

  const out = useMemo(() => {
    const p = parseFloat(price);
    const d = parseFloat(pct);
    if (!isFinite(p) || !isFinite(d)) return null;
    const save = (p * d) / 100;
    return { save, final: p - save };
  }, [price, pct]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Original price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" icon="pricetag" />
          <Input label="Discount %" value={pct} onChangeText={setPct} keyboardType="decimal-pad" icon="trending-down" />
        </View>
      </Card>

      <ResultDisplay label="Final price" value={out ? fmt(out.final) : '—'} sub={out ? `You save ${fmt(out.save)}` : undefined} />
    </View>
  );
}
