import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtNum(n: number, digits = 2): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

// ---------------------------------------------------------------------------
// 1. DecisionWheel
// ---------------------------------------------------------------------------
export function DecisionWheel() {
  const [raw, setRaw] = useState('Pizza, Burger, Sushi, Tacos, Salad');
  const [picked, setPicked] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const options = useMemo(
    () =>
      raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [raw],
  );

  function spin() {
    if (options.length === 0 || spinning) return;
    setSpinning(true);
    setPicked(null);
    setTimeout(() => {
      const choice = options[Math.floor(Math.random() * options.length)];
      setPicked(choice);
      setSpinning(false);
    }, 800);
  }

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input
            label="Options (comma-separated)"
            value={raw}
            onChangeText={setRaw}
            placeholder="Option A, Option B, Option C"
          />
          <Button
            title={spinning ? 'Spinning…' : 'Spin'}
            icon="refresh"
            onPress={spin}
            disabled={spinning || options.length === 0}
            fullWidth
          />
        </View>
      </Card>
      <ResultDisplay
        label="Picked"
        value={picked ?? (spinning ? '…' : '—')}
        sub={`${options.length} option${options.length === 1 ? '' : 's'}`}
      />
      {options.length > 0 ? (
        <Card>
          <Text variant="bodyStrong" className="mb-2">All options</Text>
          {options.map((opt, idx) => {
            const active = picked === opt;
            return (
              <View
                key={`${opt}-${idx}`}
                className="flex-row items-center justify-between py-1.5"
              >
                <Text
                  variant={active ? 'bodyStrong' : 'body'}
                  tone={active ? 'primary' : 'default'}
                  className="flex-1"
                >
                  {active ? '▶  ' : ''}
                  {opt}
                </Text>
                {active ? (
                  <Text variant="small" tone="primary">PICKED</Text>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2. BirthdayParadoxCalculator
// ---------------------------------------------------------------------------
export function BirthdayParadoxCalculator() {
  const [people, setPeople] = useState('23');

  const out = useMemo(() => {
    const n = parseInt(people, 10);
    if (!isFinite(n) || n < 1 || n > 365) return null;
    let p = 1;
    for (let i = 0; i < n; i++) p *= (365 - i) / 365;
    return { n, prob: 1 - p };
  }, [people]);

  const interpretation = (() => {
    if (!out) return undefined;
    const pct = out.prob * 100;
    if (pct < 10) return 'Very unlikely two share a birthday.';
    if (pct < 50) return 'Some chance of a shared birthday — but more likely not.';
    if (pct < 90) return 'A coin-flip or better — surprisingly common!';
    return 'Almost certain that at least two share a birthday.';
  })();

  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Number of people (1-365)"
          value={people}
          onChangeText={setPeople}
          keyboardType="numeric"
        />
      </Card>
      <ResultDisplay
        label="Probability of a shared birthday"
        value={out ? `${(out.prob * 100).toFixed(4)}%` : '—'}
        sub={interpretation}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. AgeOnPlanetsCalculator
// ---------------------------------------------------------------------------
const PLANETS: { name: string; period: number; symbol: string }[] = [
  { name: 'Mercury', period: 0.2408, symbol: '☿' },
  { name: 'Venus', period: 0.6152, symbol: '♀' },
  { name: 'Earth', period: 1, symbol: '⊕' },
  { name: 'Mars', period: 1.881, symbol: '♂' },
  { name: 'Jupiter', period: 11.862, symbol: '♃' },
  { name: 'Saturn', period: 29.457, symbol: '♄' },
  { name: 'Uranus', period: 84.016, symbol: '♅' },
  { name: 'Neptune', period: 164.79, symbol: '♆' },
];

export function AgeOnPlanetsCalculator() {
  const [date, setDate] = useState('2000-01-01');

  const out = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const d = new Date(date + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return null;
    const earthYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return { earthYears };
  }, [date]);

  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Date of birth (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          icon="calendar"
          autoCapitalize="none"
        />
      </Card>
      <ResultDisplay
        label="Earth age"
        value={out ? `${fmtNum(out.earthYears, 2)} years` : '—'}
      />
      <View className="flex-row flex-wrap -m-1.5">
        {PLANETS.map((p) => {
          const planetAge = out ? out.earthYears / p.period : null;
          return (
            <View key={p.name} className="w-1/2 p-1.5">
              <Card>
                <Text variant="caption" tone="muted">
                  {p.symbol}  {p.name.toUpperCase()}
                </Text>
                <Text
                  variant="h3"
                  tone="primary"
                  className="mt-1"
                >
                  {planetAge === null ? '—' : `${fmtNum(planetAge, 2)}`}
                </Text>
                <Text variant="small" tone="muted">years</Text>
              </Card>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4. CatAgeCalculator
// ---------------------------------------------------------------------------
export function CatAgeCalculator() {
  const [age, setAge] = useState('3');

  const out = useMemo(() => {
    const a = parseFloat(age);
    if (!isFinite(a) || a < 0) return null;
    let human = 0;
    if (a <= 1) human = 15 * a;
    else if (a <= 2) human = 15 + 9 * (a - 1);
    else human = 24 + 4 * (a - 2);
    return human;
  }, [age]);

  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Cat age (years)"
          value={age}
          onChangeText={setAge}
          keyboardType="decimal-pad"
        />
      </Card>
      <ResultDisplay
        label="Human-equivalent age"
        value={out === null ? '—' : `${fmtNum(out, 1)} years`}
        sub="Year 1 = 15, year 2 = +9, then +4 per year"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 5. DogAgeCalculator
// ---------------------------------------------------------------------------
type DogSize = 'small' | 'medium' | 'large' | 'giant';

export function DogAgeCalculator() {
  const [age, setAge] = useState('3');
  const [size, setSize] = useState<DogSize>('medium');

  const out = useMemo(() => {
    const a = parseFloat(age);
    if (!isFinite(a) || a < 0) return null;
    let human = 0;
    if (size === 'small' || size === 'medium') {
      if (a <= 2) human = 12 * a;
      else human = 24 + 4 * (a - 2);
    } else if (size === 'large') {
      if (a <= 2) human = 9 * a;
      else human = 18 + 5 * (a - 2);
    } else {
      // giant
      if (a <= 2) human = 7 * a;
      else human = 14 + 7 * (a - 2);
    }
    return human;
  }, [age, size]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input
            label="Dog age (years)"
            value={age}
            onChangeText={setAge}
            keyboardType="decimal-pad"
          />
          <View>
            <Text variant="caption" tone="muted">SIZE</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={size}
                onChange={setSize}
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' },
                  { label: 'Giant', value: 'giant' },
                ]}
              />
            </View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Human-equivalent age"
        value={out === null ? '—' : `${fmtNum(out, 1)} years`}
        sub="AAHA-style approximation by breed size"
      />
    </View>
  );
}
