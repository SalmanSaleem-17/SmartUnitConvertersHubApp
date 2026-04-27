import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function num(v: string): number {
  const n = parseFloat(v);
  return isFinite(n) ? n : NaN;
}

function fmt(n: number, digits = 1): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// 1. TDEE
// ---------------------------------------------------------------------------
export function TdeeCalculator() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('0');

  const out = useMemo(() => {
    const a = num(age); const w = num(weight); const h = num(height);
    const af = num(activity); const g = num(goal);
    if (![a, w, h, af].every(isFinite) || w <= 0 || h <= 0 || a <= 0) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'male' ? 5 : -161);
    const tdee = bmr * af;
    const target = tdee + (isFinite(g) ? g : 0);
    const proteinKcal = target * 0.3;
    const carbsKcal = target * 0.4;
    const fatKcal = target * 0.3;
    return {
      bmr,
      tdee,
      target,
      protein: proteinKcal / 4,
      carbs: carbsKcal / 4,
      fat: fatKcal / 9,
    };
  }, [sex, age, weight, height, activity, goal]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View>
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
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
          <Picker
            label="Activity level"
            value={activity}
            onChange={setActivity}
            options={[
              { label: 'Sedentary (little/no exercise)', value: '1.2' },
              { label: 'Light (1-3 days/week)', value: '1.375' },
              { label: 'Moderate (3-5 days/week)', value: '1.55' },
              { label: 'Active (6-7 days/week)', value: '1.725' },
              { label: 'Athlete (2x/day)', value: '1.9' },
            ]}
          />
          <Picker
            label="Goal"
            value={goal}
            onChange={setGoal}
            options={[
              { label: 'Maintain weight', value: '0' },
              { label: 'Mild loss (-250 kcal)', value: '-250' },
              { label: 'Loss (-500 kcal)', value: '-500' },
              { label: 'Mild gain (+250 kcal)', value: '250' },
              { label: 'Gain (+500 kcal)', value: '500' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="TDEE"
        value={out ? `${fmt(out.tdee, 0)} kcal/day` : '—'}
        sub={out ? `BMR: ${fmt(out.bmr, 0)} kcal · Mifflin-St Jeor` : undefined}
      />
      <ResultDisplay
        label="Daily target"
        emphasize={false}
        value={out ? `${fmt(out.target, 0)} kcal/day` : '—'}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong" className="mb-2">Macros estimate (30/40/30)</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text variant="caption" tone="muted">PROTEIN</Text>
              <Text variant="h3">{fmt(out.protein, 0)} g</Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">CARBS</Text>
              <Text variant="h3">{fmt(out.carbs, 0)} g</Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">FAT</Text>
              <Text variant="h3">{fmt(out.fat, 0)} g</Text>
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2. Macro
// ---------------------------------------------------------------------------
export function MacroCalculator() {
  const [calories, setCalories] = useState('2000');
  const [pPct, setPPct] = useState('30');
  const [cPct, setCPct] = useState('40');
  const [fPct, setFPct] = useState('30');

  const out = useMemo(() => {
    const k = num(calories); const p = num(pPct); const c = num(cPct); const f = num(fPct);
    if (![k, p, c, f].every(isFinite) || k <= 0) return null;
    const sum = p + c + f;
    return {
      sum,
      protein: (k * p) / 100 / 4,
      carbs: (k * c) / 100 / 4,
      fat: (k * f) / 100 / 9,
    };
  }, [calories, pPct, cPct, fPct]);

  const valid = out && Math.abs(out.sum - 100) < 0.01;

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Daily calories (kcal)" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Protein %" value={pPct} onChangeText={setPPct} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Carbs %" value={cPct} onChangeText={setCPct} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Fat %" value={fPct} onChangeText={setFPct} keyboardType="decimal-pad" /></View>
          </View>
          {out && !valid ? (
            <Text variant="small" tone="danger">Percentages should sum to 100 (currently {fmt(out.sum, 1)}).</Text>
          ) : null}
        </View>
      </Card>
      <ResultDisplay label="Protein" value={valid ? `${fmt(out!.protein, 0)} g` : '—'} />
      <ResultDisplay label="Carbs" emphasize={false} value={valid ? `${fmt(out!.carbs, 0)} g` : '—'} />
      <ResultDisplay label="Fat" emphasize={false} value={valid ? `${fmt(out!.fat, 0)} g` : '—'} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. Calories Burned
// ---------------------------------------------------------------------------
export function CaloriesBurnedCalculator() {
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('30');
  const [met, setMet] = useState('7');

  const out = useMemo(() => {
    const w = num(weight); const d = num(duration); const m = num(met);
    if (![w, d, m].every(isFinite) || w <= 0 || d <= 0) return null;
    return (m * 3.5 * w / 200) * d;
  }, [weight, duration, met]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          <Input label="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="decimal-pad" />
          <Picker
            label="Activity"
            value={met}
            onChange={setMet}
            options={[
              { label: 'Walking', value: '3.5' },
              { label: 'Jogging', value: '7' },
              { label: 'Running', value: '10' },
              { label: 'Cycling', value: '8' },
              { label: 'Swimming', value: '8' },
              { label: 'HIIT', value: '10' },
              { label: 'Weight training', value: '6' },
              { label: 'Yoga', value: '2.5' },
              { label: 'Cleaning', value: '3.5' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Calories burned"
        value={out === null ? '—' : `${fmt(out, 0)} kcal`}
        sub={out === null ? undefined : `MET ${met} × ${duration} min`}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4. Pregnancy Due Date
// ---------------------------------------------------------------------------
export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState(() => new Date().toISOString().slice(0, 10));

  const out = useMemo(() => {
    const d = new Date(lmp + 'T00:00:00');
    if (isNaN(d.getTime())) return null;
    const due = new Date(d);
    due.setDate(d.getDate() + 280);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const week = Math.max(0, Math.floor(diffDays / 7));
    let trimester = '—';
    if (week >= 0 && week < 13) trimester = '1st trimester';
    else if (week < 27) trimester = '2nd trimester';
    else if (week <= 42) trimester = '3rd trimester';
    else trimester = 'Past due';
    return { due: due.toISOString().slice(0, 10), week, trimester, diffDays };
  }, [lmp]);

  return (
    <View className="gap-3">
      <Card>
        <Input label="Last menstrual period (YYYY-MM-DD)" value={lmp} onChangeText={setLmp} autoCapitalize="none" />
      </Card>
      <ResultDisplay label="Estimated due date" value={out?.due ?? '—'} sub={out ? `LMP + 280 days` : undefined} />
      <ResultDisplay
        label="Current pregnancy"
        emphasize={false}
        value={out && out.diffDays >= 0 ? `Week ${out.week}` : '—'}
        sub={out && out.diffDays >= 0 ? out.trimester : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 5. Ovulation
// ---------------------------------------------------------------------------
export function OvulationCalculator() {
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [cycle, setCycle] = useState('28');

  const out = useMemo(() => {
    const d = new Date(start + 'T00:00:00');
    const c = num(cycle);
    if (isNaN(d.getTime()) || !isFinite(c) || c < 20 || c > 45) return null;
    const ov = new Date(d);
    ov.setDate(d.getDate() + c - 14);
    const fStart = new Date(ov); fStart.setDate(ov.getDate() - 5);
    const fEnd = new Date(ov); fEnd.setDate(ov.getDate() + 1);
    const nextPeriod = new Date(d); nextPeriod.setDate(d.getDate() + c);
    return {
      ov: ov.toISOString().slice(0, 10),
      fStart: fStart.toISOString().slice(0, 10),
      fEnd: fEnd.toISOString().slice(0, 10),
      nextPeriod: nextPeriod.toISOString().slice(0, 10),
    };
  }, [start, cycle]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Last period start (YYYY-MM-DD)" value={start} onChangeText={setStart} autoCapitalize="none" />
          <Input label="Average cycle length (days)" value={cycle} onChangeText={setCycle} keyboardType="numeric" hint="Typically 21-35 days" />
        </View>
      </Card>
      <ResultDisplay label="Estimated ovulation" value={out?.ov ?? '—'} />
      <ResultDisplay label="Fertile window" emphasize={false} value={out ? `${out.fStart} → ${out.fEnd}` : '—'} />
      <ResultDisplay label="Next period" emphasize={false} value={out?.nextPeriod ?? '—'} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 6. Lean Body Mass (Boer)
// ---------------------------------------------------------------------------
export function LeanBodyMassCalculator() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');

  const out = useMemo(() => {
    const w = num(weight); const h = num(height);
    if (![w, h].every(isFinite) || w <= 0 || h <= 0) return null;
    const lbm = sex === 'male' ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
    return { lbm, fat: w - lbm, fatPct: ((w - lbm) / w) * 100 };
  }, [sex, weight, height]);

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
        <View className="mt-3.5 gap-3">
          <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Lean body mass" value={out ? `${fmt(out.lbm, 1)} kg` : '—'} sub="Boer formula" />
      <ResultDisplay
        label="Body fat mass"
        emphasize={false}
        value={out ? `${fmt(out.fat, 1)} kg` : '—'}
        sub={out ? `${fmt(out.fatPct, 1)}% of body weight` : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 7. Waist-Hip Ratio
// ---------------------------------------------------------------------------
export function WaistHipRatioCalculator() {
  const [waist, setWaist] = useState('80');
  const [hip, setHip] = useState('100');
  const [sex, setSex] = useState<'male' | 'female'>('male');

  const out = useMemo(() => {
    const w = num(waist); const h = num(hip);
    if (![w, h].every(isFinite) || h <= 0 || w <= 0) return null;
    const ratio = w / h;
    let risk = 'Low';
    if (sex === 'male') {
      if (ratio >= 1.0) risk = 'High';
      else if (ratio >= 0.9) risk = 'Moderate';
    } else {
      if (ratio >= 0.85) risk = 'High';
      else if (ratio >= 0.8) risk = 'Moderate';
    }
    return { ratio, risk };
  }, [waist, hip, sex]);

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
        <View className="mt-3.5 flex-row gap-3">
          <View className="flex-1"><Input label="Waist (cm)" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" /></View>
          <View className="flex-1"><Input label="Hip (cm)" value={hip} onChangeText={setHip} keyboardType="decimal-pad" /></View>
        </View>
      </Card>
      <ResultDisplay
        label="Waist-hip ratio"
        value={out ? out.ratio.toFixed(2) : '—'}
        sub={out ? `Risk: ${out.risk}` : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 8. BAC (Widmark)
// ---------------------------------------------------------------------------
export function BacCalculator() {
  const [drinks, setDrinks] = useState('2');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('70');
  const [hours, setHours] = useState('1');
  const [oz, setOz] = useState('1.5');
  const [abv, setAbv] = useState('40');

  const out = useMemo(() => {
    const d = num(drinks); const w = num(weight); const t = num(hours);
    const o = num(oz); const a = num(abv);
    if (![d, w, t, o, a].every(isFinite) || w <= 0) return null;
    const grams = d * o * 29.5735 * (a / 100) * 0.789;
    const r = sex === 'male' ? 0.68 : 0.55;
    const raw = (grams / (w * 1000 * r)) * 100 - 0.015 * Math.max(0, t);
    const bac = Math.max(0, raw);
    let cat = 'Negligible';
    if (bac >= 0.15) cat = 'Severe — call for help';
    else if (bac >= 0.08) cat = 'Over US legal limit';
    else if (bac >= 0.05) cat = 'Caution — impaired';
    else if (bac >= 0.02) cat = 'Light';
    return { bac, cat };
  }, [drinks, sex, weight, hours, oz, abv]);

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
        <View className="mt-3.5 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Drinks" value={drinks} onChangeText={setDrinks} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Drink size (oz)" value={oz} onChangeText={setOz} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="ABV %" value={abv} onChangeText={setAbv} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Hours since first drink" value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="Estimated BAC"
        value={out ? `${out.bac.toFixed(3)}%` : '—'}
        sub={out ? out.cat : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 9. Blood Pressure
// ---------------------------------------------------------------------------
export function BloodPressureCalculator() {
  const [sys, setSys] = useState('120');
  const [dia, setDia] = useState('80');

  const out = useMemo(() => {
    const s = num(sys); const d = num(dia);
    if (![s, d].every(isFinite) || s <= 0 || d <= 0) return null;
    let cat = 'Normal';
    if (s >= 180 || d >= 120) cat = 'Hypertensive crisis';
    else if (s >= 140 || d >= 90) cat = 'Stage 2 hypertension';
    else if (s >= 130 || d >= 80) cat = 'Stage 1 hypertension';
    else if (s >= 120 && d < 80) cat = 'Elevated';
    else cat = 'Normal';
    const pp = s - d;
    const map = d + (s - d) / 3;
    return { cat, pp, map };
  }, [sys, dia]);

  return (
    <View className="gap-3">
      <Card>
        <View className="flex-row gap-3">
          <View className="flex-1"><Input label="Systolic (mmHg)" value={sys} onChangeText={setSys} keyboardType="numeric" /></View>
          <View className="flex-1"><Input label="Diastolic (mmHg)" value={dia} onChangeText={setDia} keyboardType="numeric" /></View>
        </View>
      </Card>
      <ResultDisplay label="Classification (AHA)" value={out?.cat ?? '—'} />
      <ResultDisplay
        label="Pulse pressure"
        emphasize={false}
        value={out ? `${fmt(out.pp, 0)} mmHg` : '—'}
        sub={out ? `MAP: ${fmt(out.map, 1)} mmHg` : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 10. Sleep Cycle
// ---------------------------------------------------------------------------
export function SleepCycleCalculator() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
  const [time, setTime] = useState('07:00');

  const out = useMemo(() => {
    const m = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10); const mm = parseInt(m[2], 10);
    if (!isFinite(h) || !isFinite(mm) || h > 23 || mm > 59) return null;
    const base = h * 60 + mm;
    const fall = 14;
    const cycles = [1, 2, 3, 4, 5, 6];
    const list = cycles.map((c) => {
      const offset = c * 90 + fall;
      const total = mode === 'wake' ? base - offset : base + offset;
      const norm = ((total % 1440) + 1440) % 1440;
      return {
        cycles: c,
        time: `${pad2(Math.floor(norm / 60))}:${pad2(norm % 60)}`,
        hours: (c * 90) / 60,
      };
    });
    return mode === 'wake' ? list.slice().reverse() : list;
  }, [mode, time]);

  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Wake at', value: 'wake' },
            { label: 'Sleep at', value: 'sleep' },
          ]}
        />
        <View className="mt-3.5">
          <Input
            label={mode === 'wake' ? 'Wake time (HH:MM)' : 'Bedtime (HH:MM)'}
            value={time}
            onChangeText={setTime}
            placeholder="07:00"
            autoCapitalize="none"
          />
        </View>
      </Card>
      {out ? (
        <Card>
          <Text variant="bodyStrong">{mode === 'wake' ? 'Suggested bedtimes' : 'Suggested wake times'}</Text>
          <Text variant="small" tone="muted" className="mb-2">Includes 14 min to fall asleep · 90-minute cycles</Text>
          {out.map((row) => (
            <View key={row.cycles} className="flex-row items-center py-2">
              <Text variant="bodyStrong" className="flex-1">{row.time}</Text>
              <Text variant="small" tone="muted">{row.cycles} cycle{row.cycles > 1 ? 's' : ''} · {row.hours}h sleep</Text>
            </View>
          ))}
        </Card>
      ) : (
        <ResultDisplay label="Result" value="—" sub="Enter time as HH:MM (24h)" />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 11. eGFR (MDRD)
// ---------------------------------------------------------------------------
export function EgfrCalculator() {
  const [age, setAge] = useState('40');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [race, setRace] = useState('non-black');
  const [creat, setCreat] = useState('1.0');

  const out = useMemo(() => {
    const a = num(age); const c = num(creat);
    if (![a, c].every(isFinite) || a <= 0 || c <= 0) return null;
    const e = 175 * Math.pow(c, -1.154) * Math.pow(a, -0.203)
      * (sex === 'female' ? 0.742 : 1)
      * (race === 'black' ? 1.212 : 1);
    let stage = 'G1 — Normal';
    if (e < 15) stage = 'G5 — Kidney failure';
    else if (e < 30) stage = 'G4 — Severely decreased';
    else if (e < 45) stage = 'G3b — Moderate-severe';
    else if (e < 60) stage = 'G3a — Mild-moderate';
    else if (e < 90) stage = 'G2 — Mildly decreased';
    return { e, stage };
  }, [age, sex, race, creat]);

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
        <View className="mt-3.5 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Creatinine (mg/dL)" value={creat} onChangeText={setCreat} keyboardType="decimal-pad" /></View>
          </View>
          <Picker
            label="Race"
            value={race}
            onChange={setRace}
            options={[
              { label: 'Non-Black', value: 'non-black' },
              { label: 'Black', value: 'black' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="eGFR (MDRD)"
        value={out ? `${fmt(out.e, 1)} mL/min/1.73m²` : '—'}
        sub={out ? out.stage : undefined}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 12. BSA
// ---------------------------------------------------------------------------
export function BsaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');

  const out = useMemo(() => {
    const w = num(weight); const h = num(height);
    if (![w, h].every(isFinite) || w <= 0 || h <= 0) return null;
    return {
      duBois: 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725),
      mosteller: Math.sqrt((w * h) / 3600),
      haycock: 0.024265 * Math.pow(w, 0.5378) * Math.pow(h, 0.3964),
    };
  }, [weight, height]);

  return (
    <View className="gap-3">
      <Card>
        <View className="flex-row gap-3">
          <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
          <View className="flex-1"><Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /></View>
        </View>
      </Card>
      <ResultDisplay label="Mosteller" value={out ? `${out.mosteller.toFixed(2)} m²` : '—'} />
      <ResultDisplay label="DuBois" emphasize={false} value={out ? `${out.duBois.toFixed(2)} m²` : '—'} />
      <ResultDisplay label="Haycock" emphasize={false} value={out ? `${out.haycock.toFixed(2)} m²` : '—'} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 13. Child BMI Percentile (approx)
// ---------------------------------------------------------------------------
export function ChildBmiPercentileCalculator() {
  const [age, setAge] = useState('10');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('35');
  const [height, setHeight] = useState('140');

  const out = useMemo(() => {
    const a = num(age); const w = num(weight); const h = num(height);
    if (![a, w, h].every(isFinite) || a < 2 || a > 20 || w <= 0 || h <= 0) return null;
    const m = h / 100;
    const bmi = w / (m * m);
    let cat = 'Healthy weight';
    if (bmi < 16) cat = 'Underweight (<5th %ile)';
    else if (bmi < 18.5) cat = 'Healthy (5–85th %ile)';
    else if (bmi < 25) cat = 'Overweight (85–95th %ile)';
    else cat = 'Obese (≥95th %ile)';
    return { bmi, cat };
  }, [age, sex, weight, height]);

  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted">SEX</Text>
        <View className="mt-1.5">
          <SegmentedControl
            value={sex}
            onChange={setSex}
            options={[
              { label: 'Boy', value: 'male' },
              { label: 'Girl', value: 'female' },
            ]}
          />
        </View>
        <View className="mt-3.5 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Age (2-20)" value={age} onChangeText={setAge} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="BMI"
        value={out ? out.bmi.toFixed(1) : '—'}
        sub={out ? out.cat : 'Approximation only — use CDC LMS tables for diagnosis'}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// 14. Chronological Age
// ---------------------------------------------------------------------------
export function ChronologicalAgeCalculator() {
  const [birth, setBirth] = useState('2000-01-01');
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));

  const out = useMemo(() => {
    const b = new Date(birth + 'T00:00:00');
    const a = new Date(asOf + 'T00:00:00');
    if (isNaN(b.getTime()) || isNaN(a.getTime()) || a < b) return null;
    let years = a.getFullYear() - b.getFullYear();
    let months = a.getMonth() - b.getMonth();
    let days = a.getDate() - b.getDate();
    if (days < 0) {
      months -= 1;
      const prev = new Date(a.getFullYear(), a.getMonth(), 0).getDate();
      days += prev;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMs = a.getTime() - b.getTime();
    const totalDays = Math.floor(totalMs / 86400000);
    return {
      years, months, days,
      totalDays,
      weeks: Math.floor(totalDays / 7),
      hours: Math.floor(totalMs / 3600000),
      minutes: Math.floor(totalMs / 60000),
      seconds: Math.floor(totalMs / 1000),
    };
  }, [birth, asOf]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Birth date (YYYY-MM-DD)" value={birth} onChangeText={setBirth} autoCapitalize="none" />
          <Input label="As of date (YYYY-MM-DD)" value={asOf} onChangeText={setAsOf} autoCapitalize="none" />
        </View>
      </Card>
      <ResultDisplay
        label="Age"
        value={out ? `${out.years}y ${out.months}m ${out.days}d` : '—'}
        sub={out ? `${out.totalDays.toLocaleString()} total days` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text variant="caption" tone="muted">WEEKS</Text>
              <Text variant="h3">{out.weeks.toLocaleString()}</Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">DAYS</Text>
              <Text variant="h3">{out.totalDays.toLocaleString()}</Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <Text variant="caption" tone="muted">HOURS</Text>
              <Text variant="h3">{out.hours.toLocaleString()}</Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">MINUTES</Text>
              <Text variant="h3">{out.minutes.toLocaleString()}</Text>
            </View>
          </View>
          <View className="mt-3">
            <Text variant="caption" tone="muted">SECONDS</Text>
            <Text variant="h3">{out.seconds.toLocaleString()}</Text>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 15. Protein Intake
// ---------------------------------------------------------------------------
export function ProteinIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [goal, setGoal] = useState('1.6');

  const out = useMemo(() => {
    const w = num(weight); const g = num(goal);
    if (![w, g].every(isFinite) || w <= 0 || g <= 0) return null;
    const total = w * g;
    return { total, perMeal: total / 4 };
  }, [weight, goal]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          <Picker
            label="Goal"
            value={goal}
            onChange={setGoal}
            options={[
              { label: 'Sedentary (0.8 g/kg)', value: '0.8' },
              { label: 'Recreational athlete (1.2 g/kg)', value: '1.2' },
              { label: 'Endurance (1.4 g/kg)', value: '1.4' },
              { label: 'Strength training (1.6 g/kg)', value: '1.6' },
              { label: 'Cutting / preserve muscle (2.0 g/kg)', value: '2.0' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Daily protein"
        value={out ? `${fmt(out.total, 0)} g/day` : '—'}
        sub={out ? `${goal} g per kg of body weight` : undefined}
      />
      <ResultDisplay
        label="Per meal (4 meals)"
        emphasize={false}
        value={out ? `${fmt(out.perMeal, 0)} g` : '—'}
      />
    </View>
  );
}
