import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// ─────────────────────────────────────────────────────────────────────
// 1. AngleConverter — degrees, radians, gradians, arc-min, arc-sec, turns
// ─────────────────────────────────────────────────────────────────────
const ANGLE_UNITS = [
  { label: 'Degrees (°)',     value: 'deg',  toRad: Math.PI / 180 },
  { label: 'Radians (rad)',   value: 'rad',  toRad: 1 },
  { label: 'Gradians (gon)',  value: 'gon',  toRad: Math.PI / 200 },
  { label: 'Arc minutes (′)', value: 'amin', toRad: Math.PI / (180 * 60) },
  { label: 'Arc seconds (″)', value: 'asec', toRad: Math.PI / (180 * 3600) },
  { label: 'Turns (rev)',     value: 'turn', toRad: 2 * Math.PI },
];

export function AngleConverter() {
  const [value, setValue] = useState('45');
  const [from, setFrom] = useState('deg');
  const [to, setTo] = useState('rad');

  const out = useMemo(() => {
    const v = parseFloat(value);
    const a = ANGLE_UNITS.find((u) => u.value === from);
    const b = ANGLE_UNITS.find((u) => u.value === to);
    if (!isFinite(v) || !a || !b) return null;
    return (v * a.toRad) / b.toRad;
  }, [value, from, to]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Value" value={value} onChangeText={setValue} keyboardType="numbers-and-punctuation" />
          <Picker label="From" value={from} onChange={setFrom} options={ANGLE_UNITS} />
          <Picker label="To" value={to} onChange={setTo} options={ANGLE_UNITS} />
        </View>
      </Card>
      <ResultDisplay
        label="Converted"
        value={out === null ? '—' : `${out.toLocaleString(undefined, { maximumFractionDigits: 8 })}`}
        sub={out === null ? undefined : `${value} ${from} → ${to}`}
      />
      <Card variant="subtle">
        <Text variant="bodyStrong">Common references</Text>
        <View className="gap-1 mt-2">
          {[
            ['π / 4', '= 45° = 50 gon'],
            ['π / 2', '= 90° = 100 gon'],
            ['π', '= 180° = 200 gon'],
            ['2π', '= 360° = 400 gon = 1 turn'],
            ['1°', '= 60′ = 3600″'],
          ].map(([a, b]) => (
            <View key={a} className="flex-row">
              <Text variant="small" tone="primary" className="w-16">{a}</Text>
              <Text variant="small" tone="muted" className="flex-1">{b}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2. WindSpeedConverter — m/s, km/h, mph, knots, ft/s + Beaufort
// ─────────────────────────────────────────────────────────────────────
const WIND_UNITS = [
  { label: 'Meters / second (m/s)', value: 'mps',  toMps: 1 },
  { label: 'Kilometers / hour (km/h)', value: 'kph', toMps: 1 / 3.6 },
  { label: 'Miles / hour (mph)', value: 'mph', toMps: 0.44704 },
  { label: 'Knots (kn)',         value: 'kn',  toMps: 0.514444 },
  { label: 'Feet / second (ft/s)', value: 'fps', toMps: 0.3048 },
];

const BEAUFORT = [
  { n: 0,  desc: 'Calm',           max: 0.5 },
  { n: 1,  desc: 'Light air',      max: 1.5 },
  { n: 2,  desc: 'Light breeze',   max: 3.3 },
  { n: 3,  desc: 'Gentle breeze',  max: 5.5 },
  { n: 4,  desc: 'Moderate breeze', max: 7.9 },
  { n: 5,  desc: 'Fresh breeze',   max: 10.7 },
  { n: 6,  desc: 'Strong breeze',  max: 13.8 },
  { n: 7,  desc: 'Near gale',      max: 17.1 },
  { n: 8,  desc: 'Gale',           max: 20.7 },
  { n: 9,  desc: 'Strong gale',    max: 24.4 },
  { n: 10, desc: 'Storm',          max: 28.4 },
  { n: 11, desc: 'Violent storm',  max: 32.6 },
  { n: 12, desc: 'Hurricane',      max: Infinity },
];

export function WindSpeedConverter() {
  const [value, setValue] = useState('20');
  const [from, setFrom] = useState('kph');

  const out = useMemo(() => {
    const v = parseFloat(value);
    const a = WIND_UNITS.find((u) => u.value === from);
    if (!isFinite(v) || !a) return null;
    const mps = v * a.toMps;
    const beaufort = BEAUFORT.find((b) => mps <= b.max) ?? BEAUFORT[BEAUFORT.length - 1];
    return {
      mps,
      kph: mps * 3.6,
      mph: mps / 0.44704,
      knots: mps / 0.514444,
      fps: mps / 0.3048,
      beaufort,
    };
  }, [value, from]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Wind speed" value={value} onChangeText={setValue} keyboardType="decimal-pad" icon="cloud" />
          <Picker label="Unit" value={from} onChange={setFrom} options={WIND_UNITS} />
        </View>
      </Card>
      <ResultDisplay
        label={`Beaufort ${out?.beaufort.n ?? '—'}`}
        value={out?.beaufort.desc ?? '—'}
        sub={out ? `${fmt(out.kph)} km/h · ${fmt(out.mph)} mph` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">m/s</Text><Text variant="bodyStrong">{fmt(out.mps)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">km/h</Text><Text variant="bodyStrong">{fmt(out.kph)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">mph</Text><Text variant="bodyStrong">{fmt(out.mph)}</Text></View>
          </View>
          <View className="flex-row gap-3 mt-2">
            <View className="flex-1"><Text variant="caption" tone="muted">KNOTS</Text><Text variant="bodyStrong">{fmt(out.knots)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">ft/s</Text><Text variant="bodyStrong">{fmt(out.fps)}</Text></View>
            <View className="flex-1" />
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3. CookingMeasurementConverter — volume + density-dependent weight
// ─────────────────────────────────────────────────────────────────────
const COOK_VOLUMES = [
  { label: 'US Cup',         value: 'cupUS', toMl: 236.588 },
  { label: 'US Tablespoon',  value: 'tbspUS', toMl: 14.7868 },
  { label: 'US Teaspoon',    value: 'tspUS', toMl: 4.92892 },
  { label: 'Metric Cup',     value: 'cupM', toMl: 250 },
  { label: 'Metric Tbsp',    value: 'tbspM', toMl: 15 },
  { label: 'Metric Tsp',     value: 'tspM', toMl: 5 },
  { label: 'Milliliter (ml)', value: 'ml', toMl: 1 },
  { label: 'Fluid Ounce (fl oz)', value: 'floz', toMl: 29.5735 },
];
const INGREDIENTS = [
  { label: 'Water / liquid', value: 'water', density: 1.0 },
  { label: 'Milk',           value: 'milk',  density: 1.03 },
  { label: 'All-purpose flour', value: 'flour', density: 0.529 },
  { label: 'Granulated sugar', value: 'sugar', density: 0.85 },
  { label: 'Brown sugar',    value: 'brown',  density: 0.93 },
  { label: 'Butter',         value: 'butter', density: 0.911 },
  { label: 'Honey',          value: 'honey',  density: 1.42 },
  { label: 'Salt',           value: 'salt',   density: 1.217 },
  { label: 'Olive oil',      value: 'oil',    density: 0.92 },
];

export function CookingMeasurementConverter() {
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('cupUS');
  const [to, setTo] = useState('ml');
  const [ing, setIng] = useState('flour');

  const out = useMemo(() => {
    const v = parseFloat(value);
    const a = COOK_VOLUMES.find((u) => u.value === from);
    const b = COOK_VOLUMES.find((u) => u.value === to);
    const ingr = INGREDIENTS.find((i) => i.value === ing);
    if (!isFinite(v) || !a || !b || !ingr) return null;
    const ml = v * a.toMl;
    const grams = ml * ingr.density;
    const ounces = grams * 0.035274;
    return { ml, grams, ounces, converted: (v * a.toMl) / b.toMl };
  }, [value, from, to, ing]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Quantity" value={value} onChangeText={setValue} keyboardType="decimal-pad" icon="restaurant" />
          <View className="flex-row gap-2">
            <View className="flex-1"><Picker label="From" value={from} onChange={setFrom} options={COOK_VOLUMES} /></View>
            <View className="flex-1"><Picker label="To" value={to} onChange={setTo} options={COOK_VOLUMES} /></View>
          </View>
          <Picker label="Ingredient (for weight)" value={ing} onChange={setIng} options={INGREDIENTS} />
        </View>
      </Card>
      <ResultDisplay label="Volume converted" value={out === null ? '—' : `${fmt(out.converted)} ${to}`} />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Weight equivalent ({INGREDIENTS.find((i) => i.value === ing)?.label})</Text>
          <View className="flex-row gap-3 mt-2">
            <View className="flex-1"><Text variant="caption" tone="muted">GRAMS</Text><Text variant="bodyStrong">{fmt(out.grams)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">OUNCES</Text><Text variant="bodyStrong">{fmt(out.ounces)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">ML</Text><Text variant="bodyStrong">{fmt(out.ml)}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4. HeatIndexCalculator — apparent temp from T + humidity
// ─────────────────────────────────────────────────────────────────────
function heatIndexF(tF: number, rh: number): number {
  // NWS Rothfusz regression
  const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127, c4 = -0.22475541;
  const c5 = -0.00683783, c6 = -0.05481717, c7 = 0.00122874, c8 = 0.00085282, c9 = -0.00000199;
  return c1 + c2 * tF + c3 * rh + c4 * tF * rh + c5 * tF * tF + c6 * rh * rh +
         c7 * tF * tF * rh + c8 * tF * rh * rh + c9 * tF * tF * rh * rh;
}

export function HeatIndexCalculator() {
  const [t, setT] = useState('35');
  const [tUnit, setTUnit] = useState<'C' | 'F'>('C');
  const [rh, setRh] = useState('60');

  const out = useMemo(() => {
    const temp = parseFloat(t);
    const hum = parseFloat(rh);
    if (![temp, hum].every(isFinite) || hum < 0 || hum > 100) return null;
    const tF = tUnit === 'C' ? (temp * 9) / 5 + 32 : temp;
    if (tF < 80) return null;  // formula valid above 80°F
    const hi = heatIndexF(tF, hum);
    const hiC = ((hi - 32) * 5) / 9;
    let risk: { label: string; tone: 'success' | 'warning' | 'danger' };
    if (hi < 90) risk = { label: 'Caution', tone: 'success' };
    else if (hi < 105) risk = { label: 'Extreme caution', tone: 'warning' };
    else if (hi < 130) risk = { label: 'Danger', tone: 'warning' };
    else risk = { label: 'Extreme danger', tone: 'danger' };
    return { hi, hiC, risk };
  }, [t, tUnit, rh]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-2">
            <View className="flex-[2]"><Input label="Temperature" value={t} onChangeText={setT} keyboardType="decimal-pad" /></View>
            <View className="flex-1">
              <Text variant="caption" tone="muted" className="mb-1.5">UNIT</Text>
              <SegmentedControl
                value={tUnit}
                onChange={setTUnit}
                options={[{ label: '°C', value: 'C' }, { label: '°F', value: 'F' }]}
              />
            </View>
          </View>
          <Input label="Relative humidity (%)" value={rh} onChangeText={setRh} keyboardType="decimal-pad" hint="0–100" />
        </View>
      </Card>
      <ResultDisplay
        label="Heat index"
        value={out ? `${out.hiC.toFixed(1)}°C / ${out.hi.toFixed(1)}°F` : '—'}
        sub={out ? `Risk level: ${out.risk.label}` : 'Formula is valid only when temperature ≥ 26.7°C / 80°F.'}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5. DaysUntilCalculator — countdown with quick presets
// ─────────────────────────────────────────────────────────────────────
export function DaysUntilCalculator() {
  const [target, setTarget] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [label, setLabel] = useState('My event');

  const out = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(target)) return null;
    const t = new Date(target + 'T00:00:00');
    if (isNaN(t.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ms = t.getTime() - today.getTime();
    const days = Math.round(ms / 86400000);
    const weeks = days / 7;
    const months = days / 30.4375;
    const past = days < 0;
    return { days: Math.abs(days), weeks: Math.abs(weeks), months: Math.abs(months), past };
  }, [target]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Event name" value={label} onChangeText={setLabel} icon="bookmark" />
          <Input label="Date (YYYY-MM-DD)" value={target} onChangeText={setTarget} autoCapitalize="none" icon="calendar" />
        </View>
      </Card>
      <ResultDisplay
        label={out?.past ? `${label} — days since` : `${label} — days until`}
        value={out ? `${out.days} days` : '—'}
        sub={out ? `${out.weeks.toFixed(1)} weeks · ${out.months.toFixed(2)} months` : undefined}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6. OneRepMaxCalculator — Brzycki / Epley / Lander / Lombardi
// ─────────────────────────────────────────────────────────────────────
export function OneRepMaxCalculator() {
  const [weight, setWeight] = useState('80');
  const [reps, setReps] = useState('5');

  const out = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    if (![w, r].every(isFinite) || w <= 0 || r < 1 || r > 12) return null;
    return {
      brzycki: w * (36 / (37 - r)),
      epley: w * (1 + r / 30),
      lander: (100 * w) / (101.3 - 2.67123 * r),
      lombardi: w * Math.pow(r, 0.10),
      oconner: w * (1 + 0.025 * r),
    };
  }, [weight, reps]);

  const fmt = (n: number) => `${n.toFixed(1)} kg`;
  const avg = out ? (out.brzycki + out.epley + out.lander + out.lombardi + out.oconner) / 5 : null;

  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted">RECENT WORKING SET</Text>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" icon="barbell" /></View>
          <View className="flex-1"><Input label="Reps (1–12)" value={reps} onChangeText={setReps} keyboardType="numeric" /></View>
        </View>
      </Card>
      <ResultDisplay
        label="Estimated 1 Rep Max"
        value={avg === null ? '—' : fmt(avg)}
        sub={avg === null ? undefined : 'Average of 5 standard formulas'}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Per formula</Text>
          <View className="gap-1 mt-2">
            {[
              ['Brzycki', out.brzycki],
              ['Epley', out.epley],
              ['Lander', out.lander],
              ['Lombardi', out.lombardi],
              ["O'Conner", out.oconner],
            ].map(([n, v]) => (
              <View key={String(n)} className="flex-row">
                <Text variant="small" className="flex-1">{String(n)}</Text>
                <Text variant="small" tone="primary">{fmt(v as number)}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
      {out ? (
        <Card>
          <Text variant="bodyStrong">Training percentages of 1RM</Text>
          <View className="gap-1 mt-2">
            {[
              { pct: 95, reps: '1–2', note: 'Max strength' },
              { pct: 85, reps: '3–5', note: 'Strength' },
              { pct: 75, reps: '6–8', note: 'Hypertrophy' },
              { pct: 65, reps: '10–12', note: 'Hypertrophy / endurance' },
              { pct: 50, reps: '15+', note: 'Endurance' },
            ].map((row) => (
              <View key={row.pct} className="flex-row items-center">
                <Text variant="small" className="w-12">{row.pct}%</Text>
                <Text variant="small" tone="primary" className="w-20">{fmt(avg! * row.pct / 100)}</Text>
                <Text variant="caption" tone="muted" className="flex-1 ml-2">{row.reps} · {row.note}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7. PregnancyWeightGainCalculator — IOM ranges by pre-pregnancy BMI
// ─────────────────────────────────────────────────────────────────────
export function PregnancyWeightGainCalculator() {
  const [prePregBmi, setBmi] = useState('22');
  const [weeks, setWeeks] = useState('20');
  const [twins, setTwins] = useState(false);

  const out = useMemo(() => {
    const b = parseFloat(prePregBmi);
    const w = parseFloat(weeks);
    if (![b, w].every(isFinite) || w < 0 || w > 42) return null;

    // IOM 2009 guidelines (singleton)
    let ranges: { min: number; max: number; firstTri: { min: number; max: number } };
    if (b < 18.5)        ranges = { min: 12.5, max: 18.0, firstTri: { min: 0.5, max: 2.0 } };
    else if (b < 25.0)   ranges = { min: 11.5, max: 16.0, firstTri: { min: 0.5, max: 2.0 } };
    else if (b < 30.0)   ranges = { min: 7.0,  max: 11.5, firstTri: { min: 0.5, max: 2.0 } };
    else                 ranges = { min: 5.0,  max: 9.0,  firstTri: { min: 0.5, max: 2.0 } };

    if (twins) {  // approximate IOM provisional
      ranges = { min: 16.8, max: 24.5, firstTri: ranges.firstTri };
      if (b < 18.5) ranges = { min: 16.8, max: 24.5, firstTri: { min: 0.5, max: 2.0 } };
      else if (b >= 30) ranges = { min: 11.0, max: 19.0, firstTri: { min: 0.5, max: 2.0 } };
    }

    // Estimated gain by week W
    let expectedMin = 0, expectedMax = 0;
    if (w <= 12) {
      expectedMin = (ranges.firstTri.min * w) / 12;
      expectedMax = (ranges.firstTri.max * w) / 12;
    } else {
      const remaining = w - 12;
      const totalRemaining = 40 - 12;
      const restMin = ranges.min - ranges.firstTri.min;
      const restMax = ranges.max - ranges.firstTri.max;
      expectedMin = ranges.firstTri.min + (restMin * remaining) / totalRemaining;
      expectedMax = ranges.firstTri.max + (restMax * remaining) / totalRemaining;
    }

    let category = 'Normal';
    if (b < 18.5) category = 'Underweight';
    else if (b >= 30) category = 'Obese';
    else if (b >= 25) category = 'Overweight';

    return { ranges, expectedMin, expectedMax, category };
  }, [prePregBmi, weeks, twins]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Pre-pregnancy BMI" value={prePregBmi} onChangeText={setBmi} keyboardType="decimal-pad" />
          <Input label="Current week of pregnancy" value={weeks} onChangeText={setWeeks} keyboardType="numeric" />
          <Pressable onPress={() => setTwins(!twins)} className="flex-row items-center px-3 py-3 rounded-md border-hairline border-border dark:border-border-dark">
            <Text variant="body" className="flex-1">Twin pregnancy</Text>
            <View className={`w-5 h-5 rounded items-center justify-center border-2 ${twins ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark' : 'border-border-strong dark:border-border-strong-dark'}`}>
              {twins ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
            </View>
          </Pressable>
        </View>
      </Card>
      {out ? (
        <>
          <ResultDisplay
            label={`Expected gain by week ${weeks}`}
            value={`${out.expectedMin.toFixed(1)}–${out.expectedMax.toFixed(1)} kg`}
            sub={`${out.category} BMI · IOM 2009 guidance`}
          />
          <Card variant="subtle">
            <Text variant="bodyStrong">Total recommended (40 weeks)</Text>
            <Text variant="h2" tone="primary" className="mt-1">{out.ranges.min}–{out.ranges.max} kg</Text>
            <Text variant="caption" tone="muted" className="mt-2">
              First trimester (0–12 wk): {out.ranges.firstTri.min}–{out.ranges.firstTri.max} kg total{'\n'}
              Then ~0.4 kg / week (singleton normal-weight) for the rest of pregnancy.
            </Text>
          </Card>
        </>
      ) : (
        <ResultDisplay label="Expected gain" value="—" sub="Enter valid BMI and gestational week (0–42)." />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8. QiblaDirectionFinder — bearing from user to Mecca
// ─────────────────────────────────────────────────────────────────────
const KAABA = { lat: 21.4225, lon: 39.8262 };

function qiblaBearing(lat1: number, lon1: number) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lon - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PRESET_CITIES = [
  { label: 'Karachi',    lat: 24.8607,  lon: 67.0011 },
  { label: 'Lahore',     lat: 31.5497,  lon: 74.3436 },
  { label: 'Islamabad',  lat: 33.6844,  lon: 73.0479 },
  { label: 'Dubai',      lat: 25.2048,  lon: 55.2708 },
  { label: 'Riyadh',     lat: 24.7136,  lon: 46.6753 },
  { label: 'Istanbul',   lat: 41.0082,  lon: 28.9784 },
  { label: 'Cairo',      lat: 30.0444,  lon: 31.2357 },
  { label: 'Mumbai',     lat: 19.0760,  lon: 72.8777 },
  { label: 'London',     lat: 51.5074,  lon: -0.1278 },
  { label: 'New York',   lat: 40.7128,  lon: -74.0060 },
  { label: 'Tokyo',      lat: 35.6762,  lon: 139.6503 },
  { label: 'Sydney',     lat: -33.8688, lon: 151.2093 },
];

export function QiblaDirectionFinder() {
  const [lat, setLat] = useState('24.8607');
  const [lon, setLon] = useState('67.0011');

  const out = useMemo(() => {
    const a = parseFloat(lat);
    const b = parseFloat(lon);
    if (![a, b].every(isFinite) || Math.abs(a) > 90 || Math.abs(b) > 180) return null;
    const bearing = qiblaBearing(a, b);
    const distance = haversineKm(a, b, KAABA.lat, KAABA.lon);
    const compass = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(bearing / 45) % 8];
    return { bearing, distance, compass };
  }, [lat, lon]);

  return (
    <View className="gap-3">
      <Card>
        <Text variant="bodyStrong">Your location</Text>
        <View className="gap-2 mt-2">
          <View className="flex-row gap-2">
            <View className="flex-1"><Input label="Latitude" value={lat} onChangeText={setLat} keyboardType="numbers-and-punctuation" /></View>
            <View className="flex-1"><Input label="Longitude" value={lon} onChangeText={setLon} keyboardType="numbers-and-punctuation" /></View>
          </View>
          <Text variant="caption" tone="muted">Quick presets:</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {PRESET_CITIES.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => { setLat(String(c.lat)); setLon(String(c.lon)); }}
                className="px-2.5 py-1 rounded-pill bg-muted dark:bg-muted-dark active:opacity-80"
              >
                <Text variant="caption">{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Qibla bearing"
        value={out ? `${out.bearing.toFixed(2)}° (${out.compass})` : '—'}
        sub={out ? `Distance to Kaaba: ${out.distance.toFixed(0)} km` : 'Enter valid latitude/longitude'}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">How to use</Text>
          <Text variant="small" tone="muted" className="mt-1">
            {`Stand facing North, then rotate clockwise by ${out.bearing.toFixed(1)}°. The Qibla bearing assumes the great-circle (shortest) direction over the Earth's surface.`}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 9. QrCodeGenerator — uses free api.qrserver.com (no key)
// ─────────────────────────────────────────────────────────────────────
export function QrCodeGenerator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [text, setText] = useState('https://smartunitconverters.com');
  const [size, setSize] = useState('300');
  const url = useMemo(() => {
    const data = encodeURIComponent(text || ' ');
    return `https://api.qrserver.com/v1/create-qr-code/?data=${data}&size=${size}x${size}&format=png&margin=10`;
  }, [text, size]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Text or URL to encode" value={text} onChangeText={setText} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} autoCapitalize="none" />
          <Input label="Size (px)" value={size} onChangeText={setSize} keyboardType="numeric" hint="100–800" />
        </View>
      </Card>
      {text.trim() ? (
        <Card className="items-center py-4">
          <Image source={{ uri: url }} style={{ width: parseInt(size) || 300, height: parseInt(size) || 300, maxWidth: '100%' }} resizeMode="contain" />
          <Text variant="caption" tone="muted" className="mt-3">Powered by api.qrserver.com</Text>
        </Card>
      ) : (
        <Card className="items-center py-8">
          <Ionicons name="qr-code" size={64} color={tokens.textSubtle} />
          <Text variant="small" tone="muted" className="mt-2">Enter text to generate QR code</Text>
        </Card>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 10. BarcodeGenerator — uses free bwip-js render via online endpoint
// ─────────────────────────────────────────────────────────────────────
const BARCODE_TYPES = [
  { label: 'Code 128 (alphanumeric)', value: 'code128' },
  { label: 'EAN-13 (retail)',         value: 'ean13' },
  { label: 'EAN-8',                   value: 'ean8' },
  { label: 'UPC-A',                   value: 'upca' },
  { label: 'Code 39',                 value: 'code39' },
  { label: 'ITF (numeric)',           value: 'interleaved2of5' },
];

export function BarcodeGenerator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [text, setText] = useState('123456789012');
  const [type, setType] = useState('code128');
  const url = useMemo(() => {
    const t = encodeURIComponent(text || '');
    return `https://bwipjs-api.metafloor.com/?bcid=${type}&text=${t}&scale=3&height=20&includetext`;
  }, [text, type]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker label="Symbology" value={type} onChange={setType} options={BARCODE_TYPES} />
          <Input label="Text / number to encode" value={text} onChangeText={setText} autoCapitalize="none" />
        </View>
      </Card>
      {text.trim() ? (
        <Card className="items-center py-4 bg-white">
          <Image source={{ uri: url }} style={{ width: 280, height: 100 }} resizeMode="contain" />
          <Text variant="caption" tone="muted" className="mt-3">Powered by bwipjs-api.metafloor.com</Text>
        </Card>
      ) : (
        <Card className="items-center py-8">
          <Ionicons name="barcode" size={64} color={tokens.textSubtle} />
          <Text variant="small" tone="muted" className="mt-2">Enter text to generate barcode</Text>
        </Card>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 11. SolidVolumeCalculator — common 3D shapes
// ─────────────────────────────────────────────────────────────────────
const SHAPES = [
  { label: 'Cube',     value: 'cube' },
  { label: 'Cuboid (box)', value: 'cuboid' },
  { label: 'Sphere',   value: 'sphere' },
  { label: 'Cylinder', value: 'cylinder' },
  { label: 'Cone',     value: 'cone' },
  { label: 'Pyramid (square base)', value: 'pyramid' },
  { label: 'Hemisphere', value: 'hemisphere' },
];

export function SolidVolumeCalculator() {
  const [shape, setShape] = useState('cube');
  const [a, setA] = useState('5');
  const [b, setB] = useState('3');
  const [c, setC] = useState('2');

  const out = useMemo(() => {
    const x = parseFloat(a), y = parseFloat(b), z = parseFloat(c);
    if (!isFinite(x) || x <= 0) return null;
    switch (shape) {
      case 'cube':       return { volume: x ** 3, surface: 6 * x ** 2, label: 'side', dims: '1' };
      case 'cuboid':     return isFinite(y) && isFinite(z) ? {
        volume: x * y * z,
        surface: 2 * (x * y + y * z + x * z),
        label: 'L × W × H', dims: '3',
      } : null;
      case 'sphere':     return { volume: (4 / 3) * Math.PI * x ** 3, surface: 4 * Math.PI * x ** 2, label: 'radius', dims: '1' };
      case 'cylinder':   return isFinite(y) ? {
        volume: Math.PI * x ** 2 * y,
        surface: 2 * Math.PI * x * (x + y),
        label: 'r, h', dims: '2',
      } : null;
      case 'cone':       return isFinite(y) ? {
        volume: (1 / 3) * Math.PI * x ** 2 * y,
        surface: Math.PI * x * (x + Math.sqrt(x ** 2 + y ** 2)),
        label: 'r, h', dims: '2',
      } : null;
      case 'pyramid':    return isFinite(y) ? {
        volume: (x ** 2 * y) / 3,
        surface: x ** 2 + 2 * x * Math.sqrt((x / 2) ** 2 + y ** 2),
        label: 'base, h', dims: '2',
      } : null;
      case 'hemisphere': return { volume: (2 / 3) * Math.PI * x ** 3, surface: 3 * Math.PI * x ** 2, label: 'radius', dims: '1' };
    }
    return null;
  }, [shape, a, b, c]);

  const dims = out?.dims ?? '1';
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker label="Shape" value={shape} onChange={setShape} options={SHAPES} />
          {shape === 'cuboid' ? (
            <View className="flex-row gap-2">
              <View className="flex-1"><Input label="Length" value={a} onChangeText={setA} keyboardType="decimal-pad" /></View>
              <View className="flex-1"><Input label="Width" value={b} onChangeText={setB} keyboardType="decimal-pad" /></View>
              <View className="flex-1"><Input label="Height" value={c} onChangeText={setC} keyboardType="decimal-pad" /></View>
            </View>
          ) : dims === '2' ? (
            <View className="flex-row gap-2">
              <View className="flex-1"><Input label={shape === 'pyramid' ? 'Base side' : 'Radius'} value={a} onChangeText={setA} keyboardType="decimal-pad" /></View>
              <View className="flex-1"><Input label="Height" value={b} onChangeText={setB} keyboardType="decimal-pad" /></View>
            </View>
          ) : (
            <Input label={shape === 'sphere' || shape === 'hemisphere' ? 'Radius' : 'Side'} value={a} onChangeText={setA} keyboardType="decimal-pad" />
          )}
        </View>
      </Card>
      <ResultDisplay label="Volume" value={out ? `${fmt(out.volume)} units³` : '—'} sub={out ? `Surface area: ${fmt(out.surface)} units²` : undefined} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 12. StudentResultCard — multi-subject grading
// ─────────────────────────────────────────────────────────────────────
type Subject = { id: number; name: string; obtained: string; total: string };

const GRADE_BANDS: { min: number; grade: string; gpa: number }[] = [
  { min: 90, grade: 'A+', gpa: 4.0 },
  { min: 80, grade: 'A',  gpa: 4.0 },
  { min: 70, grade: 'B+', gpa: 3.5 },
  { min: 60, grade: 'B',  gpa: 3.0 },
  { min: 50, grade: 'C',  gpa: 2.0 },
  { min: 40, grade: 'D',  gpa: 1.0 },
  { min: 0,  grade: 'F',  gpa: 0.0 },
];

function gradeFor(pct: number) {
  return GRADE_BANDS.find((b) => pct >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

export function StudentResultCard() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [studentName, setStudentName] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Mathematics', obtained: '85', total: '100' },
    { id: 2, name: 'English',     obtained: '78', total: '100' },
    { id: 3, name: 'Science',     obtained: '92', total: '100' },
  ]);

  const update = (id: number, field: keyof Subject, v: string) =>
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: v } : s)));

  const out = useMemo(() => {
    const rows = subjects.map((s) => {
      const ob = parseFloat(s.obtained);
      const tot = parseFloat(s.total);
      const valid = isFinite(ob) && isFinite(tot) && tot > 0;
      const pct = valid ? (ob / tot) * 100 : 0;
      const g = valid ? gradeFor(pct) : null;
      return { ...s, ob, tot, pct, grade: g, valid };
    });
    const validRows = rows.filter((r) => r.valid);
    const totalObtained = validRows.reduce((a, r) => a + r.ob, 0);
    const totalMarks = validRows.reduce((a, r) => a + r.tot, 0);
    const overallPct = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
    const cgpa = validRows.length > 0 ? validRows.reduce((a, r) => a + (r.grade?.gpa ?? 0), 0) / validRows.length : 0;
    const overallGrade = totalMarks > 0 ? gradeFor(overallPct) : null;
    return { rows, totalObtained, totalMarks, overallPct, cgpa, overallGrade };
  }, [subjects]);

  return (
    <View className="gap-3">
      <Card>
        <Input label="Student name" value={studentName} onChangeText={setStudentName} icon="person" placeholder="Optional" />
      </Card>
      <Card>
        <Text variant="bodyStrong">Subjects ({subjects.length})</Text>
        <View className="gap-2 mt-2">
          {subjects.map((s, i) => (
            <View key={s.id} className="rounded-md border-hairline border-border dark:border-border-dark p-3 gap-2">
              <View className="flex-row items-center gap-2">
                <View className="flex-1"><Input label={`Subject ${i + 1}`} value={s.name} onChangeText={(v) => update(s.id, 'name', v)} /></View>
                {subjects.length > 1 ? (
                  <Pressable onPress={() => setSubjects(subjects.filter((x) => x.id !== s.id))} className="w-8 h-8 rounded-md items-center justify-center bg-danger/10 active:opacity-70">
                    <Ionicons name="close" size={16} color={tokens.danger} />
                  </Pressable>
                ) : null}
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1"><Input label="Obtained" value={s.obtained} onChangeText={(v) => update(s.id, 'obtained', v)} keyboardType="decimal-pad" /></View>
                <View className="flex-1"><Input label="Total" value={s.total} onChangeText={(v) => update(s.id, 'total', v)} keyboardType="decimal-pad" /></View>
              </View>
              {out.rows[i].valid ? (
                <View className="flex-row gap-2 pt-1 border-t-hairline border-border dark:border-border-dark">
                  <Text variant="caption" tone="muted" className="flex-1">{out.rows[i].pct.toFixed(1)}% · GPA {out.rows[i].grade?.gpa.toFixed(1) ?? '—'}</Text>
                  <Text variant="caption" tone="primary">Grade {out.rows[i].grade?.grade ?? '—'}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
        <View className="mt-3">
          <Button
            title="Add subject"
            icon="add"
            size="sm"
            variant="secondary"
            fullWidth
            onPress={() => setSubjects([...subjects, { id: Date.now(), name: '', obtained: '', total: '100' }])}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Overall percentage"
        value={`${out.overallPct.toFixed(2)}%`}
        sub={`${out.totalObtained.toFixed(0)} / ${out.totalMarks.toFixed(0)} · CGPA ${out.cgpa.toFixed(2)} · Grade ${out.overallGrade?.grade ?? '—'}`}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 13. Vo2MaxCalculator — 1.5-mile run test (Cooper) + resting HR method
// ─────────────────────────────────────────────────────────────────────
export function Vo2MaxCalculator() {
  const [method, setMethod] = useState<'cooper' | 'rhr'>('cooper');
  // Cooper 1.5-mile run
  const [mins, setMins] = useState('12');
  const [secs, setSecs] = useState('30');
  // Resting HR method
  const [age, setAge] = useState('30');
  const [restingHr, setRestingHr] = useState('60');

  const out = useMemo(() => {
    if (method === 'cooper') {
      const m = parseFloat(mins); const s = parseFloat(secs);
      if (![m, s].every(isFinite) || m <= 0) return null;
      const totalMin = m + s / 60;
      // Cooper formula: VO2 = 483 / time + 3.5
      return 483 / totalMin + 3.5;
    } else {
      const a = parseFloat(age); const r = parseFloat(restingHr);
      if (![a, r].every(isFinite) || r <= 0) return null;
      const maxHr = 208 - 0.7 * a;
      return 15.3 * (maxHr / r);
    }
  }, [method, mins, secs, age, restingHr]);

  const fitness = (vo2: number) => {
    if (vo2 < 25) return 'Poor';
    if (vo2 < 35) return 'Fair';
    if (vo2 < 45) return 'Average';
    if (vo2 < 55) return 'Good';
    if (vo2 < 65) return 'Excellent';
    return 'Elite';
  };

  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted" className="mb-1.5">METHOD</Text>
        <SegmentedControl
          value={method}
          onChange={setMethod}
          options={[
            { label: 'Cooper run', value: 'cooper' },
            { label: 'Resting HR', value: 'rhr' },
          ]}
        />
        <View className="gap-3 mt-3.5">
          {method === 'cooper' ? (
            <>
              <Text variant="caption" tone="muted">{`1.5-mile (2.4 km) run time`}</Text>
              <View className="flex-row gap-2">
                <View className="flex-1"><Input label="Minutes" value={mins} onChangeText={setMins} keyboardType="numeric" /></View>
                <View className="flex-1"><Input label="Seconds" value={secs} onChangeText={setSecs} keyboardType="numeric" /></View>
              </View>
            </>
          ) : (
            <>
              <Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
              <Input label="Resting heart rate (bpm)" value={restingHr} onChangeText={setRestingHr} keyboardType="numeric" />
            </>
          )}
        </View>
      </Card>
      <ResultDisplay
        label="VO₂ max"
        value={out === null ? '—' : `${out.toFixed(1)} mL/(kg·min)`}
        sub={out === null ? undefined : `Cardio fitness: ${fitness(out)}`}
      />
      <Card variant="subtle">
        <Text variant="caption" tone="muted">REFERENCE</Text>
        <Text variant="small" tone="muted" className="mt-1">
          VO₂ max = max rate of oxygen your body uses during exercise. Endurance athletes 60-90, fit adults 40-50, sedentary adults 25-35.
        </Text>
      </Card>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 14. ImageFormatConverter — advisor (no real conversion without lib)
// ─────────────────────────────────────────────────────────────────────
const FORMAT_INFO = [
  { name: 'JPEG', strengths: ['Photos', 'Small size', 'Universal'], weaknesses: ['Lossy', 'No transparency'], use: 'Photos for web/email' },
  { name: 'PNG',  strengths: ['Lossless', 'Transparency', 'Sharp lines'], weaknesses: ['Large size', 'No animation'], use: 'Logos, screenshots, UI' },
  { name: 'WebP', strengths: ['Smaller than JPG', 'Transparency', 'Animation'], weaknesses: ['Older browsers'], use: 'Modern web images' },
  { name: 'GIF',  strengths: ['Animation', 'Universal'], weaknesses: ['256 colors only', 'Larger than WebP'], use: 'Simple animations, memes' },
  { name: 'SVG',  strengths: ['Infinite scaling', 'Tiny for shapes', 'Editable'], weaknesses: ['Not for photos'], use: 'Icons, logos, illustrations' },
  { name: 'AVIF', strengths: ['Smallest size', 'Transparency', 'HDR'], weaknesses: ['Newest, weaker support'], use: 'Cutting-edge web' },
];

export function ImageFormatConverter() {
  const [useCase, setUseCase] = useState('photos');
  const recommendation = useMemo(() => {
    if (useCase === 'photos') return ['JPEG', 'WebP', 'AVIF'];
    if (useCase === 'logos') return ['SVG', 'PNG'];
    if (useCase === 'icons') return ['SVG', 'PNG'];
    if (useCase === 'screenshots') return ['PNG', 'WebP'];
    if (useCase === 'animations') return ['GIF', 'WebP', 'APNG'];
    return ['PNG'];
  }, [useCase]);

  return (
    <View className="gap-3">
      <Card>
        <Picker
          label="What are you converting?"
          value={useCase}
          onChange={setUseCase}
          options={[
            { label: 'Photos / photographs', value: 'photos' },
            { label: 'Logos / brand assets',  value: 'logos' },
            { label: 'Icons / UI graphics',   value: 'icons' },
            { label: 'Screenshots',           value: 'screenshots' },
            { label: 'Animations',            value: 'animations' },
          ]}
        />
      </Card>
      <ResultDisplay
        label="Best formats for this use"
        value={recommendation.join(' · ')}
        sub="Listed in preference order — first is usually optimal."
      />
      <Card>
        <Text variant="bodyStrong">Format guide</Text>
        <View className="gap-3 mt-2">
          {FORMAT_INFO.map((f) => (
            <View key={f.name} className="rounded-md border-hairline border-border dark:border-border-dark p-3">
              <View className="flex-row items-center">
                <Text variant="bodyStrong" tone="primary" className="flex-1">{f.name}</Text>
                <Text variant="caption" tone="muted">{f.use}</Text>
              </View>
              <Text variant="small" tone="success" className="mt-1.5">+ {f.strengths.join(' · ')}</Text>
              <Text variant="small" tone="warning" className="mt-0.5">− {f.weaknesses.join(' · ')}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card variant="subtle">
        <Text variant="caption" tone="muted">NOTE</Text>
        <Text variant="small" tone="muted" className="mt-1">
          Actual format conversion requires platform-specific image processing. Use a desktop tool (Squoosh, Photoshop) or a server-side service for the conversion itself; this advisor helps you pick the right target format.
        </Text>
      </Card>
    </View>
  );
}
