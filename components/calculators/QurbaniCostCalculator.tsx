import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { Picker } from '@/components/ui/Picker';

export function QurbaniCostCalculator() {
  const [animal, setAnimal] = useState('cow');
  const [price, setPrice] = useState('200000');
  const [shares, setShares] = useState('7');
  const [butcher, setButcher] = useState('5000');

  const out = useMemo(() => {
    const p = parseFloat(price);
    const s = parseInt(shares);
    const b = parseFloat(butcher);
    if (![p, s, b].every(isFinite) || s <= 0) return null;
    const total = p + b;
    return { total, perShare: total / s };
  }, [price, shares, butcher]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Picker
            label="Animal"
            value={animal}
            onChange={setAnimal}
            options={[
              { label: 'Goat / Sheep (1 share)', value: 'goat' },
              { label: 'Cow (7 shares)', value: 'cow' },
              { label: 'Camel (7 shares)', value: 'camel' },
            ]}
          />
          <Input label="Animal price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <Input label="Shares (1 for goat/sheep, 7 for cow/camel)" value={shares} onChangeText={setShares} keyboardType="numeric" />
          <Input label="Butcher / handling fees" value={butcher} onChangeText={setButcher} keyboardType="decimal-pad" />
        </View>
      </Card>

      <ResultDisplay label="Cost per share" value={out ? fmt(out.perShare) : '—'} sub={out ? `Total: ${fmt(out.total)}` : undefined} />
    </View>
  );
}
