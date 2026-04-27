import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

const WEIGHT = [
  { label: 'Kilograms (kg)', value: 'kg', toKg: 1 },
  { label: 'Pounds (lb)',    value: 'lb', toKg: 0.453592 },
  { label: 'Stones (st)',    value: 'st', toKg: 6.35029 },
];
const LENGTH = [
  { label: 'Centimeters (cm)', value: 'cm' },
  { label: 'Meters (m)',       value: 'm' },
  { label: 'Feet + Inches',    value: 'ft+in' },
  { label: 'Inches (in)',      value: 'in' },
];

function categoryFor(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warning' as const, tip: 'Below normal weight range — consider a balanced gain plan.' };
  if (bmi < 25)   return { label: 'Normal weight', tone: 'success' as const, tip: 'Healthy range — maintain through balanced diet and exercise.' };
  if (bmi < 30)   return { label: 'Overweight', tone: 'warning' as const, tip: 'Above the healthy range — small changes can shift your category.' };
  return { label: 'Obesity', tone: 'danger' as const, tip: 'Substantially elevated risk — consult a healthcare professional.' };
}

export function BmiCalculator() {
  const [weight, setWeight] = useState('70');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('170');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [extraInches, setExtraInches] = useState('7');

  const out = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!isFinite(w) || w <= 0) return null;

    // weight → kg
    const wKg = w * (WEIGHT.find((u) => u.value === weightUnit)?.toKg ?? 1);

    // height → meters
    let hM = 0;
    if (heightUnit === 'cm') hM = h / 100;
    else if (heightUnit === 'm') hM = h;
    else if (heightUnit === 'in') hM = h * 0.0254;
    else if (heightUnit === 'ft+in') {
      const inches = h * 12 + (parseFloat(extraInches) || 0);
      hM = inches * 0.0254;
    }
    if (!isFinite(hM) || hM <= 0) return null;

    const bmi = wKg / (hM * hM);
    const cat = categoryFor(bmi);

    // Calculation steps (mirror website)
    const steps: string[] = [];
    if (weightUnit === 'kg') steps.push(`Weight = ${w} kg`);
    else steps.push(`Weight = ${w} ${weightUnit} → ${wKg.toFixed(3)} kg`);

    if (heightUnit === 'ft+in') steps.push(`Height = ${h} ft ${parseFloat(extraInches) || 0} in → ${hM.toFixed(3)} m`);
    else if (heightUnit === 'm') steps.push(`Height = ${h} m`);
    else steps.push(`Height = ${h} ${heightUnit} → ${hM.toFixed(3)} m`);

    steps.push(`BMI = ${wKg.toFixed(2)} ÷ ${hM.toFixed(3)}² = ${wKg.toFixed(2)} ÷ ${(hM * hM).toFixed(4)} = ${bmi.toFixed(2)}`);
    return { wKg, hM, bmi, cat, steps };
  }, [weight, weightUnit, height, heightUnit, extraInches]);

  return (
    <View className="gap-2.5">
      <Card>
        <Text variant="caption" tone="muted">WEIGHT</Text>
        <View className="flex-row gap-2 mt-1">
          <View className="flex-[2]"><Input value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" /></View>
          <View className="flex-1"><Picker value={weightUnit} onChange={setWeightUnit} options={WEIGHT} /></View>
        </View>

        <Text variant="caption" tone="muted" className="mt-3">HEIGHT</Text>
        {heightUnit === 'ft+in' ? (
          <View className="flex-row gap-2 mt-1">
            <View className="flex-1"><Input value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="ft" /></View>
            <View className="flex-1"><Input value={extraInches} onChangeText={setExtraInches} keyboardType="decimal-pad" placeholder="in" /></View>
            <View className="flex-1"><Picker value={heightUnit} onChange={setHeightUnit} options={LENGTH} /></View>
          </View>
        ) : (
          <View className="flex-row gap-2 mt-1">
            <View className="flex-[2]"><Input value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" /></View>
            <View className="flex-1"><Picker value={heightUnit} onChange={setHeightUnit} options={LENGTH} /></View>
          </View>
        )}
      </Card>

      <ResultDisplay
        label="BMI"
        value={out === null ? '—' : out.bmi.toFixed(1)}
        sub={out?.cat.label}
      />

      {out ? (
        <Card variant="subtle">
          <View className="flex-row items-center">
            <View className={`w-2.5 h-2.5 rounded-pill mr-2 bg-${out.cat.tone}`} />
            <Text variant="bodyStrong" tone={out.cat.tone}>{out.cat.label}</Text>
          </View>
          <Text variant="small" tone="muted" className="mt-1">{out.cat.tip}</Text>
          <Text variant="caption" tone="muted" className="mt-2">
            WHO ranges: &lt;18.5 underweight · 18.5–24.9 normal · 25–29.9 overweight · ≥30 obesity
          </Text>
        </Card>
      ) : null}

      {out ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">CALCULATION</Text>
          <View className="mt-1.5 gap-1">
            {out.steps.map((s, i) => (
              <Text key={i} variant="small" tone="muted">{s}</Text>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
}
