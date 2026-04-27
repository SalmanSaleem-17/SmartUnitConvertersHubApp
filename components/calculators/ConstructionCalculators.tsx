import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

export function TileCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [tile, setTile] = useState('2');
  const [waste, setWaste] = useState('10');

  const out = useMemo(() => {
    const l = parseFloat(length); const w = parseFloat(width);
    const t = parseFloat(tile); const ws = parseFloat(waste);
    if (![l, w, t, ws].every(isFinite) || t <= 0) return null;
    const area = l * w;
    const tileArea = t * t;
    const tiles = Math.ceil((area / tileArea) * (1 + ws / 100));
    return { area, tiles };
  }, [length, width, tile, waste]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Room length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" />
          <Input label="Room width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" />
          <Input label="Tile side (ft)" value={tile} onChangeText={setTile} keyboardType="decimal-pad" />
          <Input label="Waste %" value={waste} onChangeText={setWaste} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Tiles required" value={out ? out.tiles.toString() : '—'} sub={out ? `Floor area: ${out.area} sq ft (incl. waste)` : undefined} />
    </View>
  );
}

export function PaintCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [height, setH] = useState('10');
  const [doors, setD] = useState('2');
  const [windows, setWin] = useState('2');
  const [coverage, setCov] = useState('120');

  const out = useMemo(() => {
    const l = parseFloat(length); const w = parseFloat(width); const h = parseFloat(height);
    const d = parseFloat(doors); const wi = parseFloat(windows); const c = parseFloat(coverage);
    if ([l, w, h, d, wi, c].some((x) => !isFinite(x)) || c <= 0) return null;
    const wallArea = 2 * (l + w) * h;
    const subtract = d * 21 + wi * 15;
    const paintable = Math.max(0, wallArea - subtract);
    const liters = paintable / c;
    return { wallArea, paintable, liters };
  }, [length, width, height, doors, windows, coverage]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" />
          <Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" />
          <Input label="Height (ft)" value={height} onChangeText={setH} keyboardType="decimal-pad" />
          <Input label="Doors" value={doors} onChangeText={setD} keyboardType="numeric" />
          <Input label="Windows" value={windows} onChangeText={setWin} keyboardType="numeric" />
          <Input label="Coverage (sq ft / liter)" value={coverage} onChangeText={setCov} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Paint required" value={out ? `${out.liters.toFixed(2)} L` : '—'} sub={out ? `Paintable area: ${Math.round(out.paintable)} sq ft` : undefined} />
    </View>
  );
}

export function BrickCalculator() {
  const [length, setL] = useState('20');
  const [height, setH] = useState('10');
  const [waste, setWaste] = useState('10');

  const out = useMemo(() => {
    const l = parseFloat(length); const h = parseFloat(height); const w = parseFloat(waste);
    if ([l, h, w].some((x) => !isFinite(x))) return null;
    const area = l * h;
    const bricks = Math.ceil(area * 6 * (1 + w / 100));
    return { area, bricks };
  }, [length, height, waste]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Wall length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" />
          <Input label="Wall height (ft)" value={height} onChangeText={setH} keyboardType="decimal-pad" />
          <Input label="Waste %" value={waste} onChangeText={setWaste} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Bricks required" value={out ? out.bricks.toLocaleString() : '—'} sub={out ? `Wall area: ${out.area} sq ft` : undefined} />
    </View>
  );
}

export function SquareFootageCalculator() {
  const [length, setL] = useState('20');
  const [width, setW] = useState('15');
  const out = useMemo(() => {
    const l = parseFloat(length); const w = parseFloat(width);
    if (!isFinite(l) || !isFinite(w)) return null;
    return { sqft: l * w, m2: l * w * 0.092903, sqyd: l * w / 9 };
  }, [length, width]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" />
          <Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Square Footage" value={out ? `${out.sqft.toFixed(2)} sq ft` : '—'} sub={out ? `${out.m2.toFixed(2)} m² · ${out.sqyd.toFixed(2)} sq yd` : undefined} />
    </View>
  );
}

export function ConcreteCalculator() {
  const [length, setL] = useState('10');
  const [width, setW] = useState('10');
  const [thickness, setT] = useState('0.5');
  const out = useMemo(() => {
    const l = parseFloat(length); const w = parseFloat(width); const t = parseFloat(thickness);
    if ([l, w, t].some((x) => !isFinite(x))) return null;
    const cuft = l * w * t;
    const cuyd = cuft / 27;
    const cum = cuft * 0.0283168;
    return { cuft, cuyd, cum, bags: cum * 6, sand: cum * 0.42, agg: cum * 0.83 };
  }, [length, width, thickness]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" />
          <Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" />
          <Input label="Thickness (ft)" value={thickness} onChangeText={setT} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Concrete volume" value={out ? `${out.cum.toFixed(2)} m³` : '—'} sub={out ? `${out.cuft.toFixed(2)} cu ft · ${out.cuyd.toFixed(2)} cu yd` : undefined} />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Materials (1:2:4 mix)</Text>
          <View className="flex-row mt-2 gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">CEMENT</Text><Text variant="h3">{out.bags.toFixed(1)} bags</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">SAND</Text><Text variant="h3">{out.sand.toFixed(2)} m³</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">AGGREGATE</Text><Text variant="h3">{out.agg.toFixed(2)} m³</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}
