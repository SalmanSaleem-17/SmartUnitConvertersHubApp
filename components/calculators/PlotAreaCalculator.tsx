import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

// 1 Marla = 25.2929 m² (Pakistan std)
// 1 Kanal = 20 Marla
// 1 Acre = 4046.86 m²
const MARLA_M2 = 25.2929;

export function PlotAreaCalculator() {
  const [n, setN] = useState('40');
  const [s, setS] = useState('40');
  const [e, setE] = useState('60');
  const [w, setW] = useState('60');

  const out = useMemo(() => {
    const ns = [n, s, e, w].map((x) => parseFloat(x));
    if (ns.some((v) => !isFinite(v) || v <= 0)) return null;
    const [a, b, c, d] = ns;
    // average opposite sides for rectangle approx
    const len = (a + b) / 2;
    const wid = (c + d) / 2;
    const sqft = len * wid;
    const m2 = sqft * 0.092903;
    return {
      sqft,
      m2,
      marla: m2 / MARLA_M2,
      kanal: m2 / (20 * MARLA_M2),
      acres: m2 / 4046.86,
    };
  }, [n, s, e, w]);

  const fmt = (v: number, p = 2) => v.toLocaleString(undefined, { maximumFractionDigits: p });

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <Text variant="caption" tone="muted">PLOT SIDES (FT)</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Input label="North" value={n} onChangeText={setN} keyboardType="decimal-pad" />
            <Input label="South" value={s} onChangeText={setS} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <Input label="East" value={e} onChangeText={setE} keyboardType="decimal-pad" />
            <Input label="West" value={w} onChangeText={setW} keyboardType="decimal-pad" />
          </View>
        </View>
      </Card>

      <ResultDisplay label="Area" value={out ? `${fmt(out.sqft)} sq ft` : '—'} sub={out ? `${fmt(out.m2)} m²` : undefined} />
      {out ? (
        <Card variant="subtle">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Text variant="caption" tone="muted">MARLA</Text><Text variant="h3">{fmt(out.marla)}</Text></View>
            <View style={{ flex: 1 }}><Text variant="caption" tone="muted">KANAL</Text><Text variant="h3">{fmt(out.kanal, 3)}</Text></View>
            <View style={{ flex: 1 }}><Text variant="caption" tone="muted">ACRES</Text><Text variant="h3">{fmt(out.acres, 4)}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}
