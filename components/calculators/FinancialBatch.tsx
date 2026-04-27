import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function num(v: string): number {
  const n = parseFloat(v);
  return isFinite(n) ? n : NaN;
}

function fmtMoney(n: number, digits = 0): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function fmtNum(n: number, digits = 2): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

// ---------------------------------------------------------------------------
// 1. IncomeTaxCalculatorPK — Pakistan FBR 2024-25 salaried slabs
// ---------------------------------------------------------------------------
type Slab = {
  label: string;
  upper: number;
  base: number;
  rate: number;
  lower: number;
};

const PK_SLABS: Slab[] = [
  { label: 'Up to 600,000', lower: 0, upper: 600000, base: 0, rate: 0 },
  { label: '600,001 – 1,200,000', lower: 600000, upper: 1200000, base: 0, rate: 0.05 },
  { label: '1,200,001 – 2,200,000', lower: 1200000, upper: 2200000, base: 30000, rate: 0.15 },
  { label: '2,200,001 – 3,200,000', lower: 2200000, upper: 3200000, base: 180000, rate: 0.25 },
  { label: '3,200,001 – 4,100,000', lower: 3200000, upper: 4100000, base: 430000, rate: 0.30 },
  { label: 'Above 4,100,000', lower: 4100000, upper: Infinity, base: 700000, rate: 0.35 },
];

function computePkTax(income: number): { tax: number; slab: Slab } {
  for (const s of PK_SLABS) {
    if (income <= s.upper) {
      const tax = s.base + (income - s.lower) * s.rate;
      return { tax: Math.max(0, tax), slab: s };
    }
  }
  const last = PK_SLABS[PK_SLABS.length - 1];
  return { tax: last.base + (income - last.lower) * last.rate, slab: last };
}

