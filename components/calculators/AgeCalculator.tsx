import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

function parseDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function ageBetween(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((to.getTime() - from.getTime()) / 86400000);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  return { years, months, days, totalDays, totalHours, totalMinutes };
}

export function AgeCalculator() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [dob, setDob] = useState('2000-01-01');
  const [as_, setAs] = useState(todayStr);

  const out = useMemo(() => {
    const a = parseDate(dob);
    const b = parseDate(as_);
    if (!a || !b || b < a) return null;
    return ageBetween(a, b);
  }, [dob, as_]);

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Input
            label="Date of birth (YYYY-MM-DD)"
            value={dob}
            onChangeText={setDob}
            placeholder="2000-01-01"
            autoCapitalize="none"
            icon="calendar"
          />
          <Input
            label="Calculate as of"
            value={as_}
            onChangeText={setAs}
            placeholder={todayStr}
            autoCapitalize="none"
            icon="calendar-clear"
          />
        </View>
      </Card>

      <ResultDisplay
        label="Age"
        value={out ? `${out.years}y ${out.months}m ${out.days}d` : '—'}
        sub={out ? `${out.totalDays.toLocaleString()} total days` : 'Enter a valid date of birth'}
      />

      {out ? (
        <Card variant="subtle">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">DAYS</Text>
              <Text variant="h3">{out.totalDays.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">HOURS</Text>
              <Text variant="h3">{out.totalHours.toLocaleString()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">MINUTES</Text>
              <Text variant="h3">{out.totalMinutes.toLocaleString()}</Text>
            </View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}
