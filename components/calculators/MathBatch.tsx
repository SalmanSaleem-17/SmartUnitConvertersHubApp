import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';

const fmt = (n: number, d = 6) =>
  !isFinite(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: d });

function parseList(v: string): number[] {
  return v
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((x) => isFinite(x));
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// 1. QuadraticSolver -----------------------------------------------------
export function QuadraticSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const out = useMemo(() => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    if (!isFinite(A) || !isFinite(B) || !isFinite(C) || A === 0) return null;
    const D = B * B - 4 * A * C;
    const vx = -B / (2 * A);
    const vy = C - (B * B) / (4 * A);
    const axis = vx;
    if (D >= 0) {
      const sq = Math.sqrt(D);
      return {
        D,
        roots: `x₁ = ${fmt((-B + sq) / (2 * A))},  x₂ = ${fmt((-B - sq) / (2 * A))}`,
        vertex: `(${fmt(vx)}, ${fmt(vy)})`,
        axis,
      };
    }
    const real = -B / (2 * A);
    const imag = Math.sqrt(-D) / (2 * A);
    return {
      D,
      roots: `${fmt(real)} ± ${fmt(imag)}i`,
      vertex: `(${fmt(vx)}, ${fmt(vy)})`,
      axis,
    };
  }, [a, b, c]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="a" value={a} onChangeText={setA} keyboardType="numbers-and-punctuation" />
          <Input label="b" value={b} onChangeText={setB} keyboardType="numbers-and-punctuation" />
          <Input label="c" value={c} onChangeText={setC} keyboardType="numbers-and-punctuation" />
        </View>
      </Card>
      <ResultDisplay
        label="Roots"
        value={out ? out.roots : '—'}
        sub={out ? `Discriminant D = ${fmt(out.D)}` : 'Provide a, b, c (a ≠ 0)'}
      />
      {out ? (
        <Card variant="subtle">
          <View className="gap-2">
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text variant="caption" tone="muted">VERTEX</Text>
                <Text variant="h3">{out.vertex}</Text>
              </View>
              <View className="flex-1">
                <Text variant="caption" tone="muted">AXIS OF SYMMETRY</Text>
                <Text variant="h3">x = {fmt(out.axis)}</Text>
              </View>
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 2. TriangleSolver ------------------------------------------------------
export function TriangleSolver() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [c, setC] = useState('5');
  const out = useMemo(() => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    if (!(A > 0 && B > 0 && C > 0)) return null;
    if (A + B <= C || A + C <= B || B + C <= A) return { invalid: true as const };
    const angA = (Math.acos((B * B + C * C - A * A) / (2 * B * C)) * 180) / Math.PI;
    const angB = (Math.acos((A * A + C * C - B * B) / (2 * A * C)) * 180) / Math.PI;
    const angC = 180 - angA - angB;
    const perim = A + B + C;
    const s = perim / 2;
    const area = Math.sqrt(s * (s - A) * (s - B) * (s - C));
    let shape = 'scalene';
    if (A === B && B === C) shape = 'equilateral';
    else if (A === B || B === C || A === C) shape = 'isosceles';
    const maxAng = Math.max(angA, angB, angC);
    let kind = 'acute';
    if (Math.abs(maxAng - 90) < 1e-6) kind = 'right';
    else if (maxAng > 90) kind = 'obtuse';
    return { invalid: false as const, angA, angB, angC, perim, s, area, shape, kind };
  }, [a, b, c]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Side a" value={a} onChangeText={setA} keyboardType="decimal-pad" />
          <Input label="Side b" value={b} onChangeText={setB} keyboardType="decimal-pad" />
          <Input label="Side c" value={c} onChangeText={setC} keyboardType="decimal-pad" />
        </View>
      </Card>
      {out && out.invalid ? (
        <ResultDisplay label="Triangle" value="Invalid" sub="Triangle inequality fails" emphasize={false} />
      ) : out ? (
        <>
          <ResultDisplay
            label="Area (Heron)"
            value={fmt(out.area)}
            sub={`Perimeter ${fmt(out.perim)} · semi-perimeter ${fmt(out.s)}`}
          />
          <Card variant="subtle">
            <View className="gap-2">
              <Text variant="caption" tone="muted">ANGLES (degrees)</Text>
              <View className="flex-row gap-3">
                <View className="flex-1"><Text variant="caption" tone="muted">A</Text><Text variant="h3">{fmt(out.angA, 3)}°</Text></View>
                <View className="flex-1"><Text variant="caption" tone="muted">B</Text><Text variant="h3">{fmt(out.angB, 3)}°</Text></View>
                <View className="flex-1"><Text variant="caption" tone="muted">C</Text><Text variant="h3">{fmt(out.angC, 3)}°</Text></View>
              </View>
              <Text variant="small" tone="muted">
                Type: {out.shape} · {out.kind}
              </Text>
            </View>
          </Card>
        </>
      ) : (
        <ResultDisplay label="Triangle" value="—" sub="Enter three positive sides" emphasize={false} />
      )}
    </View>
  );
}

// 3. TrigonometryCalculator ---------------------------------------------
export function TrigonometryCalculator() {
  const [angle, setAngle] = useState('30');
  const [unit, setUnit] = useState<'deg' | 'rad'>('deg');
  const out = useMemo(() => {
    const v = parseFloat(angle);
    if (!isFinite(v)) return null;
    const r = unit === 'deg' ? (v * Math.PI) / 180 : v;
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    const tan = Math.tan(r);
    return {
      sin,
      cos,
      tan,
      cot: 1 / tan,
      sec: 1 / cos,
      csc: 1 / sin,
    };
  }, [angle, unit]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Angle" value={angle} onChangeText={setAngle} keyboardType="numbers-and-punctuation" />
          <Picker
            label="Unit"
            value={unit}
            onChange={(v) => setUnit(v as 'deg' | 'rad')}
            options={[
              { label: 'Degrees', value: 'deg' },
              { label: 'Radians', value: 'rad' },
            ]}
          />
        </View>
      </Card>
      <Card variant="subtle">
        <View className="gap-2">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">SIN</Text><Text variant="h3">{out ? fmt(out.sin) : '—'}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">COS</Text><Text variant="h3">{out ? fmt(out.cos) : '—'}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">TAN</Text><Text variant="h3">{out ? fmt(out.tan) : '—'}</Text></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">COT</Text><Text variant="h3">{out ? fmt(out.cot) : '—'}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">SEC</Text><Text variant="h3">{out ? fmt(out.sec) : '—'}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">CSC</Text><Text variant="h3">{out ? fmt(out.csc) : '—'}</Text></View>
          </View>
        </View>
      </Card>
    </View>
  );
}

// 4. PermutationCombinationCalculator -----------------------------------
export function PermutationCombinationCalculator() {
  const [n, setN] = useState('10');
  const [r, setR] = useState('3');
  const out = useMemo(() => {
    const N = parseInt(n);
    const R = parseInt(r);
    if (!isFinite(N) || !isFinite(R)) return null;
    if (N < 0 || R < 0 || R > N || N > 170) return { invalid: true as const };
    const nFact = factorial(N);
    const rFact = factorial(R);
    const nrFact = factorial(N - R);
    return {
      invalid: false as const,
      P: nFact / nrFact,
      C: nFact / (rFact * nrFact),
      nFact,
      rFact,
    };
  }, [n, r]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="n" value={n} onChangeText={setN} keyboardType="numeric" hint="0 ≤ r ≤ n ≤ 170" />
          <Input label="r" value={r} onChangeText={setR} keyboardType="numeric" />
        </View>
      </Card>
      {out && out.invalid ? (
        <ResultDisplay label="Inputs" value="Invalid" sub="Need 0 ≤ r ≤ n ≤ 170" emphasize={false} />
      ) : out ? (
        <>
          <ResultDisplay label={`P(${n}, ${r})`} value={out.P.toLocaleString()} />
          <ResultDisplay label={`C(${n}, ${r})`} value={out.C.toLocaleString()} emphasize={false} />
          <Card variant="subtle">
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">{n}!</Text><Text variant="h3">{out.nFact.toLocaleString()}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">{r}!</Text><Text variant="h3">{out.rFact.toLocaleString()}</Text></View>
            </View>
          </Card>
        </>
      ) : null}
    </View>
  );
}

// 5. SequenceSumsCalculator ---------------------------------------------
export function SequenceSumsCalculator() {
  const [type, setType] = useState<'arithmetic' | 'geometric'>('arithmetic');
  const [a, setA] = useState('1');
  const [d, setD] = useState('2');
  const [n, setN] = useState('10');
  const out = useMemo(() => {
    const A = parseFloat(a);
    const D = parseFloat(d);
    const N = parseInt(n);
    if (!isFinite(A) || !isFinite(D) || !isFinite(N) || N < 1) return null;
    const terms: number[] = [];
    let nth = 0;
    let sum = 0;
    if (type === 'arithmetic') {
      nth = A + (N - 1) * D;
      sum = (N / 2) * (2 * A + (N - 1) * D);
      for (let i = 1; i <= Math.min(N, 8); i++) terms.push(A + (i - 1) * D);
    } else {
      nth = A * Math.pow(D, N - 1);
      sum = D === 1 ? N * A : A * ((1 - Math.pow(D, N)) / (1 - D));
      for (let i = 1; i <= Math.min(N, 8); i++) terms.push(A * Math.pow(D, i - 1));
    }
    return { nth, sum, terms };
  }, [type, a, d, n]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { label: 'Arithmetic', value: 'arithmetic' },
              { label: 'Geometric', value: 'geometric' },
            ]}
          />
          <Input label="First term (a)" value={a} onChangeText={setA} keyboardType="numbers-and-punctuation" />
          <Input
            label={type === 'arithmetic' ? 'Common difference (d)' : 'Common ratio (r)'}
            value={d}
            onChangeText={setD}
            keyboardType="numbers-and-punctuation"
          />
          <Input label="Term count (n)" value={n} onChangeText={setN} keyboardType="numeric" />
        </View>
      </Card>
      <ResultDisplay label="nth term" value={out ? fmt(out.nth) : '—'} />
      <ResultDisplay label="Sum" value={out ? fmt(out.sum) : '—'} emphasize={false} />
      {out ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">FIRST {out.terms.length} TERMS</Text>
          <Text variant="bodyStrong">{out.terms.map((t) => fmt(t, 4)).join(', ')}</Text>
        </Card>
      ) : null}
    </View>
  );
}

