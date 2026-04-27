import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

const ACTIVITY = [
  { name: 'Sedentary',  desc: 'Little / no exercise',     mult: 1.2 },
  { name: 'Light',      desc: '1–3 days / week',          mult: 1.375 },
  { name: 'Moderate',   desc: '3–5 days / week',          mult: 1.55 },
  { name: 'Active',     desc: '6–7 days / week',          mult: 1.725 },
  { name: 'Very Active',desc: 'Athlete level',            mult: 1.9 },
];

const FORMULAS = [
  { label: 'Mifflin–St Jeor (modern)', value: 'mifflin' },
  { label: 'Harris–Benedict (1919)',   value: 'harris' },
  { label: 'Katch–McArdle (with body-fat %)', value: 'katch' },
];

export function BmrCalculator() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [bodyFat, setBodyFat] = useState('20');
  const [formula, setFormula] = useState('mifflin');

  const out = useMemo(() => {
    const w = parseFloat(weight); const h = parseFloat(height); const a = parseFloat(age);
    if (![w, h, a].every((x) => isFinite(x) && x > 0)) return null;
    let bmr = 0;
    let formulaText = '';
    if (formula === 'mifflin') {
      bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'male' ? 5 : -161);
      formulaText = `BMR = 10 × ${w} + 6.25 × ${h} − 5 × ${a} ${sex === 'male' ? '+ 5' : '− 161'} = ${bmr.toFixed(0)}`;
    } else if (formula === 'harris') {
      bmr = sex === 'male'
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
      formulaText = sex === 'male'
        ? `BMR = 88.362 + 13.397 × ${w} + 4.799 × ${h} − 5.677 × ${a} = ${bmr.toFixed(0)}`
        : `BMR = 447.593 + 9.247 × ${w} + 3.098 × ${h} − 4.330 × ${a} = ${bmr.toFixed(0)}`;
    } else {
      const bf = parseFloat(bodyFat);
      if (!isFinite(bf) || bf < 0 || bf > 70) return null;
      const lbm = w * (1 - bf / 100);
      bmr = 370 + 21.6 * lbm;
      formulaText = `LBM = ${w} × (1 − ${bf}/100) = ${lbm.toFixed(2)} kg\nBMR = 370 + 21.6 × ${lbm.toFixed(2)} = ${bmr.toFixed(0)}`;
    }
    return { bmr, formulaText };
  }, [sex, age, weight, height, formula, bodyFat]);

  return (
    <View className="gap-2.5">
      <Card>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Text variant="caption" tone="muted" className="mb-1">SEX</Text>
            <SegmentedControl
              value={sex}
              onChange={setSex}
              options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
            />
          </View>
          <View className="flex-1"><Input label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" /></View>
        </View>
        <View className="flex-row gap-2 mt-2.5">
          <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
          <View className="flex-1"><Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /></View>
        </View>
        <View className="mt-2.5">
          <Picker label="Formula" value={formula} onChange={setFormula} options={FORMULAS} />
        </View>
        {formula === 'katch' ? (
          <View className="mt-2.5">
            <Input label="Body fat %" value={bodyFat} onChangeText={setBodyFat} keyboardType="decimal-pad" hint="Required for Katch–McArdle" />
          </View>
        ) : null}
      </Card>

      <ResultDisplay
        label="BMR · calories at rest / day"
        value={out === null ? '—' : Math.round(out.bmr).toLocaleString()}
        sub={out === null ? undefined : 'Multiply by activity factor for daily calorie needs (TDEE)'}
      />

      {out ? (
        <Card>
          <Text variant="bodyStrong">TDEE by activity</Text>
          <View className="gap-1.5 mt-2">
            {ACTIVITY.map((a) => (
              <View key={a.name} className="flex-row items-center">
                <View className="flex-1">
                  <Text variant="bodyStrong">{a.name}</Text>
                  <Text variant="caption" tone="muted">{a.desc} · ×{a.mult}</Text>
                </View>
                <Text variant="bodyStrong" tone="primary">
                  {Math.round(out.bmr * a.mult).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {out ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">FORMULA</Text>
          <Text variant="small" tone="muted" className="mt-1">{out.formulaText}</Text>
        </Card>
      ) : null}
    </View>
  );
}
