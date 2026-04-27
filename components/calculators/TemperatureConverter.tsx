import React, { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

function toCelsius(v: number, unit: string) {
  if (unit === 'C') return v;
  if (unit === 'F') return ((v - 32) * 5) / 9;
  if (unit === 'K') return v - 273.15;
  return v;
}
function fromCelsius(c: number, unit: string) {
  if (unit === 'C') return c;
  if (unit === 'F') return (c * 9) / 5 + 32;
  if (unit === 'K') return c + 273.15;
  return c;
}

export function TemperatureConverter() {
  const [value, setValue] = useState('25');
  const [from, setFrom] = useState('C');
  const num = parseFloat(value);

  const c = isFinite(num) ? toCelsius(num, from) : null;
  const fmt = (n: number | null) =>
    n === null || !isFinite(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const opts = [
    { label: 'Celsius (°C)', value: 'C' },
    { label: 'Fahrenheit (°F)', value: 'F' },
    { label: 'Kelvin (K)', value: 'K' },
  ];

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Input
            label="Temperature"
            value={value}
            onChangeText={setValue}
            keyboardType="numbers-and-punctuation"
            placeholder="25"
          />
          <Picker label="From unit" value={from} onChange={setFrom} options={opts} />
        </View>
      </Card>

      <ResultDisplay
        label="Celsius"
        value={`${fmt(c)} °C`}
        sub={c === null ? undefined : 'Equivalent in °C'}
      />
      <ResultDisplay
        label="Fahrenheit"
        emphasize={false}
        value={`${fmt(c === null ? null : fromCelsius(c, 'F'))} °F`}
      />
      <ResultDisplay
        label="Kelvin"
        emphasize={false}
        value={`${fmt(c === null ? null : fromCelsius(c, 'K'))} K`}
      />
    </View>
  );
}
