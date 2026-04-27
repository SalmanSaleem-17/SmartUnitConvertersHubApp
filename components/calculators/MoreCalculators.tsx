import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

// ---------- Health ----------
export function IdealWeightCalculator() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('170');
  const h = parseFloat(height);
  const out = isFinite(h) && h > 0 ? {
    devine: sex === 'male' ? 50 + 0.91 * (h - 152.4) : 45.5 + 0.91 * (h - 152.4),
    robinson: sex === 'male' ? 52 + 1.9 * ((h - 152.4) / 2.54) : 49 + 1.7 * ((h - 152.4) / 2.54),
    miller: sex === 'male' ? 56.2 + 1.41 * ((h - 152.4) / 2.54) : 53.1 + 1.36 * ((h - 152.4) / 2.54),
  } : null;
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
        <View className="mt-3.5">
          <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Devine formula" value={out ? `${out.devine.toFixed(1)} kg` : '—'} />
      <ResultDisplay label="Robinson" emphasize={false} value={out ? `${out.robinson.toFixed(1)} kg` : '—'} />
      <ResultDisplay label="Miller" emphasize={false} value={out ? `${out.miller.toFixed(1)} kg` : '—'} />
    </View>
  );
}

export function HeartRateZoneCalculator() {
  const [age, setAge] = useState('30');
  const [rest, setRest] = useState('60');
  const a = parseFloat(age); const rhr = parseFloat(rest);
  const max = isFinite(a) ? 220 - a : null;
  const zones = useMemo(() => {
    if (max === null || !isFinite(rhr)) return null;
    const reserve = max - rhr;
    const make = (lo: number, hi: number) => ({ lo: Math.round(rhr + reserve * lo), hi: Math.round(rhr + reserve * hi) });
    return {
      zone1: make(0.5, 0.6), zone2: make(0.6, 0.7),
      zone3: make(0.7, 0.8), zone4: make(0.8, 0.9),
      zone5: make(0.9, 1.0),
    };
  }, [max, rhr]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
          <Input label="Resting heart rate (bpm)" value={rest} onChangeText={setRest} keyboardType="numeric" />
        </View>
      </Card>
      <ResultDisplay label="Max HR" value={max === null ? '—' : `${max} bpm`} />
      {zones ? (
        <Card>
          <Text variant="bodyStrong" className="mb-2">Training zones (Karvonen)</Text>
          {([
            ['1 · Recovery', zones.zone1],
            ['2 · Endurance', zones.zone2],
            ['3 · Tempo', zones.zone3],
            ['4 · Threshold', zones.zone4],
            ['5 · VO₂ max', zones.zone5],
          ] as const).map(([label, z]) => (
            <View key={label} className="flex-row items-center py-2">
              <Text variant="bodyStrong" className="flex-1">{label}</Text>
              <Text variant="bodyStrong" tone="primary">{z.lo}–{z.hi} bpm</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

export function PaceCalculator() {
  const [distKm, setDistKm] = useState('5');
  const [hours, setH] = useState('0');
  const [mins, setM] = useState('25');
  const [secs, setS] = useState('0');
  const out = useMemo(() => {
    const d = parseFloat(distKm);
    const total = (parseFloat(hours) || 0) * 3600 + (parseFloat(mins) || 0) * 60 + (parseFloat(secs) || 0);
    if (!isFinite(d) || d <= 0 || total <= 0) return null;
    const perKm = total / d;
    const speedKmh = (d / total) * 3600;
    return { perKm, speedKmh };
  }, [distKm, hours, mins, secs]);
  function fmtTime(secs: number) {
    const m = Math.floor(secs / 60); const s = Math.round(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Distance (km)" value={distKm} onChangeText={setDistKm} keyboardType="decimal-pad" />
          <View className="flex-row gap-2">
            <View className="flex-1"><Input label="Hours" value={hours} onChangeText={setH} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Minutes" value={mins} onChangeText={setM} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Seconds" value={secs} onChangeText={setS} keyboardType="numeric" /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay label="Pace" value={out ? `${fmtTime(out.perKm)} /km` : '—'} sub={out ? `Speed: ${out.speedKmh.toFixed(2)} km/h` : undefined} />
    </View>
  );
}

export function WaterIntakeCalculator() {
  const [w, setW] = useState('70');
  const v = parseFloat(w);
  const liters = isFinite(v) ? v * 0.035 : null;
  return (
    <View className="gap-3">
      <Card>
        <Input label="Body weight (kg)" value={w} onChangeText={setW} keyboardType="decimal-pad" />
      </Card>
      <ResultDisplay label="Daily water" value={liters === null ? '—' : `${liters.toFixed(2)} L`} sub="Approx. 35 ml per kg of body weight" />
    </View>
  );
}

// ---------- Date & Time ----------
export function WorkingDaysCalculator() {
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2025-12-31');
  const out = useMemo(() => {
    const a = new Date(from + 'T00:00:00');
    const b = new Date(to + 'T00:00:00');
    if (isNaN(a.getTime()) || isNaN(b.getTime()) || b < a) return null;
    let count = 0;
    const cur = new Date(a);
    while (cur <= b) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [from, to]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} autoCapitalize="none" />
          <Input label="To (YYYY-MM-DD)" value={to} onChangeText={setTo} autoCapitalize="none" />
        </View>
      </Card>
      <ResultDisplay label="Working days" value={out === null ? '—' : out.toLocaleString()} sub="Excludes Saturday & Sunday" />
    </View>
  );
}

export function AddSubtractDays() {
  const [start, setStart] = useState('2025-01-01');
  const [days, setDays] = useState('30');
  const [mode, setMode] = useState<'add' | 'sub'>('add');
  const out = useMemo(() => {
    const d = new Date(start + 'T00:00:00');
    const n = parseInt(days);
    if (isNaN(d.getTime()) || !isFinite(n)) return null;
    const r = new Date(d);
    r.setDate(d.getDate() + (mode === 'add' ? n : -n));
    return r.toISOString().slice(0, 10);
  }, [start, days, mode]);
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Add', value: 'add' },
            { label: 'Subtract', value: 'sub' },
          ]}
        />
        <View className="gap-3 mt-3.5">
          <Input label="Start date" value={start} onChangeText={setStart} autoCapitalize="none" />
          <Input label="Days" value={days} onChangeText={setDays} keyboardType="numeric" />
        </View>
      </Card>
      <ResultDisplay label="Result date" value={out ?? '—'} />
    </View>
  );
}

export function TimeDurationCalculator() {
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('17:30');
  const out = useMemo(() => {
    const [h1, m1] = from.split(':').map(Number);
    const [h2, m2] = to.split(':').map(Number);
    if ([h1, m1, h2, m2].some((x) => !isFinite(x))) return null;
    let mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60;
    return { hours: Math.floor(mins / 60), mins: mins % 60, total: mins };
  }, [from, to]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="From (HH:MM)" value={from} onChangeText={setFrom} placeholder="09:00" autoCapitalize="none" />
          <Input label="To (HH:MM)" value={to} onChangeText={setTo} placeholder="17:30" autoCapitalize="none" />
        </View>
      </Card>
      <ResultDisplay label="Duration" value={out ? `${out.hours}h ${out.mins}m` : '—'} sub={out ? `${out.total} minutes total` : undefined} />
    </View>
  );
}

export function CountdownTimer() {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [target, setTarget] = useState('2026-01-01');
  const [time, setTime] = useState('17:30');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const targetMs = useMemo(() => {
    if (mode === 'date') {
      const t = new Date(target + 'T00:00:00');
      return isNaN(t.getTime()) ? null : t.getTime();
    }
    const m = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10); const mn = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mn < 0 || mn > 59) return null;
    const d = new Date(); d.setHours(h, mn, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }, [mode, target, time]);
  const diff = targetMs === null ? null : Math.max(0, targetMs - now);
  const parts = diff === null ? null : {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Date (YYYY-MM-DD)', value: 'date' },
            { label: 'Time of day (HH:MM)', value: 'time' },
          ]}
        />
        <View className="mt-3">
          {mode === 'date' ? (
            <Input label="Target date" value={target} onChangeText={setTarget} autoCapitalize="none" />
          ) : (
            <Input label="Target time" value={time} onChangeText={setTime} placeholder="HH:MM" autoCapitalize="none" />
          )}
        </View>
      </Card>
      {parts ? (
        <Card>
          <Text variant="caption" tone="muted">TIME REMAINING</Text>
          <View className="flex-row justify-between mt-2">
            {([
              ['Days', parts.d], ['Hours', parts.h], ['Minutes', parts.m], ['Seconds', parts.s],
            ] as const).map(([label, v]) => (
              <View key={label} className="items-center flex-1">
                <Text variant="display" tone="primary">{String(v).padStart(2, '0')}</Text>
                <Text variant="caption" tone="muted">{label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <ResultDisplay label="Time remaining" value="—" />
      )}
    </View>
  );
}

// ---------- Financial extras ----------
export function ProfitMarginCalculator() {
  const [cost, setCost] = useState('100');
  const [revenue, setRev] = useState('150');
  const out = useMemo(() => {
    const c = parseFloat(cost); const r = parseFloat(revenue);
    if (!isFinite(c) || !isFinite(r) || r === 0) return null;
    const profit = r - c;
    return { profit, margin: (profit / r) * 100, markup: c === 0 ? null : (profit / c) * 100 };
  }, [cost, revenue]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Cost" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
          <Input label="Revenue" value={revenue} onChangeText={setRev} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Profit margin" value={out ? `${out.margin.toFixed(2)}%` : '—'} sub={out ? `Profit: ${out.profit.toFixed(2)}` : undefined} />
      <ResultDisplay label="Markup %" emphasize={false} value={out?.markup === null ? '—' : out ? `${out.markup!.toFixed(2)}%` : '—'} />
    </View>
  );
}

export function MarkupCalculator() {
  const [cost, setCost] = useState('100');
  const [markup, setM] = useState('30');
  const out = useMemo(() => {
    const c = parseFloat(cost); const m = parseFloat(markup);
    if (!isFinite(c) || !isFinite(m)) return null;
    const profit = (c * m) / 100;
    return { profit, price: c + profit };
  }, [cost, markup]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Cost" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
          <Input label="Markup %" value={markup} onChangeText={setM} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Selling price" value={out ? out.price.toFixed(2) : '—'} sub={out ? `Profit: ${out.profit.toFixed(2)}` : undefined} />
    </View>
  );
}

export function SalaryCalculator() {
  const [hourly, setH] = useState('10');
  const [hours, setHours] = useState('40');
  const out = useMemo(() => {
    const h = parseFloat(hourly); const w = parseFloat(hours);
    if (!isFinite(h) || !isFinite(w)) return null;
    const weekly = h * w;
    return { weekly, monthly: weekly * 4.345, annual: weekly * 52 };
  }, [hourly, hours]);
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Hourly rate" value={hourly} onChangeText={setH} keyboardType="decimal-pad" />
          <Input label="Hours per week" value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Annual salary" value={out ? fmt(out.annual) : '—'} sub={out ? `Weekly ${fmt(out.weekly)} · Monthly ${fmt(out.monthly)}` : undefined} />
    </View>
  );
}

export function CostPerUnitCalculator() {
  const [total, setTotal] = useState('500');
  const [units, setUnits] = useState('25');
  const out = useMemo(() => {
    const t = parseFloat(total); const u = parseFloat(units);
    if (!isFinite(t) || !isFinite(u) || u === 0) return null;
    return t / u;
  }, [total, units]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Total cost" value={total} onChangeText={setTotal} keyboardType="decimal-pad" />
          <Input label="Number of units" value={units} onChangeText={setUnits} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Cost per unit" value={out === null ? '—' : out.toFixed(4)} />
    </View>
  );
}
