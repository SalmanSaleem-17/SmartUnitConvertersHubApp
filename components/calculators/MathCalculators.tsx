import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function AverageCalculator() {
  const [v, setV] = useState('10, 20, 30, 40');
  const out = useMemo(() => {
    const xs = v.split(/[\s,]+/).map(Number).filter((x) => isFinite(x));
    if (xs.length === 0) return null;
    const sum = xs.reduce((a, b) => a + b, 0);
    const sorted = [...xs].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];
    return { mean: sum / xs.length, sum, count: xs.length, min: Math.min(...xs), max: Math.max(...xs), median };
  }, [v]);

  return (
    <View className="gap-3">
      <Card>
        <Input label="Values (comma or space separated)" value={v} onChangeText={setV} multiline />
      </Card>
      <ResultDisplay label="Average (mean)" value={out ? out.mean.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'} sub={out ? `${out.count} values · sum ${out.sum.toLocaleString()}` : undefined} />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">MIN</Text><Text variant="h3">{out.min}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">MEDIAN</Text><Text variant="h3">{out.median}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">MAX</Text><Text variant="h3">{out.max}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

export function LcmGcdCalculator() {
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const out = useMemo(() => {
    const x = parseInt(a); const y = parseInt(b);
    if (!isFinite(x) || !isFinite(y) || x === 0 || y === 0) return null;
    const g = gcd(x, y);
    return { gcd: g, lcm: Math.abs(x * y) / g };
  }, [a, b]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Number A" value={a} onChangeText={setA} keyboardType="numeric" />
          <Input label="Number B" value={b} onChangeText={setB} keyboardType="numeric" />
        </View>
      </Card>
      <ResultDisplay label="GCD" value={out ? String(out.gcd) : '—'} />
      <ResultDisplay label="LCM" emphasize={false} value={out ? String(out.lcm) : '—'} />
    </View>
  );
}

export function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const out = useMemo(() => {
    const b = parseFloat(base); const e = parseFloat(exp);
    if (!isFinite(b) || !isFinite(e)) return null;
    return Math.pow(b, e);
  }, [base, exp]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Base" value={base} onChangeText={setBase} keyboardType="decimal-pad" />
          <Input label="Exponent" value={exp} onChangeText={setExp} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label={`${base}^${exp}`} value={out === null || !isFinite(out) ? '—' : out.toLocaleString(undefined, { maximumFractionDigits: 6 })} />
    </View>
  );
}

export function SquareRootCalculator() {
  const [v, setV] = useState('625');
  const n = parseFloat(v);
  const sqrt = isFinite(n) && n >= 0 ? Math.sqrt(n) : null;
  const cbrt = isFinite(n) ? Math.cbrt(n) : null;
  return (
    <View className="gap-3">
      <Card>
        <Input label="Number" value={v} onChangeText={setV} keyboardType="decimal-pad" />
      </Card>
      <ResultDisplay label="√n" value={sqrt === null ? '—' : sqrt.toLocaleString(undefined, { maximumFractionDigits: 6 })} />
      <ResultDisplay label="∛n" emphasize={false} value={cbrt === null ? '—' : cbrt.toLocaleString(undefined, { maximumFractionDigits: 6 })} />
    </View>
  );
}

export function PrimeChecker() {
  const [v, setV] = useState('29');
  const out = useMemo(() => {
    const n = parseInt(v);
    if (!isFinite(n) || n < 2) return null;
    if (n === 2) return { prime: true, factor: null as number | null };
    if (n % 2 === 0) return { prime: false, factor: 2 };
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return { prime: false, factor: i };
    }
    return { prime: true, factor: null as number | null };
  }, [v]);
  return (
    <View className="gap-3">
      <Card>
        <Input label="Number" value={v} onChangeText={setV} keyboardType="numeric" />
      </Card>
      <ResultDisplay
        label="Prime?"
        value={out === null ? '—' : out.prime ? 'YES, prime ✓' : 'No'}
        sub={out && !out.prime && out.factor ? `Smallest factor: ${out.factor}` : undefined}
      />
    </View>
  );
}

export function LogarithmCalculator() {
  const [v, setV] = useState('1000');
  const [base, setBase] = useState('10');
  const out = useMemo(() => {
    const x = parseFloat(v); const b = parseFloat(base);
    if (!(isFinite(x) && isFinite(b) && x > 0 && b > 0 && b !== 1)) return null;
    return Math.log(x) / Math.log(b);
  }, [v, base]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Value" value={v} onChangeText={setV} keyboardType="decimal-pad" />
          <Input label="Base" value={base} onChangeText={setBase} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label={`log_${base}(${v})`} value={out === null ? '—' : out.toLocaleString(undefined, { maximumFractionDigits: 6 })} />
    </View>
  );
}

export function RatioCalculator() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [c, setC] = useState('15');
  const out = useMemo(() => {
    const x = parseFloat(a); const y = parseFloat(b); const z = parseFloat(c);
    if (!(isFinite(x) && isFinite(y) && isFinite(z)) || x === 0) return null;
    return (z * y) / x;
  }, [a, b, c]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="A" value={a} onChangeText={setA} keyboardType="decimal-pad" />
          <Input label="B" value={b} onChangeText={setB} keyboardType="decimal-pad" />
          <Input label="C" value={c} onChangeText={setC} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="D (A:B = C:D)" value={out === null ? '—' : out.toLocaleString(undefined, { maximumFractionDigits: 4 })} />
    </View>
  );
}
