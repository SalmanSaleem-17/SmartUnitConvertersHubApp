import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

const SILVER_GRAMS_PER_DIRHAM = 2.975; // common contemporary derivation

export function MahrCalculator() {
  const [silverPriceGram, setSilverPriceGram] = useState('300');
  const [dirhams, setDirhams] = useState('400');

  const out = useMemo(() => {
    const price = parseFloat(silverPriceGram);
    const d = parseFloat(dirhams);
    if (!isFinite(price) || !isFinite(d)) return null;
    const grams = d * SILVER_GRAMS_PER_DIRHAM;
    return { grams, total: grams * price };
  }, [silverPriceGram, dirhams]);

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <Text variant="bodyStrong">Mahr-i-Fatimi</Text>
        <Text variant="small" tone="muted" style={{ marginTop: 4, marginBottom: 12 }}>
          A traditional reference value: 400 silver dirhams ≈ 1,190 g of silver. Adjust for your local market.
        </Text>
        <View style={{ gap: 10 }}>
          <Input label="Dirhams" value={dirhams} onChangeText={setDirhams} keyboardType="decimal-pad" />
          <Input label="Silver price per gram (local currency)" value={silverPriceGram} onChangeText={setSilverPriceGram} keyboardType="decimal-pad" />
        </View>
      </Card>

      <ResultDisplay
        label="Mahr value"
        value={out ? out.total.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
        sub={out ? `${out.grams.toFixed(2)} g of silver` : undefined}
      />
    </View>
  );
}