export function IncomeTaxCalculatorPK() {
  const [income, setIncome] = useState('1500000');
  const out = useMemo(() => {
    const v = num(income);
    if (!isFinite(v) || v < 0) return null;
    const { tax, slab } = computePkTax(v);
    const take = v - tax;
    return {
      annualTax: tax,
      monthlyTax: tax / 12,
      takeHome: take,
      takeHomeMonthly: take / 12,
      effective: v > 0 ? (tax / v) * 100 : 0,
      slab,
    };
  }, [income]);

  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Annual taxable income (PKR)"
          value={income}
          onChangeText={setIncome}
          keyboardType="decimal-pad"
        />
      </Card>
      <ResultDisplay
        label="Annual income tax"
        value={out ? `PKR ${fmtMoney(out.annualTax)}` : '—'}
        sub={out ? `Effective rate: ${out.effective.toFixed(2)}%` : undefined}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <ResultDisplay
            label="Monthly tax"
            emphasize={false}
            value={out ? fmtMoney(out.monthlyTax) : '—'}
          />
        </View>
        <View className="flex-1">
          <ResultDisplay
            label="Take-home /mo"
            emphasize={false}
            value={out ? fmtMoney(out.takeHomeMonthly) : '—'}
          />
        </View>
      </View>
      <ResultDisplay
        label="Annual take-home"
        emphasize={false}
        value={out ? `PKR ${fmtMoney(out.takeHome)}` : '—'}
      />
      <Card>
        <Text variant="bodyStrong" className="mb-2">FBR 2024-25 slabs (salaried)</Text>
        {PK_SLABS.map((s) => {
          const active = out && out.slab.label === s.label;
          return (
            <View
              key={s.label}
              className="flex-row items-center justify-between py-1.5"
            >
              <Text
                variant={active ? 'bodyStrong' : 'body'}
                tone={active ? 'primary' : 'muted'}
                className="flex-1"
              >
                {s.label}
              </Text>
              <Text
                variant={active ? 'bodyStrong' : 'body'}
                tone={active ? 'primary' : 'default'}
              >
                {s.rate === 0 ? '0%' : `${(s.rate * 100).toFixed(0)}%`}
              </Text>
            </View>
          );
        })}
      </Card>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2. VehicleTokenTaxPkCalculator
// ---------------------------------------------------------------------------
type TokenBracket = { key: string; label: string; filer: number; nonFiler: number };
const TOKEN_BRACKETS: TokenBracket[] = [
  { key: 'lt1000', label: 'Below 1000 cc', filer: 1500, nonFiler: 3000 },
  { key: '1000', label: '1000 – 1300 cc', filer: 4000, nonFiler: 8000 },
  { key: '1300', label: '1300 – 1500 cc', filer: 6000, nonFiler: 12000 },
  { key: '1500', label: '1500 – 1800 cc', filer: 9000, nonFiler: 18000 },
  { key: '1800', label: '1800 – 2000 cc', filer: 12000, nonFiler: 24000 },
  { key: '2000', label: '2000 – 2500 cc', filer: 15000, nonFiler: 30000 },
  { key: '2500', label: '2500 – 3000 cc', filer: 17000, nonFiler: 35000 },
  { key: '3000', label: '3000+ cc', filer: 24000, nonFiler: 50000 },
];

const CITY_ADJ: Record<string, number> = {
  punjab: 1.0,
  sindh: 1.05,
  kpk: 0.95,
  balochistan: 0.9,
  islamabad: 1.1,
};

export function VehicleTokenTaxPkCalculator() {
  const [bracket, setBracket] = useState('1300');
  const [filer, setFiler] = useState<'filer' | 'non'>('filer');
  const [city, setCity] = useState('punjab');

  const out = useMemo(() => {
    const b = TOKEN_BRACKETS.find((x) => x.key === bracket);
    if (!b) return null;
    const base = filer === 'filer' ? b.filer : b.nonFiler;
    const factor = CITY_ADJ[city] ?? 1;
    return { base, adjusted: base * factor, factor, label: b.label };
  }, [bracket, filer, city]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker
            label="Engine capacity"
            value={bracket}
            onChange={setBracket}
            options={TOKEN_BRACKETS.map((b) => ({ label: b.label, value: b.key }))}
          />
          <View>
            <Text variant="caption" tone="muted">FILER STATUS</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={filer}
                onChange={setFiler}
                options={[
                  { label: 'Filer', value: 'filer' },
                  { label: 'Non-filer', value: 'non' },
                ]}
              />
            </View>
          </View>
          <Picker
            label="Registration city"
            value={city}
            onChange={setCity}
            options={[
              { label: 'Punjab', value: 'punjab' },
              { label: 'Sindh', value: 'sindh' },
              { label: 'KPK', value: 'kpk' },
              { label: 'Balochistan', value: 'balochistan' },
              { label: 'Islamabad', value: 'islamabad' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Annual token tax"
        value={out ? `PKR ${fmtMoney(out.adjusted)}` : '—'}
        sub={
          out
            ? `Base: ${fmtMoney(out.base)} · City factor x${out.factor.toFixed(2)}`
            : undefined
        }
      />
      <Card variant="subtle">
        <Text variant="small" tone="muted">
          Educational estimate. Token tax varies by province and policy year (±10% city adjustment is illustrative).
        </Text>
      </Card>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. PropertyRegistrationTaxPkCalculator
// ---------------------------------------------------------------------------
export function PropertyRegistrationTaxPkCalculator() {
  const [value, setValue] = useState('5000000');
  const [filer, setFiler] = useState<'filer' | 'non'>('filer');
  const [type, setType] = useState<'res' | 'com'>('res');

  const out = useMemo(() => {
    const v = num(value);
    if (!isFinite(v) || v <= 0) return null;
    const stamp = v * 0.01;
    const reg = v * 0.01;
    const cvt = v * (filer === 'filer' ? 0.01 : 0.02);
    const town = v * 0.005;
    const commercial = type === 'com' ? v * 0.02 : 0;
    const total = stamp + reg + cvt + town + commercial;
    return { stamp, reg, cvt, town, commercial, total };
  }, [value, filer, type]);

  const rows: { label: string; amount: number | null }[] = out
    ? [
        { label: 'Stamp duty (1%)', amount: out.stamp },
        { label: 'Registration fee (1%)', amount: out.reg },
        {
          label: `CVT (${filer === 'filer' ? '1%' : '2%'})`,
          amount: out.cvt,
        },
        { label: 'Town tax (0.5%)', amount: out.town },
        ...(type === 'com'
          ? [{ label: 'Commercial surcharge (2%)', amount: out.commercial }]
          : []),
      ]
    : [];

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input
            label="Property declared value (PKR)"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
          />
          <View>
            <Text variant="caption" tone="muted">FILER STATUS</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={filer}
                onChange={setFiler}
                options={[
                  { label: 'Filer', value: 'filer' },
                  { label: 'Non-filer', value: 'non' },
                ]}
              />
            </View>
          </View>
          <View>
            <Text variant="caption" tone="muted">PROPERTY TYPE</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={type}
                onChange={setType}
                options={[
                  { label: 'Residential', value: 'res' },
                  { label: 'Commercial', value: 'com' },
                ]}
              />
            </View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Total registration cost"
        value={out ? `PKR ${fmtMoney(out.total)}` : '—'}
      />
      {rows.length > 0 ? (
        <Card>
          <Text variant="bodyStrong" className="mb-2">Itemized breakdown</Text>
          {rows.map((r) => (
            <View
              key={r.label}
              className="flex-row items-center justify-between py-1.5"
            >
              <Text variant="body" tone="muted" className="flex-1">{r.label}</Text>
              <Text variant="bodyStrong">PKR {fmtMoney(r.amount ?? 0)}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4. BreakEvenCalculator
// ---------------------------------------------------------------------------
export function BreakEvenCalculator() {
  const [fixed, setFixed] = useState('10000');
  const [variable, setVariable] = useState('15');
  const [price, setPrice] = useState('25');

  const out = useMemo(() => {
    const f = num(fixed); const v = num(variable); const p = num(price);
    if (![f, v, p].every(isFinite) || f < 0 || v < 0 || p <= 0) return null;
    if (p <= v) return { invalid: true } as const;
    const cm = p - v;
    const units = f / cm;
    const revenue = units * p;
    const cmPct = (cm / p) * 100;
    return { invalid: false, units, revenue, cm, cmPct } as const;
  }, [fixed, variable, price]);

  const invalid = out && out.invalid;

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input
            label="Fixed costs"
            value={fixed}
            onChangeText={setFixed}
            keyboardType="decimal-pad"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Variable cost / unit"
                value={variable}
                onChangeText={setVariable}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Price / unit"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      </Card>
      {invalid ? (
        <Card variant="subtle">
          <Text variant="bodyStrong" tone="danger">Price must exceed variable cost.</Text>
        </Card>
      ) : (
        <>
          <ResultDisplay
            label="Break-even units"
            value={out && !out.invalid ? fmtNum(Math.ceil(out.units), 0) : '—'}
            sub={
              out && !out.invalid ? `Exact: ${fmtNum(out.units, 2)} units` : undefined
            }
          />
          <ResultDisplay
            label="Break-even revenue"
            emphasize={false}
            value={out && !out.invalid ? fmtMoney(out.revenue, 2) : '—'}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ResultDisplay
                label="Contribution / unit"
                emphasize={false}
                value={out && !out.invalid ? fmtMoney(out.cm, 2) : '—'}
              />
            </View>
            <View className="flex-1">
              <ResultDisplay
                label="CM %"
                emphasize={false}
                value={out && !out.invalid ? `${out.cmPct.toFixed(2)}%` : '—'}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 7. GpaCalculator
// ---------------------------------------------------------------------------
type Course = { id: number; course: string; credits: string; gradeValue: string };

const GRADE_OPTIONS = [
  { label: 'A (4.0)', value: '4.0' },
  { label: 'A- (3.7)', value: '3.7' },
  { label: 'B+ (3.3)', value: '3.3' },
  { label: 'B (3.0)', value: '3.0' },
  { label: 'B- (2.7)', value: '2.7' },
  { label: 'C+ (2.3)', value: '2.3' },
  { label: 'C (2.0)', value: '2.0' },
  { label: 'C- (1.7)', value: '1.7' },
  { label: 'D (1.0)', value: '1.0' },
  { label: 'F (0)', value: '0' },
];

export function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, course: 'Course 1', credits: '3', gradeValue: '4.0' },
    { id: 2, course: 'Course 2', credits: '3', gradeValue: '3.7' },
    { id: 3, course: 'Course 3', credits: '3', gradeValue: '3.3' },
    { id: 4, course: 'Course 4', credits: '3', gradeValue: '3.0' },
  ]);
  const [nextId, setNextId] = useState(5);

  function update(id: number, patch: Partial<Course>) {
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addCourse() {
    setCourses((cs) => [
      ...cs,
      { id: nextId, course: `Course ${cs.length + 1}`, credits: '3', gradeValue: '4.0' },
    ]);
    setNextId((n) => n + 1);
  }

  function removeCourse(id: number) {
    setCourses((cs) => cs.filter((c) => c.id !== id));
  }

  const out = useMemo(() => {
    let totalCredits = 0;
    let weighted = 0;
    for (const c of courses) {
      const cr = parseFloat(c.credits);
      const gp = parseFloat(c.gradeValue);
      if (!isFinite(cr) || cr <= 0 || !isFinite(gp)) continue;
      totalCredits += cr;
      weighted += cr * gp;
    }
    if (totalCredits === 0) return null;
    return { totalCredits, gpa: weighted / totalCredits };
  }, [courses]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          {courses.map((c, idx) => (
            <View
              key={c.id}
              className="gap-2 pb-3 border-b-hairline border-border dark:border-border-dark"
            >
              <View className="flex-row items-center justify-between">
                <Text variant="bodyStrong">Course {idx + 1}</Text>
                {courses.length > 1 ? (
                  <Pressable
                    onPress={() => removeCourse(c.id)}
                    className="px-2 py-1 active:opacity-70"
                  >
                    <Text variant="small" tone="danger">Remove</Text>
                  </Pressable>
                ) : null}
              </View>
              <Input
                label="Name"
                value={c.course}
                onChangeText={(v) => update(c.id, { course: v })}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Credits"
                    value={c.credits}
                    onChangeText={(v) => update(c.id, { credits: v })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Picker
                    label="Grade"
                    value={c.gradeValue}
                    onChange={(v) => update(c.id, { gradeValue: v })}
                    options={GRADE_OPTIONS}
                  />
                </View>
              </View>
            </View>
          ))}
          <Button title="Add course" icon="add" onPress={addCourse} variant="secondary" fullWidth />
        </View>
      </Card>
      <ResultDisplay
        label="GPA"
        value={out ? out.gpa.toFixed(2) : '—'}
        sub={out ? `Total credits: ${fmtNum(out.totalCredits, 1)}` : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 8. GradeCalculator
// ---------------------------------------------------------------------------
type Assignment = { id: number; name: string; weight: string; score: string };

export function GradeCalculator() {
  const [items, setItems] = useState<Assignment[]>([
    { id: 1, name: 'Quiz 1', weight: '20', score: '85' },
    { id: 2, name: 'Midterm', weight: '30', score: '78' },
    { id: 3, name: 'Project', weight: '20', score: '90' },
  ]);
  const [nextId, setNextId] = useState(4);
  const [target, setTarget] = useState('80');

  function update(id: number, patch: Partial<Assignment>) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function add() {
    setItems((xs) => [
      ...xs,
      { id: nextId, name: `Assignment ${xs.length + 1}`, weight: '10', score: '0' },
    ]);
    setNextId((n) => n + 1);
  }

  function remove(id: number) {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }

  const out = useMemo(() => {
    let totalWeight = 0;
    let weighted = 0;
    for (const a of items) {
      const w = parseFloat(a.weight);
      const s = parseFloat(a.score);
      if (!isFinite(w) || w < 0 || !isFinite(s)) continue;
      totalWeight += w;
      weighted += (w / 100) * s;
    }
    const remaining = Math.max(0, 100 - totalWeight);
    const t = parseFloat(target);
    let needed: number | null = null;
    if (isFinite(t) && remaining > 0) {
      needed = ((t - weighted) / (remaining / 100));
    }
    return {
      totalWeight,
      runningTotal: weighted,
      remaining,
      overflow: totalWeight > 100,
      needed,
    };
  }, [items, target]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          {items.map((a, idx) => (
            <View
              key={a.id}
              className="gap-2 pb-3 border-b-hairline border-border dark:border-border-dark"
            >
              <View className="flex-row items-center justify-between">
                <Text variant="bodyStrong">Item {idx + 1}</Text>
                {items.length > 1 ? (
                  <Pressable
                    onPress={() => remove(a.id)}
                    className="px-2 py-1 active:opacity-70"
                  >
                    <Text variant="small" tone="danger">Remove</Text>
                  </Pressable>
                ) : null}
              </View>
              <Input
                label="Name"
                value={a.name}
                onChangeText={(v) => update(a.id, { name: v })}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Input
                    label="Weight %"
                    value={a.weight}
                    onChangeText={(v) => update(a.id, { weight: v })}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Score %"
                    value={a.score}
                    onChangeText={(v) => update(a.id, { score: v })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          ))}
          <Button title="Add assignment" icon="add" onPress={add} variant="secondary" fullWidth />
        </View>
      </Card>
      <ResultDisplay
        label="Running total"
        value={`${out.runningTotal.toFixed(2)}%`}
        sub={`Weights used: ${out.totalWeight.toFixed(0)}% · Remaining: ${out.remaining.toFixed(0)}%`}
      />
      {out.overflow ? (
        <Card variant="subtle">
          <Text variant="bodyStrong" tone="danger">
            Weights exceed 100% ({out.totalWeight.toFixed(0)}%). Reduce some weights.
          </Text>
        </Card>
      ) : null}
      <Card>
        <Text variant="bodyStrong" className="mb-2">Target grade</Text>
        <Input
          label="Desired final %"
          value={target}
          onChangeText={setTarget}
          keyboardType="decimal-pad"
        />
        <View className="mt-3">
          {out.remaining <= 0 ? (
            <Text variant="body" tone="muted">
              No remaining capacity to plan a target.
            </Text>
          ) : out.needed === null ? (
            <Text variant="body" tone="muted">Enter a valid target.</Text>
          ) : (
            <Text variant="bodyStrong" tone="primary">
              Need {out.needed.toFixed(2)}% on the remaining {out.remaining.toFixed(0)}% to reach {target}%.
            </Text>
          )}
        </View>
      </Card>
    </View>
  );
}
