import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export function BodyFatCalculator() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('170');
  const [neck, setNeck] = useState('38');
  const [waist, setWaist] = useState('85');
  const [hip, setHip] = useState('95');

  const bf = useMemo(() => {
    const h = parseFloat(height);
    const n = parseFloat(neck);
    const w = parseFloat(waist);
    const hp = parseFloat(hip);
    if (sex === 'male') {
      if (![h, n, w].every((x) => isFinite(x) && x > 0)) return null;
      if (w - n <= 0) return null;
      return 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      if (![h, n, w, hp].every((x) => isFinite(x) && x > 0)) return null;
      if (w + hp - n <= 0) return null;
      return 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.221 * Math.log10(h)) - 450;
    }
  }, [sex, height, neck, waist, hip]);

  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted">SEX</Text>
        <View className="mt-1.5">
          <SegmentedControl
            value={sex}
            onChange={setSex}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
          />
        </View>
        <View className="gap-3 mt-3.5">
          <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
          <Input label="Neck (cm)" value={neck} onChangeText={setNeck} keyboardType="decimal-pad" />
          <Input label="Waist (cm)" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" />
          {sex === 'female' ? (
            <Input label="Hip (cm)" value={hip} onChangeText={setHip} keyboardType="decimal-pad" />
          ) : null}
        </View>
      </Card>
      <ResultDisplay
        label="Body Fat %"
        value={bf === null ? '—' : `${bf.toFixed(1)}%`}
        sub="Estimated using the U.S. Navy circumference method."
      />
    </View>
  );
}
