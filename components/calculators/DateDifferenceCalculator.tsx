import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

function parseDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export function DateDifferenceCalculator() {
  const [from, setFrom] = useState('2024-01-01');
  const [to, setTo] = useState('2025-01-01');

  const out = useMemo(() => {
    const a = parseDate(from);
    const b = parseDate(to);
    if (!a || !b) return null;
    const ms = b.getTime() - a.getTime();
    const days = Math.round(ms / 86400000);
    const weeks = days / 7;
    const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    const years = days / 365.25;
    return { days, weeks, months, years };
  }, [from, to]);

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <View style={{ gap: 12 }}>
          <Input label="From date" value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" autoCapitalize="none" icon="calendar" />
          <Input label="To date" value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" autoCapitalize="none" icon="calendar-clear" />
        </View>
      </Card>

      <ResultDisplay label="Days" value={out ? out.days.toLocaleString() : '—'} sub={out ? `${out.weeks.toFixed(1)} weeks · ${out.months} months · ${out.years.toFixed(2)} years` : undefined} />
    </View>
  );
}
