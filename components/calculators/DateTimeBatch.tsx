import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

const TIMEZONES = [
  { label: 'Karachi (PKT) UTC+5',     value: 'Asia/Karachi' },
  { label: 'New Delhi (IST) UTC+5:30', value: 'Asia/Kolkata' },
  { label: 'Dubai (GST) UTC+4',       value: 'Asia/Dubai' },
  { label: 'Riyadh (AST) UTC+3',      value: 'Asia/Riyadh' },
  { label: 'London (GMT/BST)',        value: 'Europe/London' },
  { label: 'New York (EST/EDT)',      value: 'America/New_York' },
  { label: 'Los Angeles (PST/PDT)',   value: 'America/Los_Angeles' },
  { label: 'Tokyo (JST) UTC+9',       value: 'Asia/Tokyo' },
  { label: 'Singapore (SGT) UTC+8',   value: 'Asia/Singapore' },
  { label: 'Sydney (AEST/AEDT)',      value: 'Australia/Sydney' },
  { label: 'Istanbul (TRT) UTC+3',    value: 'Europe/Istanbul' },
  { label: 'Cairo (EET) UTC+2',       value: 'Africa/Cairo' },
  { label: 'Paris (CET/CEST)',        value: 'Europe/Paris' },
  { label: 'UTC',                     value: 'UTC' },
];

function formatInZone(d: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour12: false,
    }).format(d);
  } catch {
    return '—';
  }
}

// ---------- TimeZoneConverter ----------
export function TimeZoneConverter() {
  const [from, setFrom] = useState('Asia/Karachi');
  const [to, setTo] = useState('America/New_York');
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const out = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [h, m] = time.split(':').map(Number);
    const [yy, mm, dd] = date.split('-').map(Number);
    // Build a Date interpreted as if the user picked it in `from` timezone:
    // treat the inputs as local in `from`. Use Intl to find offset.
    const utcGuess = Date.UTC(yy, mm - 1, dd, h, m);
    // Find what time it would show in the source zone, find delta, adjust.
    const src = new Intl.DateTimeFormat('en-US', {
      timeZone: from,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date(utcGuess));
    const parts: any = {};
    for (const p of src) parts[p.type] = p.value;
    const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
    const offset = shown - utcGuess;
    const target = new Date(utcGuess - offset);
    return target;
  }, [from, to, time, date]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker label="From timezone" value={from} onChange={setFrom} options={TIMEZONES} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
            </View>
            <View className="flex-1">
              <Input label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="14:30" autoCapitalize="none" />
            </View>
          </View>
          <Picker label="To timezone" value={to} onChange={setTo} options={TIMEZONES} />
        </View>
      </Card>
      <ResultDisplay
        label={`In ${TIMEZONES.find((t) => t.value === to)?.label}`}
        value={out ? formatInZone(out, to) : '—'}
        sub={out ? `Source: ${formatInZone(out, from)} · ${from}` : undefined}
      />
    </View>
  );
}

// ---------- WorldClock ----------
export function WorldClock() {
  const [now, setNow] = useState(new Date());
  const [zones, setZones] = useState<string[]>([
    'Asia/Karachi',
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
  ]);
  const [picker, setPicker] = useState('Asia/Dubai');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function add() {
    if (!zones.includes(picker)) setZones([...zones, picker]);
  }
  function remove(z: string) {
    setZones(zones.filter((x) => x !== z));
  }

  function isWorking(d: Date, tz: string) {
    try {
      const h = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hour12: false }).format(d);
      const hr = parseInt(h);
      return hr >= 9 && hr < 18;
    } catch {
      return false;
    }
  }

  return (
    <View className="gap-3">
      <Card>
        <Text variant="bodyStrong">Add a city</Text>
        <View className="flex-row gap-2 mt-2 items-end">
          <View className="flex-1">
            <Picker label="Timezone" value={picker} onChange={setPicker} options={TIMEZONES} />
          </View>
          <Button title="Add" icon="add" onPress={add} variant="primary" size="md" />
        </View>
      </Card>
      {zones.map((z) => {
        const tz = TIMEZONES.find((t) => t.value === z);
        const working = isWorking(now, z);
        return (
          <Card key={z}>
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text variant="bodyStrong">{tz?.label ?? z}</Text>
                <Text variant="small" tone={working ? 'success' : 'muted'} className="mt-0.5">
                  {working ? '🟢 Within work hours' : '🔵 Outside work hours'}
                </Text>
              </View>
              <Text variant="h2" tone="primary">{formatInZone(now, z)}</Text>
            </View>
            {zones.length > 1 ? (
              <View className="mt-3">
                <Button title="Remove" icon="close" variant="ghost" size="sm" onPress={() => remove(z)} />
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

// ---------- PomodoroTimer ----------
export function PomodoroTimer() {
  const WORK = 25 * 60;
  const SHORT = 5 * 60;
  const LONG = 15 * 60;
  const [phase, setPhase] = useState<'work' | 'short' | 'long'>('work');
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // phase transition
          if (phase === 'work') {
            const nextCompleted = completed + 1;
            setCompleted(nextCompleted);
            if (nextCompleted % 4 === 0) {
              setPhase('long');
              return LONG;
            } else {
              setPhase('short');
              return SHORT;
            }
          } else {
            setPhase('work');
            return WORK;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, completed]);

  function reset() {
    setRunning(false);
    setPhase('work');
    setSeconds(WORK);
    setCompleted(0);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const phaseLabel = phase === 'work' ? 'Focus' : phase === 'short' ? 'Short break' : 'Long break';

  return (
    <View className="gap-3">
      <Card className="items-center py-6">
        <Text variant="caption" tone="muted">{phaseLabel.toUpperCase()}</Text>
        <Text className="text-7xl font-extrabold tracking-tight mt-2 text-primary dark:text-primary-dark" style={{ fontVariant: ['tabular-nums'] }}>
          {mm}:{ss}
        </Text>
        <Text variant="small" tone="muted" className="mt-2">
          Pomodoros completed: {completed}
        </Text>
      </Card>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button title={running ? 'Pause' : 'Start'} icon={running ? 'pause' : 'play'} onPress={() => setRunning(!running)} fullWidth size="lg" />
        </View>
        <View className="flex-1">
          <Button title="Reset" icon="refresh" variant="secondary" onPress={reset} fullWidth size="lg" />
        </View>
      </View>
      <Card variant="subtle">
        <Text variant="caption" tone="muted">METHOD</Text>
        <Text variant="small" tone="muted" className="mt-1">
          25 min of focused work, 5 min short break. Every 4 pomodoros, take a 15-minute long break.
        </Text>
      </Card>
    </View>
  );
}
