import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal',
  'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qa'dah", 'Dhu al-Hijjah'
];

// Simple Tabular Islamic algorithm (Umm al-Qura derivative)
function gregorianToHijri(d: Date): { y: number; m: number; d: number } {
  const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
  const days = jd - 1948440 + 10632;
  const n = Math.floor((days - 1) / 10631);
  let dd = days - 10631 * n + 354;
  const j = Math.floor((10985 - dd) / 5316) * Math.floor((50 * dd) / 17719) +
            Math.floor(dd / 5670) * Math.floor((43 * dd) / 15238);
  dd = dd - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
            Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * dd) / 709);
  const dh = dd - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { y, m, d: dh };
}

export function HijriDateToday() {
  const today = useMemo(() => new Date(), []);
  const hijri = useMemo(() => gregorianToHijri(today), [today]);
  const greg = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <View style={{ gap: 12 }}>
      <ResultDisplay
        label="Today (Hijri)"
        value={`${hijri.d} ${HIJRI_MONTHS[hijri.m - 1] ?? ''}`}
        sub={`${hijri.y} AH`}
      />
      <Card variant="subtle">
        <Text variant="caption" tone="muted">GREGORIAN</Text>
        <Text variant="h3" style={{ marginTop: 2 }}>
          {greg}
        </Text>
      </Card>
      <Card>
        <Text variant="bodyStrong">About this widget</Text>
        <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
          Hijri date is computed using the Tabular Islamic algorithm. It may vary by ±1 day from sighting-based calendars in different regions.
        </Text>
      </Card>
    </View>
  );
}
