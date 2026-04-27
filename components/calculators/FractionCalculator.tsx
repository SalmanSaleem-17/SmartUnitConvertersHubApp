import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { cn } from '@/lib/cn';

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function simplify(n: number, d: number): [number, number] {
  if (d === 0) return [n, d];
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n / g, d / g];
}

export function FractionCalculator() {
  const [n1, setN1] = useState('1');
  const [d1, setD1] = useState('2');
  const [n2, setN2] = useState('1');
  const [d2, setD2] = useState('3');
  const [op, setOp] = useState<'+' | '-' | '×' | '÷'>('+');

  const out = useMemo(() => {
    const a = parseInt(n1); const b = parseInt(d1);
    const e = parseInt(n2); const f = parseInt(d2);
    if ([a, b, e, f].some((x) => !isFinite(x))) return null;
    if (b === 0 || f === 0) return null;
    let num = 0, den = 1;
    if (op === '+') { num = a * f + e * b; den = b * f; }
    if (op === '-') { num = a * f - e * b; den = b * f; }
    if (op === '×') { num = a * e; den = b * f; }
    if (op === '÷') { num = a * f; den = b * e; }
    if (den === 0) return null;
    const [n, d] = simplify(num, den);
    return { n, d, decimal: n / d };
  }, [n1, d1, n2, d2, op]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Input label="Numerator A" value={n1} onChangeText={setN1} keyboardType="numeric" />
              <Input label="Denominator A" value={d1} onChangeText={setD1} keyboardType="numeric" />
            </View>
            <View className="flex-1 gap-2">
              <Input label="Numerator B" value={n2} onChangeText={setN2} keyboardType="numeric" />
              <Input label="Denominator B" value={d2} onChangeText={setD2} keyboardType="numeric" />
            </View>
          </View>
          <View className="flex-row rounded-md p-1 bg-muted dark:bg-muted-dark">
            {(['+', '-', '×', '÷'] as const).map((o) => (
              <Pressable
                key={o}
                onPress={() => setOp(o)}
                className={cn('flex-1 py-3 items-center rounded-sm active:opacity-90', op === o && 'bg-surface dark:bg-surface-dark')}
              >
                <Text variant="h3" tone={op === o ? 'primary' : 'muted'}>{o}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      <ResultDisplay
        label="Result"
        value={out ? `${out.n}/${out.d}` : '—'}
        sub={out ? `Decimal: ${out.decimal.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : undefined}
      />
    </View>
  );
}