// 6. StandardDeviationCalculator ----------------------------------------
export function StandardDeviationCalculator() {
  const [v, setV] = useState('5, 7, 9, 12, 15, 20');
  const [mode, setMode] = useState<'sample' | 'population'>('sample');
  const out = useMemo(() => {
    const xs = parseList(v);
    if (xs.length < 2) return null;
    const sum = xs.reduce((p, q) => p + q, 0);
    const mean = sum / xs.length;
    const sqSum = xs.reduce((p, q) => p + (q - mean) ** 2, 0);
    const denom = mode === 'sample' ? xs.length - 1 : xs.length;
    const variance = denom > 0 ? sqSum / denom : 0;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    return { count: xs.length, sum, mean, variance, stdDev, min, max, range: max - min };
  }, [v, mode]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Values" value={v} onChangeText={setV} multiline hint="Comma or space separated" />
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { label: 'Sample', value: 'sample' },
              { label: 'Population', value: 'population' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Standard Deviation"
        value={out ? fmt(out.stdDev) : '—'}
        sub={out ? `Variance ${fmt(out.variance)}` : 'Need at least 2 values'}
      />
      {out ? (
        <Card variant="subtle">
          <View className="gap-2">
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">COUNT</Text><Text variant="h3">{out.count}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">SUM</Text><Text variant="h3">{fmt(out.sum, 4)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">MEAN</Text><Text variant="h3">{fmt(out.mean, 4)}</Text></View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">MIN</Text><Text variant="h3">{fmt(out.min)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">MAX</Text><Text variant="h3">{fmt(out.max)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">RANGE</Text><Text variant="h3">{fmt(out.range)}</Text></View>
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 7. StatisticsBatchCalculator ------------------------------------------
export function StatisticsBatchCalculator() {
  const [v, setV] = useState('4, 8, 15, 16, 23, 42, 8, 16');
  const out = useMemo(() => {
    const xs = parseList(v);
    if (xs.length === 0) return null;
    const sorted = [...xs].sort((a, b) => a - b);
    const sum = xs.reduce((p, q) => p + q, 0);
    const mean = sum / xs.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    const counts = new Map<number, number>();
    for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
    let mode = xs[0];
    let best = 0;
    counts.forEach((cnt, val) => {
      if (cnt > best) {
        best = cnt;
        mode = val;
      }
    });
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sqSum = xs.reduce((p, q) => p + (q - mean) ** 2, 0);
    const variance = xs.length > 1 ? sqSum / (xs.length - 1) : 0;
    const stdDev = Math.sqrt(variance);
    return { count: xs.length, sum, mean, median, mode, min, max, range: max - min, variance, stdDev, sorted };
  }, [v]);
  return (
    <View className="gap-3">
      <Card>
        <Input label="Dataset" value={v} onChangeText={setV} multiline hint="Comma or space separated values" />
      </Card>
      <ResultDisplay
        label="Mean"
        value={out ? fmt(out.mean, 4) : '—'}
        sub={out ? `${out.count} values · sum ${fmt(out.sum, 4)}` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="gap-2">
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">MEDIAN</Text><Text variant="h3">{fmt(out.median, 4)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">MODE</Text><Text variant="h3">{fmt(out.mode, 4)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">RANGE</Text><Text variant="h3">{fmt(out.range, 4)}</Text></View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">MIN</Text><Text variant="h3">{fmt(out.min)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">MAX</Text><Text variant="h3">{fmt(out.max)}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">σ (sample)</Text><Text variant="h3">{fmt(out.stdDev, 4)}</Text></View>
            </View>
            <Text variant="caption" tone="muted">SORTED</Text>
            <Text variant="small">{out.sorted.join(', ')}</Text>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 8. DistanceMidpointCalculator -----------------------------------------
export function DistanceMidpointCalculator() {
  const [x1, setX1] = useState('0');
  const [y1, setY1] = useState('0');
  const [x2, setX2] = useState('3');
  const [y2, setY2] = useState('4');
  const out = useMemo(() => {
    const X1 = parseFloat(x1);
    const Y1 = parseFloat(y1);
    const X2 = parseFloat(x2);
    const Y2 = parseFloat(y2);
    if (![X1, Y1, X2, Y2].every(isFinite)) return null;
    const distance = Math.sqrt((X2 - X1) ** 2 + (Y2 - Y1) ** 2);
    const mid = `(${fmt((X1 + X2) / 2)}, ${fmt((Y1 + Y2) / 2)})`;
    const slope = X2 === X1 ? 'undefined (vertical)' : fmt((Y2 - Y1) / (X2 - X1));
    return { distance, mid, slope };
  }, [x1, y1, x2, y2]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="x₁" value={x1} onChangeText={setX1} keyboardType="numbers-and-punctuation" /></View>
            <View className="flex-1"><Input label="y₁" value={y1} onChangeText={setY1} keyboardType="numbers-and-punctuation" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="x₂" value={x2} onChangeText={setX2} keyboardType="numbers-and-punctuation" /></View>
            <View className="flex-1"><Input label="y₂" value={y2} onChangeText={setY2} keyboardType="numbers-and-punctuation" /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay label="Distance" value={out ? fmt(out.distance) : '—'} />
      <Card variant="subtle">
        <View className="flex-row gap-3">
          <View className="flex-1"><Text variant="caption" tone="muted">MIDPOINT</Text><Text variant="h3">{out ? out.mid : '—'}</Text></View>
          <View className="flex-1"><Text variant="caption" tone="muted">SLOPE</Text><Text variant="h3">{out ? out.slope : '—'}</Text></View>
        </View>
      </Card>
    </View>
  );
}

// 9. BaseConverter ------------------------------------------------------
export function BaseConverter() {
  const [v, setV] = useState('255');
  const [from, setFrom] = useState('10');
  const [to, setTo] = useState('16');
  const out = useMemo(() => {
    const fromBase = parseInt(from);
    const toBase = parseInt(to);
    const trimmed = v.trim();
    if (!trimmed) return null;
    const decimal = parseInt(trimmed, fromBase);
    if (!isFinite(decimal) || isNaN(decimal)) return null;
    return {
      converted: decimal.toString(toBase).toUpperCase(),
      bin: decimal.toString(2),
      oct: decimal.toString(8),
      dec: decimal.toString(10),
      hex: decimal.toString(16).toUpperCase(),
    };
  }, [v, from, to]);
  const baseOptions = [
    { label: 'Binary (2)', value: '2' },
    { label: 'Octal (8)', value: '8' },
    { label: 'Decimal (10)', value: '10' },
    { label: 'Hex (16)', value: '16' },
  ];
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Number" value={v} onChangeText={setV} autoCapitalize="characters" />
          <View className="flex-row gap-3">
            <View className="flex-1"><Picker label="From" value={from} onChange={setFrom} options={baseOptions} /></View>
            <View className="flex-1"><Picker label="To" value={to} onChange={setTo} options={baseOptions} /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label={`Base ${from} → Base ${to}`}
        value={out ? out.converted : '—'}
        sub={out ? undefined : 'Enter a valid number for the chosen base'}
      />
      {out ? (
        <Card variant="subtle">
          <View className="gap-2">
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">BIN</Text><Text variant="bodyStrong">{out.bin}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">OCT</Text><Text variant="bodyStrong">{out.oct}</Text></View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1"><Text variant="caption" tone="muted">DEC</Text><Text variant="bodyStrong">{out.dec}</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">HEX</Text><Text variant="bodyStrong">{out.hex}</Text></View>
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}
